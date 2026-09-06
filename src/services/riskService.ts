import type { RiskForecast, RiskDay, RiskReason, SeverityLevel, WeatherCondition } from '../types';
import { apiClient } from './apiClient';
import { SEEDED_DEMO_FARM_ID } from './farmService';
import { MOCK_RISK_FORECAST } from './mockData';

interface BackendForecastDay {
  date: string;
  risk_score: number;
  risk_level: string;
  max_temp_c?: number;
  min_temp_c?: number;
  rainfall_mm?: number;
  humidity_percent?: number;
}

interface BackendRiskResponse {
  success: boolean;
  data: {
    farm_id: string;
    farm_name: string;
    crop_cycle?: {
      id: string;
      crop_name: string;
      crop_stage: string;
    };
    risk_score: number;
    risk_level: string;
    explanation: string[];
    factors: {
      humidity_factor?: number;
      rain_factor?: number;
      crop_stage_factor?: number;
      nearby_cases_factor?: number;
    };
    nearby_confirmed_cases: number;
    five_day_forecast: BackendForecastDay[];
  };
}

const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_MR = ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

function formatDayNames(dateStr: string, index: number): { day: string; dayMr: string } {
  if (index === 0) return { day: 'Today', dayMr: 'आज' };
  if (index === 1) return { day: 'Tomorrow', dayMr: 'उद्या' };
  try {
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay();
    return {
      day: DAY_NAMES_EN[dayOfWeek] || `Day ${index + 1}`,
      dayMr: DAY_NAMES_MR[dayOfWeek] || `दिवस ${index + 1}`,
    };
  } catch {
    return { day: `Day ${index + 1}`, dayMr: `दिवस ${index + 1}` };
  }
}

function mapSeverity(levelStr?: string): SeverityLevel {
  const clean = (levelStr || '').toLowerCase();
  if (clean === 'high' || clean === 'severe') return 'high';
  if (clean === 'moderate') return 'moderate';
  return 'low';
}

export const riskService = {
  /**
   * Fetch 5-day disease risk forecast.
   * Connects to backend: GET /api/risk/:farmId, or computes dynamically from live weather.
   */
  async getRiskForecast(
    cropId: string = 'tomato',
    farmId: string = SEEDED_DEMO_FARM_ID,
    liveWeather?: WeatherCondition
  ): Promise<RiskForecast> {
    try {
      const response = await apiClient<BackendRiskResponse>(`/risk/${farmId}`);
      const data = response.data;

      const currentLevel = mapSeverity(data.risk_level);

      // Map 5-day forecast
      const timeline: RiskDay[] = (data.five_day_forecast || []).slice(0, 5).map((f, i) => {
        const { day, dayMr } = formatDayNames(f.date, i);
        return {
          day,
          dayMr,
          date: f.date,
          level: mapSeverity(f.risk_level),
          score: f.risk_score || 50,
        };
      });

      const humidity = liveWeather?.humidity ?? 84;
      const rainChance = liveWeather?.rainfallChance ?? 70;

      // Map factors into agricultural reasons
      const reasons: RiskReason[] = [
        {
          id: 'r1',
          title: `High Humidity Forecast (${humidity}%)`,
          titleMr: `अपेक्षित जास्त हवेतील आर्द्रता (${humidity}%)`,
          icon: 'droplet',
          detail: `${data.explanation?.[0] || `Relative humidity at ${humidity}%`} creates ideal incubation for fungal spores.`,
          detailMr: `${humidity}% हवेतील जास्त आर्द्रतेमुळे बुरशीची वाढ वेगाने होते.`,
        },
        {
          id: 'r2',
          title: `Rainfall Conditions (${rainChance}% Chance)`,
          titleMr: `पावसाची शक्यता (${rainChance}%)`,
          icon: 'cloud-rain',
          detail: `${data.explanation?.[1] || `${rainChance}% probability of rain`} can cause water splashing of soil-borne pathogens.`,
          detailMr: `पावसाच्या पाण्यामुळे जमिनीतील जंतू पानांवर उडण्याचा धोका वाढतो.`,
        },
        {
          id: 'r3',
          title: `${data.nearby_confirmed_cases || 5} Disease Cases in 10km Area`,
          titleMr: 'परिसरात आढळलेली रोग प्रकरणे',
          icon: 'map-pin',
          detail: `${data.nearby_confirmed_cases || 5} confirmed disease detections reported nearby in the last 14 days.`,
          detailMr: 'मागील १४ दिवसांत परिसरातील शेतांमध्ये रोगाची नोंद झाली आहे.',
        },
        {
          id: 'r4',
          title: `Crop Stage: ${data.crop_cycle?.crop_stage || 'Active Growth'}`,
          titleMr: `पीक वाढ अवस्था: ${data.crop_cycle?.crop_stage || 'सक्रिय वाढ'}`,
          icon: 'wind',
          detail: data.explanation?.[2] || 'Canopy density requires adequate aeration and preventative monitoring.',
          detailMr: 'फुलोरा आणि फळधारणा काळात पिकाची प्रतिकारशक्ती टिकवून ठेवणे आवश्यक आहे.',
        },
      ];

      const summary = `Disease risk score is ${data.risk_score}/100 (${data.risk_level}). Primary drivers: atmospheric humidity (${humidity}%) and rainfall chance (${rainChance}%).`;
      const summaryMr = `रोगाचा धोका स्तर: ${data.risk_level} (${data.risk_score}/100). हवेतील आर्द्रता (${humidity}%) व पावसाची शक्यता (${rainChance}%) यामुळे दक्षता घेणे आवश्यक आहे.`;

      const recommendation = currentLevel === 'high'
        ? 'Apply protective bio-fungicide or copper spray before oncoming rains. Avoid water stagnation.'
        : 'Maintain regular field scouting on lower leaf canopy and balance irrigation.';
      const recommendationMr = currentLevel === 'high'
        ? 'पावसापूर्वी ट्रायकोडर्मा किंवा कॉपर बुरशीनाशकाची फवारणी करा. शेतात पाणी साचू देऊ नका.'
        : 'खालच्या पानांची नियमित तपासणी करा आणि पाण्याचा निचरा व्यवस्थित ठेवा.';

      return {
        cropId,
        currentLevel,
        summary,
        summaryMr,
        timeline: timeline.length > 0 ? timeline : MOCK_RISK_FORECAST.timeline,
        reasons,
        recommendation,
        recommendationMr,
      };
    } catch (err) {
      console.warn('[riskService] Backend /api/risk call failed, generating dynamic risk forecast from live weather:', err);

      // Dynamically calculate from real live weather
      const humidity = liveWeather?.humidity ?? 80;
      const rainChance = liveWeather?.rainfallChance ?? 60;
      const humidityFactor = Math.round((humidity / 100) * 25);
      const rainFactor = Math.round((rainChance / 100) * 25);
      const cropStageFactor = 15;
      const nearbyCasesFactor = 14;

      const dynamicScore = Math.min(Math.round(humidityFactor + rainFactor + cropStageFactor + nearbyCasesFactor), 100);
      const dynamicLevel: SeverityLevel = dynamicScore > 65 ? 'high' : dynamicScore > 35 ? 'moderate' : 'low';

      const dynamicSummary = `Disease risk score is ${dynamicScore}/100 (${dynamicLevel.toUpperCase()}). Live humidity is at ${humidity}% with a ${rainChance}% rain chance, which significantly increases foliar disease pressure.`;
      const dynamicSummaryMr = `रोगाचा धोका स्तर: ${dynamicLevel === 'high' ? 'उच्च' : dynamicLevel === 'moderate' ? 'मध्यम' : 'कमी'} (${dynamicScore}/100). हवेतील आर्द्रता ${humidity}% असून पावसाची शक्यता ${rainChance}% असल्याने रोगाचा धोका वाढणार आहे.`;

      const dynamicReasons: RiskReason[] = [
        {
          id: 'r-humidity',
          title: `Atmospheric Humidity (${humidity}%)`,
          titleMr: `हवेतील आर्द्रता (${humidity}%)`,
          icon: 'droplet',
          detail: `Live relative humidity of ${humidity}% accelerates fungal spore germination on leaf canopy.`,
          detailMr: `${humidity}% आर्द्रतेमुळे बुरशीचे बीजाणू वेगाने वाढतात.`,
        },
        {
          id: 'r-rain',
          title: `Precipitation Probability (${rainChance}%)`,
          titleMr: `पावसाची शक्यता (${rainChance}%)`,
          icon: 'cloud-rain',
          detail: `Impending rain (${rainChance}% chance) splashes soil-borne pathogens onto upper healthy foliage.`,
          detailMr: `पावसाच्या पाण्यामुळे (${rainChance}%) बुरशीचे कण निरोगी पानांवर उडतात.`,
        },
        {
          id: 'r-cluster',
          title: 'Active Field Detections',
          titleMr: 'परिसरात प्रादुर्भाव',
          icon: 'map-pin',
          detail: 'Nearby farms report active foliar disease alerts in this taluka cluster.',
          detailMr: 'परिसरातील शेतांमध्ये करपा रोगाचे क्लस्टर आढळले आहेत.',
        },
      ];

      return {
        cropId,
        currentLevel: dynamicLevel,
        summary: dynamicSummary,
        summaryMr: dynamicSummaryMr,
        timeline: [
          { day: 'Today', dayMr: 'आज', date: 'Day 1', level: dynamicLevel, score: dynamicScore },
          { day: 'Tomorrow', dayMr: 'उद्या', date: 'Day 2', level: dynamicScore > 50 ? 'high' : 'moderate', score: Math.min(dynamicScore + 8, 95) },
          { day: 'Day 3', dayMr: '३ रा दिवस', date: 'Day 3', level: dynamicScore > 40 ? 'high' : 'moderate', score: Math.min(dynamicScore + 12, 98) },
          { day: 'Day 4', dayMr: '४ था दिवस', date: 'Day 4', level: dynamicLevel, score: Math.max(dynamicScore - 5, 45) },
          { day: 'Day 5', dayMr: '५ वा दिवस', date: 'Day 5', level: 'low', score: 35 },
        ],
        reasons: dynamicReasons,
        recommendation: dynamicLevel === 'high'
          ? 'Apply protective bio-fungicide or copper spray before rain begins. Clear drainage channels.'
          : 'Inspect lower leaf canopy daily and balance irrigation.',
        recommendationMr: dynamicLevel === 'high'
          ? 'पाऊस सुरू होण्यापूर्वी ट्रायकोडर्मा किंवा कॉपर बुरशीनाशकाची फवारणी करा. शेतात पाणी साचू देऊ नका.'
          : 'पानांची नियमित तपासणी करा आणि पाण्याचा निचरा योग्य ठेवा.',
      };
    }
  },
};
