import type { RiskForecast, RiskDay, RiskReason, SeverityLevel } from '../types';
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
   * Connects to backend: GET /api/risk/:farmId
   * Falls back to MOCK_RISK_FORECAST if backend is unavailable.
   */
  async getRiskForecast(cropId: string = 'tomato', farmId: string = SEEDED_DEMO_FARM_ID): Promise<RiskForecast> {
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

      // Map factors into agricultural reasons
      const reasons: RiskReason[] = [
        {
          id: 'r1',
          title: 'High Humidity Forecast',
          titleMr: 'अपेक्षित जास्त हवेतील आर्द्रता',
          icon: 'droplet',
          detail: `${data.explanation?.[0] || 'Relative humidity above 85%'} creates ideal incubation for fungal spores.`,
          detailMr: '८५% पेक्षा जास्त आर्द्रतेमुळे बुरशीची वाढ वेगाने होते.',
        },
        {
          id: 'r2',
          title: 'Rainfall Conditions',
          titleMr: 'पावसाची शक्यता',
          icon: 'cloud-rain',
          detail: `${data.explanation?.[1] || 'Rain showers expected'} can cause water splashing of soil-borne pathogens.`,
          detailMr: 'पावसाच्या पाण्यामुळे जमिनीतील जंतू पानांवर उडतात.',
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

      const summary = `Disease risk score is ${data.risk_score}/100 (${data.risk_level}). Primary drivers: high atmospheric humidity and ${data.nearby_confirmed_cases} confirmed cases in your taluka.`;
      const summaryMr = `रोगाचा धोका स्तर: ${data.risk_level} (${data.risk_score}/100). हवेतील जास्त आर्द्रता व परिसरातील रोगाच्या प्रादुर्भावामुळे दक्षता घेणे आवश्यक आहे.`;

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
      console.warn('[riskService] Backend /api/risk call failed, falling back to mock risk forecast:', err);
      return {
        ...MOCK_RISK_FORECAST,
        cropId,
      };
    }
  },
};
