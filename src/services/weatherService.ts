import type { WeatherCondition } from '../types';

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    rain?: number;
  };
  daily?: {
    time?: string[];
    precipitation_probability_max?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
}

export const weatherService = {
  /**
   * Fetches real-time weather data for a given farm latitude & longitude using Open-Meteo.
   * Dynamically formats disease impact summary based on active crop.
   */
  async getWeather(latitude: number, longitude: number, _cropIdOrName?: string): Promise<WeatherCondition> {
    if (latitude === undefined || longitude === undefined || isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Valid latitude and longitude coordinates are required to fetch weather.');
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,rain&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=auto`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Open-Meteo API returned status ${response.status}`);
      }

      const data: OpenMeteoResponse = await response.json();

      const temp = Math.round(data.current?.temperature_2m ?? 24);
      const humidity = Math.round(data.current?.relative_humidity_2m ?? 65);
      const rainfallChance = data.daily?.precipitation_probability_max?.[0] ?? Math.round((data.current?.precipitation || 0) > 0 ? 80 : 15);
      const rainfallMm = data.current?.rain ?? data.current?.precipitation ?? 0;

      // Determine condition
      let condition: 'rainy' | 'humid' | 'sunny' | 'cloudy' = 'cloudy';
      if (rainfallChance >= 50 || rainfallMm > 0.5) {
        condition = 'rainy';
      } else if (humidity >= 75) {
        condition = 'humid';
      } else if (temp >= 30) {
        condition = 'sunny';
      }

      // Generate dynamic rainfall status text
      const rainfallStatus =
        rainfallChance >= 60
          ? `Rain showers expected (${rainfallChance}% chance)`
          : rainfallChance >= 30
          ? `Scattered rain or clouds (${rainfallChance}% chance)`
          : `Dry weather forecast (${rainfallChance}% chance)`;

      const rainfallStatusHi =
        rainfallChance >= 60
          ? `बारिश की अधिक संभावना (${rainfallChance}%)`
          : rainfallChance >= 30
          ? `हल्की बारिश या बादल (${rainfallChance}%)`
          : `शुष्क मौसम पूर्वानुमान (${rainfallChance}%)`;

      const rainfallStatusMr =
        rainfallChance >= 60
          ? `पावसाची दाट शक्यता (${rainfallChance}%)`
          : rainfallChance >= 30
          ? `हलक्या सरी किंवा ढगाळ वातावरण (${rainfallChance}%)`
          : `कोरडे हवामान (${rainfallChance}%)`;

      // Calculate Temperature-Humidity Index (THI) for cattle & buffalo
      const rawTHI = 0.8 * temp + (humidity / 100) * (temp - 14.4) + 46.4;
      const thi = Math.round(rawTHI * 10) / 10;
      let thiStatus = 'Comfortable';
      if (thi >= 89) thiStatus = 'Severe Heat Stress';
      else if (thi >= 79) thiStatus = 'Moderate Heat Stress';
      else if (thi >= 72) thiStatus = 'Mild Heat Stress';

      // Dynamically compute livestock disease and heat stress impact summary
      let cropImpactSummary = '';
      let cropImpactSummaryHi = '';
      let cropImpactSummaryMr = '';

      if (thi >= 79) {
        cropImpactSummary = `Elevated Heat Stress Index (THI ${thi}). Cattle prone to 15-20% drop in milk yield, reduced feed intake, and high respiration. Provide shed shade, fans/sprinklers, and abundant fresh drinking water.`;
        cropImpactSummaryHi = `उच्च ताप-तनाव सूचकांक (THI ${thi})। दुधारू पशुओं में दूध उत्पादन में 15-20% गिरावट और सांस फूलने का खतरा। गोठे में पंखे, छाया और ठंडा पानी उपलब्ध कराएं।`;
        cropImpactSummaryMr = `वाढता उष्णता ताण निर्देशांक (THI ${thi}). दुधाळ जनावरांचे दूध १५-२०% घटण्याची आणि धाप लागण्याची शक्यता. गोठ्यात सावली, पंखे, गारवा आणि मुबलक थंड पिण्याचे पाणी ठेवा.`;
      } else if (humidity >= 70 && temp >= 22 && temp <= 35) {
        cropImpactSummary = `Humid environment (${humidity}%) and warm weather (${temp}°C) accelerate biting fly (Stomoxys) and mosquito breeding—the primary vectors for Lumpy Skin Disease (LSD). Apply shed vector netting and smoke repellant.`;
        cropImpactSummaryHi = `उच्च आर्द्रता (${humidity}%) और तापमान (${temp}°C) डास व गोचीड मक्खियों को बढ़ाते हैं, जो लम्पी त्वचा रोग (LSD) फैलाती हैं। गोठे में धुआं या मच्छरदानी का उपयोग करें।`;
        cropImpactSummaryMr = `जास्त आर्द्रता (${humidity}%) व उष्ण वातावरणामुळे (${temp}°C) डास, गोचीड आणि चावणाऱ्या माश्यांची पैदास वाढून लंपी रोगाचा (LSD) प्रसार वेगाने होऊ शकतो. गोठ्यात धूर व कीटक प्रतिबंधक उपाय करा.`;
      } else if (humidity >= 65 && temp >= 15 && temp <= 28) {
        cropImpactSummary = `Moderate temperatures (${temp}°C) and damp air (${humidity}%) favor aerosol stability of Foot-and-Mouth Disease (FMD) virus. Disinfect shed entrances with 4% sodium carbonate.`;
        cropImpactSummaryHi = `हल्की ठंड और नमी (${humidity}%) खुरपका-मुंहपका (FMD) वायरस के फैलाव के लिए अनुकूल हैं। गोठे के प्रवेश द्वार पर चूना या सोडियम कार्बोनेट छिड़कें।`;
        cropImpactSummaryMr = `दमट हवामानामुळे (${humidity}%) लाळ्या खुरकूत (FMD) विषाणू हवेत जास्त काळ टिकून राहतो. गोठ्याच्या प्रवेशद्वारावर पोटॅशियम परमँगनेट किंवा चुन्याचे निर्जंतुकीकरण करा.`;
      } else if (rainfallChance >= 60) {
        cropImpactSummary = `Anticipated rainfall (${rainfallChance}%) may lead to shed waterlogging and foot rot infections. Ensure dry, clean bedding and hoof hygiene.`;
        cropImpactSummaryHi = `संभावित बारिश (${rainfallChance}%) से गोठे में कीचड़ और खुर सड़न (फुट रॉट) का खतरा हो सकता है। फर्श सूखा व साफ रखें।`;
        cropImpactSummaryMr = `पावसामुळे (${rainfallChance}%) गोठ्यात ओल व चिखल होऊन जनावरांच्या खुरांमध्ये सडण (फूट रॉट) होण्याचा धोका आहे. गोठा कोरडा व स्वच्छ ठेवा.`;
      } else {
        cropImpactSummary = `Current microclimate (THI ${thi}, Humidity ${humidity}%) is favorable with stable livestock physiological parameters. Maintain routine shed sanitation.`;
        cropImpactSummaryHi = `वर्तमान मौसम (THI ${thi}, आर्द्रता ${humidity}%) पशु स्वास्थ्य के लिए अनुकूल है। गोठे की नियमित सफाई बनाए रखें।`;
        cropImpactSummaryMr = `सध्याचे वातावरण (THI ${thi}, आर्द्रता ${humidity}%) जनावरांच्या आरोग्यासाठी अनुकूल आहे. गोठ्यात नियमित स्वच्छता ठेवा.`;
      }

      return {
        temp,
        humidity,
        rainfallStatus,
        rainfallStatusHi,
        rainfallStatusMr,
        rainfallChance,
        condition,
        cropImpactSummary,
        cropImpactSummaryHi,
        cropImpactSummaryMr,
        thi,
        thiStatus,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('[weatherService] Live Open-Meteo fetch failed:', err);
      throw err;
    }
  },

  /**
   * Helper for backwards compatibility.
   */
  async getWeatherContext(
    _location: string = 'Nashik',
    coords?: { latitude: number; longitude: number }
  ): Promise<WeatherCondition> {
    const lat = coords?.latitude ?? 20.156556;
    const lng = coords?.longitude ?? 74.117339;
    return this.getWeather(lat, lng);
  },
};
