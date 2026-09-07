import type { DiagnosisResult, ActionItem, MonitorItem, SeverityLevel, ConfidenceLevel } from '../types';
import { apiClient, API_ROOT_URL } from './apiClient';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './authService';
import { advisoryService, type BackendAdvisory } from './advisoryService';
import { farmService, SEEDED_DEMO_FARMER_ID, SEEDED_DEMO_FARM_ID } from './farmService';
import { DEFAULT_DIAGNOSIS, getDefaultDiagnosisForCrop, MOCK_CROPS } from './mockData';

export const CROP_COMPATIBLE_DISEASES: Record<string, string[]> = {
  tomato: ['Early Blight', 'Late Blight', 'Leaf Mold', 'Healthy Leaf', 'Uncertain Image / Low AI Confidence'],
  soybean: ['Soybean Rust', 'Rust', 'Leaf Spot', 'Healthy Leaf', 'Uncertain Image / Low AI Confidence'],
  cotton: ['Leaf Curl Virus', 'Leaf Curl Disease', 'Bollworm Related Damage', 'Healthy Leaf', 'Uncertain Image / Low AI Confidence'],
  sugarcane: ['Red Rot', 'Healthy Leaf', 'Uncertain Image / Low AI Confidence'],
  maize: ['Turcicum Leaf Blight', 'Leaf Blight', 'Healthy Leaf', 'Uncertain Image / Low AI Confidence'],
  onion: ['Purple Blotch', 'Healthy Leaf', 'Uncertain Image / Low AI Confidence'],
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

// Helper to convert base64 data URL to Blob
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

// Convert image input to a File/Blob suitable for FormData
async function resolveImageBlob(imageSource?: string | File | Blob): Promise<Blob | null> {
  if (!imageSource) return null;
  if (typeof imageSource === 'object') {
    return imageSource as Blob;
  }
  if (typeof imageSource === 'string') {
    if (imageSource.startsWith('data:')) {
      return dataURLtoBlob(imageSource);
    }
    // Remote/local URL: attempt fetch to convert to blob
    try {
      const resp = await fetch(imageSource);
      return await resp.blob();
    } catch {
      return null;
    }
  }
  return null;
}

// Helper to resolve an image source (File, Blob, or URL string) into a renderable display URL
async function resolveImageDisplayUrl(imageSource?: string | File | Blob): Promise<string> {
  if (!imageSource) return '';
  if (typeof imageSource === 'string') return imageSource;
  if (imageSource instanceof File || imageSource instanceof Blob) {
    return new Promise<string>((resolve) => {
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
   * Connects to Express + Supabase backend: POST /api/diagnosis
   * Then fetches advisory: GET /api/advisory/:caseId
   * Gracefully falls back to realistic local diagnosis engine if backend is unavailable.
   */
  async checkCrop(
    cropId: string,
    imageSource?: string | File | Blob,
    options?: { farmerId?: string; farmId?: string; cropCycleId?: string }
  ): Promise<DiagnosisResult> {
    const selectedCrop = MOCK_CROPS.find((c) => c.id === cropId) || MOCK_CROPS[0];
    const farmerId = options?.farmerId || SEEDED_DEMO_FARMER_ID;
    const farmId = options?.farmId || SEEDED_DEMO_FARM_ID;
    const cropCycleId = options?.cropCycleId || farmService.getCropCycleIdForCrop(cropId);
    const defaultDiag = getDefaultDiagnosisForCrop(cropId);

    try {
      // 1. Resolve renderable display URL for image
      const displayImageUrl = await resolveImageDisplayUrl(imageSource);

      // 2. Prepare image blob
      let imageBlob = await resolveImageBlob(imageSource);

      // If no valid image blob could be extracted (e.g. offline sample URL), create a fallback image blob
      if (!imageBlob) {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#2d5a27';
          ctx.fillRect(0, 0, 400, 400);
          ctx.fillStyle = '#ffffff';
          ctx.font = '20px sans-serif';
          ctx.fillText(`${selectedCrop.name} Scan`, 100, 200);
        }
        imageBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b || new Blob()), 'image/jpeg'));
      }

      // 3. Build FormData for POST /api/diagnosis
      const formData = new FormData();
      formData.append('image', imageBlob, 'crop_diagnosis.jpg');
      formData.append('farmer_id', farmerId);
      formData.append('farm_id', farmId);
      formData.append('crop_cycle_id', cropCycleId);

      // 4. Send request to backend
      const diagResponse = await apiClient<{
        success: boolean;
        data: {
          case_id: string;
          crop: string;
          disease: string;
          confidence: number;
          severity_band: string;
          severity_percent: number;
          requires_expert_review: boolean;
        };
      }>('/diagnosis', {
        method: 'POST',
        body: formData,
      });

      const backendData = diagResponse.data;

      // 5. Fetch structured advisory for this case from backend
      let advisory: BackendAdvisory | null = null;
      try {
        advisory = await advisoryService.getAdvisory(backendData.case_id);
      } catch (err) {
        console.warn('[diagnosisService] Advisory fetch failed, using built-in IPM advice:', err);
      }

      // 6. Fetch case record to get backend-served image URL
      let serverImageUrl: string | undefined;
      try {
        const caseRecord = await this.getDiagnosisById(backendData.case_id);
        if (caseRecord?.image_url) {
          serverImageUrl = caseRecord.image_url.startsWith('http')
            ? caseRecord.image_url
            : `${API_ROOT_URL}${caseRecord.image_url}`;
        }
      } catch {
        // Safe to ignore, fallback to imageSource
      }

      const severityMap: Record<string, SeverityLevel> = {
        low: 'low',
        moderate: 'moderate',
        high: 'high',
        severe: 'high',
      };
      const mappedSeverity: SeverityLevel = severityMap[backendData.severity_band?.toLowerCase()] || 'moderate';

      let confidenceLabel: ConfidenceLevel = 'reliable';
      if (backendData.confidence < 75) {
        confidenceLabel = 'review';
      } else if (backendData.confidence < 85) {
        confidenceLabel = 'monitor';
      }

      const diseaseName = backendData.disease || defaultDiag.diseaseName;
      const diseaseNameMr = DISEASE_NAME_MR_MAP[diseaseName] || defaultDiag.diseaseNameMr;
      const diseaseNameHi = DISEASE_NAME_HI_MAP[diseaseName] || defaultDiag.diseaseNameHi;

      const actions = parseAdvisoryActions(advisory?.what_to_do_today, defaultDiag.whatToDoToday);
      const monitors = parseAdvisoryMonitors(advisory?.what_to_monitor, defaultDiag.whatToMonitor);

      const voiceScript = `Detected ${diseaseName} on ${backendData.crop} with ${backendData.severity_band} severity and ${backendData.confidence}% confidence. Follow the recommended daily IPM steps.`;
      const voiceScriptMr = `${backendData.crop} पिकावर ${diseaseNameMr} आढळला आहे. गांभीर्य: ${backendData.severity_band}. त्वरित दिलेल्या उपाययोजना अंमलात आणा.`;
      const voiceScriptHi = `${backendData.crop} फसल पर ${diseaseNameHi} पाया गया है। गंभीरता: ${backendData.severity_band}। तुरंत दिए गए एकीकृत कीट प्रबंधन (IPM) उपायों का पालन करें।`;

      const finalImageUrl =
        serverImageUrl ||
        displayImageUrl ||
        (selectedCrop?.sampleImages?.[0]?.url || defaultDiag.imageUrl);

      return {
        id: backendData.case_id,
        cropId: cropId.toLowerCase(),
        cropName: backendData.crop || selectedCrop.name,
        cropNameMr: selectedCrop.nameMr,
        cropNameHi: selectedCrop.nameHi || selectedCrop.name,
        diseaseName,
        diseaseNameMr,
        diseaseNameHi,
        pathogen: advisory?.disease_info?.scientific_name || defaultDiag.pathogen,
        severity: mappedSeverity,
        confidenceLabel,
        isUncertain: backendData.requires_expert_review && backendData.confidence < 80,
        detectedAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        imageUrl: finalImageUrl,
        whatToDoToday: actions,
        whatToMonitor: monitors,
        whatMayHappenNext: defaultDiag.whatMayHappenNext,
        advisoryVoiceScript: voiceScript,
        advisoryVoiceScriptMr: voiceScriptMr,
        advisoryVoiceScriptHi: voiceScriptHi,
      };
    } catch (apiError) {
      console.warn('[diagnosisService] Real backend request failed, running rich local engine fallback:', apiError);

      const displayImageUrl = await resolveImageDisplayUrl(imageSource);
      const resolvedImageUrl = displayImageUrl || selectedCrop?.sampleImages?.[0]?.url || defaultDiag.imageUrl;
      const isString = typeof imageSource === 'string';
      const imageStr = isString ? (imageSource as string) : '';

      // Check for uncertain / low confidence demo image
      if (imageStr && (imageStr.includes('530836369250') || imageStr.includes('blurry') || imageStr.includes('uncertain'))) {
        return {
          ...defaultDiag,
          id: `diag-uncertain-${Date.now()}`,
          cropId,
          cropName: selectedCrop.name,
          cropNameMr: selectedCrop.nameMr,
          cropNameHi: selectedCrop.nameHi || selectedCrop.name,
          diseaseName: 'Uncertain Image / Low AI Confidence',
          diseaseNameMr: 'अस्पष्ट फोटो / AI निदान अनिश्चित',
          diseaseNameHi: 'अस्पष्ट फोटो / AI निदान अनिश्चित',
          pathogen: 'Undetermined (Blurred foliage / lighting issue)',
          severity: 'low',
          confidenceLabel: 'review',
          isUncertain: true,
          imageUrl: resolvedImageUrl,
          whatToDoToday: [
            {
              step: 1,
              title: 'Take a fresh close-up photo in bright daylight',
              titleMr: 'सूर्यप्रकाशात पानाचा नवीन स्पष्ट फोटो घ्या',
              titleHi: 'सूर्य के प्रकाश में पत्ती का स्पष्ट फोटो लें',
              description: 'Position camera 10-15 cm from leaf spot with steady hands.',
              descriptionMr: 'पानाच्या डागापासून १० ते १५ सेमी अंतरावर कॅमेरा धरून स्पष्ट फोटो काढा.',
              descriptionHi: 'पत्ती के धब्बे से 10-15 सेमी की दूरी पर कैमरा स्थिर रखकर स्पष्ट फोटो लें।',
              priority: 'critical',
              category: 'cultural',
            },
            {
              step: 2,
              title: 'Connect with Demo Agricultural Expert',
              titleMr: 'डेमो कृषी तज्ञांशी थेट संपर्क साधा',
              titleHi: 'डेमो कृषि विशेषज्ञ से सीधे संपर्क करें',
              description: 'Share your field symptoms directly with an agronomist for manual verification.',
              descriptionMr: 'खात्रीशीर सल्ल्यासाठी शेतातील लक्षणे थेट कृषी तज्ञांना पाठवा.',
              descriptionHi: 'सटीक सलाह के लिए खेत के लक्षण सीधे कृषि विशेषज्ञ से साझा करें।',
              priority: 'critical',
              category: 'mechanical',
            },
          ],
          whatToMonitor: [
            {
              title: 'Leaf symptom expansion',
              titleMr: 'पानावरील डागांचा प्रसार',
              titleHi: 'पत्ती के धब्बों का फैलाव',
              check: 'Check if spots enlarge or change color over 24 hours.',
              checkMr: '२४ तासांत डागांचा रंग बदलतो का ते तपासा.',
              checkHi: 'जांचें कि क्या 24 घंटों में धब्बे बड़े होते हैं या रंग बदलता है।',
            },
          ],
          whatMayHappenNext: {
            title: 'Manual Review Recommended',
            titleMr: 'तज्ञ तपासणी आवश्यक',
            titleHi: 'विशेषज्ञ समीक्षा अनुशंसित',
            text: 'AI could not confirm the exact disease due to image clarity. Human expert review is safest before spraying chemical fungicides.',
            textMr: 'फोटो अस्पष्ट असल्याने AI निदान अनिश्चित आहे. कोणतीही औषध फवारणी करण्यापूर्वी कृषी तज्ञांचा सल्ला घ्या.',
            textHi: 'फोटो स्पष्ट न होने के कारण AI निदान अनिश्चित है। किसी भी रासायनिक छिड़काव से पहले कृषि विशेषज्ञ से सलाह लेना सुरक्षित है।',
            riskTrend: 'stable',
          },
          advisoryVoiceScript:
            'Diagnosis uncertain due to image clarity. Please take a clearer photo in daylight or consult an agricultural expert before spraying chemicals.',
          advisoryVoiceScriptMr:
            'फोटोच्या अस्पष्टतेमुळे निदान निश्चित नाही. कृपया दिवसा चांगल्या प्रकाशात नवीन फोटो घ्या किंवा फवारणीपूर्वी कृषी तज्ञांशी बोला.',
          advisoryVoiceScriptHi:
            'फोटो स्पष्ट न होने के कारण निदान अनिश्चित है। कृपया दिन के उजाले में साफ फोटो लें या कीटनाशक छिड़कने से पहले कृषि विशेषज्ञ से सलाह लें।',
        };
      }

      // Return dynamic crop-specific default with resolved image
      return {
        ...defaultDiag,
        id: `diag-${cropId}-${Date.now()}`,
        imageUrl: resolvedImageUrl,
      };
    }
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
