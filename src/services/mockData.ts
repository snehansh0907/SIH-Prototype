import type { CropInfo, DiagnosisResult, WeatherCondition, RiskForecast, AreaReport, ExpertProfile, ChatMessage } from '../types';

export const MOCK_CROPS: CropInfo[] = [
  {
    id: 'tomato',
    name: 'Tomato',
    nameMr: 'टोमॅटो',
    icon: '🍅',
    scientificName: 'Solanum lycopersicum',
    sampleImages: [
      {
        id: 'tomato_early_blight',
        title: 'Tomato with Dark Concentric Spots (Early Blight)',
        titleMr: 'पानांवर काळपट गोलाकार डाग (करपा रोग)',
        condition: 'Early Blight',
        url: 'https://images.unsplash.com/photo-1592417817098-8f3d69102a5e?auto=format&fit=crop&w=600&q=80',
        isHealthy: false,
      },
      {
        id: 'tomato_healthy',
        title: 'Healthy Green Tomato Leaf',
        titleMr: 'निरोगी हिरवे टोमॅटोचे पान',
        condition: 'Healthy Leaf',
        url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=600&q=80',
        isHealthy: true,
      }
    ]
  },
  {
    id: 'cotton',
    name: 'Cotton',
    nameMr: 'कापूस',
    icon: '🌱',
    scientificName: 'Gossypium hirsutum',
    sampleImages: [
      {
        id: 'cotton_leaf_curl',
        title: 'Cotton Leaf Curling & Thickening',
        titleMr: 'कापसाच्या पानांचा चुरमुरडा / वाकडी पाने',
        condition: 'Leaf Curl Virus',
        url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80',
        isHealthy: false,
      }
    ]
  },
  {
    id: 'soybean',
    name: 'Soybean',
    nameMr: 'सोयाबीन',
    icon: '🌿',
    scientificName: 'Glycine max',
    sampleImages: [
      {
        id: 'soybean_rust',
        title: 'Soybean Yellow Pustules (Rust)',
        titleMr: 'सोयाबीनवरील पिवळे-तपकिरी तांबेरा डाग',
        condition: 'Soybean Rust',
        url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
        isHealthy: false,
      }
    ]
  },
  {
    id: 'rice',
    name: 'Rice (Paddy)',
    nameMr: 'भात (धान)',
    icon: '🌾',
    scientificName: 'Oryza sativa',
    sampleImages: [
      {
        id: 'rice_blast',
        title: 'Spindle-shaped Lesions on Rice',
        titleMr: 'भाताच्या पानांवर लांबट करपा चट्टे',
        condition: 'Rice Blast',
        url: 'https://images.unsplash.com/photo-1536704689578-8ffe53d499f5?auto=format&fit=crop&w=600&q=80',
        isHealthy: false,
      }
    ]
  },
  {
    id: 'potato',
    name: 'Potato',
    nameMr: 'बटाटा',
    icon: '🥔',
    scientificName: 'Solanum tuberosum',
    sampleImages: [
      {
        id: 'potato_late_blight',
        title: 'Water-soaked Dark Patches on Potato',
        titleMr: 'बटाट्याच्या पानांवर काळपट पाणथळ चट्टे',
        condition: 'Late Blight',
        url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
        isHealthy: false,
      }
    ]
  }
];

export const DEFAULT_DIAGNOSIS: DiagnosisResult = {
  id: 'diag-tomato-001',
  cropId: 'tomato',
  cropName: 'Tomato',
  cropNameMr: 'टोमॅटो',
  diseaseName: 'Early Blight',
  diseaseNameMr: 'करपा (अल्टरनेरिया सोलेनाय)',
  pathogen: 'Alternaria solani (Fungal Pathogen)',
  severity: 'moderate',
  confidenceLabel: 'reliable',
  detectedAt: 'Today, 10:15 AM',
  imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69102a5e?auto=format&fit=crop&w=600&q=80',
  whatToDoToday: [
    {
      step: 1,
      title: 'Remove heavily affected lower leaves',
      titleMr: 'खालची जास्त बाधित पाने काढून नष्ट करा',
      description: 'Prune infected lower leaves touching soil. Do not leave them in the field; bury or burn them.',
      descriptionMr: 'मातीला टेकलेली व करपलेली पाने कात्रीने काळजीपूर्वक कापा. ही पाने शेतात न टाकता नष्ट करा.',
      priority: 'critical'
    },
    {
      step: 2,
      title: 'Avoid overhead watering & excess moisture',
      titleMr: 'वरतून पाणी देणे टाळा व ठिबक सिंचन वापरा',
      description: 'Do not wet the foliage in evening hours. Ensure clear drainage between crop ridges.',
      descriptionMr: 'संध्याकाळी पानांवर पाणी फवारू नका. वाफ्यांमध्ये पाणी साचू नये याची काळजी घ्या.',
      priority: 'critical'
    },
    {
      step: 3,
      title: 'Inspect nearby plants within 5-meter radius',
      titleMr: 'लगतच्या ५ मीटर परिसरातील इतर रोपे तपासा',
      description: 'Check adjacent rows for initial brown target-like spots on leaves.',
      descriptionMr: 'शेजारील ओळींमधील पानांवर गोलाकार तपकिरी डाग आहेत का ते नीट पाहा.',
      priority: 'important'
    },
    {
      step: 4,
      title: 'Preventive Spray (If humidity > 80%)',
      titleMr: 'प्रतिबंधात्मक फवारणी (आर्द्रता जास्त असल्यास)',
      description: 'Spray Mancozeb 75% WP @ 2.5g/L water OR Copper Oxychloride 50% WP @ 3g/L during dry morning hours.',
      descriptionMr: 'सकाळच्या वेळी मॅन्कोझेब ७५% WP (२.५ ग्रॅम प्रति लिटर पाणी) किंवा कॉपर ऑक्सिक्लोराईडची फवारणी करा.',
      priority: 'preventive'
    }
  ],
  whatToMonitor: [
    {
      title: 'Concentric target-board rings',
      titleMr: 'पानांवरील चक्राकार तपकिरी कडी',
      check: 'Monitor if dark rings with yellow halos enlarge over next 48 hours.',
      checkMr: 'डागांच्या भोवती पिवळसर वलय वाढते आहे का यावर लक्ष ठेवा.'
    },
    {
      title: 'Stem and petiole lesions',
      titleMr: 'देठ व खोडावरील डाग',
      check: 'Ensure fungus has not penetrated the main stem.',
      checkMr: 'रोग खोडापर्यंत पोहोचलेला नाही ना याची खात्री करा.'
    }
  ],
  whatMayHappenNext: {
    title: 'Upcoming Spread Forecast',
    titleMr: 'पुढील संभाव्य धोका अंदाज',
    text: 'Humidity is expected to remain above 80% with rain expected tomorrow. Fungal spore germination rate is HIGH. Disease spread risk will elevate to High in 48 hours unless preventive foliage protection is applied today.',
    textMr: 'हवेतील आर्द्रता ८०% पेक्षा जास्त राहण्याचा आणि उद्या पाऊस पडण्याचा अंदाज आहे. त्यामुळे बुरशीचा प्रसार वेगाने होऊ शकतो. आज प्रतिबंधात्मक उपाय न केल्यास पुढील ४८ तासांत धोका उच्च पातळीवर जाऊ शकतो.',
    riskTrend: 'increasing'
  },
  advisoryVoiceScript: 'Possible Early Blight detected on tomato leaf with moderate severity. Today you should remove heavily affected lower leaves and avoid excess watering. Fungal risk may increase over the next forty-eight hours due to high humidity. Consider preventive spray during clear morning hours.',
  advisoryVoiceScriptMr: 'टोमॅटोच्या पानावर मध्यम स्वरूपाचा करपा रोग आढळला आहे. आज लगेच जास्त खराब झालेली पाने तोडून टाका आणि पानांवर पाणी साचू देऊ नका. पुढील दोन दिवसांत जास्त आर्द्रतेमुळे रोग वाढू शकतो, म्हणून योग्य फवारणी करा.'
};

export const MOCK_WEATHER: WeatherCondition = {
  temp: 28,
  humidity: 84,
  rainfallStatus: 'Rain Expected Tomorrow (15mm)',
  rainfallStatusMr: 'उद्या मध्यम पावसाचा अंदाज (१५ मिमी)',
  rainfallChance: 78,
  condition: 'humid',
  cropImpactSummary: 'High humidity (>80%) creates favorable conditions for fungal spore germination on leaf surfaces.',
  cropImpactSummaryMr: 'हवेतील जास्त आर्द्रतेमुळे (८४%) पानांवर बुरशीचे बीजाणू वेगाने वाढण्यास पोषक वातावरण तयार झाले आहे.'
};

export const MOCK_RISK_FORECAST: RiskForecast = {
  cropId: 'tomato',
  currentLevel: 'moderate',
  summary: 'Disease pressure will peak in Day 3 & 4 due to combined rainfall and sustained humidity.',
  summaryMr: 'पाऊस आणि सततच्या आर्द्रतेमुळे ३ऱ्या आणि ४थ्या दिवशी रोगाचा प्रादुर्भाव सर्वोच्च राहू शकतो.',
  timeline: [
    { day: 'Today', dayMr: 'आज', date: 'Sat, Sep 6', level: 'moderate', score: 55 },
    { day: 'Tomorrow', dayMr: 'उद्या', date: 'Sun, Sep 7', level: 'moderate', score: 62 },
    { day: 'Day 3', dayMr: '३ रा दिवस', date: 'Mon, Sep 8', level: 'high', score: 88 },
    { day: 'Day 4', dayMr: '४ था दिवस', date: 'Tue, Sep 9', level: 'high', score: 82 },
    { day: 'Day 5', dayMr: '५ वा दिवस', date: 'Wed, Sep 10', level: 'moderate', score: 50 },
  ],
  reasons: [
    {
      id: 'r-humidity',
      title: 'Sustained High Humidity',
      titleMr: 'सतत जास्त आर्द्रता',
      icon: 'droplet',
      detail: '80% - 88% humidity projected continuously for next 3 days.',
      detailMr: 'पुढील ३ दिवस आर्द्रता ८०% ते ८८% दरम्यान राहण्याचा अंदाज.'
    },
    {
      id: 'r-rain',
      title: 'Rain Expected Tomorrow',
      titleMr: 'उद्या पावसाचा अंदाज',
      icon: 'cloud-rain',
      detail: 'Precipitation will wash away unprotected foliage and splash spores.',
      detailMr: 'पावसाच्या पाण्यामुळे बुरशीचे कण शेजारील निरोगी पानांवर उडू शकतात.'
    },
    {
      id: 'r-cluster',
      title: '14 Confirmed Cases Nearby',
      titleMr: 'परिसरात १४ शेतांमध्ये प्रादुर्भाव',
      icon: 'map-pin',
      detail: 'Neighboring farms in Dindori sector reported Early Blight within 5 km.',
      detailMr: '५ किमी परिसरातील दिंडोरी विभागातील इतर शेतांमध्येही करपा रोग नोंदवला गेला आहे.'
    }
  ],
  recommendation: 'Complete protective copper/mancozeb spray today before rain starts. Ensure ridge drainage is clear.',
  recommendationMr: 'पाऊस सुरू होण्यापूर्वी आजच सकाळच्या सत्रात प्रतिबंधात्मक फवारणी पूर्ण करा आणि शेतात पाण्याचा निचरा व्यवस्थित ठेवा.'
};

export const MOCK_AREA_REPORT: AreaReport = {
  district: 'Nashik',
  districtMr: 'नाशिक',
  subDistrict: 'Dindori & Niphad Rural',
  subDistrictMr: 'दिंडोरी व निफाड ग्रामीण',
  status: 'moderate',
  diseaseTrend: 'increasing',
  activeCasesCount: 14,
  lastUpdated: '2 hours ago',
  clusters: [
    {
      id: 'c1',
      lat: 20.082,
      lng: 73.845,
      intensity: 'high',
      areaName: 'Dindori Sector B',
      areaNameMr: 'दिंडोरी विभाग ब',
      crop: 'Tomato',
      reportedCases: 6,
      distanceKm: 2.1
    },
    {
      id: 'c2',
      lat: 20.035,
      lng: 73.892,
      intensity: 'moderate',
      areaName: 'Niphad Border Road',
      areaNameMr: 'निफाड सीमा रस्ता',
      crop: 'Tomato & Chilli',
      reportedCases: 5,
      distanceKm: 3.8
    },
    {
      id: 'c3',
      lat: 19.992,
      lng: 73.791,
      intensity: 'low',
      areaName: 'Panchavati West Belt',
      areaNameMr: 'पंचवटी पश्चिम पट्टा',
      crop: 'Soybean',
      reportedCases: 3,
      distanceKm: 4.9
    }
  ],
  communityAdvisory: 'KVK Nashik advisory: Early Blight outbreak alert issued for tomato growers across Niphad and Dindori. Farmers are advised to avoid nitrogen fertilizer over-application and monitor lower canopies.',
  communityAdvisoryMr: 'कृषी विज्ञान केंद्र नाशिक सल्ला: दिंडोरी व निफाड तालुक्यातील टोमॅटो उत्पादक शेतकऱ्यांसाठी करपा रोगाचा इशारा. नत्र खतांचा अतिवापर टाळा व पानांच्या खालच्या भागाची नियमित तपासणी करा.'
};

export const MOCK_EXPERT: ExpertProfile = {
  id: 'exp-ramesh-patil',
  name: 'Dr. Ramesh Patil',
  nameMr: 'डॉ. रमेश पाटील',
  role: 'Senior Plant Pathologist & Agronomist',
  roleMr: 'वरिष्ठ वनस्पती रोग शास्त्रज्ञ',
  station: 'Krishi Vigyan Kendra (KVK), Nashik',
  stationMr: 'कृषी विज्ञान केंद्र (KVK), नाशिक',
  avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80',
  available: true,
  phone: '1800-180-1551'
};

export const INITIAL_EXPERT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'expert',
    text: 'Namaste Kisan bhai! I reviewed your Tomato diagnosis (Early Blight - Moderate). How many acres are affected, and have you done any spray in the past 7 days?',
    textMr: 'नमस्ते शेतकरी मित्र! मी तुमच्या टोमॅटोच्या पिकाचा अहवाल पाहिला (करपा रोग - मध्यम). किती क्षेत्र बाधित आहे आणि मागील आठवड्यात काही फवारणी केली आहे का?',
    timestamp: '10:18 AM'
  }
];
