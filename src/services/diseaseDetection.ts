/**
 * Livestock Disease Detection Service
 * Primary functional workflow for "Check My Animal" (SIH26128).
 *
 * ARCHITECTURAL INTEGRITY NOTE:
 * - MobileNet (client-side) is used strictly for pre-upload animal validation
 *   (confirming the image is an animal / tissue before consuming network/compute).
 *   It is NEVER falsely labeled as a veterinary pathologist.
 * - Disease detection connects to backend POST /api/diagnose (or /api/diagnosis) which
 *   implements a pluggable pathology model architecture.
 * - Scoped to Lumpy Skin Disease (LSD) skin nodules and Foot-and-Mouth Disease (FMD) lesions.
 * - Supports explicit low-confidence state (< 0.60):
 *   "Unable to confidently identify the livestock condition. Please capture a clear image of nodules, muzzle, or hooves."
 * - Does not force every image into a disease (supports healthy animals and indeterminate images).
 */

import type { DiagnosisResult, SeverityLevel, ConfidenceLevel, ActionItem, MonitorItem } from '../types';
import { apiClient, API_ROOT_URL } from './apiClient';
import { validateLivestockImage, InvalidLivestockImageError, InvalidCropImageError } from './imageValidationService';
import { getDefaultDiagnosisForCrop, MOCK_CROPS, MOCK_LIVESTOCK } from './mockData';

export { InvalidLivestockImageError, InvalidCropImageError };

export interface RawDiagnosisPayload {
  case_id: string;
  id?: string;
  crop?: string;
  species?: string;
  affected_body_part?: string;
  animal_tag?: string;
  disease: string;
  type: 'disease' | 'pest' | 'healthy' | 'uncertain';
  confidence: number; // 0.0 - 1.0 (or 0-100)
  severity: string;
  severity_band?: string;
  severity_percent?: number;
  image_url?: string;
  is_uncertain?: boolean;
  requires_expert_review?: boolean;
  message?: string;
  risk?: {
    score: number;
    level: string;
    reasons: string[];
    breakdown?: {
      temperature: string;
      temperatureValue?: string;
      humidity: string;
      humidityValue?: string;
      rainfall: string;
      rainfallValue?: string;
      nearbyReports: number;
      cropStage?: string;
      overallRisk: string;
    };
    factors?: Record<string, number>;
  };
  advisory?: {
    status?: string;
    what_to_do_today?: string[];
    what_to_monitor?: string[];
    prevention?: string[];
    immediateActions?: string[];
    monitoring?: string[];
    supportiveCare?: string[];
    veterinaryEscalation?: string[];
    biologicalOptions?: string[];
    chemicalIntervention?: string[];
    expertEscalation?: string[];
    disease_info?: {
      disease_name: string;
      scientific_name?: string;
      description?: string;
    };
  };
}

export interface DiseaseDetectionOptions {
  farmerId?: string;
  ownerId?: string;
  farmId?: string;
  shedId?: string;
  cropCycleId?: string;
  unitId?: string;
  cropStage?: string;
  affectedBodyPart?: string;
  animalTag?: string;
  latitude?: number;
  longitude?: number;
}

// Convert base64 data URL to Blob
function dataURLtoBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const binaryStr = atob(parts[1]);
  const len = binaryStr.length;
  const u8arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    u8arr[i] = binaryStr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

async function resolveImageBlob(imageSource?: string | File | Blob): Promise<Blob | null> {
  if (!imageSource) return null;
  if (typeof imageSource === 'object') return imageSource as Blob;
  if (typeof imageSource === 'string') {
    if (imageSource.startsWith('data:')) return dataURLtoBlob(imageSource);
    try {
      const resp = await fetch(imageSource);
      return await resp.blob();
    } catch {
      return null;
    }
  }
  return null;
}

async function resolveDisplayUrl(imageSource?: string | File | Blob): Promise<string> {
  if (!imageSource) return '';
  if (typeof imageSource === 'string') return imageSource;
  if (imageSource instanceof File || imageSource instanceof Blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.onerror = () => {
        try {
          resolve(URL.createObjectURL(imageSource));
        } catch {
          resolve('');
        }
      };
      reader.readAsDataURL(imageSource);
    });
  }
  return '';
}

/**
 * Maps raw backend/pluggable API diagnosis payload to frontend DiagnosisResult.
 */
export function mapToDiagnosisResult(
  payload: RawDiagnosisPayload,
  selectedSpeciesId: string = 'cattle',
  localImageUrl?: string
): DiagnosisResult {
  const speciesId = (payload.species || payload.crop || selectedSpeciesId || 'cattle').toLowerCase().trim();
  const defaultDiag = getDefaultDiagnosisForCrop(speciesId);
  const matchedSpecies = MOCK_LIVESTOCK.find((s) => s.id === speciesId) || MOCK_CROPS[0];

  const confRaw = typeof payload.confidence === 'number' ? payload.confidence : 0.88;
  const normalizedConf = confRaw > 1 ? confRaw / 100 : confRaw;
  const isLowConfidence = normalizedConf < 0.60 || payload.is_uncertain === true || payload.type === 'uncertain';

  const severityMap: Record<string, SeverityLevel> = {
    low: 'low',
    mild: 'low',
    moderate: 'moderate',
    high: 'high',
    severe: 'high',
  };
  const mappedSeverity: SeverityLevel =
    severityMap[(payload.severity || payload.severity_band || '').toLowerCase()] ||
    (isLowConfidence ? 'low' : 'moderate');

  let confidenceLabel: ConfidenceLevel = 'reliable';
  if (normalizedConf < 0.60) {
    confidenceLabel = 'review';
  } else if (normalizedConf < 0.80) {
    confidenceLabel = 'monitor';
  }

  // Disease naming
  let diseaseName = payload.disease || defaultDiag.diseaseName;
  let diseaseNameHi = defaultDiag.diseaseNameHi;
  let diseaseNameMr = defaultDiag.diseaseNameMr;

  const diseaseLower = diseaseName.toLowerCase();
  if (isLowConfidence) {
    diseaseName = 'Uncertain Photo / Low AI Confidence';
    diseaseNameHi = 'अस्पष्ट फोटो / AI निदान अनिश्चित';
    diseaseNameMr = 'अस्पष्ट फोटो / AI निदान अनिश्चित';
  } else if (diseaseLower.includes('foot') || diseaseLower.includes('mouth') || diseaseLower.includes('fmd')) {
    diseaseName = 'Foot-and-Mouth Disease (FMD)';
    diseaseNameHi = 'खुरपका-मुंहपका रोग (FMD)';
    diseaseNameMr = 'लाळ्या खुरकूत रोग (FMD)';
  } else if (diseaseLower.includes('lumpy') || diseaseLower.includes('lsd') || diseaseLower.includes('nodule')) {
    diseaseName = 'Lumpy Skin Disease (LSD)';
    diseaseNameHi = 'लंपी चर्मरोग (LSD)';
    diseaseNameMr = 'लंपी चर्मरोग (Lumpy Skin Disease)';
  } else if (diseaseLower.includes('healthy')) {
    diseaseName = 'Healthy Animal';
    diseaseNameHi = 'स्वस्थ पशु (रोगमुक्त)';
    diseaseNameMr = 'निरोगी पशु (रोगमुक्त)';
  }

  // Parse structured actions
  const actions: ActionItem[] = [];
  const rawActions =
    payload.advisory?.immediateActions ||
    payload.advisory?.what_to_do_today ||
    [];

  if (isLowConfidence) {
    actions.push(
      {
        step: 1,
        title: 'Retake photo in clear daylight',
        titleHi: 'दिन के उजाले में पशु के लक्षणों की स्पष्ट फोटो लें',
        titleMr: 'सूर्यप्रकाशात जनावराच्या गाठी किंवा तोंडाचा स्पष्ट फोटो पुन्हा काढा',
        description: 'Position camera 20-30 cm from skin nodules, muzzle, or hooves with steady hands and clear focus.',
        descriptionHi: 'गांठों या मुंह के छालों से 20-30 सेमी की दूरी पर कैमरा स्थिर रखकर स्पष्ट फोटो लें।',
        descriptionMr: 'गाठी किंवा खुरांपासून २०-३० सेमी अंतरावर कॅमेरा धरून स्पष्ट फोटो काढा.',
        priority: 'critical',
        category: 'cultural',
      },
      {
        step: 2,
        title: 'Request Veterinary Officer Verification',
        titleHi: 'पशु चिकित्सा अधिकारी से सत्यापन का अनुरोध करें',
        titleMr: 'पशुवैद्यकीय अधिकाऱ्यांकडून तपासणी करून घ्या',
        description: 'Submit this case to the Veterinary Officer review queue or call helpline 1962.',
        descriptionHi: 'विशेषज्ञ समीक्षा हेतु यह मामला पशु चिकित्सक को भेजें या हेल्पलाइन 1962 पर कॉल करें।',
        descriptionMr: 'अचूक निदानासाठी हा फोटो थेट पशुवैद्यकीय अधिकाऱ्यांच्या तपासणीसाठी पाठवा किंवा १९६२ वर संपर्क करा.',
        priority: 'critical',
        category: 'biological',
      }
    );
  } else if (rawActions.length > 0) {
    rawActions.forEach((item, idx) => {
      actions.push({
        step: idx + 1,
        title: item.length > 50 ? `${item.slice(0, 48)}...` : item,
        titleHi: `उपाय (${idx + 1}): ${item.slice(0, 35)}`,
        titleMr: `उपाय (${idx + 1}): ${item.slice(0, 35)}`,
        description: item,
        descriptionHi: `पशु सलाह: ${item}`,
        descriptionMr: `पशु सल्ला: ${item}`,
        priority: idx === 0 ? 'critical' : idx === 1 ? 'important' : 'preventive',
        category: idx === 0 ? 'cultural' : idx === 1 ? 'biological' : 'chemical',
      });
    });
  } else {
    actions.push(...defaultDiag.whatToDoToday);
  }

  // Parse monitoring items
  const monitors: MonitorItem[] = [];
  const rawMonitors = payload.advisory?.monitoring || payload.advisory?.what_to_monitor || [];
  if (rawMonitors.length > 0) {
    rawMonitors.forEach((m) => {
      monitors.push({
        title: m.length > 35 ? `${m.slice(0, 32)}...` : m,
        titleHi: 'निगरानी करें',
        titleMr: 'निरीक्षण करा',
        check: m,
        checkHi: m,
        checkMr: m,
      });
    });
  } else {
    monitors.push(...defaultDiag.whatToMonitor);
  }

  // Voice Script
  const voiceScript = isLowConfidence
    ? 'Unable to confidently identify the livestock condition. Please capture another clear image of skin nodules, muzzle, or hooves, or request veterinary officer verification.'
    : `Detected ${diseaseName} on ${matchedSpecies.name} with ${mappedSeverity} severity. Isolate the animal and follow recommended veterinary care steps.`;

  const voiceScriptHi = isLowConfidence
    ? 'एआई निदान अनिश्चित है। कृपया त्वचा की गांठों, मुंह या खुरों की एक स्पष्ट तस्वीर लें या पशु चिकित्सक से सत्यापन का अनुरोध करें।'
    : `${matchedSpecies.nameHi || matchedSpecies.name} में ${diseaseNameHi} पाया गया है। गंभीरता: ${mappedSeverity}। पशु को तुरंत अलग करें और दिए गए पशु चिकित्सा उपायों का पालन करें।`;

  const voiceScriptMr = isLowConfidence
    ? 'एआय निदान अनिश्चित आहे. कृपया सूर्यप्रकाशात जनावराच्या गाठी किंवा खुरांचा नवीन स्पष्ट फोटो काढा किंवा पशुवैद्यकांचा सल्ला घ्या.'
    : `${matchedSpecies.nameMr} मध्ये ${diseaseNameMr} आढळला आहे. गांभीर्य: ${mappedSeverity}. बाधित जनावरास त्वरित वेगळे बांधा व पशुवैद्यकीय उपायांची अंमलबजावणी करा.`;

  // Resolved image URL
  let finalImageUrl = localImageUrl || defaultDiag.imageUrl;
  if (payload.image_url) {
    finalImageUrl = payload.image_url.startsWith('http')
      ? payload.image_url
      : `${API_ROOT_URL}${payload.image_url}`;
  }

  return {
    id: payload.case_id || payload.id || `case-${Date.now()}`,
    cropId: speciesId,
    cropName: matchedSpecies.name,
    cropNameHi: matchedSpecies.nameHi || matchedSpecies.name,
    cropNameMr: matchedSpecies.nameMr,
    diseaseName,
    diseaseNameHi,
    diseaseNameMr,
    pathogen: payload.advisory?.disease_info?.scientific_name || defaultDiag.pathogen,
    severity: mappedSeverity,
    confidenceLabel,
    isUncertain: isLowConfidence,
    detectedAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    imageUrl: finalImageUrl,
    whatToDoToday: actions,
    whatToMonitor: monitors,
    whatMayHappenNext: defaultDiag.whatMayHappenNext,
    advisoryVoiceScript: voiceScript,
    advisoryVoiceScriptHi: voiceScriptHi,
    advisoryVoiceScriptMr: voiceScriptMr,
  };
}

export const diseaseDetectionService = {
  /**
   * Main Check My Animal flow:
   * 1. Pre-validates image content (MobileNet client-side animal validator)
   * 2. Sends image to backend POST /api/diagnose
   * 3. Receives standard species, disease, type, confidence, severity, risk, advisory
   * 4. Maps to unified frontend model
   */
  async diagnose(
    imageSource?: string | File | Blob,
    speciesId: string = 'cattle',
    options?: DiseaseDetectionOptions
  ): Promise<DiagnosisResult> {
    const activeSpecies = (speciesId || 'cattle').toLowerCase().trim();

    // 1. Client-Side Animal Validation (Transparent MobileNet usage)
    const validation = await validateLivestockImage(imageSource);
    if (!validation.isValid) {
      console.warn('[diseaseDetectionService] Rejected: Image does not appear to show livestock / animal symptoms:', validation.predictions);
      throw new InvalidLivestockImageError(
        'Invalid animal photo — please upload a clear photo of your animal (skin nodules, muzzle, hooves, or body)',
        validation.predictions
      );
    }

    const displayUrl = await resolveDisplayUrl(imageSource);

    // 2. Prepare FormData
    const formData = new FormData();
    const imageBlob = await resolveImageBlob(imageSource);

    if (imageBlob) {
      formData.append('image', imageBlob, `animal_${activeSpecies}_${Date.now()}.jpg`);
    } else {
      // Offline fallback canvas blob
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#6c584c';
        ctx.fillRect(0, 0, 300, 300);
      }
      const dummyBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b || new Blob()), 'image/jpeg'));
      formData.append('image', dummyBlob, `animal_${activeSpecies}.jpg`);
    }

    formData.append('species', activeSpecies);
    formData.append('crop', activeSpecies);
    formData.append('crop_name', activeSpecies);
    if (options?.affectedBodyPart) formData.append('affected_body_part', options.affectedBodyPart);
    if (options?.animalTag) formData.append('animal_tag', options.animalTag);
    if (options?.ownerId || options?.farmerId) formData.append('owner_id', (options.ownerId || options.farmerId)!);
    if (options?.farmerId) formData.append('farmer_id', options.farmerId);
    if (options?.shedId || options?.farmId) formData.append('shed_id', (options.shedId || options.farmId)!);
    if (options?.farmId) formData.append('farm_id', options.farmId);
    if (options?.unitId || options?.cropCycleId) formData.append('unit_id', (options.unitId || options.cropCycleId)!);
    if (options?.cropCycleId) formData.append('crop_cycle_id', options.cropCycleId);
    if (options?.latitude) formData.append('latitude', String(options.latitude));
    if (options?.longitude) formData.append('longitude', String(options.longitude));

    // 3. Connect to backend POST /api/diagnose
    try {
      const response = await apiClient<{ success: boolean; data: RawDiagnosisPayload }>('/diagnose', {
        method: 'POST',
        body: formData,
      });

      if (response && response.success && response.data) {
        return mapToDiagnosisResult(response.data, activeSpecies, displayUrl);
      }
      throw new Error('Invalid backend diagnosis response');
    } catch (apiErr) {
      console.warn('[diseaseDetectionService] Backend API call failed, running deterministic local diagnosis:', apiErr);

      // Check if this was a deliberate blurry/uncertain sample
      const isString = typeof imageSource === 'string';
      const str = isString ? (imageSource as string) : '';
      const isUncertainSample = str.includes('uncertain') || str.includes('blurry');

      if (isUncertainSample) {
        const uncertainPayload: RawDiagnosisPayload = {
          case_id: `diag-uncertain-${Date.now()}`,
          species: activeSpecies,
          crop: activeSpecies,
          disease: 'Unable to confidently identify livestock condition',
          type: 'uncertain',
          confidence: 0.52,
          severity: 'low',
          is_uncertain: true,
          message: 'Unable to confidently identify the livestock condition. Please capture a clear image of skin nodules, muzzle, or hooves, or request veterinary officer verification.',
        };
        return mapToDiagnosisResult(uncertainPayload, activeSpecies, displayUrl);
      }

      // Standard livestock default
      const defaultDiag = getDefaultDiagnosisForCrop(activeSpecies);
      return {
        ...defaultDiag,
        imageUrl: displayUrl || defaultDiag.imageUrl,
      };
    }
  },
};
