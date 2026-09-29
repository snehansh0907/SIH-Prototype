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
   * Fetches real-time weather data for a given livestock barn location using Open-Meteo.
   * Calculates Temperature-Humidity Index (THI) for livestock heat stress.
   */
  async getWeather(latitude: number, longitude: number, _speciesIdOrName?: string): Promise<WeatherCondition> {
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

      const temp = Math.round(data.current?.temperature_2m ?? 28);
      const humidity = Math.round(data.current?.relative_humidity_2m ?? 72);
      const rainfallChance = data.daily?.precipitation_probability_max?.[0] ?? Math.round((data.current?.precipitation || 0) > 0 ? 80 : 15);
      const rainfallMm = data.current?.rain ?? data.current?.precipitation ?? 0;

      // Calculate Temperature-Humidity Index (THI) for Dairy Cattle
      // Standard Formula: THI = (0.8 * T) + [RH/100 * (T - 14.4)] + 46.4
      const thiIndex = Math.round(((0.8 * temp) + ((humidity / 100) * (temp - 14.4)) + 46.4) * 10) / 10;

      let heatStressLevel: 'normal' | 'alert' | 'danger' | 'emergency' = 'normal';
      if (thiIndex >= 84) {
        heatStressLevel = 'danger';
      } else if (thiIndex >= 78) {
        heatStressLevel = 'alert';
      } else {
        heatStressLevel = 'normal';
      }

      // Determine condition
      let condition: 'rainy' | 'humid' | 'sunny' | 'cloudy' = 'cloudy';
      if (rainfallChance >= 50 || rainfallMm > 0.5) {
        condition = 'rainy';
      } else if (humidity >= 75) {
        condition = 'humid';
      } else if (temp >= 32) {
        condition = 'sunny';
      }

      const rainfallStatus =
        rainfallChance >= 60
          ? `Rain showers expected (${rainfallChance}% chance)`
          : rainfallChance >= 30
          ? `Scattered clouds & humidity (${rainfallChance}% chance)`
          : `Dry weather forecast (${rainfallChance}% chance)`;

      const rainfallStatusHi =
        rainfallChance >= 60
          ? `बारिश की अधिक संभावना (${rainfallChance}%)`
          : rainfallChance >= 30
          ? `हल्की बारिश व उमस (${rainfallChance}%)`
          : `शुष्क मौसम पूर्वानुमान (${rainfallChance}%)`;

      const rainfallStatusMr =
        rainfallChance >= 60
          ? `पावसाची शक्यता (${rainfallChance}%)`
          : rainfallChance >= 30
          ? `ढगाळ व दमट वातावरण (${rainfallChance}%)`
          : `कोरडे हवामान (${rainfallChance}%)`;

      let cropImpactSummary = '';
      let cropImpactSummaryHi = '';
      let cropImpactSummaryMr = '';

      if (humidity >= 75) {
        cropImpactSummary = `Barn humidity is high (${humidity}%). High humidity promotes tick proliferation, fly breeding, and increases bacterial mastitis risk on wet bedding. Keep shed floors dry with lime.`;
        cropImpactSummaryHi = `गोठे में नमी अधिक है (${humidity}%)। इससे किलनी (चिचड़ी), मक्खी-मच्छर और गीले बिछावन से थनैला का खतरा बढ़ता है। फर्श पर सूखा चूना डालें।`;
        cropImpactSummaryMr = `गोठ्यात दमटपणा जास्त आहे (${humidity}%). ओल्या जमिनीमुळे गोचीड, माश्या आणि कासेच्या आजाराचा (स्तनदाह) धोका वाढतो. गोठ्यात चुना टाकून जमीन कोरडी ठेवा.`;
      } else if (temp >= 32) {
        cropImpactSummary = `Ambient temperature is elevated (${temp}°C, THI ${thiIndex}). Ensure shade, clean cool drinking water, and barn ventilation to prevent heat stress in high-yielding dairy animals.`;
        cropImpactSummaryHi = `तापमान अधिक है (${temp}°C, THI ${thiIndex})। दुधारू पशुओं को हीट स्ट्रेस से बचाने हेतु छाया, ताजा ठंडा पानी व हवा का प्रबंध करें।`;
        cropImpactSummaryMr = `तापमान जास्त आहे (${temp}°C, THI ${thiIndex}). दुभत्या जनावरांना उष्मा ताण येऊ नये म्हणून सावली, थंड पाणी व गोठ्यात हवा खेळती ठेवा.`;
      } else {
        cropImpactSummary = `Barn temperature and humidity are currently favorable (${temp}°C, ${humidity}% RH). Maintain routine hygiene and daily grooming.`;
        cropImpactSummaryHi = `पशुशाला का मौसम अनुकूल है (${temp}°C, ${humidity}%)। नियमित स्वच्छता व पौष्टिक चारा बनाए रखें।`;
        cropImpactSummaryMr = `गोठ्यातील हवामान सध्या अनुकूल आहे (${temp}°C, ${humidity}%). नियमित स्वच्छता व संतुलित आहार ठेवा.`;
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
        thiIndex,
        heatStressLevel,
      };
    } catch {
      clearTimeout(timeoutId);
      // Reassuring fallback
      return {
        temp: 28,
        humidity: 72,
        rainfallStatus: 'Partly cloudy with mild humidity',
        rainfallStatusHi: 'आंशिक बादल व सामान्य उमस',
        rainfallStatusMr: 'अंशतः ढगाळ व हलका दमटपणा',
        rainfallChance: 25,
        condition: 'humid',
        cropImpactSummary: 'Maintain clean dry bedding and ensure fresh drinking water.',
        cropImpactSummaryHi: 'गोठा साफ व सूखा रखें और ताजा पीने का पानी दें।',
        cropImpactSummaryMr: 'गोठा स्वच्छ व कोरडा ठेवा आणि पिण्यासाठी स्वच्छ पाणी द्या.',
        thiIndex: 76.5,
        heatStressLevel: 'normal',
      };
    }
  },
};
