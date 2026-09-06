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
      },
      {
        id: 'tomato_blurry_uncertain',
        title: 'Blurry / Unclear Leaf Photo (Uncertain AI)',
        titleMr: 'अंधुक / अस्पष्ट पानाचा फोटो (अनिश्चित)',
        condition: 'Uncertain AI',
        url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
        isHealthy: false,
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
  isUncertain: false,
  detectedAt: 'Today, 10:15 AM',
  imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d69102a5e?auto=format&fit=crop&w=600&q=80',
  whatToDoToday: [
    {
      step: 1,
      title: 'Avoid overhead watering & maintain ridge drainage',
      titleMr: 'वरतून पाणी देणे टाळा व वाफ्यांमध्ये पाणी साचू देऊ नका',
      description: 'Do not wet foliage during humid evenings. Ensure clear drainage between crop ridges.',
      descriptionMr: 'संध्याकाळी पानांवर पाणी फवारू नका. वाफ्यांमध्ये साचलेल्या पाण्याचा निचरा करा.',
      priority: 'critical',
      category: 'cultural'
    },
    {
      step: 2,
      title: 'Prune & destroy heavily affected lower leaves',
      titleMr: 'खालची जास्त बाधित पाने कापून नष्ट करा',
      description: 'Prune infected lower leaves touching soil using clean shears. Burn or deeply bury removed leaves.',
      descriptionMr: 'मातीला टेकलेली व करपलेली पाने काळजीपूर्वक कापा. ही पाने शेतात न टाकता नष्ट करा.',
      priority: 'critical',
      category: 'mechanical'
    },
    {
      step: 3,
      title: 'Apply Neem-based organic extract (NSKE 5%)',
      titleMr: 'निमार्क ५% किंवा कडुनिंब अर्काची फवारणी',
      description: 'Spray Neem seed kernel extract (NSKE 5%) @ 5ml/L to inhibit fungal spore multiplication naturally.',
      descriptionMr: 'बुरशीची वाढ नैसर्गिकरीत्या रोखण्यासाठी निमार्क ५% ची फवारणी करा.',
      priority: 'important',
      category: 'biological'
    },
    {
      step: 4,
      title: 'Targeted Fungicide Spray (Only if humidity > 80%)',
      titleMr: 'नियंत्रित बुरशीनाशक फवारणी (आर्द्रता जास्त असल्यास)',
      description: 'Spray Mancozeb 75% WP @ 2.5g/L water OR Copper Oxychloride 50% WP @ 3g/L during clear morning hours.',
      descriptionMr: 'सकाळच्या वेळी मॅन्कोझेब ७५% WP (२.५ ग्रॅम प्रति लिटर पाणी) ची नियंत्रित फवारणी करा.',
      priority: 'preventive',
      category: 'chemical'
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
  summary: 'Disease risk is INCREASING because relative humidity is at 84% and rainfall is expected tomorrow.',
  summaryMr: 'हवेतील आर्द्रता ८४% असून उद्या पावसाची शक्यता असल्याने रोगाचा धोका वाढणार आहे.',
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
      title: 'High Relative Humidity (84%)',
      titleMr: 'जास्त हवेतील आर्द्रता (८४%)',
      icon: 'droplet',
      detail: '80% - 88% humidity projected continuously over next 3 days, accelerating fungal spore germination.',
      detailMr: 'पुढील ३ दिवस आर्द्रता ८०% ते ८८% दरम्यान राहण्याचा अंदाज, ज्याने बुरशीचे बीजाणू वेगाने वाढतात.'
    },
    {
      id: 'r-rain',
      title: 'Rainfall Expected in 24 hrs',
      titleMr: '२४ तासांत पावसाची शक्यता',
      icon: 'cloud-rain',
      detail: 'Rain splash spreads fungal spores onto upper healthy leaves.',
      detailMr: 'पावसाच्या पाण्यामुळे बुरशीचे कण निरोगी पानांवर उडतात.'
    },
    {
      id: 'r-cluster',
      title: '14 Confirmed Cases Nearby',
      titleMr: 'परिसरात १४ शेतांमध्ये प्रादुर्भाव',
      icon: 'map-pin',
      detail: 'Neighboring farms within 5 km report active Early Blight clusters.',
      detailMr: '५ किमी परिसरातील शेतांमध्ये करपा रोगाचे क्लस्टर आढळले आहेत.'
    }
  ],
  recommendation: 'Complete cultural leaf pruning and biological/copper spray today before rain starts.',
  recommendationMr: 'पाऊस सुरू होण्यापूर्वी आजच सकाळच्या सत्रात बाधित पाने कापा व योग्य फवारणी पूर्ण करा.'
};

export const MOCK_AREA_REPORT: AreaReport = {
  district: 'Nashik',
  districtMr: 'नाशिक',
  subDistrict: 'Dindori & Niphad Belt',
  subDistrictMr: 'दिंडोरी व निफाड पट्टा',
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
      areaName: 'Dindori Cluster A',
      areaNameMr: 'दिंडोरी क्लस्टर अ',
      crop: 'Tomato',
      reportedCases: 6,
      distanceKm: 2.1
    },
    {
      id: 'c2',
      lat: 20.035,
      lng: 73.892,
      intensity: 'moderate',
      areaName: 'Niphad Border Sector',
      areaNameMr: 'निफाड सीमा क्षेत्र',
      crop: 'Tomato & Chilli',
      reportedCases: 5,
      distanceKm: 3.8
    },
    {
      id: 'c3',
      lat: 19.992,
      lng: 73.791,
      intensity: 'low',
      areaName: 'Panchavati Belt',
      areaNameMr: 'पंचवटी पट्टा',
      crop: 'Soybean',
      reportedCases: 3,
      distanceKm: 4.9
    }
  ],
  communityAdvisory: 'Regional Advisory: Early Blight outbreak alert issued for tomato growers across Niphad and Dindori. Farmers are advised to clear ridge drainage and inspect lower leaf canopy.',
  communityAdvisoryMr: 'प्रादेशिक सल्ला: दिंडोरी व निफाड तालुक्यातील टोमॅटो उत्पादक शेतकऱ्यांसाठी करपा रोगाचा इशारा. पाण्याचा निचरा ठेवा व खालच्या पानांची तपासणी करा.'
};

export const MOCK_EXPERT: ExpertProfile = {
  id: 'exp-demo-patil',
  name: 'Dr. R. Patil (Demo Agronomist)',
  nameMr: 'डॉ. आर. पाटील (डेमो कृषी शास्त्रज्ञ)',
  role: 'Plant Pathologist (Prototype Demo Data)',
  roleMr: 'वनस्पती रोग शास्त्रज्ञ (प्रोटोटाइप नमुना)',
  station: 'KVK Nashik Advisory Desk (Demo)',
  stationMr: 'कृषी सल्ला केंद्र (डेमो नमुना)',
  avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80',
  available: true,
  phone: '1800-000-0000 (Demo)'
};

export const INITIAL_EXPERT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'expert',
    text: 'Namaste Kisan bhai! (Demo Expert Desk). I reviewed your Tomato diagnosis (Early Blight - Moderate). How many acres are affected, and have you sprayed in the last 7 days?',
    textMr: 'नमस्ते शेतकरी मित्र! (डेमो सल्ला केंद्र). मी तुमच्या टोमॅटोच्या पिकाचा अहवाल पाहिला (करपा रोग - मध्यम). किती क्षेत्र बाधित आहे?',
    timestamp: '10:18 AM'
  }
];
