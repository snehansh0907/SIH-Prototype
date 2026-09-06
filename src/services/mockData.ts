import type { CropInfo, DiagnosisResult, WeatherCondition, RiskForecast, AreaReport, ExpertProfile, ChatMessage } from '../types';

export const MOCK_CROPS: CropInfo[] = [
  {
    id: 'tomato',
    name: 'Tomato',
    nameHi: 'टमाटर',
    nameMr: 'टोमॅटो',
    icon: '🍅',
    scientificName: 'Solanum lycopersicum',
    sampleImages: [
      {
        id: 'tomato_early_blight',
        title: 'Tomato with Dark Concentric Spots (Early Blight)',
        titleHi: 'पत्तियों पर गहरे संकेंद्रित धब्बे (अगेती झुलसा)',
        titleMr: 'पानांवर काळपट गोलाकार डाग (करपा रोग)',
        condition: 'Early Blight',
        url: 'https://images.unsplash.com/photo-1592417817098-8f3d69102a5e?auto=format&fit=crop&w=600&q=80',
        isHealthy: false,
      },
      {
        id: 'tomato_healthy',
        title: 'Healthy Green Tomato Leaf',
        titleHi: 'स्वस्थ हरी टमाटर की पत्ती',
        titleMr: 'निरोगी हिरवे टोमॅटोचे पान',
        condition: 'Healthy Leaf',
        url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=600&q=80',
        isHealthy: true,
      },
      {
        id: 'tomato_blurry_uncertain',
        title: 'Blurry / Unclear Leaf Photo (Uncertain AI)',
        titleHi: 'धुंधली / अस्पष्ट पत्ती की फोटो (अनिश्चित AI)',
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
    nameHi: 'कपास',
    nameMr: 'कापूस',
    icon: '🌱',
    scientificName: 'Gossypium hirsutum',
    sampleImages: [
      {
        id: 'cotton_leaf_curl',
        title: 'Cotton Leaf Curling & Thickening',
        titleHi: 'कपास की मुड़ी और मोटी पत्तियां (लीफ कर्ल)',
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
    nameHi: 'सोयाबीन',
    nameMr: 'सोयाबीन',
    icon: '🌿',
    scientificName: 'Glycine max',
    sampleImages: [
      {
        id: 'soybean_rust',
        title: 'Soybean Yellow Pustules (Rust)',
        titleHi: 'सोयाबीन पर पीले-भूरे धब्बे (रस्ट/गेरुआ)',
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
  cropNameHi: 'टमाटर',
  cropNameMr: 'टोमॅटो',
  diseaseName: 'Early Blight',
  diseaseNameHi: 'अगेती झुलसा (अर्ली ब्लाइट)',
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
      titleHi: 'ऊपर से पानी देना बंद करें और क्यारियों में जल निकासी रखें',
      titleMr: 'वरतून पाणी देणे टाळा व वाफ्यांमध्ये पाणी साचू देऊ नका',
      description: 'Do not wet foliage during humid evenings. Ensure clear drainage between crop ridges.',
      descriptionHi: 'शाम के समय पत्तियों को गीला न करें। फसल की क्यारियों के बीच पानी की उचित निकासी सुनिश्चित करें।',
      descriptionMr: 'संध्याकाळी पानांवर पाणी फवारू नका. वाफ्यांमध्ये साचलेल्या पाण्याचा निचरा करा.',
      priority: 'critical',
      category: 'cultural'
    },
    {
      step: 2,
      title: 'Prune & destroy heavily affected lower leaves',
      titleHi: 'अधिक प्रभावित निचली पत्तियों को काटकर नष्ट करें',
      titleMr: 'खालची जास्त बाधित पाने कापून नष्ट करा',
      description: 'Prune infected lower leaves touching soil using clean shears. Burn or deeply bury removed leaves.',
      descriptionHi: 'मिट्टी को छूने वाली संक्रमित निचली पत्तियों को साफ कैंची से छांटें। निकाली गई पत्तियों को खेत से दूर जलाएं या गहरा दबा दें।',
      descriptionMr: 'मातीला टेकलेली व करपलेली पाने काळजीपूर्वक कापा. ही पाने शेतात न टाकता नष्ट करा.',
      priority: 'critical',
      category: 'mechanical'
    },
    {
      step: 3,
      title: 'Apply Neem-based organic extract (NSKE 5%)',
      titleHi: 'नीम आधारित जैविक अर्क (एनएसकेई 5%) का छिड़काव करें',
      titleMr: 'निमार्क ५% किंवा कडुनिंब अर्काची फवारणी',
      description: 'Spray Neem seed kernel extract (NSKE 5%) @ 5ml/L to inhibit fungal spore multiplication naturally.',
      descriptionHi: 'फफूंद के बीजाणुओं की वृद्धि को प्राकृतिक रूप से रोकने के लिए 5 मिली/लीटर की दर से नीम बीज अर्क (एनएसकेई 5%) का छिड़काव करें।',
      descriptionMr: 'बुरशीची वाढ नैसर्गिकरीत्या रोखण्यासाठी निमार्क ५% ची फवारणी करा.',
      priority: 'important',
      category: 'biological'
    },
    {
      step: 4,
      title: 'Targeted Fungicide Spray (Only if humidity > 80%)',
      titleHi: 'लक्षित कवकनाशी छिड़काव (केवल यदि आर्द्रता > 80% हो)',
      titleMr: 'नियंत्रित बुरशीनाशक फवारणी (आर्द्रता जास्त असल्यास)',
      description: 'Spray Mancozeb 75% WP @ 2.5g/L water OR Copper Oxychloride 50% WP @ 3g/L during clear morning hours.',
      descriptionHi: 'सुबह के साफ मौसम में मैन्कोजेब 75% डब्ल्यूपी @ 2.5 ग्राम/लीटर पानी या कॉपर ऑक्सीक्लोराइड 50% डब्ल्यूपी @ 3 ग्राम/लीटर का छिड़काव करें।',
      descriptionMr: 'सकाळच्या वेळी मॅन्कोझेब ७५% WP (२.५ ग्रॅम प्रति लिटर पाणी) ची नियंत्रित फवारणी करा.',
      priority: 'preventive',
      category: 'chemical'
    }
  ],
  whatToMonitor: [
    {
      title: 'Concentric target-board rings',
      titleHi: 'पत्तियों पर संकेंद्रित छल्लेदार गहरे धब्बे',
      titleMr: 'पानांवरील चक्राकार तपकिरी कडी',
      check: 'Monitor if dark rings with yellow halos enlarge over next 48 hours.',
      checkHi: 'निगरानी रखें कि क्या अगले 48 घंटों में पीले घेरे वाले गहरे धब्बे बढ़ रहे हैं।',
      checkMr: 'डागांच्या भोवती पिवळसर वलय वाढते आहे का यावर लक्ष ठेवा.'
    },
    {
      title: 'Stem and petiole lesions',
      titleHi: 'तने और डंठल पर घाव/धब्बे',
      titleMr: 'देठ व खोडावरील डाग',
      check: 'Ensure fungus has not penetrated the main stem.',
      checkHi: 'सुनिश्चित करें कि फफूंद मुख्य तने तक न पहुंची हो।',
      checkMr: 'रोग खोडापर्यंत पोहोचलेला नाही ना याची खात्री करा.'
    }
  ],
  whatMayHappenNext: {
    title: 'Upcoming Spread Forecast',
    titleHi: 'आगामी रोग प्रसार पूर्वानुमान',
    titleMr: 'पुढील संभाव्य धोका अंदाज',
    text: 'Humidity is expected to remain above 80% with rain expected tomorrow. Fungal spore germination rate is HIGH. Disease spread risk will elevate to High in 48 hours unless preventive foliage protection is applied today.',
    textHi: 'कल बारिश की संभावना के साथ आर्द्रता 80% से अधिक रहने का अनुमान है। फंगल बीजाणुओं का अंकुरण दर उच्च है। यदि आज पत्तियों पर सुरक्षात्मक छिड़काव नहीं किया गया तो 48 घंटों में बीमारी का जोखिम उच्च हो जाएगा।',
    textMr: 'हवेतील आर्द्रता ८०% पेक्षा जास्त राहण्याचा आणि उद्या पाऊस पडण्याचा अंदाज आहे. त्यामुळे बुरशीचा प्रसार वेगाने होऊ शकतो. आज प्रतिबंधात्मक उपाय न केल्यास पुढील ४८ तासांत धोका उच्च पातळीवर जाऊ शकतो.',
    riskTrend: 'increasing'
  },
  advisoryVoiceScript: 'Possible Early Blight detected on tomato leaf with moderate severity. Today you should remove heavily affected lower leaves and avoid excess watering. Fungal risk may increase over the next forty-eight hours due to high humidity. Consider preventive spray during clear morning hours.',
  advisoryVoiceScriptHi: 'टमाटर की पत्ती पर मध्यम गंभीरता का अगेती झुलसा रोग पाया गया है। आज आपको अधिक प्रभावित निचली पत्तियों को हटाना चाहिए और अतिरिक्त पानी देने से बचना चाहिए। उच्च आर्द्रता के कारण अगले 48 घंटों में फंगल जोखिम बढ़ सकता है। सुबह के समय सुरक्षात्मक छिड़काव करें।',
  advisoryVoiceScriptMr: 'टोमॅटोच्या पानावर मध्यम स्वरूपाचा करपा रोग आढळला आहे. आज लगेच जास्त खराब झालेली पाने तोडून टाका आणि पानांवर पाणी साचू देऊ नका. पुढील दोन दिवसांत जास्त आर्द्रतेमुळे रोग वाढू शकतो, म्हणून योग्य फवारणी करा.'
};

export const MOCK_WEATHER: WeatherCondition = {
  temp: 28,
  humidity: 84,
  rainfallStatus: 'Rain Expected Tomorrow (15mm)',
  rainfallStatusHi: 'कल बारिश की संभावना (15 मिमी)',
  rainfallStatusMr: 'उद्या मध्यम पावसाचा अंदाज (१५ मिमी)',
  rainfallChance: 78,
  condition: 'humid',
  cropImpactSummary: 'High humidity (>80%) creates favorable conditions for fungal spore germination on leaf surfaces.',
  cropImpactSummaryHi: 'उच्च आर्द्रता (>80%) पत्तियों की सतह पर फंगल बीजाणुओं के अंकुरण के लिए अनुकूल वातावरण बनाती है।',
  cropImpactSummaryMr: 'हवेतील जास्त आर्द्रतेमुळे (८४%) पानांवर बुरशीचे बीजाणू वेगाने वाढण्यास पोषक वातावरण तयार झाले आहे.'
};

export const MOCK_RISK_FORECAST: RiskForecast = {
  cropId: 'tomato',
  currentLevel: 'moderate',
  summary: 'Disease risk is INCREASING because relative humidity is at 84% and rainfall is expected tomorrow.',
  summaryHi: 'सापेक्ष आर्द्रता 84% होने और कल बारिश की संभावना के कारण बीमारी का जोखिम बढ़ रहा है।',
  summaryMr: 'हवेतील आर्द्रता ८४% असून उद्या पावसाची शक्यता असल्याने रोगाचा धोका वाढणार आहे.',
  timeline: [
    { day: 'Today', dayHi: 'आज', dayMr: 'आज', date: 'Sat, Sep 6', level: 'moderate', score: 55 },
    { day: 'Tomorrow', dayHi: 'कल', dayMr: 'उद्या', date: 'Sun, Sep 7', level: 'moderate', score: 62 },
    { day: 'Day 3', dayHi: 'तीसरा दिन', dayMr: '३ रा दिवस', date: 'Mon, Sep 8', level: 'high', score: 88 },
    { day: 'Day 4', dayHi: 'चौथा दिन', dayMr: '४ था दिवस', date: 'Tue, Sep 9', level: 'high', score: 82 },
    { day: 'Day 5', dayHi: 'पाँचवाँ दिन', dayMr: '५ वा दिवस', date: 'Wed, Sep 10', level: 'moderate', score: 50 },
  ],
  reasons: [
    {
      id: 'r-humidity',
      title: 'High Relative Humidity (84%)',
      titleHi: 'उच्च सापेक्ष आर्द्रता (84%)',
      titleMr: 'जास्त हवेतील आर्द्रता (८४%)',
      icon: 'droplet',
      detail: '80% - 88% humidity projected continuously over next 3 days, accelerating fungal spore germination.',
      detailHi: 'अगले 3 दिनों में लगातार 80% - 88% आर्द्रता का अनुमान, जो फंगल बीजाणुओं के अंकुरण को बढ़ाता है।',
      detailMr: 'पुढील ३ दिवस आर्द्रता ८०% ते ८८% दरम्यान राहण्याचा अंदाज, ज्याने बुरशीचे बीजाणू वेगाने वाढतात.'
    },
    {
      id: 'r-rain',
      title: 'Rainfall Expected in 24 hrs',
      titleHi: '24 घंटों में बारिश की संभावना',
      titleMr: '२४ तासांत पावसाची शक्यता',
      icon: 'cloud-rain',
      detail: 'Rain splash spreads fungal spores onto upper healthy leaves.',
      detailHi: 'बारिश की बूंदों के छींटे फंगल बीजाणुओं को ऊपरी स्वस्थ पत्तियों तक फैलाते हैं।',
      detailMr: 'पावसाच्या पाण्यामुळे बुरशीचे कण निरोगी पानांवर उडतात.'
    },
    {
      id: 'r-cluster',
      title: '14 Confirmed Cases Nearby',
      titleHi: 'आस-पास 14 पुष्ट मामले',
      titleMr: 'परिसरात १४ शेतांमध्ये प्रादुर्भाव',
      icon: 'map-pin',
      detail: 'Neighboring farms within 5 km report active Early Blight clusters.',
      detailHi: '5 किमी के भीतर पड़ोसी खेतों में अगेती झुलसा के सक्रिय समूह पाए गए हैं।',
      detailMr: '५ किमी परिसरातील शेतांमध्ये करपा रोगाचे क्लस्टर आढळले आहेत.'
    }
  ],
  recommendation: 'Complete cultural leaf pruning and biological/copper spray today before rain starts.',
  recommendationHi: 'बारिश शुरू होने से पहले आज ही पत्तियों की छंटाई और जैविक/कॉपर का छिड़काव पूरा करें।',
  recommendationMr: 'पाऊस सुरू होण्यापूर्वी आजच सकाळच्या सत्रात बाधित पाने कापा व योग्य फवारणी पूर्ण करा.'
};

export const MOCK_AREA_REPORT: AreaReport = {
  district: 'Nashik',
  districtHi: 'नासिक',
  districtMr: 'नाशिक',
  subDistrict: 'Dindori & Niphad Belt',
  subDistrictHi: 'दिंडोरी और निफाड क्षेत्र',
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
      areaNameHi: 'दिंडोरी क्लस्टर ए',
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
      areaNameHi: 'निफाड सीमा क्षेत्र',
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
      areaNameHi: 'पंचवटी क्षेत्र',
      areaNameMr: 'पंचवटी पट्टा',
      crop: 'Soybean',
      reportedCases: 3,
      distanceKm: 4.9
    }
  ],
  communityAdvisory: 'Regional Advisory: Early Blight outbreak alert issued for tomato growers across Niphad and Dindori. Farmers are advised to clear ridge drainage and inspect lower leaf canopy.',
  communityAdvisoryHi: 'क्षेत्रीय सलाह: निफाड और दिंडोरी के टमाटर उत्पादकों के लिए अगेती झुलसा का अलर्ट जारी। किसानों को जल निकासी साफ रखने और निचली पत्तियों का निरीक्षण करने की सलाह दी जाती है।',
  communityAdvisoryMr: 'प्रादेशिक सल्ला: दिंडोरी व निफाड तालुक्यातील टोमॅटो उत्पादक शेतकऱ्यांसाठी करपा रोगाचा इशारा. पाण्याचा निचरा ठेवा व खालच्या पानांची तपासणी करा.'
};

export const MOCK_EXPERT: ExpertProfile = {
  id: 'exp-demo-patil',
  name: 'Dr. R. Patil (Demo Agronomist)',
  nameHi: 'डॉ. आर. पाटिल (डेमो कृषि विशेषज्ञ)',
  nameMr: 'डॉ. आर. पाटील (डेमो कृषी शास्त्रज्ञ)',
  role: 'Plant Pathologist (Prototype Demo Data)',
  roleHi: 'पादप रोग विशेषज्ञ (प्रोटोटाइप डेमो डेटा)',
  roleMr: 'वनस्पती रोग शास्त्रज्ञ (प्रोटोटाइप नमुना)',
  station: 'KVK Nashik Advisory Desk (Demo)',
  stationHi: 'केवीके नासिक परामर्श केंद्र (डेमो)',
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
    textHi: 'नमस्ते किसान भाई! (डेमो विशेषज्ञ डेस्क)। मैंने आपके टमाटर निदान (अगेती झुलसा - मध्यम) की समीक्षा की है। कितने एकड़ क्षेत्र प्रभावित है, और क्या आपने पिछले 7 दिनों में कोई छिड़काव किया है?',
    textMr: 'नमस्ते शेतकरी मित्र! (डेमो सल्ला केंद्र). मी तुमच्या टोमॅटोच्या पिकाचा अहवाल पाहिला (करपा रोग - मध्यम). किती क्षेत्र बाधित आहे आणि आपण गेल्या ७ दिवसांत फवारणी केली आहे का?',
    timestamp: '10:18 AM'
  }
];

