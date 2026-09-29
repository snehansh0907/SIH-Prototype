import type { CropInfo, DiagnosisResult, WeatherCondition, RiskForecast, AreaReport, ExpertProfile, ChatMessage } from '../types';

export const SVG_HEALTHY_ANIMAL = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%231b4332"/><circle cx="100" cy="100" r="75" fill="%232d6a4f"/><path d="M60 85 Q75 40 100 45 Q125 40 140 85 Q145 130 100 155 Q55 130 60 85 Z" fill="%23d4a373"/><circle cx="85" cy="85" r="7" fill="%232b2d42"/><circle cx="115" cy="85" r="7" fill="%232b2d42"/><ellipse cx="100" cy="120" rx="22" ry="14" fill="%234a4e69"/><circle cx="92" cy="120" r="4" fill="%2322223b"/><circle cx="108" cy="120" r="4" fill="%2322223b"/><path d="M40 70 Q30 30 60 50" stroke="%23fefae0" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M160 70 Q170 30 140 50" stroke="%23fefae0" stroke-width="8" stroke-linecap="round" fill="none"/></svg>`;

export const SVG_LSD_NODULES = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%233a1e1e"/><rect x="20" y="20" width="160" height="160" rx="24" fill="%238d5b4c"/><circle cx="65" cy="65" r="22" fill="%23b91c1c" stroke="%23fecaca" stroke-width="4"/><circle cx="65" cy="65" r="14" fill="%237f1d1d"/><circle cx="135" cy="75" r="18" fill="%23b91c1c" stroke="%23fecaca" stroke-width="4"/><circle cx="135" cy="75" r="10" fill="%237f1d1d"/><circle cx="95" cy="125" r="25" fill="%23b91c1c" stroke="%23fecaca" stroke-width="5"/><circle cx="95" cy="125" r="16" fill="%237f1d1d"/><circle cx="145" cy="140" r="14" fill="%23b91c1c" stroke="%23fecaca" stroke-width="3"/><circle cx="45" cy="130" r="16" fill="%23b91c1c" stroke="%23fecaca" stroke-width="3"/></svg>`;

export const SVG_FMD_LESIONS = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%232b1b17"/><path d="M50 40 Q100 20 150 40 L160 120 Q100 160 40 120 Z" fill="%236c584c"/><ellipse cx="100" cy="100" rx="45" ry="30" fill="%23dc2626" opacity="0.9"/><circle cx="80" cy="95" r="8" fill="%23fef08a"/><circle cx="120" cy="95" r="8" fill="%23fef08a"/><circle cx="100" cy="115" r="10" fill="%237f1d1d"/><path d="M95 130 C90 160 105 180 100 190" stroke="%2393c5fd" stroke-width="6" stroke-linecap="round" fill="none"/></svg>`;

export const SVG_UNCERTAIN_ANIMAL = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%232c3e50"/><circle cx="100" cy="100" r="65" fill="%234a6572" opacity="0.6" filter="blur(6px)"/><text x="100" y="115" text-anchor="middle" fill="%23f1f2f6" font-size="34" font-family="sans-serif" font-weight="bold">❓</text></svg>`;

// Aliases for backwards compatibility with any remaining crop-named imports
export const SVG_HEALTHY_LEAF = SVG_HEALTHY_ANIMAL;
export const SVG_UNCERTAIN_AI = SVG_UNCERTAIN_ANIMAL;
export const SVG_EARLY_BLIGHT = SVG_LSD_NODULES;
export const SVG_COTTON_CURL = SVG_FMD_LESIONS;
export const SVG_SOYBEAN_RUST = SVG_LSD_NODULES;
export const SVG_SUGARCANE_RED_ROT = SVG_FMD_LESIONS;
export const SVG_MAIZE_BLIGHT = SVG_LSD_NODULES;
export const SVG_ONION_BLOTCH = SVG_LSD_NODULES;
export const SVG_RICE_BLAST = SVG_FMD_LESIONS;
export const SVG_WHEAT_RUST = SVG_LSD_NODULES;

export const MOCK_LIVESTOCK: CropInfo[] = [
  {
    id: 'cattle',
    name: 'Cattle (Cow)',
    nameHi: 'गाय (गोवंश)',
    nameMr: 'गाय (गोवंश)',
    icon: '🐄',
    scientificName: 'Bos indicus / Bos taurus (Gir, Khillari, HF Cross)',
    sampleImages: [
      {
        id: 'cattle_lsd_nodules',
        title: 'Cutaneous Skin Nodules & Neck Lumps (Lumpy Skin Disease)',
        titleHi: 'गर्दन और त्वचा पर 2-5 सेमी सख्त गांठें (लंपी चर्मरोग)',
        titleMr: 'मान व पाठीवर २-५ सेमी गोल गाठी (लंपी चर्मरोग)',
        condition: 'Lumpy Skin Disease (LSD)',
        conditionHi: 'लंपी चर्मरोग',
        conditionMr: 'लंपी चर्मरोग (LSD)',
        url: SVG_LSD_NODULES,
        fallbackUrl: SVG_LSD_NODULES,
        isHealthy: false,
      },
      {
        id: 'cattle_fmd_blisters',
        title: 'Mouth Ulcers & Hoof Lesions (Foot-and-Mouth Disease)',
        titleHi: 'मुंह में छाले, लार टपकना व खुरों में घाव (खुरपका-मुंहपका)',
        titleMr: 'तोंडात फोड, लाळ गळणे व खुरांमध्ये जखमा (लाळ्या खुरकूत)',
        condition: 'Foot-and-Mouth Disease (FMD)',
        conditionHi: 'खुरपका-मुंहपका (FMD)',
        conditionMr: 'लाळ्या खुरकूत (FMD)',
        url: SVG_FMD_LESIONS,
        fallbackUrl: SVG_FMD_LESIONS,
        isHealthy: false,
      },
      {
        id: 'cattle_healthy',
        title: 'Healthy Cattle with Smooth Coat & Active Rumination',
        titleHi: 'स्वस्थ गाय - चमकदार त्वचा व सक्रिय जुगाली',
        titleMr: 'निरोगी गाय - तुकतुकीत त्वचा व नियमित रवंथ',
        condition: 'Healthy Animal',
        conditionHi: 'स्वस्थ पशु',
        conditionMr: 'निरोगी पशु',
        url: SVG_HEALTHY_ANIMAL,
        fallbackUrl: SVG_HEALTHY_ANIMAL,
        isHealthy: true,
      },
      {
        id: 'cattle_uncertain',
        title: 'Blurry / Unclear Livestock Photo (Uncertain AI)',
        titleHi: 'धुंधली / अस्पष्ट फोटो (अनिश्चित AI)',
        titleMr: 'अंधुक / अस्पष्ट फोटो (पुन्हा फोटो काढा)',
        condition: 'Uncertain AI',
        conditionHi: 'अस्पष्ट फोटो',
        conditionMr: 'अस्पष्ट फोटो',
        url: SVG_UNCERTAIN_ANIMAL,
        fallbackUrl: SVG_UNCERTAIN_ANIMAL,
        isHealthy: false,
      },
    ],
  },
  {
    id: 'buffalo',
    name: 'Buffalo',
    nameHi: 'भैंस',
    nameMr: 'म्हैस',
    icon: '🐃',
    scientificName: 'Bubalus bubalis (Murrah, Jaffrabadi, Pandharpuri)',
    sampleImages: [
      {
        id: 'buffalo_fmd',
        title: 'Excessive Stringy Salivation & Hoof Lesions (FMD)',
        titleHi: 'मुंह से गाढ़ी लार और खुरों में छाले (एफएमडी)',
        titleMr: 'तोंडातून चिकट लाळ व पायांतील जखमा (लाळ्या खुरकूत)',
        condition: 'Foot-and-Mouth Disease (FMD)',
        url: SVG_FMD_LESIONS,
        fallbackUrl: SVG_FMD_LESIONS,
        isHealthy: false,
      },
      {
        id: 'buffalo_lsd',
        title: 'Subcutaneous Nodules along Back and Flank (LSD)',
        titleHi: 'पीठ और बगल पर सख्त गांठें (लंपी)',
        titleMr: 'पाठीवर व पोटावर गाठी (लंपी रोग)',
        condition: 'Lumpy Skin Disease (LSD)',
        url: SVG_LSD_NODULES,
        fallbackUrl: SVG_LSD_NODULES,
        isHealthy: false,
      },
      {
        id: 'buffalo_healthy',
        title: 'Healthy Murrah Buffalo in Shed',
        titleHi: 'स्वस्थ मुर्रा भैंस',
        titleMr: 'निरोगी मुरा म्हैस',
        condition: 'Healthy Animal',
        url: SVG_HEALTHY_ANIMAL,
        fallbackUrl: SVG_HEALTHY_ANIMAL,
        isHealthy: true,
      },
    ],
  },
  {
    id: 'goat',
    name: 'Goat',
    nameHi: 'बकरी',
    nameMr: 'शेळी',
    icon: '🐐',
    scientificName: 'Capra hircus (Osmanabadi, Sangamneri, Berari)',
    sampleImages: [
      {
        id: 'goat_fmd',
        title: 'Interdigital Hoof Lesions & Acute Lameness (FMD)',
        titleHi: 'खुरों के बीच छाले व लंगड़ापन (एफएमडी)',
        titleMr: 'खुरांच्या फटीत जखमा व लंगडणे (लाळ्या खुरकूत)',
        condition: 'Foot-and-Mouth Disease (FMD)',
        url: SVG_FMD_LESIONS,
        fallbackUrl: SVG_FMD_LESIONS,
        isHealthy: false,
      },
      {
        id: 'goat_healthy',
        title: 'Healthy Osmanabadi Goat',
        titleHi: 'स्वस्थ उस्मानाबादी बकरी',
        titleMr: 'निरोगी उस्मानाबादी शेळी',
        condition: 'Healthy Animal',
        url: SVG_HEALTHY_ANIMAL,
        fallbackUrl: SVG_HEALTHY_ANIMAL,
        isHealthy: true,
      },
    ],
  },
  {
    id: 'sheep',
    name: 'Sheep',
    nameHi: 'भेड़',
    nameMr: 'मेंढी',
    icon: '🐑',
    scientificName: 'Ovis aries (Deccani, Madgyal)',
    sampleImages: [
      {
        id: 'sheep_fmd',
        title: 'Oral Vesicles & Coronary Band Lesions (FMD)',
        titleHi: 'मुंह में फफोले व खुरों की सूजन (एफएमडी)',
        titleMr: 'तोंडात फोड व खुरांना सूज (लाळ्या खुरकूत)',
        condition: 'Foot-and-Mouth Disease (FMD)',
        url: SVG_FMD_LESIONS,
        fallbackUrl: SVG_FMD_LESIONS,
        isHealthy: false,
      },
      {
        id: 'sheep_healthy',
        title: 'Healthy Grazing Deccani Sheep',
        titleHi: 'स्वस्थ दख्खनी भेड़',
        titleMr: 'निरोगी दख्खनी मेंढी',
        condition: 'Healthy Animal',
        url: SVG_HEALTHY_ANIMAL,
        fallbackUrl: SVG_HEALTHY_ANIMAL,
        isHealthy: true,
      },
    ],
  },
];

export const MOCK_CROPS: CropInfo[] = MOCK_LIVESTOCK;

export function getDefaultDiagnosisForCrop(speciesOrCropId: string = 'cattle'): DiagnosisResult {
  const key = (speciesOrCropId || 'cattle').toLowerCase().trim();

  // If Foot-and-Mouth Disease requested or detected
  if (key === 'fmd' || key.includes('foot') || key.includes('mouth') || key === 'goat') {
    return {
      id: 'diag-fmd-default',
      cropId: 'cattle',
      cropName: 'Cattle',
      cropNameHi: 'गाय (गोवंश)',
      cropNameMr: 'गाय (गोवंश)',
      diseaseName: 'Foot-and-Mouth Disease (FMD)',
      diseaseNameHi: 'खुरपका-मुंहपका रोग (FMD)',
      diseaseNameMr: 'लाळ्या खुरकूत रोग (FMD)',
      pathogen: 'Aphthovirus (Picornaviridae Family)',
      severity: 'high',
      confidenceLabel: 'reliable',
      confidence: 0.92,
      isUncertain: false,
      detectedAt: 'Today, 10:15 AM',
      imageUrl: SVG_FMD_LESIONS,
      whatToDoToday: [
        {
          step: 1,
          title: 'Strict Quarantine & Herd Movement Halt',
          titleHi: 'संक्रमित पशु को तुरंत अलग करें व आवागमन रोकें',
          titleMr: 'बाधित जनावरास तातडीने वेगळे बांधा व हालचाल थांबवा',
          description: 'Isolate affected cattle in a dry, disinfected stall. Prohibit grazing in public pastures or shared water ponds.',
          descriptionHi: 'संक्रमित गाय को साफ सूखे बाड़े में अलग बांधें। सार्वजनिक चारागाह या साझे तालाब में पानी पिलाना सख्त बंद करें।',
          descriptionMr: 'बाधित जनावरास गोठ्यात एका स्वतंत्र ठिकाणी बांधा. सार्वजनिक पाणवठ्यावर किंवा चराऊ कुरणात नेणे त्वरित थांबवा.',
          priority: 'critical',
          category: 'cultural',
        },
        {
          step: 2,
          title: 'Antiseptic Oral Wash (1-2% Sodium Bicarbonate / Soda)',
          titleHi: 'मुंह के छालों को 1% मीठा सोडा के घोल से धोएं',
          titleMr: 'तोंडातील फोड १-२% खाण्याचा सोडा द्रावणाने धुवा',
          description: 'Gently flush oral cavity and tongue blisters twice daily with lukewarm 1-2% baking soda or boric acid solution.',
          descriptionHi: 'मुंह और जीभ के छालों को दिन में दो बार 1% खाने के सोडे के गुनगुने पानी से साफ करें।',
          descriptionMr: 'दिवसातून २ वेळा कोमट पाण्यात १-२% खाण्याचा सोडा टाकून तोंड व जिभेवरील व्रण हलक्या हाताने स्वच्छ करा.',
          priority: 'critical',
          category: 'mechanical',
        },
        {
          step: 3,
          title: 'Copper Sulphate Foot Bath (2% CuSO4)',
          titleHi: 'खुरों के घावों को 2% नीला थोथा (तूतिया) घोल से धोएं',
          titleMr: 'खुरांमधील जखमा २% मोरचूद (CuSO4) द्रावणाने धुवा',
          description: 'Walk cattle through a 2% Copper Sulphate foot-bath or apply potassium permanganate wash to heal interdigital clefts.',
          descriptionHi: 'खुरों के बीच के घावों को 2% कॉपर सल्फेट घोल या पोटाश के घोल से दिन में दो बार धोएं।',
          descriptionMr: 'खुरांच्या फटीतील जखमांवर २% मोरचूदचे पाणी किंवा पोटॅशियम परमँगनेटचे द्रावण लावून जखमा कोरड्या ठेवा.',
          priority: 'important',
          category: 'biological',
        },
        {
          step: 4,
          title: 'Soft Gruel Mash Diet & Mineral Supplementation',
          titleHi: 'मुलायम दलिया, गुड़ और इलेक्ट्रोलाइट युक्त आहार दें',
          titleMr: 'मऊ पेज, गूळ व खनिजयुक्त मऊ आहार द्या',
          description: 'Feed soft boiled rice/ragi gruel with 50g jaggery and fresh tender green grass. Avoid dry fibrous straw while mouth is sore.',
          descriptionHi: 'मुंह में दर्द के कारण सख्त चारा न दें। उबला दलिया, 50 ग्राम गुड़ और ताजी कोमल हरी घास खिलाएं।',
          descriptionMr: 'तोंडात जखमा असल्याने कडक चारा देणे टाळा. उकडलेली मऊ पेज, ५० ग्रॅम गूळ व कोवळा लुसलुशीत हिरवा चारा द्या.',
          priority: 'important',
          category: 'biological',
        },
        {
          step: 5,
          title: 'Veterinary Escalation & Ring Vaccination (Call 1962)',
          titleHi: 'पशु चिकित्सक को सूचित करें व 10 किमी क्षेत्र में टीकाकरण कराएं',
          titleMr: 'पशुवैद्यकीय अधिकाऱ्यांशी संपर्क करा व रिंग व्हॅक्सिनेशन करा',
          description: 'Notify Taluka Veterinary Officer immediately for NADCP trivalent FMD ring vaccination in a 10 km radius.',
          descriptionHi: 'राष्ट्रीय पशु रोग नियंत्रण कार्यक्रम (NADCP) के तहत 10 किमी दायरे में रिंग टीकाकरण हेतु तुरंत नजदीकी पशु चिकित्सालय में संपर्क करें (हेल्पलाइन 1962)।',
          descriptionMr: '१० किमी परिसरातील जनावरांच्या रिंग लसीकरणासाठी त्वरित तालुका पशुवैद्यकीय अधिकारी किंवा १९६२ हेल्पलाईनवर संपर्क करा.',
          priority: 'critical',
          category: 'chemical',
        },
      ],
      whatToMonitor: [
        {
          title: 'Stringy drooling salivation & mouth blisters',
          titleHi: 'मुंह से लगातार लार टपकना व जीभ के छाले',
          titleMr: 'तोंडातून सतत लाळ गळणे व जिभेवरील फोड',
          check: 'Observe if excessive frothy salivation decreases after antiseptic mouth rinses.',
          checkHi: 'जांचें कि क्या सोडे के पानी से धोने के बाद मुंह से लार टपकना कम हो रहा है।',
          checkMr: 'सोड्याच्या पाण्याने तोंड धुतल्यानंतर लाळ गळण्याचे प्रमाण कमी होते का ते तपासा.',
        },
        {
          title: 'Lameness & hoof detachment prevention',
          titleHi: 'खुरों में कीड़े या खुर उखड़ने का जोखिम',
          titleMr: 'खुर गळणे किंवा जखमेत अळ्या पडणे',
          check: 'Inspect hooves daily for fly strike or secondary bacterial necrosis.',
          checkHi: 'प्रतिदिन खुरों की जांच करें कि कहीं घाव में मक्खियों के कीड़े (मैगॉट्स) न पड़ रहे हों।',
          checkMr: 'पायांच्या जखमांमध्ये माशा बसून अळ्या पडणार नाहीत याकडे बारकाईने लक्ष द्या.',
        },
      ],
      whatMayHappenNext: {
        title: 'FMD Hyper-Contagious Outbreak Forecast',
        titleHi: 'खुरपका-मुंहपका तीव्र संक्रमण पूर्वानुमान',
        titleMr: 'लाळ्या खुरकूत रोग प्रसार अंदाज',
        text: 'FMD virus spreads rapidly via aerosol and shared grazing within 48-72 hours. Strict quarantine and immediate foot-bath disinfection are mandatory to protect entire village cattle herds.',
        textHi: 'एफएमडी वायरस हवा और संपर्क से अगले 48-72 घंटों में तेजी से फैलता है। पूरे गांव के गोवंश की सुरक्षा के लिए क्वारंटाइन और टीकाकरण अनिवार्य है।',
        textMr: 'हा विषाणूजन्य रोग हवेतून व संपर्कातून ४८-७२ तासांत वेगाने इतर जनावरांमध्ये पसरू शकतो. गावातील इतर जनावरांच्या सुरक्षिततेसाठी बाधित जनावर वेगळे ठेवणे सक्तीचे आहे.',
        riskTrend: 'increasing',
      },
      advisoryVoiceScript: 'Foot-and-Mouth Disease suspected with high severity. Immediately isolate the animal, rinse mouth ulcers with one percent baking soda, and wash hooves with copper sulphate. Call veterinary helpline 1962 for ring vaccination.',
      advisoryVoiceScriptHi: 'गाय में उच्च गंभीरता का खुरपका-मुंहपका (FMD) रोग पाया गया है। पशु को तुरंत अलग बांधें, मुंह को मीठे सोडे से और खुरों को तूतिया के पानी से धोएं। रिंग टीकाकरण के लिए 1962 पर कॉल करें।',
      advisoryVoiceScriptMr: 'जनावरामध्ये लाळ्या खुरकूत रोगाची तीव्र लक्षणे आढळली आहेत. बाधित जनावरास लगेच वेगळे बांधा, तोंड १% खाण्याच्या सोड्याने व खुर मोरचुदाच्या पाण्याने धुवा. लसीकरणासाठी १९६२ वर संपर्क करा.',
    };
  }

  // Default Primary: Lumpy Skin Disease (LSD) - SIH Scoped Demonstration
  return {
    id: 'diag-lsd-default',
    cropId: 'cattle',
    cropName: 'Cattle',
    cropNameHi: 'गाय (गोवंश)',
    cropNameMr: 'गाय (गोवंश)',
    diseaseName: 'Lumpy Skin Disease (LSD)',
    diseaseNameHi: 'लंपी चर्मरोग (LSD)',
    diseaseNameMr: 'लंपी चर्मरोग (Lumpy Skin Disease)',
    pathogen: 'Capripoxvirus (Poxviridae Family)',
    severity: 'moderate',
    confidenceLabel: 'reliable',
    confidence: 0.91,
    isUncertain: false,
    detectedAt: 'Today, 10:15 AM',
    imageUrl: SVG_LSD_NODULES,
    whatToDoToday: [
      {
        step: 1,
        title: 'Segregate in Fly-Proof Pen (Vector Biosecurity)',
        titleHi: 'पशु को तुरंत अलग बांधें व मच्छरदानी / मक्खी-रोधी जाली लगाएं',
        titleMr: 'बाधित जनावरास वेगळे ठेवा व डास-माशांपासून संरक्षण करा',
        description: 'Quarantine the affected animal in a dry, sanitized shed. Install mosquito nets or mesh to block biting flies (Stomoxys) and mosquitoes.',
        descriptionHi: 'संक्रमित पशु को अलग हवादार बाड़े में रखें। मक्खियों और मच्छरों को रोकने के लिए जाली या मच्छरदानी लगाएं।',
        descriptionMr: 'बाधित जनावरास इतर जनावरांपासून पूर्णपणे वेगळे बांधा. चावणाऱ्या माशा व डासांपासून संरक्षणासाठी गोठ्यात जाळी लावा.',
        priority: 'critical',
        category: 'cultural',
      },
      {
        step: 2,
        title: 'Antiseptic Nodule Wash (Potassium Permanganate 1:1000)',
        titleHi: 'त्वचा की गांठों को लाल दवा (पोटैशियम परमैंगनेट 1:1000) से धोएं',
        titleMr: 'गाठींना पोटॅशियम परमँगनेट (लाल औषध १:१०००) द्रावणाने धुवा',
        description: 'Wash ruptured or open skin nodules twice daily with mild pink KMnO4 solution (1g in 1 liter of warm water) to prevent secondary infection.',
        descriptionHi: 'फूट रही गांठों को हल्के गुलाबी लाल दवा के घोल (1 ग्राम प्रति लीटर पानी) से दिन में दो बार साफ करें।',
        descriptionMr: 'फुटलेल्या गाठी दिवसातून दोनदा कोमट पाण्यात लाल औषध (१ ग्रॅम/लिटर) मिसळून हलक्या हाताने स्वच्छ धुवा.',
        priority: 'critical',
        category: 'mechanical',
      },
      {
        step: 3,
        title: 'Natural Fly Repellent & Herbal Wound Care',
        titleHi: 'नीम का तेल या हर्बल स्प्रे लगाएं (कीड़े व मक्खी रोकथाम)',
        titleMr: 'कडुनिंब तेल किंवा जखमेवर औषधी मलम लावा',
        description: 'Apply Neem oil or veterinary herbal fly-repellent spray over nodules and limbs to deter vector flies and prevent maggot wounds.',
        descriptionHi: 'गांठों पर नीम का तेल या मक्खी-रोधी हर्बल स्प्रे लगाएं ताकि मक्खियां न बैठें और कीड़े न पड़ें।',
        descriptionMr: 'गाठींवर माशा बसू नयेत व अळ्या पडू नयेत म्हणून कडुनिंबाचे तेल किंवा जखमेवर निर्जंतुक मलम लावा.',
        priority: 'important',
        category: 'biological',
      },
      {
        step: 4,
        title: 'Nutritive Soft Mash Diet with Electrolytes & Jaggery',
        titleHi: 'गुड़, हल्दी और खनिज मिश्रण युक्त सुपाच्य दलिया खिलाएं',
        titleMr: 'गूळ, हळद व क्षारमिश्रणयुक्त मऊ पौष्टिक आहार द्या',
        description: 'Feed warm boiled mash with 50g jaggery, 10g turmeric, mineral mixture, and electrolytes. Provide ad libitum clean water.',
        descriptionHi: 'बुखार और कमजोरी से निपटने के लिए 50 ग्राम गुड़, हल्दी और खनिज लवण युक्त सुपाच्य दलिया और स्वच्छ पानी दें।',
        descriptionMr: 'रोगप्रतिकारशक्तीसाठी ५० ग्रॅम गूळ, हळद, मीठ व क्षारमिश्रण (Mineral Mixture) घातलेली मऊ पेज खायला द्या.',
        priority: 'important',
        category: 'biological',
      },
      {
        step: 5,
        title: 'Veterinary Escalation & Ring Vaccination (Call 1962)',
        titleHi: 'पशु चिकित्सक से परामर्श लें व गोट पॉक्स रिंग टीकाकरण कराएं',
        titleMr: 'पशुवैद्यकीय अधिकाऱ्यांचा सल्ला घ्या व गोट पॉक्स लस द्या',
        description: 'Contact Government Veterinary Officer for prescription antipyretics (Meloxicam + Paracetamol) and organize Goat Pox ring vaccination in 5 km zone.',
        descriptionHi: 'बुखार कम करने की दवा हेतु सरकारी पशु चिकित्सक से परामर्श लें और 5 किमी क्षेत्र में गोट पॉक्स वैक्सीन (3 मिली) लगवाएं।',
        descriptionMr: 'ताप नियंत्रणासाठी पशुवैद्यकीय अधिकाऱ्यांच्या सल्ल्याने औषधोपचार करा व ५ किमी परिसरात गोट पॉक्स रिंग लसीकरण पूर्ण करा.',
        priority: 'critical',
        category: 'chemical',
      },
    ],
    whatToMonitor: [
      {
        title: 'Rectal body temperature (High fever 104-106°F)',
        titleHi: 'पशु का तापमान (बुखार 104-106°F की जांच)',
        titleMr: 'जनावराचे शरीराचे तापमान (१०४-१०६°F ताप)',
        check: 'Measure body temperature using a clinical veterinary thermometer twice daily.',
        checkHi: 'थर्मामीटर से सुबह-शाम पशु का तापमान मापें (सामान्य तापमान 101.5°F होता है)।',
        checkMr: 'दिवसातून २ वेळा थर्मामीटरने जनावराचा ताप तपासा (सामान्य तापमान १०१.५°F असते).',
      },
      {
        title: 'Nodule crusting & secondary maggot strike',
        titleHi: 'गांठों का सूखना व मक्खियों से कीड़े पड़ने की जांच',
        titleMr: 'गाठी सुकणे व जखमेत अळ्या न पडणे',
        check: 'Inspect nodule centers for hard necrotic scabs or maggot infestation.',
        checkHi: 'गांठों की नियमित जांच करें कि वे सूख रही हैं या उनमें मवाद/कीड़े पड़ रहे हैं।',
        checkMr: 'गाठींच्या ठिकाणी पू किंवा अळ्या पडत नाहीत ना यावर रोज लक्ष ठेवा.',
      },
      {
        title: 'Daily milk yield & feed intake volume',
        titleHi: 'दूध उत्पादन व चारा खाने की क्षमता',
        titleMr: 'दूध उत्पादन व चारा खाण्याचे प्रमाण',
        check: 'Track milk volume and water intake to gauge systemic recovery.',
        checkHi: 'दूध की मात्रा और चारे की खपत पर नजर रखें।',
        checkMr: 'दूध उत्पादन व पाणी पिण्याचे प्रमाण तपासून सुधारणा नोंदवा.',
      },
    ],
    whatMayHappenNext: {
      title: 'Vector Activity & Outbreak Spread Projection',
      titleHi: 'मक्खी-मच्छर प्रसार व प्रकोप पूर्वानुमान',
      titleMr: 'रोगप्रसार व प्रादुर्भाव वाढीचा अंदाज',
      text: 'Warm humid weather (25-34°C, >70% RH) accelerates biting fly (Stomoxys) and mosquito breeding. Strict fly control and quarantine protect healthy herd members from infection within 5-7 days.',
      textHi: 'उमस भरा मौसम (आर्द्रता >70%) खून चूसने वाली मक्खियों को बढ़ाता है। मक्खी नियंत्रण और क्वारंटाइन से बाड़े के अन्य पशु 5-7 दिनों में सुरक्षित रहते हैं।',
      textMr: 'दमट हवामानामुळे (आर्द्रता ७०%+) चावणाऱ्या गोमाश्या व डासांची संख्या वाढते. माशांचे नियंत्रण व गोठ्याची स्वच्छता ठेवल्यास इतर जनावरांचे रक्षण होते.',
      riskTrend: 'increasing',
    },
    advisoryVoiceScript: 'Lumpy Skin Disease nodules detected on cattle with moderate severity. Isolate the animal in a fly-proof pen, cleanse nodules with potassium permanganate solution, and feed soft warm mash with jaggery. Call helpline 1962 for veterinary ring vaccination.',
    advisoryVoiceScriptHi: 'गाय में मध्यम स्तर का लंपी चर्मरोग पाया गया है। पशु को तुरंत मक्खी-रोधी बाड़े में अलग करें, गांठों को लाल दवा के घोल से धोएं, और गुड़-दलिया खिलाएं। रिंग टीकाकरण हेतु 1962 पर कॉल करें।',
    advisoryVoiceScriptMr: 'जनावरामध्ये मध्यम स्वरूपाचा लंपी चर्मरोग आढळला आहे. बाधित जनावरास लगेच डास-माशांपासून वेगळे बांधा, गाठी लाल औषधाच्या पाण्याने धुवा आणि गुळाची मऊ पेज खायला द्या. लसीकरणासाठी १९६२ वर संपर्क करा.',
  };
}

export function getDefaultRiskForecastForCrop(speciesOrCropId: string = 'cattle', liveWeather?: WeatherCondition): RiskForecast {
  const key = (speciesOrCropId || 'cattle').toLowerCase().trim();
  const temp = liveWeather?.temp ?? 28;
  const humidity = liveWeather?.humidity ?? 82;

  // National Research Council THI equation for Cattle:
  // THI = 0.8 * T + (RH/100) * (T - 14.4) + 46.4
  const calculatedThi = Math.round(0.8 * temp + (humidity / 100) * (temp - 14.4) + 46.4);
  const heatStressLevel = calculatedThi >= 88 ? 'severe' : calculatedThi >= 79 ? 'moderate' : calculatedThi >= 72 ? 'low' : 'low';

  return {
    cropId: key,
    currentLevel: heatStressLevel === 'severe' ? 'high' : heatStressLevel === 'moderate' ? 'moderate' : 'low',
    score: calculatedThi >= 88 ? 85 : calculatedThi >= 79 ? 74 : 52,
    summary: `Livestock Bioclimatic Risk: THI is at ${calculatedThi} (${heatStressLevel.toUpperCase()} Heat Stress). High humidity (${humidity}%) elevates Lumpy Skin Disease biting vector proliferation.`,
    summaryHi: `पशु जलवायु जोखिम: टीएचआई सूचकांक ${calculatedThi} है (${heatStressLevel === 'moderate' ? 'मध्यम' : 'उच्च'} हीट स्ट्रेस)। उच्च आर्द्रता (${humidity}%) के कारण लंपी रोग फैलाने वाले मच्छरों-मक्खियों का प्रकोप बढ़ रहा है।`,
    summaryMr: `पशु हवामान जोखीम: THI निर्देशांक ${calculatedThi} असून मध्यम उष्मा ताण (Heat Stress) आहे. हवेतील जास्त आर्द्रतेमुळे (${humidity}%) लंपी चर्मरोग पसरवणाऱ्या गोमाश्या व डासांचा प्रादुर्भाव वाढू शकतो.`,
    timeline: [
      { day: 'Today', dayHi: 'आज', dayMr: 'आज', date: 'Sat, Sep 6', level: heatStressLevel === 'severe' ? 'high' : 'moderate', score: 72 },
      { day: 'Tomorrow', dayHi: 'कल', dayMr: 'उद्या', date: 'Sun, Sep 7', level: 'moderate', score: 76 },
      { day: 'Day 3', dayHi: 'तीसरा दिन', dayMr: '३ रा दिवस', date: 'Mon, Sep 8', level: 'high', score: 84 },
      { day: 'Day 4', dayHi: 'चौथा दिन', dayMr: '४ था दिवस', date: 'Tue, Sep 9', level: 'high', score: 80 },
      { day: 'Day 5', dayHi: 'पाँचवाँ दिन', dayMr: '५ वा दिवस', date: 'Wed, Sep 10', level: 'moderate', score: 65 },
    ],
    reasons: [
      {
        id: 'r-thi',
        title: `Temperature-Humidity Index (THI: ${calculatedThi})`,
        titleHi: `तापमान-आर्द्रता सूचकांक (THI: ${calculatedThi})`,
        titleMr: `तापमान-आर्द्रता निर्देशांक (THI: ${calculatedThi})`,
        icon: 'droplet',
        detail: `THI of ${calculatedThi} causes heat stress, suppressing bovine immunity and reducing daily milk yield by 10% to 20%.`,
        detailHi: `THI ${calculatedThi} होने से पशुओं में गर्मी का तनाव होता है, जिससे रोग प्रतिरोधक क्षमता घटती है और दूध उत्पादन में 10-20% की गिरावट आती है।`,
        detailMr: `THI ${calculatedThi} झाल्यामुळे जनावरांवर उष्मा ताण येतो, ज्यामुळे दूध उत्पादनात १०-२०% घट व प्रतिकारशक्ती कमी होते.`,
      },
      {
        id: 'r-vector',
        title: `Vector Proliferation Risk (Stomoxys & Mosquitoes)`,
        titleHi: `मक्खी-मच्छर प्रसार चेतावनी (लंपी वाहक)`,
        titleMr: `गोमाश्या व डास प्रादुर्भाव इशारा (लंपी वाहक)`,
        icon: 'wind',
        detail: `Continuous humidity at ${humidity}% with temperatures between 25-32°C creates peak breeding conditions for LSD vector flies.`,
        detailHi: `${humidity}% आर्द्रता और 25-32°C तापमान लंपी रोग फैलाने वाली खून चूसने वाली मक्खियों (Stomoxys) के पनपने के लिए अनुकूल है।`,
        detailMr: `हवेतील ${humidity}% आर्द्रता व २५-३२°C तापमानामुळे लंपी रोग पसरवणाऱ्या गोमाश्या वेगाने वाढतात.`,
      },
      {
        id: 'r-cluster',
        title: `Active Nearby Outbreak Activity (Niphad Taluka)`,
        titleHi: `आस-पास 14 सक्रिय पशु रोग मामले`,
        titleMr: `परिसरात १४ सक्रिय पशु रोग प्रकरणे`,
        icon: 'map-pin',
        detail: `Neighboring dairy herds within 5 km report confirmed Lumpy Skin Disease & FMD cases. Ring biosecurity required.`,
        detailHi: `5 किमी के भीतर पड़ोसी बाड़ों में लंपी और एफएमडी के मामले सामने आए हैं। 5 किमी दायरे में रिंग टीकाकरण आवश्यक है।`,
        detailMr: `५ किमी परिसरातील गोठ्यांमध्ये लंपी व लाळ्या खुरकूत आजाराचे रुग्ण आढळले आहेत. रिंग लसीकरण आवश्यक आहे.`,
      },
    ],
    recommendation: `Activate shed ventilation and foggers to lower THI heat stress. Spray neem oil on livestock limbs to deter biting flies and confirm vaccination status with local vet.`,
    recommendationHi: `पशुओं को गर्मी से बचाने के लिए बाड़े में पंखे/फव्वारे चलाएं। मक्खियों से बचाव के लिए नीम का तेल लगाएं और पशु चिकित्सक से गोट पॉक्स टीकाकरण करवाएं।`,
    recommendationMr: `गोठ्यात हवा खेळती ठेवा व थंडावा निर्माण करा. जनावरांवर कडुनिंब तेलाची फवारणी करा आणि पशुवैद्यकांकडून वेळेवर लसीकरण करून घ्या.`,
    breakdown: {
      temperature: `${temp}°C`,
      temperatureValue: `${temp}°C (Warm)`,
      humidity: `${humidity}%`,
      humidityValue: `${humidity}% (Humid)`,
      rainfall: 'Moderate chance',
      rainfallValue: 'Rain expected',
      nearbyReports: 14,
      cropStage: 'Lactating & Calves (High Sensitivity)',
      overallRisk: `${calculatedThi >= 79 ? 'Moderate to High' : 'Low'}`,
    },
  };
}

export const DEFAULT_DIAGNOSIS: DiagnosisResult = getDefaultDiagnosisForCrop('cattle');

export const MOCK_RISK_FORECAST: RiskForecast = getDefaultRiskForecastForCrop('cattle');

export const MOCK_AREA_REPORT: AreaReport = {
  district: 'Nashik',
  districtHi: 'नासिक',
  districtMr: 'नाशिक',
  subDistrict: 'Niphad & Dindori Belt',
  subDistrictHi: 'निफाड और दिंडोरी पट्टा',
  subDistrictMr: 'निफाड व दिंडोरी पट्टा',
  status: 'moderate',
  diseaseTrend: 'increasing',
  activeCasesCount: 14,
  lastUpdated: '1 hour ago',
  clusters: [
    {
      id: 'c1',
      lat: 20.082,
      lng: 73.845,
      intensity: 'high',
      areaName: 'Niphad Cattle Dairy Cluster',
      areaNameHi: 'निफाड गोवंश क्लस्टर',
      areaNameMr: 'निफाड गोवंश क्लस्टर',
      crop: 'Cattle (LSD)',
      reportedCases: 6,
      distanceKm: 2.1,
    },
    {
      id: 'c2',
      lat: 20.035,
      lng: 73.892,
      intensity: 'moderate',
      areaName: 'Lasalgaon Livestock Market Zone',
      areaNameHi: 'लासलगांव पशु बाजार क्षेत्र',
      areaNameMr: 'लासलगाव जनावरांचा बाजार परिसर',
      crop: 'Cattle & Buffalo (FMD)',
      reportedCases: 5,
      distanceKm: 3.8,
    },
    {
      id: 'c3',
      lat: 19.992,
      lng: 73.791,
      intensity: 'low',
      areaName: 'Chandori Goat & Cattle Belt',
      areaNameHi: 'चांदोरी क्षेत्र',
      areaNameMr: 'चांदोरी पट्टा',
      crop: 'Goat & Cattle',
      reportedCases: 3,
      distanceKm: 4.9,
    },
  ],
  communityAdvisory: 'Regional Veterinary Advisory: Active surveillance for Lumpy Skin Disease (LSD) and Foot-and-Mouth Disease (FMD) across Niphad and Dindori talukas. Livestock owners must quarantine newly brought animals for 14 days and coordinate with Taluka Veterinary Dispensaries for mandatory ring vaccination.',
  communityAdvisoryHi: 'क्षेत्रीय पशु चिकित्सा परामर्श: निफाड और दिंडोरी में लंपी चर्मरोग और एफएमडी का प्रकोप अलर्ट। पशुपालक नए पशुओं को 14 दिन अलग रखें और नजदीकी पशु चिकित्सालय से तुरंत टीकाकरण कराएं।',
  communityAdvisoryMr: 'प्रादेशिक पशुवैद्यकीय सल्ला: निफाड व दिंडोरी तालुक्यात लंपी चर्मरोग व लाळ्या खुरकूत आजाराचा दक्षता इशारा. नवीन जनावरे १४ दिवस वेगळी बांधा व नजीकच्या पशुवैद्यकीय दवाखान्यातून त्वरित रिंग लसीकरण पूर्ण करा.',
};

export const MOCK_EXPERT: ExpertProfile = {
  id: 'exp-dr-kulkarni',
  name: 'Dr. Ashok Kulkarni, B.V.Sc & A.H.',
  nameHi: 'डॉ. अशोक कुलकर्णी (पशुधन विकास अधिकारी)',
  nameMr: 'डॉ. अशोक कुलकर्णी (पशुधन विकास अधिकारी)',
  role: 'Veterinary Officer (Govt. of Maharashtra)',
  roleHi: 'पशुधन विकास अधिकारी (महाराष्ट्र शासन)',
  roleMr: 'पशुधन विकास अधिकारी (महाराष्ट्र शासन)',
  station: 'Taluka Veterinary Dispensary, Niphad, Nashik',
  stationHi: 'तालुका पशु चिकित्सालय, निफाड, नासिक',
  stationMr: 'तालुका पशुवैद्यकीय दवाखाना, निफाड, नाशिक',
  avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80',
  available: true,
  phone: '1962 (Toll-Free Livestock Emergency)',
};

export const INITIAL_EXPERT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'expert',
    text: 'Namaste Pashupalak! I am Dr. Ashok Kulkarni from the Veterinary Dispensary. I have reviewed your Cattle diagnosis (Lumpy Skin Disease - Moderate). Is the animal isolated from healthy cattle, and have you noted high fever above 103°F or drop in milk yield?',
    textHi: 'नमस्ते पशुपालक! मैं पशु चिकित्सालय से डॉ. अशोक कुलकर्णी हूं। मैंने आपकी गाय के लंपी चर्मरोग निदान की समीक्षा की है। क्या पशु को अन्य स्वस्थ पशुओं से अलग बांधा गया है, और क्या तेज बुखार (103°F से अधिक) या दूध में गिरावट देखी गई है?',
    textMr: 'नमस्ते पशुपालक बांधवांनो! मी तालुका पशुवैद्यकीय दवाखान्यातून डॉ. अशोक कुलकर्णी बोलत आहे. मी आपल्या जनावराचा लंपी चर्मरोग अहवाल पाहिला आहे. बाधित जनावरास इतर जनावरांपासून वेगळे बांधले आहे का आणि १०३°F पेक्षा जास्त ताप किंवा दूध कमी झाल्याचे आढळले आहे का?',
    timestamp: '10:18 AM',
  },
];
