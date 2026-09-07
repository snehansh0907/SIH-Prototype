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
  async getWeather(latitude: number, longitude: number, cropIdOrName?: string): Promise<WeatherCondition> {
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

      // Dynamically compute disease risk impact summary based on REAL conditions and active crop
      const cropKey = (cropIdOrName || 'tomato').toLowerCase().trim();
      let cropImpactSummary = '';
      let cropImpactSummaryHi = '';
      let cropImpactSummaryMr = '';

      if (humidity >= 80 && rainfallChance >= 50) {
        if (cropKey === 'soybean') {
          cropImpactSummary = `High humidity (${humidity}%) and rain (${rainfallChance}%) significantly increase Soybean Rust and foliar fungal pressure. Ensure clear drainage between crop ridges.`;
          cropImpactSummaryHi = `उच्च आर्द्रता (${humidity}%) और बारिश (${rainfallChance}%) सोयाबीन गेरुआ (रस्ट) और फफूंद का खतरा बढ़ाती है। क्यारियों में जल निकासी रखें।`;
          cropImpactSummaryMr = `जास्त हवेतील आर्द्रता (${humidity}%) व पाऊस (${rainfallChance}%) यामुळे सोयाबीन तांबेरा रोगाचा धोका वाढतो. वाफ्यांमध्ये पाणी साचू देऊ नका.`;
        } else if (cropKey === 'cotton') {
          cropImpactSummary = `High humidity (${humidity}%) and rain (${rainfallChance}%) elevate fungal leaf spot and boll rot risk in cotton. Inspect lower bolls and foliage.`;
          cropImpactSummaryHi = `उच्च आर्द्रता (${humidity}%) और बारिश (${rainfallChance}%) कपास में पत्ती धब्बा व गूलर सड़न का जोखिम बढ़ाती है।`;
          cropImpactSummaryMr = `जास्त आर्द्रता व पावसामुळे कापूस पिकात बोंड सड व पानावरील ठिपके रोगाचा धोका वाढतो.`;
        } else {
          cropImpactSummary = `High atmospheric humidity (${humidity}%) and impending rain (${rainfallChance}%) significantly increase fungal disease pressure. Apply preventive measures on lower leaf canopy.`;
          cropImpactSummaryHi = `उच्च वायुमंडलीय आर्द्रता (${humidity}%) और संभावित बारिश (${rainfallChance}%) फफूंद जनित रोगों का खतरा काफी बढ़ा देती है। निचली पत्तियों पर निवारक उपाय करें।`;
          cropImpactSummaryMr = `जास्त हवेतील आर्द्रता (${humidity}%) आणि पाऊस (${rainfallChance}%) यामुळे पानांवर करपा व बुरशीजन्य रोगांचा धोका मोठ्या प्रमाणावर वाढतो.`;
        }
      } else if (humidity >= 75) {
        if (cropKey === 'soybean') {
          cropImpactSummary = `High relative humidity (${humidity}%) creates favorable micro-climate for soybean rust spore multiplication. Inspect lower canopy foliage.`;
          cropImpactSummaryHi = `उच्च सापेक्ष आर्द्रता (${humidity}%) सोयाबीन रस्ट के बीजाणुओं के अंकुरण के लिए अनुकूल है। निचली पत्तियों की जांच करें।`;
          cropImpactSummaryMr = `हवेतील जास्त आर्द्रतेमुळे (${humidity}%) सोयाबीनच्या खालच्या पानांवर तांबेरा बुरशी वाढण्याचा धोका आहे.`;
        } else {
          cropImpactSummary = `High relative humidity (${humidity}%) creates favorable micro-climate for fungal spore germination. Ensure field aeration and inspect lower foliage.`;
          cropImpactSummaryHi = `उच्च सापेक्ष आर्द्रता (${humidity}%) फंगल बीजाणुओं के अंकुरण के लिए अनुकूल वातावरण बनाती है। खेत में वायु प्रवाह सुनिश्चित करें।`;
          cropImpactSummaryMr = `हवेतील जास्त आर्द्रतेमुळे (${humidity}%) पानांवर बुरशीचे बीजाणू वेगाने वाढण्यास पोषक वातावरण तयार झाले आहे.`;
        }
      } else if (rainfallChance >= 60) {
        cropImpactSummary = `Expected rainfall (${rainfallChance}%) may cause water splashing of soil-borne pathogens onto foliage. Inspect field drainage.`;
        cropImpactSummaryHi = `संभावित वर्षा (${rainfallChance}%) के कारण मिट्टी जनित रोगजनक पत्तियों पर छिटक सकते हैं। खेत में जल निकासी की जांच करें।`;
        cropImpactSummaryMr = `पावसाच्या पाण्यामुळे (${rainfallChance}%) जमिनीतील जंतू पानांवर उडण्याचा धोका आहे. पाण्याचा निचरा सुरळीत ठेवा.`;
      } else if (temp >= 33) {
        cropImpactSummary = `High temperatures (${temp}°C) combined with moderate humidity accelerate insect pest development (thrips/mites). Maintain soil moisture.`;
        cropImpactSummaryHi = `अधिक तापमान (${temp}°C) और आर्द्रता कीटों (थ्रिप्स/माइट्स) के विकास को तेज करते हैं। मिट्टी में उचित नमी बनाए रखें।`;
        cropImpactSummaryMr = `जास्त तापमान (${temp}°C) व आर्द्रतेमुळे रसशोषक किडींचा प्रादुर्भाव वाढू शकतो. जमिनीत पुरेसा ओलावा ठेवा.`;
      } else {
        cropImpactSummary = `Current humidity (${humidity}%) and low rain chance (${rainfallChance}%) indicate stable conditions with low immediate fungal risk.`;
        cropImpactSummaryHi = `वर्तमान आर्द्रता (${humidity}%) और कम वर्षा की संभावना (${rainfallChance}%) स्थिर स्थिति और कम फंगल जोखिम दर्शाती है।`;
        cropImpactSummaryMr = `सध्याची आर्द्रता (${humidity}%) व कमी पाऊस (${rainfallChance}%) यामुळे रोगाचा तात्काळ धोका कमी आहे.`;
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
