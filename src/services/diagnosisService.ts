import type {
  DiagnosisResult,
  AffectedBodyArea,
  AnimalSpecies,
} from '../types';
import {
  DEFAULT_DIAGNOSIS,
  CATTLE_LSD_DIAGNOSIS,
  getDefaultDiagnosisForCrop,
} from './mockData';

export class InvalidCropImageError extends Error {
  constructor(message?: string) {
    super(message || 'Invalid or unidentifiable livestock image provided.');
    this.name = 'InvalidCropImageError';
  }
}

export const LIVESTOCK_COMPATIBLE_DISEASES: Record<string, string[]> = {
  cattle: [
    'Bovine Mastitis (थनैला रोग / स्तनदाह)',
    'Lumpy Skin Disease / LSD (लंपी त्वचा रोग)',
    'Foot and Mouth Disease / FMD (खुरपका-मुंहपका)',
    'Hemorrhagic Septicemia / HS (गलघोंटू)',
    'Black Quarter / BQ (लंगड़ा बुखार)',
    'Bovine Babesiosis / Tick Fever (बबेसियोसिस)',
    'Tympanites / Bloat (आफरा / पोटफुगी)',
    'Healthy Cattle',
    'Uncertain Image / Low AI Confidence',
  ],
  buffalo: [
    'Bovine Mastitis (थनैला रोग)',
    'Hemorrhagic Septicemia (गलघोंटू)',
    'Foot and Mouth Disease (खुरपका)',
    'Uterine Prolapse / Post-Partum Care',
    'Healthy Buffalo',
    'Uncertain Image / Low AI Confidence',
  ],
  goat: [
    'Peste des Petits Ruminants / PPR (बकरी प्लेग)',
    'Goat Pox (बकरी चेचक)',
    'Contagious Ecthyma / Orf (मुंह के छाले)',
    'Enterotoxemia (फड़किया)',
    'Parasitic Gastroenteritis / Worms',
    'Healthy Goat',
    'Uncertain Image / Low AI Confidence',
  ],
  sheep: [
    'Ovine Foot Rot (खूर कुजणे)',
    'Sheep Pox (मेंढी देवी)',
    'Enterotoxemia (फड़किया)',
    'Healthy Sheep',
    'Uncertain Image / Low AI Confidence',
  ],
  poultry: [
    'Ranikhet / Newcastle Disease (रानीखेत)',
    'Infectious Bursal Disease / Gumboro',
    'Coccidiosis (खूनी दस्त)',
    'Fowl Pox',
    'Healthy Poultry',
    'Uncertain Image / Low AI Confidence',
  ],
};

export function isDiseaseCompatibleWithCrop(diseaseName: string, speciesIdOrName: string): boolean {
  if (!diseaseName) return true;
  const key = (speciesIdOrName || '').toLowerCase().trim();
  const allowed = LIVESTOCK_COMPATIBLE_DISEASES[key];
  if (!allowed) return true;
  const dLower = diseaseName.toLowerCase().trim();
  return allowed.some((a) => a.toLowerCase() === dLower || dLower.includes(a.toLowerCase()));
}

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

export interface CheckAnimalOptions {
  farmerId?: string;
  farmId?: string;
  cropCycleId?: string;
  animalId?: string;
  animalTag?: string;
  animalName?: string;
  affectedBodyArea?: AffectedBodyArea;
  symptoms?: string[];
  symptomDuration?: string;
  appetiteStatus?: string;
  milkYieldImpact?: string;
  otherObservations?: string;
}

export const diagnosisService = {
  async checkCrop(
    speciesId: string,
    imageSource?: string | File | Blob,
    options?: CheckAnimalOptions
  ): Promise<DiagnosisResult> {
    const rawSpecies = (speciesId || 'cattle').toLowerCase().trim();
    const species = (['cattle', 'buffalo', 'goat', 'sheep', 'poultry'].includes(rawSpecies) ? rawSpecies : 'cattle') as AnimalSpecies;

    const displayUrl = await resolveImageDisplayUrl(imageSource);
    const bodyArea = options?.affectedBodyArea || 'udder';
    const symptoms = options?.symptoms || [];

    // 1. Check for specific test samples or symptoms
    if (
      displayUrl.includes('lsd') ||
      bodyArea === 'skin' ||
      symptoms.some((s) => s.toLowerCase().includes('nodule') || s.toLowerCase().includes('lump') || s.toLowerCase().includes('गांठ'))
    ) {
      return {
        ...CATTLE_LSD_DIAGNOSIS,
        imageUrl: displayUrl || CATTLE_LSD_DIAGNOSIS.imageUrl,
        animalId: options?.animalId || 'animal-001',
        animalTag: options?.animalTag || 'MH-1042-88',
        animalName: options?.animalName || 'Gauri',
        affectedBodyArea: 'skin',
        symptomsObserved: symptoms.length > 0 ? symptoms : CATTLE_LSD_DIAGNOSIS.symptomsObserved,
        symptomDuration: options?.symptomDuration || '3 days',
        appetiteChange: options?.appetiteStatus || 'Reduced appetite',
        milkYieldChange: options?.milkYieldImpact || 'Reduced (20-40% drop)',
      };
    }

    if (
      displayUrl.includes('fmd') ||
      bodyArea === 'mouth' ||
      bodyArea === 'hooves' ||
      symptoms.some((s) => s.toLowerCase().includes('drool') || s.toLowerCase().includes('blister') || s.toLowerCase().includes('लाळ'))
    ) {
      return {
        ...DEFAULT_DIAGNOSIS,
        id: 'diag-case-fmd',
        diseaseName: 'Foot and Mouth Disease / FMD (खुरपका-मुंहपका / लाळ्या खुरकूत)',
        diseaseNameHi: 'खुरपका-मुंहपका रोग (FMD)',
        diseaseNameMr: 'लाळ्या खुरकूत रोग (FMD)',
        pathogen: 'Aphthovirus (Picornaviridae)',
        severity: 'high',
        urgencyLevel: 'high',
        affectedBodyArea: bodyArea,
        imageUrl: displayUrl || DEFAULT_DIAGNOSIS.imageUrl,
        animalId: options?.animalId,
        animalTag: options?.animalTag,
        animalName: options?.animalName,
        symptomsObserved: symptoms.length > 0 ? symptoms : ['Blisters on tongue and interdigital space', 'Profuse ropy drooling', 'Severe lameness'],
        whatToDoToday: [
          {
            step: 1,
            title: 'Mouth & Hoof Antiseptic Wash',
            titleHi: 'मुंह व खुरों की पोटाश पानी से सफाई',
            titleMr: 'तोंड व खुरांची पोटॅशियम परमँगनेटने स्वच्छता',
            description: 'Wash oral blisters with 1% Alum (fitkari) or 1:1000 potassium permanganate solution. Wash hooves with 2% copper sulfate or povidone-iodine.',
            descriptionHi: 'मुंह के छालों को फिटकरी या पोटाश पानी से धोएं। खुरों को तूतिया (कॉपर सल्फेट) के घोल से साफ करें।',
            descriptionMr: 'तोंडातील फोड तुरटीच्या किंवा पोटॅशच्या पाण्याने धुवा. खुरांना मोर्चूदच्या (कॉपर सल्फेट) द्रावणाने स्वच्छ करा.',
            priority: 'critical',
            category: 'first_aid',
          },
          {
            step: 2,
            title: 'Soft Nutritious Diet & Strict Isolation',
            titleHi: 'मुलायम दलिया-चारा व सख्त पृथक्करण',
            titleMr: 'मऊ लापशी/दलिया व विलगीकरण',
            description: 'Provide soft cooked gruel (jowar/bajra daliya) with jaggery. Do NOT feed dry hard straw as mouth is sore. Keep animal on soft sand bedding.',
            descriptionHi: 'पशु को नरम दलिया व गुड़ खिलाएं। सूखा कड़ा चारा न दें क्योंकि मुंह में छाले हैं।',
            descriptionMr: 'जनावराला मऊ शिजवलेली लापशी व गूळ द्या. कोरडा चारा देऊ नका कारण तोंड आलेले असते.',
            priority: 'important',
            category: 'nutrition',
          },
        ],
      };
    }

    if (
      displayUrl.includes('uncertain') ||
      displayUrl.includes('blurry')
    ) {
      return {
        ...DEFAULT_DIAGNOSIS,
        id: 'diag-case-uncertain',
        diseaseName: 'Uncertain Image / Low AI Confidence (अस्पष्ट छायाचित्र)',
        diseaseNameHi: 'अस्पष्ट छायाचित्र / अनिश्चित AI परिणाम',
        diseaseNameMr: 'अंधुक छायाचित्र / AI निष्कर्ष अनिश्चित',
        severity: 'low',
        urgencyLevel: 'low',
        confidenceLabel: 'review',
        confidenceScore: 42,
        isUncertain: true,
        imageUrl: displayUrl || DEFAULT_DIAGNOSIS.imageUrl,
        whatToDoToday: [
          {
            step: 1,
            title: 'Capture a Clear Well-Lit Photo',
            titleHi: 'दिन के उजाले में स्पष्ट फोटो खींचें',
            titleMr: 'दिवसाच्या चांगल्या प्रकाशात स्पष्ट फोटो काढा',
            description: 'The uploaded image was unclear or blurry. Please hold the camera steady in bright natural light and focus directly on the affected body area.',
            descriptionHi: 'फोटो बहुत धुंधला था। कृपया दिन के उजाले में प्रभावित अंग पर फोकस करके दोबारा फोटो लें।',
            descriptionMr: 'अपलोड केलेला फोटो अंधुक होता. कृपया चांगल्या प्रकाशात बाधित अवयवावर कॅमेरा स्थिर ठेवून पुन्हा फोटो काढा.',
            priority: 'important',
            category: 'hygiene',
          },
        ],
      };
    }

    // Default species diagnosis
    const defaultRes = getDefaultDiagnosisForCrop(species);
    return {
      ...defaultRes,
      imageUrl: displayUrl || defaultRes.imageUrl,
      animalId: options?.animalId || defaultRes.animalId,
      animalTag: options?.animalTag || defaultRes.animalTag,
      animalName: options?.animalName || defaultRes.animalName,
      affectedBodyArea: bodyArea,
      symptomsObserved: symptoms.length > 0 ? symptoms : defaultRes.symptomsObserved,
      symptomDuration: options?.symptomDuration || '2 to 3 days',
      appetiteChange: options?.appetiteStatus || 'Normal feeding',
      milkYieldChange: options?.milkYieldImpact || 'Normal yield',
    };
  },

  async getDiagnosisForActiveContext(params: {
    farmId?: string;
    farmerId?: string;
    cropName?: string;
  }): Promise<DiagnosisResult | null> {
    const species = params.cropName || 'cattle';
    return getDefaultDiagnosisForCrop(species);
  },

  async getLatestDiagnosisForFarm(_farmId: string, cropName?: string): Promise<DiagnosisResult | null> {
    const species = cropName || 'cattle';
    return getDefaultDiagnosisForCrop(species);
  },

  async getLatestDiagnosisForFarmer(_farmerId: string, cropName?: string): Promise<DiagnosisResult | null> {
    const species = cropName || 'cattle';
    return getDefaultDiagnosisForCrop(species);
  },

  async getDiagnosisById(_caseId?: string): Promise<DiagnosisResult> {
    return DEFAULT_DIAGNOSIS;
  },
};
