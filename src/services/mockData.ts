import type {
  CropInfo,
  DiagnosisResult,
  WeatherCondition,
  RiskForecast,
  AreaReport,
  ExpertProfile,
  ChatMessage,
  LivestockAnimal,
  VaccinationRecord,
} from '../types';

// =========================================================================
// SVG TEST VISUALS FOR LIVESTOCK DEMO & EVALUATION
// =========================================================================

export const SVG_HEALTHY_CATTLE = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%231b4332"/><circle cx="100" cy="100" r="70" fill="%232d6a4f"/><path d="M60 90 Q100 60 140 90 Q120 140 80 140 Z" fill="%2352b788" opacity="0.8"/><circle cx="85" cy="85" r="5" fill="%23ffffff"/><circle cx="115" cy="85" r="5" fill="%23ffffff"/><text x="100" y="165" text-anchor="middle" fill="%23d8f3dc" font-size="14" font-family="sans-serif" font-weight="bold">🟢 Healthy Skin / Udder</text></svg>`;

export const SVG_LUMPY_SKIN_DISEASE = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23451a03"/><circle cx="100" cy="100" r="75" fill="%2378350f"/><circle cx="70" cy="70" r="16" fill="%23f97316" stroke="%23ea580c" stroke-width="4"/><circle cx="130" cy="80" r="18" fill="%23f97316" stroke="%23ea580c" stroke-width="4"/><circle cx="95" cy="115" r="22" fill="%23f97316" stroke="%23ea580c" stroke-width="5"/><circle cx="60" cy="130" r="14" fill="%23f97316" stroke="%23ea580c" stroke-width="3"/><circle cx="140" cy="135" r="15" fill="%23f97316" stroke="%23ea580c" stroke-width="3"/><text x="100" y="180" text-anchor="middle" fill="%23fed7aa" font-size="12" font-family="sans-serif" font-weight="bold">🔴 Lumpy Skin Nodules (LSD)</text></svg>`;

export const SVG_MASTITIS_UDDER = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%237f1d1d"/><ellipse cx="100" cy="90" rx="65" ry="50" fill="%23dc2626"/><ellipse cx="100" cy="85" rx="45" ry="30" fill="%23ef4444"/><line x1="75" y1="120" x2="75" y2="150" stroke="%23b91c1c" stroke-width="12" stroke-linecap="round"/><line x1="92" y1="125" x2="92" y2="158" stroke="%23ef4444" stroke-width="14" stroke-linecap="round"/><line x1="108" y1="125" x2="108" y2="158" stroke="%23ef4444" stroke-width="14" stroke-linecap="round"/><line x1="125" y1="120" x2="125" y2="150" stroke="%23b91c1c" stroke-width="12" stroke-linecap="round"/><text x="100" y="182" text-anchor="middle" fill="%23fecaca" font-size="12" font-family="sans-serif" font-weight="bold">🔴 Udder Swelling (Mastitis)</text></svg>`;

export const SVG_FMD_LESIONS = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%233f2c00"/><path d="M50 140 Q100 40 150 140 Q100 160 50 140 Z" fill="%23a16207"/><circle cx="80" cy="90" r="12" fill="%23ef4444" stroke="%23ffffff" stroke-width="2"/><circle cx="115" cy="95" r="14" fill="%23ef4444" stroke="%23ffffff" stroke-width="2"/><circle cx="100" cy="125" r="10" fill="%23ef4444" stroke="%23ffffff" stroke-width="2"/><path d="M90 145 Q95 175 90 185 M105 145 Q110 175 105 185" stroke="%2338bdf8" stroke-width="3"/><text x="100" y="30" text-anchor="middle" fill="%23fef08a" font-size="12" font-family="sans-serif" font-weight="bold">⚠️ FMD Blisters & Drooling</text></svg>`;

export const SVG_UNCERTAIN_AI = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%233a5a40"/><circle cx="100" cy="100" r="70" fill="%23588157" opacity="0.6" filter="blur(8px)"/><text x="100" y="115" text-anchor="middle" fill="%23dad7cd" font-size="36" font-family="sans-serif" font-weight="bold">❓</text><text x="100" y="160" text-anchor="middle" fill="%23dad7cd" font-size="12" font-family="sans-serif">Uncertain / Blurry Image</text></svg>`;

export const SVG_GOAT_PPR = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%232c1810"/><circle cx="100" cy="95" r="60" fill="%236b4226"/><circle cx="80" cy="80" r="6" fill="%23ffffff"/><circle cx="120" cy="80" r="6" fill="%23ffffff"/><ellipse cx="100" cy="115" rx="18" ry="10" fill="%23e11d48"/><path d="M90 120 Q100 150 95 165" stroke="%2394a3b8" stroke-width="4"/><text x="100" y="185" text-anchor="middle" fill="%23fecdd3" font-size="12" font-family="sans-serif" font-weight="bold">🔴 PPR Mouth Ulcers & Mucus</text></svg>`;

export const SVG_POULTRY_RANIKHET = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%231e293b"/><circle cx="100" cy="90" r="55" fill="%230f766e"/><polygon points="90,40 100,20 110,40 100,50" fill="%23e11d48"/><polygon points="100,85 130,95 100,105" fill="%23f59e0b"/><circle cx="85" cy="75" r="7" fill="%23cbd5e1"/><text x="100" y="175" text-anchor="middle" fill="%2399f6e4" font-size="12" font-family="sans-serif" font-weight="bold">⚠️ Poultry Respiratory / Newcastle</text></svg>`;

// =========================================================================
// SPECIES CATALOGUE (Mapped to CropInfo for compatibility)
// =========================================================================

export const MOCK_CROPS: CropInfo[] = [
  {
    id: 'cattle',
    name: 'Cattle (Cow / Bull)',
    nameHi: 'गाय / बैल (गोवंश)',
    nameMr: 'गाय / बैल (गोवंश)',
    icon: '🐄',
    scientificName: 'Bos indicus / Bos taurus',
    sampleImages: [
      {
        id: 'cattle_lsd_sample',
        title: 'Skin Nodules & Eruptions (Lumpy Skin Disease)',
        titleHi: 'त्वचा पर उभरी हुई गांठें (लंपी त्वचा रोग)',
        titleMr: 'अंगावर आलेल्या गाठी व फोड (लंपी रोग)',
        condition: 'Lumpy Skin Disease (LSD)',
        url: SVG_LUMPY_SKIN_DISEASE,
        fallbackUrl: SVG_LUMPY_SKIN_DISEASE,
        isHealthy: false,
        bodyArea: 'skin',
      },
      {
        id: 'cattle_mastitis_sample',
        title: 'Swollen & Hardened Udder (Bovine Mastitis)',
        titleHi: 'थन में सूजन, कड़ापन व दर्द (थनैला रोग)',
        titleMr: 'कासेला सूज, गरम व कडक कास (स्तनदाह/मस्टायटिस)',
        condition: 'Bovine Mastitis (थनैला)',
        url: SVG_MASTITIS_UDDER,
        fallbackUrl: SVG_MASTITIS_UDDER,
        isHealthy: false,
        bodyArea: 'udder',
      },
      {
        id: 'cattle_fmd_sample',
        title: 'Mouth Ulcers & Excessive Drooling (FMD)',
        titleHi: 'मुंह में छाले व लगातार लार गिरना (खुरपका-मुंहपका)',
        titleMr: 'तोंडात फोड व सतत लाळ गळणे (लाळ्या खुरकूत)',
        condition: 'Foot and Mouth Disease (FMD)',
        url: SVG_FMD_LESIONS,
        fallbackUrl: SVG_FMD_LESIONS,
        isHealthy: false,
        bodyArea: 'mouth',
      },
      {
        id: 'cattle_healthy_sample',
        title: 'Healthy Cattle Coat & Udder',
        titleHi: 'स्वस्थ गाय की सामान्य त्वचा व थन',
        titleMr: 'निरोगी गायीची त्वचा व सामान्य कास',
        condition: 'Healthy Cattle',
        url: SVG_HEALTHY_CATTLE,
        fallbackUrl: SVG_HEALTHY_CATTLE,
        isHealthy: true,
        bodyArea: 'skin',
      },
      {
        id: 'cattle_uncertain_sample',
        title: 'Blurry / Unclear Photo (Low Quality Test)',
        titleHi: 'धुंधली व अस्पष्ट फोटो (क्वालिटी टेस्ट)',
        titleMr: 'अंधुक किंवा न उलगडणारा फोटो',
        condition: 'Uncertain Image / Low Confidence',
        url: SVG_UNCERTAIN_AI,
        fallbackUrl: SVG_UNCERTAIN_AI,
        isHealthy: false,
        bodyArea: 'general',
      },
    ],
  },
  {
    id: 'buffalo',
    name: 'Buffalo',
    nameHi: 'भैंस (महिष वंश)',
    nameMr: 'म्हैस / रेडा',
    icon: '🐃',
    scientificName: 'Bubalus bubalis',
    sampleImages: [
      {
        id: 'buffalo_mastitis',
        title: 'Hard Udder & Blood/Flakes in Milk (Mastitis)',
        titleHi: 'थन में कड़ापन और दूध में छीछड़े (थनैला)',
        titleMr: 'कास कडक होणे व दुधात रक्ताच्या गाठी (स्तनदाह)',
        condition: 'Bovine Mastitis',
        url: SVG_MASTITIS_UDDER,
        fallbackUrl: SVG_MASTITIS_UDDER,
        isHealthy: false,
        bodyArea: 'udder',
      },
      {
        id: 'buffalo_fmd',
        title: 'Foot Lesions & Salivation (FMD in Buffalo)',
        titleHi: 'खुर में घाव व लार (खुरपका-मुंहपका)',
        titleMr: 'खुरांमध्ये जखमा व लाळ (खुरकूत)',
        condition: 'Foot and Mouth Disease',
        url: SVG_FMD_LESIONS,
        fallbackUrl: SVG_FMD_LESIONS,
        isHealthy: false,
        bodyArea: 'hooves',
      },
      {
        id: 'buffalo_healthy',
        title: 'Healthy Buffalo',
        titleHi: 'स्वस्थ भैंस',
        titleMr: 'निरोगी म्हैस',
        condition: 'Healthy Buffalo',
        url: SVG_HEALTHY_CATTLE,
        fallbackUrl: SVG_HEALTHY_CATTLE,
        isHealthy: true,
        bodyArea: 'skin',
      },
    ],
  },
  {
    id: 'goat',
    name: 'Goat',
    nameHi: 'बकरी',
    nameMr: 'शेळी',
    icon: '🐐',
    scientificName: 'Capra hircus',
    sampleImages: [
      {
        id: 'goat_ppr_sample',
        title: 'PPR Mouth Sores, Discharge & Fever (Goat Plague)',
        titleHi: 'मुंह में घाव, दस्त व बुखार (बकरी प्लेग / पीपीआर)',
        titleMr: 'तोंडात जखमा, हगवण व ताप (पीपीआर / शेळी प्लेग)',
        condition: 'Peste des Petits Ruminants (PPR)',
        url: SVG_GOAT_PPR,
        fallbackUrl: SVG_GOAT_PPR,
        isHealthy: false,
        bodyArea: 'mouth',
      },
      {
        id: 'goat_healthy_sample',
        title: 'Healthy Active Goat',
        titleHi: 'स्वस्थ व चुस्त बकरी',
        titleMr: 'निरोगी व चपळ शेळी',
        condition: 'Healthy Goat',
        url: SVG_HEALTHY_CATTLE,
        fallbackUrl: SVG_HEALTHY_CATTLE,
        isHealthy: true,
        bodyArea: 'skin',
      },
    ],
  },
  {
    id: 'sheep',
    name: 'Sheep',
    nameHi: 'भेड़',
    nameMr: 'मेंढी',
    icon: '🐑',
    scientificName: 'Ovis aries',
    sampleImages: [
      {
        id: 'sheep_footrot',
        title: 'Foot Rot & Interdigital Lesions',
        titleHi: 'खुरों में सड़ांध व लंगड़ापन (फुट रॉट)',
        titleMr: 'खुरांमध्ये घाण व लंगडणे (खूर कुजणे)',
        condition: 'Ovine Foot Rot',
        url: SVG_FMD_LESIONS,
        fallbackUrl: SVG_FMD_LESIONS,
        isHealthy: false,
        bodyArea: 'hooves',
      },
      {
        id: 'sheep_healthy',
        title: 'Healthy Sheep',
        titleHi: 'स्वस्थ भेड़',
        titleMr: 'निरोगी मेंढी',
        condition: 'Healthy Sheep',
        url: SVG_HEALTHY_CATTLE,
        fallbackUrl: SVG_HEALTHY_CATTLE,
        isHealthy: true,
        bodyArea: 'skin',
      },
    ],
  },
  {
    id: 'poultry',
    name: 'Poultry',
    nameHi: 'मुर्गी पालन',
    nameMr: 'कुक्कुटपालन',
    icon: '🐔',
    scientificName: 'Gallus gallus domesticus',
    sampleImages: [
      {
        id: 'poultry_ranikhet_sample',
        title: 'Gasping, Twisted Neck & Drop in Eggs (Ranikhet / Newcastle)',
        titleHi: 'सांस लेने में तकलीफ, गर्दन मुड़ना (रानीखेत रोग)',
        titleMr: 'श्वासास त्रास, मान फिरणे व अंडी घट (राणीखेत आजार)',
        condition: 'Ranikhet / Newcastle Disease',
        url: SVG_POULTRY_RANIKHET,
        fallbackUrl: SVG_POULTRY_RANIKHET,
        isHealthy: false,
        bodyArea: 'general',
      },
      {
        id: 'poultry_healthy_sample',
        title: 'Healthy Active Broiler / Layer',
        titleHi: 'स्वस्थ मुर्गी',
        titleMr: 'निरोगी कुक्कुट',
        condition: 'Healthy Poultry',
        url: SVG_HEALTHY_CATTLE,
        fallbackUrl: SVG_HEALTHY_CATTLE,
        isHealthy: true,
        bodyArea: 'skin',
      },
    ],
  },
];

// =========================================================================
// REGISTERED DEMO HERD (My Herd Data)
// =========================================================================

export const SEEDED_DEMO_HERD: LivestockAnimal[] = [
  {
    id: 'animal-001',
    ownerId: '542d3fbc-f0f7-4e82-84b9-f8394659b61b',
    tagNumber: 'MH-1042-88',
    name: 'Gauri (गौरी)',
    species: 'cattle',
    breed: 'Gir (गीर गाय)',
    ageYears: 4,
    ageMonths: 2,
    gender: 'female',
    count: 1,
    healthStatus: 'treatment',
    lastVaccinationDate: '2026-04-15',
    nextVaccinationDue: '2026-10-15',
    recentCondition: 'Bovine Mastitis (Mild)',
    notes: 'High milker (14 L/day). Right quarter mildly swollen, under herbal fomentation.',
    createdAt: '2025-01-10',
  },
  {
    id: 'animal-002',
    ownerId: '542d3fbc-f0f7-4e82-84b9-f8394659b61b',
    tagNumber: 'MH-1042-89',
    name: 'Kapila (कपिली)',
    species: 'cattle',
    breed: 'Sahiwal (साहिवाल)',
    ageYears: 3,
    ageMonths: 6,
    gender: 'female',
    count: 1,
    healthStatus: 'healthy',
    lastVaccinationDate: '2026-05-20',
    nextVaccinationDue: '2026-11-20',
    recentCondition: 'Healthy',
    notes: 'Vaccinated for LSD and FMD. Feed intake normal.',
    createdAt: '2025-02-14',
  },
  {
    id: 'animal-003',
    ownerId: '542d3fbc-f0f7-4e82-84b9-f8394659b61b',
    tagNumber: 'MH-2088-12',
    name: 'Kaali (काळी)',
    species: 'buffalo',
    breed: 'Murrah (मुर्राह)',
    ageYears: 5,
    ageMonths: 0,
    gender: 'female',
    count: 1,
    healthStatus: 'healthy',
    lastVaccinationDate: '2026-03-10',
    nextVaccinationDue: '2026-09-10',
    recentCondition: 'Healthy',
    notes: 'Due for HS+BQ booster dose this month.',
    createdAt: '2025-01-20',
  },
  {
    id: 'animal-004',
    ownerId: '542d3fbc-f0f7-4e82-84b9-f8394659b61b',
    tagNumber: 'MH-3041-05',
    name: 'Rani (राणी)',
    species: 'goat',
    breed: 'Osmanabadi (उस्मानाबादी)',
    ageYears: 2,
    ageMonths: 1,
    gender: 'female',
    count: 6,
    healthStatus: 'healthy',
    lastVaccinationDate: '2026-06-01',
    nextVaccinationDue: '2027-06-01',
    recentCondition: 'Healthy Flock',
    notes: 'PPR vaccination completed in June. Deworming scheduled.',
    createdAt: '2025-03-01',
  },
];

// =========================================================================
// DEMO VACCINATION SCHEDULE
// =========================================================================

export const SEEDED_DEMO_VACCINATIONS: VaccinationRecord[] = [
  {
    id: 'vac-001',
    animalId: 'animal-001',
    animalName: 'Gauri (Gir Cow)',
    species: 'cattle',
    vaccineName: 'FMD Vaccine (Raksha-Ovac)',
    diseaseTarget: 'Foot and Mouth Disease (खुरपका-मुंहपका)',
    administeredDate: '2026-04-15',
    nextDueDate: '2026-10-15',
    status: 'due_soon',
    batchNumber: 'RO-2026-B8',
    veterinarian: 'Dr. A. Deshmukh (LDO Niphad)',
    notes: 'Bi-annual mandatory booster due in 15 days.',
  },
  {
    id: 'vac-002',
    animalId: 'animal-001',
    animalName: 'Gauri (Gir Cow)',
    species: 'cattle',
    vaccineName: 'LSD Goat Pox Heterologous',
    diseaseTarget: 'Lumpy Skin Disease (लंपी त्वचा रोग)',
    administeredDate: '2026-02-10',
    nextDueDate: '2027-02-10',
    status: 'completed',
    batchNumber: 'LSD-GP-99',
    veterinarian: 'Dr. A. Deshmukh (LDO Niphad)',
    notes: 'Annual immunity active.',
  },
  {
    id: 'vac-003',
    animalId: 'animal-003',
    animalName: 'Kaali (Murrah Buffalo)',
    species: 'buffalo',
    vaccineName: 'HS + BQ Combined Vaccine',
    diseaseTarget: 'Hemorrhagic Septicemia & Black Quarter',
    administeredDate: '2025-09-05',
    nextDueDate: '2026-09-05',
    status: 'overdue',
    batchNumber: 'HSBQ-441',
    veterinarian: 'Dr. Priya Sharma',
    notes: 'Pre-monsoon booster overdue by 25 days. Administer urgently.',
  },
  {
    id: 'vac-004',
    animalId: 'animal-004',
    animalName: 'Rani & Flock (Osmanabadi Goats)',
    species: 'goat',
    vaccineName: 'Raksha PPR Vaccine',
    diseaseTarget: 'Peste des Petits Ruminants (बकरी प्लेग)',
    administeredDate: '2026-06-01',
    nextDueDate: '2029-06-01',
    status: 'completed',
    batchNumber: 'PPR-8812',
    veterinarian: 'KVK Mobile Unit',
    notes: '3-year immunity valid across all 6 goats.',
  },
];

// =========================================================================
// DEFAULT DIAGNOSIS RESULTS FOR EACH SPECIES
// =========================================================================

export const BUFFALO_MASTITIS_DIAGNOSIS: DiagnosisResult = {
      id: 'diag-case-001',
      cropId: 'cattle',
      cropName: 'Cattle (Cow)',
      cropNameHi: 'गोवंश (गाय)',
      cropNameMr: 'गोवंश (गाय)',
      diseaseName: 'Bovine Mastitis (थनैला रोग / स्तनदाह)',
      diseaseNameHi: 'थनैला रोग (Bovine Mastitis)',
      diseaseNameMr: 'स्तनदाह / मस्टायटिस (Bovine Mastitis)',
      pathogen: 'Staphylococcus aureus / Streptococcus agalactiae',
      severity: 'moderate',
      urgencyLevel: 'moderate',
      confidenceLabel: 'reliable',
      confidenceScore: 88,
      detectedAt: 'Today, 9:30 AM',
      animalId: 'animal-001',
      animalTag: 'MH-1042-88',
      animalName: 'Gauri (Gir Cow)',
      affectedBodyArea: 'udder',
      symptomsObserved: ['Udder Swelling / Heat', 'Mild flakes in milk', 'Discomfort during milking'],
      symptomDuration: '2 to 3 days',
      appetiteChange: 'Slightly reduced (~15%)',
      milkYieldChange: 'Dropped from 14L to 10L/day',
      medicalDisclaimer:
        '⚠️ PRELIMINARY CLINICAL SUPPORT ONLY: This evaluation is an automated decision-support report. It does NOT replace an on-site clinical check by a registered Veterinary Officer (B.V.Sc & A.H.). For intramammary infusions, antibiotics, or anti-inflammatories, consult your local veterinary dispensary.',
      medicalDisclaimerHi:
        '⚠️ प्रारंभिक स्वास्थ्य सलाह: यह रिपोर्ट केवल प्रारंभिक जांच व प्राथमिक देखभाल सहायता हेतु है। यह पंजीकृत पशु चिकित्सा अधिकारी की जांच का विकल्प नहीं है। दवाइयों व एंटीबायोटिक के लिए तुरंत डॉक्टर से संपर्क करें।',
      medicalDisclaimerMr:
        '⚠️ प्राथमिक आरोग्य मार्गदर्शन: हा अहवाल केवळ प्राथमिक तपासणीसाठी आहे. हा नोंदणीकृत पशुवैद्यकीय डॉक्टरांच्या तपासणीचा पर्याय नाही. प्रतिजैविके व औषधोपचारासाठी जवळच्या पशुवैद्यकीय दवाखान्याशी संपर्क साधा.',
      whatToDoToday: [
        {
          step: 1,
          title: 'Complete Milking & Teat Disinfection',
          titleHi: 'पूर्ण दूध दोहन व थनों का निसंक्रमण',
          titleMr: 'पूर्ण दूध काढणे व स्तनांचे निर्जंतुकीकरण',
          description: 'Milk the affected quarter frequently (every 3-4 hours) into a separate vessel and discard safely. Dip teats in 0.5% povidone-iodine teat dip solution after milking.',
          descriptionHi: 'संक्रमित थन का दूध पूरी तरह अलग बर्तन में निकालकर नष्ट करें। दोहन के बाद 0.5% पोवीडोन आयोडीन घोल में थन डुबोएं।',
          descriptionMr: 'बाधित कासेतील दूध पूर्णपणे वेगळ्या भांड्यात काढून नष्ट करा. दूध काढल्यानंतर ०.५% पोव्हिडोन आयोडीन द्रावणात सड बुडवा.',
          priority: 'critical',
          category: 'hygiene',

        },
        {
          step: 2,
          title: 'Cold/Warm Herbal Fomentation',
          titleHi: 'हल्दी-चूना लेप व सिंकाई',
          titleMr: 'हळद-चुना लेप व शेक देणे',
          description: 'Apply a paste of fresh turmeric (Curcuma longa), Aloe vera, and a pinch of lime (Calcium hydroxide) externally on the udder twice daily to reduce inflammation.',
          descriptionHi: 'हल्दी, एलोवेरा और चुटकी भर चूने का लेप थन पर लगाएं ताकि सूजन और दर्द कम हो सके।',
          descriptionMr: 'हळद, कोरफड आणि चिमूटभर चुना यांचा लेप कासेवर दिवसातून दोनदा लावा ज्यामुळे सूज व वेदना कमी होतील.',
          priority: 'important',
          category: 'first_aid',
        },
        {
          step: 3,
          title: 'Barn Sanitation & Dry Bedding',
          titleHi: 'गोठे की सफाई व सूखा बिछावन',
          titleMr: 'गोठ्याची स्वच्छता व कोरडी गादी',
          description: 'Sprinkle quicklime/bleaching powder on the barn floor. Ensure the cow remains standing for at least 45 minutes after milking while teat canals close.',
          descriptionHi: 'फर्श पर चूना छिड़कें और दोहन के बाद गाय को कम से कम 45 मिनट तक बैठने न दें।',
          descriptionMr: 'गोठ्याच्या जमिनीवर चुना टाका व दूध काढल्यानंतर गायीला किमान ४५ मिनिटे बसू देऊ नका.',
          priority: 'preventive',
          category: 'isolation',
        },
      ],
      whatToMonitor: [
        {
          title: 'Milk Consistency & Clots',
          titleHi: 'दूध में गांठें या रंग में बदलाव',
          titleMr: 'दुधात गाठी किंवा रंगातील बदल',
          check: 'Check strip cup for yellow watery discharge, blood specks, or foul odor.',
          checkHi: 'दूध में पीलापन, खून के छींटे या दुर्गंध की जांच करें।',
          checkMr: 'दुधात पिवळेपणा, रक्ताचे डाग किंवा दुर्गंधीची तपासणी करा.',
        },
        {
          title: 'Rectal Body Temperature',
          titleHi: 'शरीर का तापमान (बुखार)',
          titleMr: 'शरीराचे तापमान (ताप)',
          check: 'Monitor if temperature exceeds normal bovine range (101.5°F - 102.5°F).',
          checkHi: 'जांचें कि तापमान 102.5°F से अधिक तो नहीं बढ़ रहा।',
          checkMr: 'तापमान १०२.५°F पेक्षा जास्त वाढल्यास तातडीने नोंद घ्या.',
        },
      ],
      whatMayHappenNext: {
        title: 'Clinical Outlook & Recovery Window',
        titleHi: 'रोग की प्रगति व सुधार का समय',
        titleMr: 'रोग वाढीचा अंदाज व सुधारणा कालावधी',
        text: 'With prompt stripping and hygiene, subacute mastitis usually resolves in 4-6 days. If swelling hardens or cow develops high fever (>103.5°F), intravenous antibiotics are required within 24 hours.',
        textHi: 'सफाई और बार-बार दूध निकालने से 4-6 दिनों में सुधार संभव है। यदि थन सख्त हो या तेज बुखार आए तो 24 घंटे में डॉक्टर द्वारा इंजेक्शन आवश्यक होगा।',
        textMr: 'नियमित दूध काढल्यास व स्वच्छतेने ४-६ दिवसांत सुधारणा होते. कास कडक झाल्यास किंवा तीव्र ताप आल्यास २४ तासांत पशुवैद्यकीय इंजेक्शन आवश्यक आहे.',
        riskTrend: 'stable',
      },
      advisoryVoiceScript:
        'Namaste. Your cow Gauri shows symptoms of moderate Bovine Mastitis in the udder. Please strip the milk frequently into a separate bowl, apply turmeric aloe paste on the udder, and keep the barn floor dry. Avoid letting the cow sit for 45 minutes after milking. If milk shows blood or cow develops fever, call your veterinary doctor immediately.',
      advisoryVoiceScriptHi:
        'नमस्ते। आपकी गाय गौरी में थनैला रोग के लक्षण पाए गए हैं। प्रभावित थन का दूध बार-बार अलग बर्तन में निकालें, हल्दी-एलोवेरा का लेप लगाएं और गोठे में चूना छिड़कें। दूध निकालने के बाद गाय को 45 मिनट बैठने न दें। यदि दूध में खून आए या तेज बुखार हो, तो तुरंत पशु चिकित्सक से संपर्क करें।',
      advisoryVoiceScriptMr:
        'नमस्कार. आपल्या गीर गाय गौरीमध्ये स्तनदाह (मस्टायटिस) आजाराची लक्षणे आढळली आहेत. बाधित कासेतील दूध वारंवार वेगळे काढा, हळद व कोरफडीचा लेप लावा आणि गोठ्याची जागा कोरडी ठेवा. दूध काढल्यावर गायीला बसू देऊ नका. दुधात रक्त आल्यास किंवा ताप वाढल्यास त्वरित पशुवैद्यक अधिकाऱ्यांशी संपर्क करा.',
      caseStatus: 'suspected',
    };

    export const CATTLE_LSD_DIAGNOSIS: DiagnosisResult = {
      id: 'diag-case-lsd',
      cropId: 'cattle',
      cropName: 'Cattle (Cow / Bull)',
      cropNameHi: 'गोवंश (गाय/बैल)',
      cropNameMr: 'गोवंश (गाय/बैल)',
      diseaseName: 'Lumpy Skin Disease / LSD (लंपी त्वचा रोग)',
      diseaseNameHi: 'लंपी त्वचा रोग (LSD)',
      diseaseNameMr: 'लंपी त्वचा रोग (LSD)',
      pathogen: 'Capripoxvirus (Lumpy Skin Disease Virus)',
      severity: 'high',
      urgencyLevel: 'high',
      confidenceLabel: 'reliable',
      confidenceScore: 92,
      detectedAt: 'Today, 8:45 AM',
      animalId: 'animal-001',
      animalTag: 'MH-1042-88',
      animalName: 'Gauri (Gir Cow)',
      affectedBodyArea: 'skin',
      symptomsObserved: ['Hard cutaneous nodules (2-5cm)', 'High fever (104°F)', 'Watery eye discharge', 'Lethargy'],
      symptomDuration: '3 days',
      appetiteChange: 'Off-feed (~60% reduction)',
      milkYieldChange: 'Severe drop (50% reduction)',
      medicalDisclaimer:
        '⚠️ NOTIFIABLE VIRAL DISEASE ALERT: Lumpy Skin Disease spreads rapidly via biting flies, mosquitoes, and ticks. Immediately isolate the infected animal and report to your Gram Panchayat / Taluka Veterinary Officer for ring vaccination.',
      medicalDisclaimerHi:
        '⚠️ संक्रामक रोग चेतावनी: लंपी त्वचा रोग मक्खी, मच्छर और चिचड़ी के काटने से तेजी से फैलता है। पशु को तुरंत अलग बांधें और पशु चिकित्सा अधिकारी को सूचित करें।',
      medicalDisclaimerMr:
        '⚠️ साथीचा संसर्गजन्य आजार: लंपी रोग माश्या, डास व गोचीड यांच्यामुळे वेगाने पसरतो. बाधित जनावराला लगेच इतर जनावरांपासून वेगळे बांधा व पशुवैद्यकीय अधिकाऱ्यांना कळवा.',
      whatToDoToday: [
        {
          step: 1,
          title: 'Strict Quarantine & Vector Control',
          titleHi: 'पशु को अलग बांधें व मक्खी-मच्छर नियंत्रण',
          titleMr: 'जनावर वेगळे बांधणे व डास-माश्या नियंत्रण',
          description: 'Quarantine the animal at least 30 meters away from healthy herd members. Spray neem oil (5%) or herbal fly repellents around the shed to prevent vector bites.',
          descriptionHi: 'पशु को स्वस्थ पशुओं से 30 मीटर दूर बांधें। नीम के तेल का छिड़काव करें ताकि मक्खी-मच्छर न काटें।',
          descriptionMr: 'बाधित जनावराला निरोगी जनावरांपासून ३० मीटर लांब बांधा. गोठ्यात कडुनिंबाच्या अर्काची फवारणी करा.',
          priority: 'critical',
          category: 'isolation',
        },
        {
          step: 2,
          title: 'Herbal Immune Booster Formulation',
          titleHi: 'पारंपरिक रोग प्रतिरोधक काढ़ा',
          titleMr: 'आयुर्वेदिक प्रतिकारशक्ती काढा',
          description: 'Prepare oral paste: Betel leaves (10), black pepper (10g), salt (10g), turmeric (20g), jaggery (50g). Feed thrice daily on Day 1, then twice daily for 2 weeks.',
          descriptionHi: 'पान (10), काली मिर्च (10g), नमक (10g), हल्दी (20g) व गुड़ मिलाकर दिन में 3 बार खिलाएं।',
          descriptionMr: 'नागवेलीची पाने (१०), काळी मिरी (१० ग्रॅम), मीठ (१० ग्रॅम), हळद (२० ग्रॅम) व गूळ एकत्र करून दिवसातून ३ वेळा खाऊ घाला.',
          priority: 'important',
          category: 'nutrition',
        },
        {
          step: 3,
          title: 'Antiseptic Dressing on Skin Nodules',
          titleHi: 'फफोले व घावों पर एंटीसेप्टिक लेप',
          titleMr: 'गाठींवर जंतुनाशक मलम/लेप',
          description: 'Wash open ruptured nodules with 1:1000 potassium permanganate solution. Apply neem-turmeric paste or fly repellent ointment to prevent maggot infestation.',
          descriptionHi: 'खुले घावों को पोटाश के पानी से धोएं और कीड़े पड़ने से रोकने के लिए नीम-हल्दी का लेप लगाएं।',
          descriptionMr: 'जखमा पोटॅशियम परमँगनेटच्या पाण्याने धुवा व अळ्या पडू नयेत म्हणून हळद-निंबोळी मलम लावा.',
          priority: 'important',
          category: 'first_aid',
        },
      ],
      whatToMonitor: [
        {
          title: 'Nodule Spread & Secondary Wounds',
          titleHi: 'गांठों का फैलाव व कीड़े पड़ना',
          titleMr: 'गाठी फुटणे व जखमेत अळ्या होणे',
          check: 'Inspect for flies settling on open nodules or maggots developing in wounds.',
          checkHi: 'देखें कि घाव पर मक्खियां न बैठें और कीड़े न पड़ें।',
          checkMr: 'फुटलेल्या गाठींवर माश्या बसणार नाहीत व अळ्या होणार नाहीत याची रोज तपासणी करा.',
        },
        {
          title: 'Leg Swelling & Lameness',
          titleHi: 'पैरों में सूजन व लंगड़ापन',
          titleMr: 'पायांना सूज व लंगडणे',
          check: 'Check if animal develops brisket or limb edema causing inability to stand.',
          checkHi: 'पैरों व छाती के निचले हिस्से में सूजन की जांच करें।',
          checkMr: 'छातीखाली किंवा पायांना सूज येऊन जनावर खाली बसत नाही ना ते पहा.',
        },
      ],
      whatMayHappenNext: {
        title: 'Progression Trajectory & Ring Vaccination',
        titleHi: 'रोग फैलाव व रिंग टीकाकरण',
        titleMr: 'रोग प्रसार व रिंग लसीकरण',
        text: 'Skin nodules typically dry up over 2-3 weeks. Healthy animals in a 5km radius should receive Goat Pox / LSD heterologous vaccine immediately to halt the outbreak.',
        textHi: 'गांठें 2-3 हफ्तों में सूखती हैं। 5 किमी के दायरे में स्वस्थ पशुओं को तुरंत गोट पॉक्स वैक्सीन लगवाएं।',
        textMr: 'गाठी २-३ आठवड्यांत वाळतात. ५ किमी परिसरातील निरोगी जनावरांना तातडीने गोट पॉक्स लस द्या.',
        riskTrend: 'increasing',
      },
      advisoryVoiceScript:
        'Attention: Your animal exhibits classic signs of Lumpy Skin Disease. Please immediately isolate the cow, spray neem oil to repel mosquitoes and flies, feed the prescribed turmeric-pepper-jaggery paste, and notify your Veterinary Officer for ring vaccination.',
      advisoryVoiceScriptHi:
        'सावधान: आपकी गाय में लंपी त्वचा रोग के स्पष्ट लक्षण हैं। गाय को तुरंत अलग बांधें, नीम तेल से मक्खी-मच्छर भगाएं, हल्दी-कालीमिर्च-गुड़ का काढ़ा दें और डॉक्टर को तुरंत सूचित करें।',
      advisoryVoiceScriptMr:
        'सावधान: आपल्या जनावरामध्ये लंपी त्वचा रोगाची लक्षणे आढळली आहेत. जनावराला ताबडतोब वेगळे बांधा, माश्या-डासांपासून संरक्षण करा, हळद-मिरी-गुळाचा काढा द्या व डॉक्टरांशी संपर्क साधा.',
      caseStatus: 'suspected',
    };

export const GOAT_PPR_DIAGNOSIS: DiagnosisResult = {
  id: 'diag-case-goat',
  cropId: 'goat',
  cropName: 'Goat',
  cropNameHi: 'बकरी',
  cropNameMr: 'शेळी',
  diseaseName: 'PPR / Goat Plague (बकरी प्लेग)',
  diseaseNameHi: 'पीपीआर / बकरी प्लेग (PPR)',
  diseaseNameMr: 'पीपीआर / शेळी प्लेग (PPR)',
  pathogen: 'Small Ruminant Morbillivirus (PPRV)',
  severity: 'high',
  urgencyLevel: 'high',
  confidenceLabel: 'reliable',
  confidenceScore: 94,
  detectedAt: 'Today, 9:00 AM',
  animalId: 'animal-004',
  animalTag: 'MH-1042-92',
  animalName: 'Rani (Osmanabadi Goat)',
  affectedBodyArea: 'mouth',
  symptomsObserved: ['Mouth erosions / foul breath', 'High fever', 'Watery diarrhea', 'Nasal crusts'],
  whatToDoToday: [
    {
      step: 1,
      title: 'Isolate Goat & Provide Warm Oral Fluids',
      titleHi: 'बकरी को अलग रखें व इलेक्ट्रोलाइट घोल दें',
      titleMr: 'शेळीला वेगळे ठेवा व ओआरएस पाणी द्या',
      description: 'Quarantine immediately. Administer oral rehydration salts (ORS) with glucose and electrolytes to prevent dehydration from diarrhea.',
      descriptionHi: 'बकरी को अलग करें। दस्त से पानी की कमी रोकने के लिए ओआरएस व ग्लूकोज का पानी पिलाएं।',
      descriptionMr: 'शेळीला वेगळे ठेवा. हगवणीमुळे अशक्तपणा येऊ नये म्हणून ओआरएस व ग्लुकोजचे पाणी पाजा.',
      priority: 'critical',
      category: 'isolation',
    },
    {
      step: 2,
      title: 'Mouth Ulcer Fomentation',
      titleHi: 'मुंह के छालों पर बोरोग्लिसरीन',
      titleMr: 'तोंडातील फोडांवर मलम/बोरोग्लिसरीन',
      description: 'Wash mouth with 1% potassium permanganate solution and gently apply Boroglycerine to ulcerated lips and tongue.',
      descriptionHi: 'पोटाश पानी से मुंह साफ करें और छालों पर बोरोग्लिसरीन लगाएं।',
      descriptionMr: 'पोटॅशच्या पाण्याने तोंड धुऊन जिभेवर बोरोग्लिसरीन लावा.',
      priority: 'important',
      category: 'first_aid',
    },
  ],
  whatToMonitor: [
    {
      title: 'Respiratory Distress & Nasal Crusting',
      titleHi: 'सांस लेने में कठिनाई व नाक की पपड़ी',
      titleMr: 'श्वास घेण्यास त्रास व नाकातील खपल्या',
      check: 'Check for high fever recurrence or severe coughing.',
      checkHi: 'तेज बुखार या खांसी की निगरानी करें।',
      checkMr: 'ताप वाढणे किंवा तीव्र खोकला यावर लक्ष ठेवा.',
    },
  ],
  whatMayHappenNext: {
    title: 'Flock Exposure Warning',
    titleHi: 'झुंड में फैलाव का खतरा',
    titleMr: 'कळपात संसर्ग पसरण्याचा धोका',
    text: 'PPR is highly contagious in small ruminants. Immediate ring vaccination is required for all healthy flock members.',
    textHi: 'पीपीआर बहुत तेजी से फैलता है। स्वस्थ बकरियों का तुरंत टीकाकरण कराएं।',
    textMr: 'पीपीआर हा रोग शेळ्या-मेंढ्यांमध्ये वेगाने पसरतो. निरोगी शेळ्यांचे तातडीने लसीकरण करा.',
    riskTrend: 'increasing',
  },
  advisoryVoiceScript: 'Your goat shows symptoms consistent with PPR (Goat Plague). Isolate immediately, provide ORS fluids, and contact your Veterinary Officer.',
  advisoryVoiceScriptHi: 'आपकी बकरी में पीपीआर (बकरी प्लेग) के लक्षण दिख रहे हैं। तुरंत अलग बांधें, ओआरएस पानी दें और डॉक्टर को बुलाएं।',
  advisoryVoiceScriptMr: 'आपल्या शेळीमध्ये पीपीआर रोगाची लक्षणे आहेत. लगेच वेगळे ठेवा, ओआरएस पाणी पाजा आणि डॉक्टरांना दाखवा.',
  caseStatus: 'suspected',
};

export const POULTRY_NEWCASTLE_DIAGNOSIS: DiagnosisResult = {
  id: 'diag-case-poultry',
  cropId: 'poultry',
  cropName: 'Poultry',
  cropNameHi: 'मुर्गी पालन',
  cropNameMr: 'कुक्कुटपालन',
  diseaseName: 'Ranikhet / Newcastle Disease (रानीखेत)',
  diseaseNameHi: 'रानीखेत रोग (Newcastle Disease)',
  diseaseNameMr: 'राणीखेत आजार (Newcastle Disease)',
  pathogen: 'Avian Paramyxovirus Serotype 1',
  severity: 'high',
  urgencyLevel: 'high',
  confidenceLabel: 'reliable',
  confidenceScore: 89,
  detectedAt: 'Today, 8:15 AM',
  animalId: 'animal-005',
  animalTag: 'MH-1042-95',
  animalName: 'Broiler Flock',
  affectedBodyArea: 'general',
  symptomsObserved: ['Gasping / rales', 'Twisting of neck (torticollis)', 'Greenish watery diarrhea', 'Drop in egg production'],
  whatToDoToday: [
    {
      step: 1,
      title: 'Immediate Shed Biosecurity & Disinfection',
      titleHi: 'शेड में तुरंत कीटाणुनाशन व अलग करना',
      titleMr: 'शेडचे निर्जंतुकीकरण व वेगळे करणे',
      description: 'Quarantine sick birds. Spray Virkon-S or 2% formalin mist in the shed. Restrict human movement between sheds.',
      descriptionHi: 'बीमार पक्षियों को तुरंत अलग करें और शेड में कीटाणुनाशक स्प्रे करें।',
      descriptionMr: 'आजारी पक्ष्यांना वेगळे करा व शेडमध्ये जंतुनाशक फवारणी करा.',
      priority: 'critical',
      category: 'hygiene',
    },
  ],
  whatToMonitor: [
    {
      title: 'Nervous Symptoms & Mortality',
      titleHi: 'गर्दन मुड़ना व मृत्यु दर',
      titleMr: 'मान मुरगळणे व मरतूक',
      check: 'Monitor mortality count and neurological signs every 4 hours.',
      checkHi: 'हर 4 घंटे में मृत्यु दर और लक्षणों की जांच करें।',
      checkMr: 'दर ४ तासांनी पक्षांमधील लक्षणे व मरतूक तपासा.',
    },
  ],
  whatMayHappenNext: {
    title: 'Rapid Shed Spread',
    titleHi: 'शेड में तीव्र प्रसार',
    titleMr: 'शेडमध्ये वेगवान प्रसार',
    text: 'Newcastle disease can cause high mortality in unvaccinated flocks within 48-72 hours. Strict isolation and sanitary disposal of dead birds are mandatory.',
    textHi: 'रानीखेत रोग 48-72 घंटों में भारी नुकसान कर सकता है। मृत पक्षियों का सुरक्षित निपटान करें।',
    textMr: 'राणीखेत आजारामुळे ४८-७२ तासांत मोठी मरतूक होऊ शकते. मृत पक्षांची योग्य विल्हेवाट लावा.',
    riskTrend: 'increasing',
  },
  advisoryVoiceScript: 'Your poultry flock shows symptoms of Newcastle (Ranikhet) disease. Implement biosecurity and administer electrolytes with vitamins.',
  advisoryVoiceScriptHi: 'मुर्गियों में रानीखेत रोग के लक्षण हैं। तुरंत शेड का कीटाणुनाशन करें और विटामिन-इलेक्ट्रोलाइट दें।',
  advisoryVoiceScriptMr: 'कुक्कुट पक्ष्यांमध्ये राणीखेत आजाराची लक्षणे आहेत. शेड निर्जंतुक करा व तातडीने उपचार सुरू करा.',
  caseStatus: 'suspected',
};

// BARN WEATHER & LIVESTOCK HEALTH RISK FORECAST
// =========================================================================

export const MOCK_WEATHER: WeatherCondition = {
  temp: 29.5,
  humidity: 78,
  rainfallStatus: 'Rain expected in 24-48 hrs',
  rainfallStatusHi: 'अगले 24-48 घंटों में बारिश की संभावना',
  rainfallStatusMr: 'पुढील २४-४८ तासांत पावसाची शक्यता',
  rainfallChance: 65,
  condition: 'humid',
  thiIndex: 79.2, // Moderate Heat Stress for crossbred dairy cattle (THI > 78)
  heatStressLevel: 'alert',
  cropImpactSummary: 'High barn humidity (>75%) increases tick proliferation, fly vectors, and moisture-induced mastitis risks.',
  cropImpactSummaryHi: 'गोठे में 78% नमी होने से किलनी (चिचड़ी), मक्खियों और थनैला रोग का जोखिम अधिक है।',
  cropImpactSummaryMr: 'गोठ्यात ७८% दमटपणामुळे गोचीड, माश्या आणि कासेच्या आजाराचा (स्तनदाह) धोका वाढला आहे.',
};

export const MOCK_RISK_FORECAST: RiskForecast = {
  cropId: 'cattle',
  currentLevel: 'moderate',
  summary: 'Elevated humidity & vector breeding will increase mastitis and tick-borne blood protozoan risk over the next 5 days.',
  summaryHi: 'बढ़ती उमस और बारिश के कारण अगले 5 दिनों में थनैला व किलनी संक्रमण का खतरा मध्यम से उच्च स्तर पर रहेगा।',
  summaryMr: 'हवेतील दमटपणा व पावसामुळे पुढील ५ दिवसांत स्तनदाह व गोचीड आजारांचा धोका मध्यम ते उच्च राहील.',
  timeline: [
    { day: 'Today', dayHi: 'आज', dayMr: 'आज', date: 'Oct 1', level: 'moderate', score: 62 },
    { day: 'Thu', dayHi: 'गुरुवार', dayMr: 'गुरुवार', date: 'Oct 2', level: 'moderate', score: 68 },
    { day: 'Fri', dayHi: 'शुक्रवार', dayMr: 'शुक्रवार', date: 'Oct 3', level: 'high', score: 82 },
    { day: 'Sat', dayHi: 'शनिवार', dayMr: 'शनिवार', date: 'Oct 4', level: 'high', score: 79 },
    { day: 'Sun', dayHi: 'रविवार', dayMr: 'रविवार', date: 'Oct 5', level: 'moderate', score: 55 },
  ],
  reasons: [
    {
      id: 'r1',
      title: 'Barn Humidity & Vector Spike',
      titleHi: 'गोठे में नमी व मक्खी-मच्छर का फैलाव',
      titleMr: 'गोठ्यात दमटपणा व डास-माश्या वाढ',
      icon: 'droplet',
      detail: 'Shed relative humidity at 78-84% favors bacterial growth on teat skin.',
      detailHi: '78-84% नमी से थन की त्वचा पर जीवाणुओं का प्रसार तेजी से होता है।',
      detailMr: '७८-८४% दमटपणामुळे कासेवर जिवाणूंचा संसर्ग वेगाने वाढतो.',
    },
    {
      id: 'r2',
      title: 'Pre-Monsoon Disease Hotspot Alert',
      titleHi: 'नजदीकी गांवों में लंपी व खुरपका रिपोर्ट',
      titleMr: 'परिसरातील गावांत लंपी व खुरकूत नोंद',
      icon: 'map-pin',
      detail: '8 livestock disease cases confirmed within 8 km radius in Niphad sector.',
      detailHi: 'निफाड़ क्षेत्र में 8 किमी के दायरे में 8 पशु रोग मामले दर्ज हुए हैं।',
      detailMr: 'निफाड तालुक्यात ८ किमी परिसरात ८ जनावरांचे आजार नोंदवले गेले आहेत.',
    },
    {
      id: 'r3',
      title: 'Temperature Humidity Index (THI 79.2)',
      titleHi: 'तापमान-आर्द्रता सूचकांक (THI 79.2)',
      titleMr: 'उष्मा ताण निर्देशांक (THI ७९.२)',
      icon: 'thermometer',
      detail: 'Milch cows experience mild heat stress reducing immunity and feed intake.',
      detailHi: 'दुधारू पशुओं में हल्का तनाव, जिससे रोग प्रतिरोधक क्षमता घट सकती है।',
      detailMr: 'दुभत्या जनावरांमध्ये उष्मा ताणामुळे प्रतिकारशक्ती कमी होऊ शकते.',
    },
  ],
  recommendation: 'Ensure clean dry bedding with lime powder, spray herbal fly repellents, and ensure clean electrolyte-rich drinking water.',
  recommendationHi: 'फर्श पर सूखा चूना डालें, मक्खी भगाने हेतु नीम स्प्रे करें और साफ व ताजा पानी दें।',
  recommendationMr: 'गोठ्यात चुना टाका, माश्यांसाठी निंबोळी अर्क फवारा आणि स्वच्छ थंड पाणी द्या.',
};


export const DEFAULT_DIAGNOSIS: DiagnosisResult = CATTLE_LSD_DIAGNOSIS;

export function getDefaultDiagnosisForCrop(speciesId?: string): DiagnosisResult {
  const key = (speciesId || 'cattle').toLowerCase().trim();
  if (key === 'goat' || key === 'sheep') return GOAT_PPR_DIAGNOSIS;
  if (key === 'buffalo') return BUFFALO_MASTITIS_DIAGNOSIS;
  return CATTLE_LSD_DIAGNOSIS;
}

export function getDefaultRiskForecastForCrop(_speciesId?: string): RiskForecast {
  return MOCK_RISK_FORECAST;
}

// =========================================================================
// MOCK LIVESTOCK DISEASE HOTSPOTS & AREA REPORT
// =========================================================================


export const MOCK_AREA_REPORT: AreaReport = {
  district: 'Nashik',
  districtHi: 'नासिक',
  districtMr: 'नाशिक',
  subDistrict: 'Niphad',
  subDistrictHi: 'निफाड़',
  subDistrictMr: 'निफाड',
  status: 'moderate',
  diseaseTrend: 'increasing',
  activeCasesCount: 14,
  lastUpdated: '25 mins ago',
  clusters: [
    {
      id: 'cluster-001',
      lat: 20.085,
      lng: 74.11,
      intensity: 'high',
      areaName: 'Pimpalgaon Ridge Livestock Zone',
      areaNameHi: 'पिंपलगांव पशुधन क्षेत्र',
      areaNameMr: 'पिंपळगाव पशुधन विभाग',
      crop: 'Cattle (LSD & Mastitis)',
      reportedCases: 7,
      distanceKm: 2.1,
      diseaseName: 'Lumpy Skin Disease (LSD)',
      containmentStatus: 'Ring Vaccination Active',
    },
    {
      id: 'cluster-002',
      lat: 20.12,
      lng: 74.15,
      intensity: 'moderate',
      areaName: 'Lasalgaon Dairy Belt',
      areaNameHi: 'लासलगांव दुग्ध पट्टा',
      areaNameMr: 'लासलगाव दुग्ध पट्टा',
      crop: 'Cattle & Buffalo (FMD)',
      reportedCases: 4,
      distanceKm: 4.8,
      diseaseName: 'Foot and Mouth Disease (FMD)',
      containmentStatus: 'Surveillance Mode',
    },
    {
      id: 'cluster-003',
      lat: 20.04,
      lng: 74.05,
      intensity: 'low',
      areaName: 'Chandori River Goat Sector',
      areaNameHi: 'चांदोरी शेळी क्लस्टर',
      areaNameMr: 'चांदोरी शेळी विभाग',
      crop: 'Goats (PPR & Deworming)',
      reportedCases: 3,
      distanceKm: 6.2,
      diseaseName: 'Peste des Petits Ruminants (PPR)',
      containmentStatus: 'Normal Monitoring',
    },
  ],
  communityAdvisory:
    'Veterinary Officer Advisory for Niphad Taluka: Lumpy Skin Disease surveillance active in Pimpalgaon sector. All farmers are advised to avoid moving cattle across village borders and ensure annual goat pox vaccination.',
  communityAdvisoryHi:
    'निफाड़ तालुका पशु चिकित्सा अधिकारी एडवाइजरी: पिंपलगांव क्षेत्र में लंपी रोग की निगरानी जारी है। पशुओं का अंतर-ग्राम आवागमन रोकें और समय पर गोट पॉक्स वैक्सीन लगवाएं।',
  communityAdvisoryMr:
    'निफाड तालुका पशुवैद्यकीय अधिकारी सल्ला: पिंपळगाव परिसरात लंपी रोगाची दक्षता सुरू आहे. जनावरांची खरेदी-विक्री थांबवा व गोट पॉक्स लस तातडीने टोचून घ्या.',
};

// =========================================================================
// MOCK VETERINARY PROFILES (Talk to a Vet)
// =========================================================================

export const MOCK_EXPERT: ExpertProfile = {
  id: 'vet-001',
  name: 'Dr. Arvind Deshmukh',
  nameHi: 'डॉ. अरविंद देशमुख',
  nameMr: 'डॉ. अरविंद देशमुख',
  role: 'Senior Veterinary Officer (B.V.Sc & A.H., M.V.Sc - Medicine)',
  roleHi: 'वरिष्ठ पशु चिकित्सा अधिकारी (B.V.Sc & A.H., M.V.Sc)',
  roleMr: 'वरिष्ठ पशुवैद्यकीय अधिकारी (B.V.Sc & A.H., M.V.Sc)',
  station: 'Krishi Vigyan Kendra (KVK) & Taluka Veterinary Dispensary, Niphad',
  stationHi: 'कृषि विज्ञान केंद्र (KVK) व पशु औषधालय, निफाड़',
  stationMr: 'कृषी विज्ञान केंद्र (KVK) व तालुका पशुवैद्यकीय दवाखाना, निफाड',
  avatar: '👨‍⚕️',
  available: true,
  phone: '1962', // Pashu Arogya Seva Helpline
  qualifications: 'B.V.Sc & A.H., M.V.Sc (Veterinary Clinical Medicine)',
  experienceYears: 14,
};

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'expert',
    text: 'Namaste! I am Dr. Arvind Deshmukh from KVK Nashik. I reviewed your case report for Gauri (Gir Cow). The udder inflammation appears to be moderate mastitis.',
    textHi: 'नमस्ते! मैं KVK नाशिक से डॉ. अरविंद देशमुख हूँ। मैंने आपकी गाय गौरी की रिपोर्ट देखी। थन में मध्यम स्तर का थनैला (मस्टायटिस) प्रतीत होता है।',
    textMr: 'नमस्कार! मी KVK नाशिक येथून डॉ. अरविंद देशमुख. आपल्या गीर गायीचा अहवाल मी पाहिला. कासेतील सूज मध्यम स्वरूपाच्या स्तनदाहाची (मस्टायटिस) दिसते.',
    timestamp: '10:00 AM',
  },
  {
    id: 'msg-2',
    sender: 'farmer',
    text: 'Doctor, should I give any antibiotic injection or first-aid paste today?',
    textHi: 'डॉक्टर साहब, क्या आज कोई एंटीबायोटिक इंजेक्शन देना है या लेप लगाना है?',
    textMr: 'डॉक्टर, आज कोणते अँटिबायोटिक इंजेक्शन द्यावे की लेप लावावा?',
    timestamp: '10:02 AM',
  },
  {
    id: 'msg-3',
    sender: 'expert',
    text: 'Do NOT self-administer any antibiotics without milk culture test. For today: empty the milk completely every 3 hours, apply turmeric-aloe paste, and keep bedding dry. I can visit or prescribe once you check if she has fever.',
    textHi: 'बिना जांच के खुद से एंटीबायोटिक न दें। आज हर 3 घंटे में दूध पूरा निकालें, हल्दी-एलोवेरा लेप लगाएं और गोठा सूखा रखें। तापमान चेक करके बताएं।',
    textMr: 'स्वतःहून कोणतेही अँटिबायोटिक इंजेक्शन देऊ नका. आज दर ३ तासांनी कासेतील दूध पूर्ण काढा, हळद-कोरफड लेप लावा व गोठा कोरडा ठेवा. ताप मोजून सांगा.',
    timestamp: '10:04 AM',
  },
];


// Compatibility aliases for livestock and legacy crop imports
export const MOCK_LIVESTOCK = MOCK_CROPS;
export const SVG_HEALTHY_ANIMAL = SVG_HEALTHY_CATTLE;
export const SVG_LSD_NODULES = SVG_LUMPY_SKIN_DISEASE;
export const SVG_UNCERTAIN_ANIMAL = SVG_HEALTHY_CATTLE;
export const SVG_HEALTHY_LEAF = SVG_HEALTHY_CATTLE;
export const SVG_EARLY_BLIGHT = SVG_LUMPY_SKIN_DISEASE;
export const SVG_COTTON_CURL = SVG_MASTITIS_UDDER;
export const SVG_SOYBEAN_RUST = SVG_GOAT_PPR;
export const SVG_SUGARCANE_RED_ROT = SVG_POULTRY_RANIKHET;
export const SVG_MAIZE_BLIGHT = SVG_LUMPY_SKIN_DISEASE;
export const SVG_ONION_BLOTCH = SVG_MASTITIS_UDDER;
export const SVG_RICE_BLAST = SVG_GOAT_PPR;
export const SVG_WHEAT_RUST = SVG_LUMPY_SKIN_DISEASE;
