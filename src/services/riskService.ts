import type { RiskForecast, RiskDay, RiskReason, SeverityLevel, WeatherCondition } from '../types';
import { apiClient } from './apiClient';
import { SEEDED_DEMO_FARM_ID } from './farmService';
import { getDefaultRiskForecastForCrop } from './mockData';

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
const DAY_NAMES_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
const DAY_NAMES_MR = ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

function formatDayNames(dateStr: string, index: number): { day: string; dayHi: string; dayMr: string } {
  if (index === 0) return { day: 'Today', dayHi: 'आज', dayMr: 'आज' };
  if (index === 1) return { day: 'Tomorrow', dayHi: 'कल', dayMr: 'उद्या' };
  try {
    const d = new Date(dateStr);
    const dayOfWeek = d.getDay();
    return {
      day: DAY_NAMES_EN[dayOfWeek] || `Day ${index + 1}`,
      dayHi: DAY_NAMES_HI[dayOfWeek] || `दिन ${index + 1}`,
      dayMr: DAY_NAMES_MR[dayOfWeek] || `दिवस ${index + 1}`,
    };
  } catch {
    return { day: `Day ${index + 1}`, dayHi: `दिन ${index + 1}`, dayMr: `दिवस ${index + 1}` };
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
   * Connects to backend: GET /api/risk/:farmId, or computes dynamically from live weather and active crop.
   */
  async getRiskForecast(
    cropId: string = 'tomato',
    farmId: string = SEEDED_DEMO_FARM_ID,
    liveWeather?: WeatherCondition
  ): Promise<RiskForecast> {
    const defaultForecast = getDefaultRiskForecastForCrop(cropId, liveWeather);

    try {
      const response = await apiClient<BackendRiskResponse>(`/risk/${farmId}`);
      const data = response.data;

      const currentLevel = mapSeverity(data.risk_level);

      // Map 5-day forecast
      const timeline: RiskDay[] = (data.five_day_forecast || []).slice(0, 5).map((f, i) => {
        const { day, dayHi, dayMr } = formatDayNames(f.date, i);
        return {
          day,
          dayHi,
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
          titleHi: `उच्च सापेक्ष आर्द्रता (${humidity}%)`,
          titleMr: `अपेक्षित जास्त हवेतील आर्द्रता (${humidity}%)`,
          icon: 'droplet',
          detail: `${data.explanation?.[0] || `Relative humidity at ${humidity}%`} creates ideal incubation for fungal spores.`,
          detailHi: `${humidity}% उच्च आर्द्रता फंगल बीजाणुओं के पनपने के लिए अनुकूल वातावरण बनाती है।`,
          detailMr: `${humidity}% हवेतील जास्त आर्द्रतेमुळे बुरशीची वाढ वेगाने होते.`,
        },
        {
          id: 'r2',
          title: `Rainfall Conditions (${rainChance}% Chance)`,
          titleHi: `बारिश की संभावना (${rainChance}%)`,
          titleMr: `पावसाची शक्यता (${rainChance}%)`,
          icon: 'cloud-rain',
          detail: `${data.explanation?.[1] || `${rainChance}% probability of rain`} can cause water splashing of soil-borne pathogens.`,
          detailHi: `बारिश की बूंदों से मिट्टी के रोगाणु ऊपरी पत्तियों पर फैल सकते हैं।`,
          detailMr: `पावसाच्या पाण्यामुळे जमिनीतील जंतू पानांवर उडण्याचा धोका वाढतो.`,
        },
        {
          id: 'r3',
          title: `${data.nearby_confirmed_cases || 5} Disease Cases in 10km Area`,
          titleHi: `10 किमी क्षेत्र में रोग के पुष्ट मामले`,
          titleMr: 'परिसरात आढळलेली रोग प्रकरणे',
          icon: 'map-pin',
          detail: defaultForecast.reasons.find((r) => r.id === 'r-cluster')?.detail || `${data.nearby_confirmed_cases || 5} confirmed disease detections reported nearby in the last 14 days.`,
          detailHi: defaultForecast.reasons.find((r) => r.id === 'r-cluster')?.detailHi || 'मागील 14 दिनों में आस-पास के खेतों में रोग की पुष्टि हुई है।',
          detailMr: defaultForecast.reasons.find((r) => r.id === 'r-cluster')?.detailMr || 'मागील १४ दिवसांत परिसरातील शेतांमध्ये रोगाची नोंद झाली आहे.',
        },
        {
          id: 'r4',
          title: `Crop Stage: ${data.crop_cycle?.crop_stage || 'Active Growth'}`,
          titleHi: `फसल अवस्था: ${data.crop_cycle?.crop_stage || 'सक्रिय वृद्धि'}`,
          titleMr: `पीक वाढ अवस्था: ${data.crop_cycle?.crop_stage || 'सक्रिय वाढ'}`,
          icon: 'wind',
          detail: data.explanation?.[2] || 'Canopy density requires adequate aeration and preventative monitoring.',
          detailHi: 'कैनोपी घनत्व के लिए उचित वायु संचरण और निगरानी आवश्यक है।',
          detailMr: 'फुलोरा आणि फळधारणा काळात पिकाची प्रतिकारशक्ती टिकवून ठेवणे आवश्यक आहे.',
        },
      ];

      const summary = `Disease risk score is ${data.risk_score}/100 (${data.risk_level}). Primary drivers: atmospheric humidity (${humidity}%) and rainfall chance (${rainChance}%).`;
      const summaryHi = `रोग जोखिम स्कोर: ${data.risk_score}/100 (${data.risk_level})। मुख्य कारक: आर्द्रता (${humidity}%) और बारिश की संभावना (${rainChance}%)।`;
      const summaryMr = `रोगाचा धोका स्तर: ${data.risk_level} (${data.risk_score}/100). हवेतील आर्द्रता (${humidity}%) व पावसाची शक्यता (${rainChance}%) यामुळे दक्षता घेणे आवश्यक आहे.`;

      const recommendation = currentLevel === 'high'
        ? 'Apply protective bio-fungicide or copper spray before oncoming rains. Avoid water stagnation.'
        : 'Maintain regular field scouting on lower leaf canopy and balance irrigation.';
      const recommendationHi = currentLevel === 'high'
        ? 'बारिश से पहले जैविक कवकनाशी या कॉपर का छिड़काव करें। जल भराव से बचें।'
        : 'निचली पत्तियों की नियमित जांच करें और संतुलित सिंचाई रखें।';
      const recommendationMr = currentLevel === 'high'
        ? 'पावसापूर्वी ट्रायकोडर्मा किंवा कॉपर बुरशीनाशकाची फवारणी करा. शेतात पाणी साचू देऊ नका.'
        : 'खालच्या पानांची नियमित तपासणी करा आणि पाण्याचा निचरा व्यवस्थित ठेवा.';

      return {
        cropId,
        currentLevel,
        summary,
        summaryHi,
        summaryMr,
        timeline: timeline.length > 0 ? timeline : defaultForecast.timeline,
        reasons,
        recommendation,
        recommendationHi,
        recommendationMr,
      };
    } catch (err) {
      console.warn('[riskService] Backend /api/risk call failed or offline, returning dynamic crop-specific risk forecast:', err);
      return defaultForecast;
    }
  },
};
