import type { DiagnosisResult, ActionItem, MonitorItem, SeverityLevel, ConfidenceLevel } from '../types';
import { apiClient, API_ROOT_URL } from './apiClient';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './authService';
import { DEFAULT_DIAGNOSIS, getDefaultDiagnosisForCrop, MOCK_CROPS, MOCK_LIVESTOCK } from './mockData';
import { diseaseDetectionService } from './diseaseDetection';
import { InvalidCropImageError, InvalidLivestockImageError } from './imageValidationService';

export { InvalidCropImageError, InvalidLivestockImageError };
export { diseaseDetectionService };

export const LIVESTOCK_COMPATIBLE_DISEASES: Record<string, string[]> = {
  cattle: ['Lumpy Skin Disease (LSD)', 'Foot-and-Mouth Disease (FMD)', 'LSD', 'FMD', 'Healthy Animal', 'Uncertain Photo / Low AI Confidence'],
  cow: ['Lumpy Skin Disease (LSD)', 'Foot-and-Mouth Disease (FMD)', 'LSD', 'FMD', 'Healthy Animal', 'Uncertain Photo / Low AI Confidence'],
  buffalo: ['Foot-and-Mouth Disease (FMD)', 'Lumpy Skin Disease (LSD)', 'FMD', 'Healthy Animal', 'Uncertain Photo / Low AI Confidence'],
  goat: ['Foot-and-Mouth Disease (FMD)', 'Peste des Petits Ruminants (PPR)', 'FMD', 'Healthy Animal', 'Uncertain Photo / Low AI Confidence'],
  sheep: ['Foot-and-Mouth Disease (FMD)', 'Sheep Pox', 'FMD', 'Healthy Animal', 'Uncertain Photo / Low AI Confidence'],
  // Compatibility fallback for existing crop keys
  tomato: ['Lumpy Skin Disease (LSD)', 'Foot-and-Mouth Disease (FMD)', 'Healthy Animal', 'Uncertain Photo / Low AI Confidence'],
  onion: ['Lumpy Skin Disease (LSD)', 'Foot-and-Mouth Disease (FMD)', 'Healthy Animal', 'Uncertain Photo / Low AI Confidence'],
  cotton: ['Lumpy Skin Disease (LSD)', 'Foot-and-Mouth Disease (FMD)', 'Healthy Animal', 'Uncertain Photo / Low AI Confidence'],
  soybean: ['Lumpy Skin Disease (LSD)', 'Foot-and-Mouth Disease (FMD)', 'Healthy Animal', 'Uncertain Photo / Low AI Confidence'],
};

export const CROP_COMPATIBLE_DISEASES = LIVESTOCK_COMPATIBLE_DISEASES;

export function isDiseaseCompatibleWithCrop(diseaseName: string, speciesOrCropId: string): boolean {
  if (!diseaseName) return true;
  const key = (speciesOrCropId || '').toLowerCase().trim();
  const allowed = LIVESTOCK_COMPATIBLE_DISEASES[key] || LIVESTOCK_COMPATIBLE_DISEASES.cattle;
  if (!allowed) return true;
  const dLower = diseaseName.toLowerCase().trim();
  return allowed.some((a) => a.toLowerCase() === dLower || dLower.includes(a.toLowerCase()) || a.toLowerCase().includes(dLower));
}

// Marathi disease name map for livestock diseases
const DISEASE_NAME_MR_MAP: Record<string, string> = {
  'Lumpy Skin Disease (LSD)': 'लंपी चर्मरोग (LSD)',
  'Lumpy Skin Disease': 'लंपी चर्मरोग (LSD)',
  'LSD': 'लंपी चर्मरोग (LSD)',
  'Foot-and-Mouth Disease (FMD)': 'लाळ्या खुरकूत रोग (FMD)',
  'Foot-and-Mouth Disease': 'लाळ्या खुरकूत रोग (FMD)',
  'FMD': 'लाळ्या खुरकूत रोग (FMD)',
  'Healthy Animal': 'निरोगी पशु (रोगमुक्त)',
  'Uncertain Photo / Low AI Confidence': 'अस्पष्ट फोटो / AI निदान अनिश्चित',
};

// Hindi disease name map for livestock diseases
const DISEASE_NAME_HI_MAP: Record<string, string> = {
  'Lumpy Skin Disease (LSD)': 'लंपी चर्मरोग (LSD)',
  'Lumpy Skin Disease': 'लंपी चर्मरोग (LSD)',
  'LSD': 'लंपी चर्मरोग (LSD)',
  'Foot-and-Mouth Disease (FMD)': 'खुरपका-मुंहपका रोग (FMD)',
  'Foot-and-Mouth Disease': 'खुरपका-मुंहपका रोग (FMD)',
  'FMD': 'खुरपका-मुंहपका रोग (FMD)',
  'Healthy Animal': 'स्वस्थ पशु (रोगमुक्त)',
  'Uncertain Photo / Low AI Confidence': 'अस्पष्ट फोटो / AI निदान अनिश्चित',
};

// Category and title parsing for Veterinary what_to_do_today strings
function parseAdvisoryActions(items?: string[], fallback?: ActionItem[]): ActionItem[] {
  if (!items || items.length === 0) {
    return fallback || DEFAULT_DIAGNOSIS.whatToDoToday;
  }

  return items.map((raw, idx) => {
    let category: 'cultural' | 'mechanical' | 'biological' | 'chemical' = 'cultural';
    let text = raw;

    const lower = raw.toLowerCase();
    if (lower.startsWith('quarantine:') || lower.startsWith('isolation:') || lower.startsWith('cultural:')) {
      category = 'cultural';
      text = raw.replace(/^(quarantine|isolation|cultural):\s*/i, '');
    } else if (lower.startsWith('antiseptic:') || lower.startsWith('supportive:') || lower.startsWith('mechanical:')) {
      category = 'mechanical';
      text = raw.replace(/^(antiseptic|supportive|mechanical):\s*/i, '');
    } else if (lower.startsWith('nutrition:') || lower.startsWith('diet:') || lower.startsWith('biological:')) {
      category = 'biological';
      text = raw.replace(/^(nutrition|diet|biological):\s*/i, '');
    } else if (lower.startsWith('veterinary') || lower.startsWith('chemical')) {
      category = 'chemical';
      text = raw.replace(/^(veterinary|chemical(\s*\(.*?\))?):\s*/i, '');
    }

    const priority: 'critical' | 'important' | 'preventive' =
      idx === 0 ? 'critical' : idx === 1 ? 'important' : 'preventive';

    return {
      step: idx + 1,
      title: text.length > 50 ? `${text.slice(0, 48)}...` : text,
      titleMr: `उपाय (${idx + 1}): ${text.slice(0, 35)}`,
      titleHi: `पशु उपाय (${idx + 1}): ${text.slice(0, 35)}`,
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
function mapBackendCaseToDiagnosisResult(data: any, expectedSpeciesOrCrop?: string): DiagnosisResult {
  const speciesRaw = data.species || data.crop || data.crop_name || data.crop_cycle?.crop_name || expectedSpeciesOrCrop || 'cattle';
  const speciesId = speciesRaw.toLowerCase().trim();
  const defaultDiag = getDefaultDiagnosisForCrop(speciesId);
  const selectedSpecies = MOCK_LIVESTOCK.find((s) => s.id === speciesId) || MOCK_CROPS[0];

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
  const diseaseName = isDiseaseCompatibleWithCrop(rawDisease, speciesId) ? rawDisease : defaultDiag.diseaseName;
  const diseaseNameMr = DISEASE_NAME_MR_MAP[diseaseName] || defaultDiag.diseaseNameMr;
  const diseaseNameHi = DISEASE_NAME_HI_MAP[diseaseName] || defaultDiag.diseaseNameHi;

  const advisory = data.advisory;
  const actions = parseAdvisoryActions(advisory?.what_to_do_today || advisory?.immediateActions, defaultDiag.whatToDoToday);
  const monitors = parseAdvisoryMonitors(advisory?.what_to_monitor || advisory?.monitoring, defaultDiag.whatToMonitor);

  let finalImageUrl = defaultDiag.imageUrl;
  if (data.image_url) {
    finalImageUrl = data.image_url.startsWith('http')
      ? data.image_url
      : `${API_ROOT_URL}${data.image_url}`;
  }

  const voiceScript = `Detected ${diseaseName} on ${selectedSpecies.name} with ${data.severity_band || 'moderate'} severity. Follow the recommended veterinary care steps.`;
  const voiceScriptMr = `${selectedSpecies.nameMr} मध्ये ${diseaseNameMr} आढळला आहे. दिलेल्या पशुवैद्यकीय उपाययोजना अंमलात आणा.`;
  const voiceScriptHi = `${selectedSpecies.nameHi || selectedSpecies.name} में ${diseaseNameHi || diseaseName} पाया गया है। दिए गए पशु चिकित्सा उपायों का पालन करें।`;

  return {
    id: data.id || data.case_id || defaultDiag.id,
    cropId: speciesId,
    cropName: selectedSpecies.name,
    cropNameMr: selectedSpecies.nameMr,
    cropNameHi: selectedSpecies.nameHi || selectedSpecies.name,
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
   * Submit an animal photo for AI diagnosis.
   * Delegates to primary diseaseDetectionService (POST /api/diagnose).
   */
  async checkCrop(
    speciesOrCropId: string,
    imageSource?: string | File | Blob,
    options?: { farmerId?: string; ownerId?: string; farmId?: string; shedId?: string; cropCycleId?: string; unitId?: string; affectedBodyPart?: string; animalTag?: string }
  ): Promise<DiagnosisResult> {
    return await diseaseDetectionService.diagnose(imageSource, speciesOrCropId, options);
  },

  async checkAnimal(
    speciesId: string,
    imageSource?: string | File | Blob,
    options?: { ownerId?: string; shedId?: string; affectedBodyPart?: string; animalTag?: string }
  ): Promise<DiagnosisResult> {
    return await diseaseDetectionService.diagnose(imageSource, speciesId, options);
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
   * Fetch latest diagnosis case for a specific shed / herd.
   */
  async getLatestDiagnosisForFarm(farmId: string, speciesOrCropName?: string): Promise<DiagnosisResult | null> {
    if (!farmId) return null;
    const target = (speciesOrCropName || '').toLowerCase().trim();

    try {
      const q = speciesOrCropName ? `?species=${encodeURIComponent(speciesOrCropName)}` : '';
      const res = await apiClient<{ success: boolean; data: any }>(`/diagnosis/farm/${farmId}/latest${q}`, {
        timeout: 2500,
      });
      if (res?.data) {
        const diag = mapBackendCaseToDiagnosisResult(res.data, speciesOrCropName);
        if ((!target || diag.cropId === target) && isDiseaseCompatibleWithCrop(diag.diseaseName, diag.cropId)) {
          return diag;
        }
      }
    } catch {}

    // Direct Supabase REST Fallback
    try {
      const supaHeaders = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      };
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/diagnosis_cases?farm_id=eq.${farmId}&order=created_at.desc&limit=15`,
        { headers: supaHeaders }
      );
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const matched = list.find((c) => {
            const cSpecies = (c.species || c.crop || '').toLowerCase().trim();
            const disease = c.predicted_disease || c.disease || '';
            const matches = !target || cSpecies === target;
            return matches && isDiseaseCompatibleWithCrop(disease, target || cSpecies);
          });
          if (matched) {
            return mapBackendCaseToDiagnosisResult(matched, speciesOrCropName);
          }
        }
      }
    } catch {}

    return null;
  },

  /**
   * Fetch latest diagnosis case for a specific livestock owner.
   */
  async getLatestDiagnosisForFarmer(farmerId: string, speciesOrCropName?: string): Promise<DiagnosisResult | null> {
    if (!farmerId) return null;
    const target = (speciesOrCropName || '').toLowerCase().trim();

    try {
      const q = speciesOrCropName ? `?species=${encodeURIComponent(speciesOrCropName)}` : '';
      const res = await apiClient<{ success: boolean; data: any }>(`/diagnosis/farmer/${farmerId}/latest${q}`, {
        timeout: 2500,
      });
      if (res?.data) {
        const diag = mapBackendCaseToDiagnosisResult(res.data, speciesOrCropName);
        if ((!target || diag.cropId === target) && isDiseaseCompatibleWithCrop(diag.diseaseName, diag.cropId)) {
          return diag;
        }
      }
    } catch {}

    // Direct Supabase REST Fallback
    try {
      const supaHeaders = {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      };
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/diagnosis_cases?farmer_id=eq.${farmerId}&order=created_at.desc&limit=15`,
        { headers: supaHeaders }
      );
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const matched = list.find((c) => {
            const cSpecies = (c.species || c.crop || '').toLowerCase().trim();
            const disease = c.predicted_disease || c.disease || '';
            const matches = !target || cSpecies === target;
            return matches && isDiseaseCompatibleWithCrop(disease, target || cSpecies);
          });
          if (matched) {
            return mapBackendCaseToDiagnosisResult(matched, speciesOrCropName);
          }
        }
      }
    } catch {}

    return null;
  },

  /**
   * Master context resolver: gets latest diagnosis strictly for the active livestock owner/shed context.
   */
  async getDiagnosisForActiveContext(options: {
    farmId?: string;
    farmerId?: string;
    cropName?: string;
  }): Promise<DiagnosisResult> {
    const speciesId = (options.cropName || 'cattle').toLowerCase().trim();

    if (options.farmId) {
      const farmCase = await this.getLatestDiagnosisForFarm(options.farmId, options.cropName);
      if (farmCase && farmCase.cropId === speciesId && isDiseaseCompatibleWithCrop(farmCase.diseaseName, speciesId)) {
        return farmCase;
      }
    }

    if (options.farmerId) {
      const farmerCase = await this.getLatestDiagnosisForFarmer(options.farmerId, options.cropName);
      if (farmerCase && farmerCase.cropId === speciesId && isDiseaseCompatibleWithCrop(farmerCase.diseaseName, speciesId)) {
        return farmerCase;
      }
    }

    return getDefaultDiagnosisForCrop(speciesId);
  },

  async getLatestDiagnosis(speciesId?: string): Promise<DiagnosisResult> {
    return getDefaultDiagnosisForCrop(speciesId || 'cattle');
  },
};
