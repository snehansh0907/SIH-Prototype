import type { DiagnosisResult, ActionItem, MonitorItem, SeverityLevel, ConfidenceLevel } from '../types';
import { apiClient, API_ROOT_URL } from './apiClient';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './authService';
import { DEFAULT_DIAGNOSIS, getDefaultDiagnosisForCrop, MOCK_CROPS } from './mockData';
import { diseaseDetectionService } from './diseaseDetection';
import { InvalidCropImageError } from './imageValidationService';

export { InvalidCropImageError };
export { diseaseDetectionService };

export const CROP_COMPATIBLE_DISEASES: Record<string, string[]> = {
  tomato: ['Early Blight', 'Late Blight', 'Leaf Mold', 'Healthy Leaf', 'Uncertain Image / Low AI Confidence'],
  soybean: ['Soybean Rust', 'Rust', 'Leaf Spot', 'Healthy Leaf', 'Uncertain Image / Low AI Confidence'],
  cotton: ['Leaf Curl Virus', 'Leaf Curl Disease', 'Bollworm Related Damage', 'Healthy Leaf', 'Uncertain Image / Low AI Confidence'],
  sugarcane: ['Red Rot', 'Healthy Leaf', 'Uncertain Image / Low AI Confidence'],
  maize: ['Turcicum Leaf Blight', 'Leaf Blight', 'Healthy Leaf', 'Uncertain Image / Low AI Confidence'],
  onion: ['Purple Blotch', 'Stemphylium Blight', 'Healthy Leaf', 'Uncertain Image / Low AI Confidence'],
  rice: ['Rice Blast', 'Blast', 'Healthy Leaf', 'Uncertain Image / Low AI Confidence'],
  wheat: ['Stripe Rust (Yellow Rust)', 'Stripe Rust', 'Yellow Rust', 'Healthy Leaf', 'Uncertain Image / Low AI Confidence'],
};

export function isDiseaseCompatibleWithCrop(diseaseName: string, cropIdOrName: string): boolean {
  if (!diseaseName) return true;
  const cropKey = (cropIdOrName || '').toLowerCase().trim();
  const allowed = CROP_COMPATIBLE_DISEASES[cropKey];
  if (!allowed) return true;
  const dLower = diseaseName.toLowerCase().trim();
  return allowed.some((a) => a.toLowerCase() === dLower || dLower.includes(a.toLowerCase()));
}

// Marathi disease name map for standard recognized diseases
const DISEASE_NAME_MR_MAP: Record<string, string> = {
  'Early Blight': 'करपा रोग (Early Blight)',
  'Late Blight': 'उशिरा येणारा करपा (Late Blight)',
  'Leaf Mold': 'पानावरील बुरशी (Leaf Mold)',
  'Leaf Curl Disease': 'पानांचा चुरमुरडा / लीफ कर्ल',
  'Leaf Curl Virus': 'पानांचा चुरमुरडा / लीफ कर्ल',
  'Bollworm Related Damage': 'बोंडअळी नुकसान',
  'Rust': 'सोयाबीन तांबेरा रोग (Rust)',
  'Soybean Rust': 'सोयाबीन तांबेरा रोग (Rust)',
  'Leaf Spot': 'पानावरील ठिपके (Leaf Spot)',
  'Red Rot': 'ऊस लाल कुजव्या रोग (Red Rot)',
  'Turcicum Leaf Blight': 'मका करपा रोग (Leaf Blight)',
  'Purple Blotch': 'कांदा जांभळा करपा (Purple Blotch)',
  'Rice Blast': 'भात कडा करपा / ब्लास्ट (Blast)',
  'Stripe Rust (Yellow Rust)': 'पिवळा तांबेरा (Yellow Rust)',
};

// Hindi disease name map for standard recognized diseases
const DISEASE_NAME_HI_MAP: Record<string, string> = {
  'Early Blight': 'अगेती झुलसा रोग (Early Blight)',
  'Late Blight': 'पछेती झुलसा रोग (Late Blight)',
  'Leaf Mold': 'पत्ती फफूंद (Leaf Mold)',
  'Leaf Curl Disease': 'पत्ती मरोड़ / पर्ण कुंचन रोग (Leaf Curl)',
  'Leaf Curl Virus': 'पत्ती मरोड़ / पर्ण कुंचन रोग (Leaf Curl)',
  'Bollworm Related Damage': 'गुलाबी सुंडी / इल्ली नुकसान',
  'Rust': 'सोयाबीन गेरुआ रोग (Rust)',
  'Soybean Rust': 'सोयाबीन गेरुआ रोग (Rust)',
  'Leaf Spot': 'पत्ती धब्बा रोग (Leaf Spot)',
  'Red Rot': 'लाल सड़न रोग (Red Rot)',
  'Turcicum Leaf Blight': 'मक्का पत्ती झुलसा (Leaf Blight)',
  'Purple Blotch': 'बैंगनी धब्बा रोग (Purple Blotch)',
  'Rice Blast': 'धान का झोंका रोग (Rice Blast)',
  'Stripe Rust (Yellow Rust)': 'पीला रतुआ / गेरुआ रोग (Yellow Rust)',
};

// Category and title parsing for IPM what_to_do_today strings
function parseAdvisoryActions(items?: string[], fallback?: ActionItem[]): ActionItem[] {
  if (!items || items.length === 0) {
    return fallback || DEFAULT_DIAGNOSIS.whatToDoToday;
  }

  return items.map((raw, idx) => {
    let category: 'cultural' | 'mechanical' | 'biological' | 'chemical' = 'cultural';
    let text = raw;

    const lower = raw.toLowerCase();
    if (lower.startsWith('cultural:')) {
      category = 'cultural';
      text = raw.replace(/^cultural:\s*/i, '');
    } else if (lower.startsWith('mechanical:')) {
      category = 'mechanical';
      text = raw.replace(/^mechanical:\s*/i, '');
    } else if (lower.startsWith('biological:')) {
      category = 'biological';
      text = raw.replace(/^biological:\s*/i, '');
    } else if (lower.startsWith('chemical')) {
      category = 'chemical';
      text = raw.replace(/^chemical(\s*\(.*?\))?:\s*/i, '');
    }

    const priority: 'critical' | 'important' | 'preventive' =
      idx === 0 ? 'critical' : idx === 1 ? 'important' : 'preventive';

    return {
      step: idx + 1,
      title: text.length > 50 ? `${text.slice(0, 48)}...` : text,
      titleMr: `${category.toUpperCase()}: शेतातील उपाययोजना (${idx + 1})`,
      titleHi: `${category.toUpperCase()}: खेत में निवारक उपाय (${idx + 1})`,
      description: text,
      descriptionMr: `सल्ला: ${text}`,
      descriptionHi: `सलाह: ${text}`,
      priority,
      category,
    };
  });
}

function parseAdvisoryMonitors(items?: string[], fallback?: MonitorItem[]): MonitorItem[] {
  if (!items || items.length === 0) {
    return fallback || DEFAULT_DIAGNOSIS.whatToMonitor;
  }

  return items.map((item) => ({
    title: item.length > 35 ? `${item.slice(0, 32)}...` : item,
    titleMr: 'निरीक्षण करा',
    titleHi: 'निगरानी करें',
    check: item,
    checkMr: item,
    checkHi: item,
  }));
}

/**
 * Maps a backend diagnosis record or API response into a frontend DiagnosisResult.
 */
function mapBackendCaseToDiagnosisResult(data: any, expectedCropIdOrName?: string): DiagnosisResult {
  const cropRaw = data.crop || data.crop_name || data.crop_cycle?.crop_name || expectedCropIdOrName || 'tomato';
  const cropId = cropRaw.toLowerCase().trim();
  const defaultDiag = getDefaultDiagnosisForCrop(cropId);
  const selectedCrop = MOCK_CROPS.find((c) => c.id === cropId) || MOCK_CROPS[0];

  const severityMap: Record<string, SeverityLevel> = {
    low: 'low',
    moderate: 'moderate',
    high: 'high',
    severe: 'high',
  };
  const mappedSeverity: SeverityLevel =
    severityMap[(data.severity_band || '').toLowerCase()] || defaultDiag.severity;

  let confidenceLabel: ConfidenceLevel = defaultDiag.confidenceLabel;
  const conf = typeof data.confidence === 'number' ? data.confidence : 85;
  if (conf < 75) {
    confidenceLabel = 'review';
  } else if (conf < 85) {
    confidenceLabel = 'monitor';
  }

  const rawDisease = data.predicted_disease || data.disease || defaultDiag.diseaseName;
  const diseaseName = isDiseaseCompatibleWithCrop(rawDisease, cropId) ? rawDisease : defaultDiag.diseaseName;
  const diseaseNameMr = DISEASE_NAME_MR_MAP[diseaseName] || defaultDiag.diseaseNameMr;
  const diseaseNameHi = DISEASE_NAME_HI_MAP[diseaseName] || defaultDiag.diseaseNameHi;

  const advisory = data.advisory;
  const actions = parseAdvisoryActions(advisory?.what_to_do_today, defaultDiag.whatToDoToday);
  const monitors = parseAdvisoryMonitors(advisory?.what_to_monitor, defaultDiag.whatToMonitor);

  let finalImageUrl = defaultDiag.imageUrl;
  if (data.image_url) {
    finalImageUrl = data.image_url.startsWith('http')
      ? data.image_url
      : `${API_ROOT_URL}${data.image_url}`;
  }

  const voiceScript = `Detected ${diseaseName} on ${selectedCrop.name} with ${data.severity_band || 'moderate'} severity. Follow the recommended daily IPM steps.`;
  const voiceScriptMr = `${selectedCrop.nameMr} पिकावर ${diseaseNameMr} आढळला आहे. दिलेल्या उपाययोजना अंमलात आणा.`;
  const voiceScriptHi = `${selectedCrop.nameHi || selectedCrop.name} फसल पर ${diseaseNameHi || diseaseName} पाया गया है। दिए गए उपायों का पालन करें।`;

  return {
    id: data.id || data.case_id || defaultDiag.id,
    cropId,
    cropName: selectedCrop.name,
    cropNameMr: selectedCrop.nameMr,
    cropNameHi: selectedCrop.nameHi || selectedCrop.name,
    diseaseName,
    diseaseNameMr,
    diseaseNameHi,
    pathogen: advisory?.disease_info?.scientific_name || defaultDiag.pathogen,
    severity: mappedSeverity,
    confidenceLabel,
    isUncertain: data.requires_expert_review && conf < 80,
    detectedAt: data.created_at
      ? `Detected ${new Date(data.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
      : defaultDiag.detectedAt,
    imageUrl: finalImageUrl,
    whatToDoToday: actions,
    whatToMonitor: monitors,
    whatMayHappenNext: defaultDiag.whatMayHappenNext,
    advisoryVoiceScript: defaultDiag.advisoryVoiceScript || voiceScript,
    advisoryVoiceScriptMr: defaultDiag.advisoryVoiceScriptMr || voiceScriptMr,
    advisoryVoiceScriptHi: defaultDiag.advisoryVoiceScriptHi || voiceScriptHi,
  };
}

export const diagnosisService = {
  /**
   * Submit a crop photo for AI diagnosis.
   * Delegates to primary diseaseDetectionService (POST /api/diagnose).
   */
  async checkCrop(
    cropId: string,
    imageSource?: string | File | Blob,
    options?: { farmerId?: string; farmId?: string; cropCycleId?: string; cropStage?: string }
  ): Promise<DiagnosisResult> {
    return await diseaseDetectionService.diagnose(imageSource, cropId, options);
  },



  async getDiagnosisById(caseId: string): Promise<any> {
    try {
      const res = await apiClient<{ success: boolean; data: any }>(`/diagnosis/${caseId}`);
      return res.data;
    } catch {
      return null;
    }
  },

  /**
   * Fetch latest diagnosis case for a specific farm, filtered by crop.
   */
  async getLatestDiagnosisForFarm(farmId: string, cropName?: string): Promise<DiagnosisResult | null> {
    if (!farmId) return null;
    const targetCrop = (cropName || '').toLowerCase().trim();

    // 1. Try Backend API with fast 2500ms timeout
    try {
      const cropQuery = cropName ? `?crop=${encodeURIComponent(cropName)}` : '';
      const res = await apiClient<{ success: boolean; data: any }>(`/diagnosis/farm/${farmId}/latest${cropQuery}`, {
        timeout: 2500,
      });
      if (res?.data) {
        const diag = mapBackendCaseToDiagnosisResult(res.data, cropName);
        if ((!targetCrop || diag.cropId === targetCrop) && isDiseaseCompatibleWithCrop(diag.diseaseName, diag.cropId)) {
          return diag;
        }
      }
    } catch {}

    // 2. Direct Supabase REST Fallback
    try {
      const supaHeaders = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      };
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/diagnosis_cases?farm_id=eq.${farmId}&select=*,crop_cycle:crop_cycle_id(id,crop_name,variety,crop_stage)&order=created_at.desc&limit=15`,
        { headers: supaHeaders }
      );
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const matched = list.find((c) => {
            const cCrop = (c.crop_cycle?.crop_name || c.crop || '').toLowerCase().trim();
            const disease = c.predicted_disease || c.disease || '';
            const cropMatches = !targetCrop || cCrop === targetCrop;
            return cropMatches && isDiseaseCompatibleWithCrop(disease, targetCrop || cCrop);
          });
          if (matched) {
            return mapBackendCaseToDiagnosisResult(matched, cropName);
          }
        }
      }
    } catch {}

    return null;
  },

  /**
   * Fetch latest diagnosis case for a specific farmer, filtered by crop.
   */
  async getLatestDiagnosisForFarmer(farmerId: string, cropName?: string): Promise<DiagnosisResult | null> {
    if (!farmerId) return null;
    const targetCrop = (cropName || '').toLowerCase().trim();

    // 1. Try Backend API with fast 2500ms timeout
    try {
      const cropQuery = cropName ? `?crop=${encodeURIComponent(cropName)}` : '';
      const res = await apiClient<{ success: boolean; data: any }>(`/diagnosis/farmer/${farmerId}/latest${cropQuery}`, {
        timeout: 2500,
      });
      if (res?.data) {
        const diag = mapBackendCaseToDiagnosisResult(res.data, cropName);
        if ((!targetCrop || diag.cropId === targetCrop) && isDiseaseCompatibleWithCrop(diag.diseaseName, diag.cropId)) {
          return diag;
        }
      }
    } catch {}

    // 2. Direct Supabase REST Fallback
    try {
      const supaHeaders = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      };
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/diagnosis_cases?farmer_id=eq.${farmerId}&select=*,crop_cycle:crop_cycle_id(id,crop_name,variety,crop_stage)&order=created_at.desc&limit=15`,
        { headers: supaHeaders }
      );
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const matched = list.find((c) => {
            const cCrop = (c.crop_cycle?.crop_name || c.crop || '').toLowerCase().trim();
            const disease = c.predicted_disease || c.disease || '';
            const cropMatches = !targetCrop || cCrop === targetCrop;
            return cropMatches && isDiseaseCompatibleWithCrop(disease, targetCrop || cCrop);
          });
          if (matched) {
            return mapBackendCaseToDiagnosisResult(matched, cropName);
          }
        }
      }
    } catch {}

    return null;
  },

  /**
   * Master context resolver: gets latest diagnosis strictly for the active farmer/farm/crop context.
   * If no existing diagnosis case exists for this specific crop, returns the dynamic crop-specific default.
   */
  async getDiagnosisForActiveContext(options: {
    farmId?: string;
    farmerId?: string;
    cropName?: string;
  }): Promise<DiagnosisResult> {
    const cropId = (options.cropName || 'tomato').toLowerCase().trim();

    // 1. Try farm latest for this crop
    if (options.farmId) {
      const farmCase = await this.getLatestDiagnosisForFarm(options.farmId, options.cropName);
      if (farmCase && farmCase.cropId === cropId && isDiseaseCompatibleWithCrop(farmCase.diseaseName, cropId)) {
        return farmCase;
      }
    }

    // 2. Try farmer latest for this crop
    if (options.farmerId) {
      const farmerCase = await this.getLatestDiagnosisForFarmer(options.farmerId, options.cropName);
      if (farmerCase && farmerCase.cropId === cropId && isDiseaseCompatibleWithCrop(farmerCase.diseaseName, cropId)) {
        return farmerCase;
      }
    }

    // 3. Dynamic crop-specific default (strictly matches active crop)
    return getDefaultDiagnosisForCrop(cropId);
  },

  async getLatestDiagnosis(cropId?: string): Promise<DiagnosisResult> {
    return getDefaultDiagnosisForCrop(cropId || 'tomato');
  },
};
