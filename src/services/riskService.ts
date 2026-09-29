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
    breakdown?: {
      temperature: string;
      temperatureValue?: string;
      humidity: string;
      humidityValue?: string;
      rainfall: string;
      rainfallValue?: string;
      nearbyReports: number;
      cropStage: string;
      overallRisk: string;
    };
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
      const cropQuery = cropId ? `?crop=${encodeURIComponent(cropId)}` : '';
      const response = await apiClient<BackendRiskResponse>(`/risk/${farmId}${cropQuery}`);
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

      const humidity = liveWeather?.humidity ?? 78;
      const rainChance = liveWeather?.rainfallChance ?? 55;
      const temp = liveWeather?.temp ?? 28;
      const rawTHI = 0.8 * temp + (humidity / 100) * (temp - 14.4) + 46.4;
      const thi = Math.round(rawTHI * 10) / 10;

      // Map factors into veterinary risk reasons
      const reasons: RiskReason[] = [
        {
          id: 'r1',
          title: `NRC Heat Stress Index: THI ${thi}`,
          titleHi: `पशु ताप-तनाव सूचकांक: THI ${thi}`,
          titleMr: `उष्णता ताण निर्देशांक: THI ${thi}`,
          icon: 'wind',
          detail: thi >= 79
            ? `THI at ${thi} triggers moderate heat stress. Milch cattle susceptible to 15-20% drop in milk yield and rapid respiration.`
            : `Current THI at ${thi} is manageable. Ensure plenty of cool drinking water and shed air circulation.`,
          detailHi: thi >= 79
            ? `THI ${thi} मध्यम ताप-तनाव का संकेत है। दुधारू पशुओं में 15-20% दूध गिरावट और सांस की गति तेज हो सकती है।`
            : `वर्तमान THI ${thi} सामान्य है। गोठे में ठंडा पेयजल और उचित हवा उपलब्ध कराएं।`,
          detailMr: thi >= 79
            ? `THI ${thi} उष्णता ताण दर्शवतो. दुधाळ जनावरांचे दूध १५-२०% कमी होण्याची आणि धाप लागण्याची शक्यता.`
            : `सध्याचा THI ${thi} सामान्य आहे. गोठ्यात मुबलक पिण्याचे पाणी आणि खेळती हवा ठेवा.`,
        },
        {
          id: 'r2',
          title: `LSD Vector Proliferation (${humidity}% Humidity)`,
          titleHi: `लम्पी वाहक मक्खी व मच्छर सक्रियता (${humidity}%)`,
          titleMr: `लंपी कीटक व डास पैदास धोका (${humidity}%)`,
          icon: 'droplet',
          detail: `Warm, humid conditions (${humidity}% humidity, ${rainChance}% rain chance) accelerate biting fly (Stomoxys) and mosquito breeding—the primary vectors of Lumpy Skin Disease.`,
          detailHi: `उच्च आर्द्रता (${humidity}%) और बारिश की संभावना (${rainChance}%) चावने वाली मक्खियों और मच्छरों को बढ़ाती है जो लम्पी वायरस फैलाते हैं।`,
          detailMr: `जास्त आर्द्रतेमुळे (${humidity}%) व पावसाच्या शक्यतेमुळे (${rainChance}%) चावणाऱ्या माश्या व डासांची पैदास वाढून लंपी रोगाचा प्रसार वेगाने होऊ शकतो.`,
        },
        {
          id: 'r3',
          title: `${data.nearby_confirmed_cases || 4} Livestock Outbreaks in 10km Area`,
          titleHi: `10 किमी क्षेत्र में पशु रोग प्रकोप (रिंग सर्विलांस)`,
          titleMr: '१० किमी परिसरात जनावरांच्या आजाराची नोंद',
          icon: 'map-pin',
          detail: defaultForecast.reasons.find((r) => r.id === 'r-cluster')?.detail || `${data.nearby_confirmed_cases || 4} livestock disease cases reported nearby in the active taluka surveillance ring.`,
          detailHi: defaultForecast.reasons.find((r) => r.id === 'r-cluster')?.detailHi || 'तालुका पशुधन निगरानी क्षेत्र में हाल ही में रोग के मामले दर्ज किए गए हैं।',
          detailMr: defaultForecast.reasons.find((r) => r.id === 'r-cluster')?.detailMr || 'तालुका पशुसंवर्धन निगराणी क्षेत्रात नजीकच्या गावांमध्ये आजाराची नोंद झाली आहे.',
        },
        {
          id: 'r4',
          title: `Herd Status: ${data.crop_cycle?.crop_stage || 'Crossbred Milch Herd'}`,
          titleHi: `पशुधन स्थिति: ${data.crop_cycle?.crop_stage || 'दुधारू पशु कळप'}`,
          titleMr: `गोठा स्थिती: ${data.crop_cycle?.crop_stage || 'दुधाळ जनावरांचा गोठा'}`,
          icon: 'cloud-rain',
          detail: data.explanation?.[2] || 'High-yielding lactating cows require strict shed biosecurity and preventive vaccination.',
          detailHi: 'उच्च दुग्ध उत्पादन वाली गायों को सख्त जैव-सुरक्षा और टीकाकरण की आवश्यकता होती है।',
          detailMr: 'जास्त दूध देणाऱ्या गाई-म्हशींमध्ये रोगप्रतिकारशक्ती टिकवण्यासाठी लसीकरण व गोठा स्वच्छता आवश्यक आहे.',
        },
      ];

      const summary = `Livestock disease & bioclimatic risk score is ${data.risk_score}/100 (${data.risk_level}). Primary drivers: NRC Heat Stress Index (THI ${thi}) and vector proliferation humidity (${humidity}%).`;
      const summaryHi = `पशुधन रोग व मौसम जोखिम स्कोर: ${data.risk_score}/100 (${data.risk_level})। मुख्य कारक: ताप-तनाव सूचकांक (THI ${thi}) और वाहक मक्खी आर्द्रता (${humidity}%)।`;
      const summaryMr = `जनावरांचा आजार व हवामान ताण निर्देशांक: ${data.risk_level} (${data.risk_score}/100). मुख्य घटक: उष्णता ताण (THI ${thi}) आणि डास/माश्यांची वाढ (${humidity}% आर्द्रता).`;

      const recommendation = currentLevel === 'high'
        ? 'Isolate sick cattle immediately. Hang vector-proof netting or herbal neem smoke in shed to stop LSD biting flies. Disinfect shed with 1:1000 potassium permanganate and call 1962.'
        : 'Maintain shaded shed ventilation and provide cool drinking water with electrolytes. Inspect cattle hides for nodules and hooves for lesions daily.';
      const recommendationHi = currentLevel === 'high'
        ? 'बीमार पशु को तुरंत अलग करें। गोठे में नीम की पत्ती का धुआं करें। फर्श को पोटेशियम परमैंगनेट के घोल से साफ करें और 1962 पर संपर्क करें।'
        : 'गोठे में छायादार वेंटिलेशन रखें और इलेक्ट्रोल युक्त पानी दें। प्रतिदिन पशु की त्वचा और खुरों की जांच करें।';
      const recommendationMr = currentLevel === 'high'
        ? 'आजारी जनावरास तात्काळ वेगळे करा. लंपी पसरवणाऱ्या माश्या रोखण्यासाठी गोठ्यात कडुनिंबाचा धूर करा. १:१००० पोटॅशियम परमँगनेटने गोठा निर्जंतुक करा आणि १९६२ वर संपर्क साधा.'
        : 'गोठ्यात सावली व हवेशीर वातावरण ठेवा. जनावरांच्या त्वचेवर गाठी किंवा लाळेची तपासणी दररोज सकाळी करा.';

      return {
        cropId,
        currentLevel,
        score: data.risk_score || defaultForecast.score || 78,
        breakdown: data.breakdown || defaultForecast.breakdown,
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
