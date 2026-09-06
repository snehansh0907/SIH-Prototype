import type { CropInfo, DiagnosisResult, WeatherCondition, RiskForecast, AreaReport, ExpertProfile, ChatMessage } from '../types';

export const SVG_HEALTHY_LEAF = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%231b4332"/><path d="M100 15 C55 55 35 105 35 160 C70 145 100 135 100 185 C100 135 130 145 165 160 C165 105 145 55 100 15 Z" fill="%232d6a4f"/><path d="M100 15 L100 185 M100 60 L60 85 M100 90 L140 115 M100 120 L65 145" stroke="%2352b788" stroke-width="3" stroke-linecap="round"/></svg>`;

export const SVG_UNCERTAIN_AI = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%233a5a40"/><circle cx="100" cy="100" r="70" fill="%23588157" opacity="0.6" filter="blur(8px)"/><path d="M80 40 Q130 90 90 160" stroke="%23a3b18a" stroke-width="12" opacity="0.5"/><text x="100" y="115" text-anchor="middle" fill="%23dad7cd" font-size="28" font-family="sans-serif" font-weight="bold">❓</text></svg>`;

export const SVG_EARLY_BLIGHT = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%232d5a27"/><path d="M100 20 C60 60 40 100 40 150 C70 140 100 130 100 180 C100 130 130 140 160 150 C160 100 140 60 100 20 Z" fill="%233e7b37"/><circle cx="90" cy="70" r="18" fill="%2378350f" opacity="0.85"/><circle cx="90" cy="70" r="12" fill="%23451a03"/><circle cx="90" cy="70" r="6" fill="%23f59e0b" opacity="0.6"/><circle cx="120" cy="110" r="14" fill="%2378350f" opacity="0.85"/><circle cx="120" cy="110" r="8" fill="%23451a03"/><circle cx="70" cy="120" r="10" fill="%2378350f" opacity="0.8"/></svg>`;

export const SVG_COTTON_CURL = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%232d4a27"/><path d="M100 20 C50 50 30 110 50 165 C80 140 100 130 100 180 C100 130 120 140 150 165 C170 110 150 50 100 20 Z" fill="%234a7c39"/><path d="M100 20 Q60 80 50 165 M100 20 Q140 80 150 165" stroke="%23eab308" stroke-width="4" fill="none"/><circle cx="85" cy="90" r="12" fill="%23ca8a04" opacity="0.7"/><circle cx="120" cy="115" r="10" fill="%23ca8a04" opacity="0.7"/></svg>`;

export const SVG_SOYBEAN_RUST = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%233b5229"/><path d="M100 25 C60 65 40 105 40 155 C75 145 100 135 100 180 C100 135 125 145 160 155 C160 105 140 65 100 25 Z" fill="%23567838"/><circle cx="75" cy="80" r="6" fill="%23991b1b"/><circle cx="95" cy="70" r="5" fill="%23991b1b"/><circle cx="115" cy="85" r="7" fill="%23991b1b"/><circle cx="85" cy="110" r="6" fill="%23991b1b"/><circle cx="125" cy="120" r="5" fill="%23991b1b"/><circle cx="105" cy="130" r="6" fill="%23991b1b"/></svg>`;

export const SVG_SUGARCANE_RED_ROT = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%231e3a1e"/><rect x="75" y="10" width="50" height="180" rx="10" fill="%234d7c0f"/><line x1="75" y1="60" x2="125" y2="60" stroke="%23365314" stroke-width="3"/><line x1="75" y1="120" x2="125" y2="120" stroke="%23365314" stroke-width="3"/><rect x="85" y="70" width="30" height="40" rx="5" fill="%23b91c1c" opacity="0.85"/></svg>`;

export const SVG_MAIZE_BLIGHT = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%231c3820"/><path d="M40 180 Q100 20 160 180" stroke="%2365a30d" stroke-width="40" fill="none" stroke-linecap="round"/><ellipse cx="90" cy="90" rx="25" ry="8" transform="rotate(-30 90 90)" fill="%23713f12" opacity="0.85"/><ellipse cx="120" cy="130" rx="20" ry="7" transform="rotate(-30 120 130)" fill="%23713f12" opacity="0.85"/></svg>`;

export const SVG_ONION_BLOTCH = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%2319381f"/><path d="M100 15 C70 60 50 120 50 180 C100 170 100 170 150 180 C150 120 130 60 100 15 Z" fill="%234f772d"/><ellipse cx="95" cy="85" rx="14" ry="22" fill="%23581c87" opacity="0.85"/><ellipse cx="105" cy="135" rx="12" ry="18" fill="%23581c87" opacity="0.85"/></svg>`;

export const SVG_RICE_BLAST = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%2314381b"/><path d="M30 170 Q100 30 170 170" stroke="%233f6212" stroke-width="25" fill="none"/><path d="M90 80 Q100 70 110 80 Q100 90 90 80 Z" fill="%2378350f"/><path d="M120 120 Q130 110 140 120 Q130 130 120 120 Z" fill="%2378350f"/></svg>`;

export const SVG_WHEAT_RUST = `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%231e3d20"/><path d="M40 180 Q100 20 160 180" stroke="%234d7c0f" stroke-width="30" fill="none"/><circle cx="85" cy="80" r="5" fill="%23d97706"/><circle cx="95" cy="95" r="6" fill="%23d97706"/><circle cx="105" cy="75" r="5" fill="%23d97706"/><circle cx="115" cy="110" r="6" fill="%23d97706"/><circle cx="125" cy="125" r="5" fill="%23d97706"/></svg>`;

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
        url: SVG_EARLY_BLIGHT,
        fallbackUrl: SVG_EARLY_BLIGHT,
        isHealthy: false,
      },
      {
        id: 'tomato_healthy',
        title: 'Healthy Green Tomato Leaf',
        titleHi: 'स्वस्थ हरी टमाटर की पत्ती',
        titleMr: 'निरोगी हिरवे टोमॅटोचे पान',
        condition: 'Healthy Leaf',
        url: SVG_HEALTHY_LEAF,
        fallbackUrl: SVG_HEALTHY_LEAF,
        isHealthy: true,
      },
      {
        id: 'tomato_blurry_uncertain',
        title: 'Blurry / Unclear Leaf Photo (Uncertain AI)',
        titleHi: 'धुंधली / अस्पष्ट पत्ती की फोटो (अनिश्चित AI)',
        titleMr: 'अंधुक / अस्पष्ट पानाचा फोटो (अनिश्चित)',
        condition: 'Uncertain AI',
        url: SVG_UNCERTAIN_AI,
        fallbackUrl: SVG_UNCERTAIN_AI,
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
        url: SVG_COTTON_CURL,
        fallbackUrl: SVG_COTTON_CURL,
        isHealthy: false,
      },
      {
        id: 'cotton_healthy',
        title: 'Healthy Green Cotton Leaf',
        titleMr: 'निरोगी हिरवे कापसाचे पान',
        condition: 'Healthy Leaf',
        url: SVG_HEALTHY_LEAF,
        fallbackUrl: SVG_HEALTHY_LEAF,
        isHealthy: true,
      },
      {
        id: 'cotton_uncertain',
        title: 'Blurry Cotton Leaf Photo',
        titleMr: 'अस्पष्ट कापसाचा फोटो',
        condition: 'Uncertain AI',
        url: SVG_UNCERTAIN_AI,
        fallbackUrl: SVG_UNCERTAIN_AI,
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
        url: SVG_SOYBEAN_RUST,
        fallbackUrl: SVG_SOYBEAN_RUST,
        isHealthy: false,
      },
      {
        id: 'soybean_healthy',
        title: 'Healthy Green Soybean Leaf',
        titleMr: 'निरोगी हिरवे सोयाबीनचे पान',
        condition: 'Healthy Leaf',
        url: SVG_HEALTHY_LEAF,
        fallbackUrl: SVG_HEALTHY_LEAF,
        isHealthy: true,
      },
      {
        id: 'soybean_uncertain',
        title: 'Blurry Soybean Photo',
        titleMr: 'अस्पष्ट सोयाबीनचा फोटो',
        condition: 'Uncertain AI',
        url: SVG_UNCERTAIN_AI,
        fallbackUrl: SVG_UNCERTAIN_AI,
        isHealthy: false,
      }
    ]
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    nameMr: 'ऊस',
    icon: '🎋',
    scientificName: 'Saccharum officinarum',
    sampleImages: [
      {
        id: 'sugarcane_red_rot',
        title: 'Sugarcane Red Rot Disease',
        titleMr: 'उसावरील तांबरा / लाल कुज रोग',
        condition: 'Red Rot',
        url: SVG_SUGARCANE_RED_ROT,
        fallbackUrl: SVG_SUGARCANE_RED_ROT,
        isHealthy: false,
      },
      {
        id: 'sugarcane_healthy',
        title: 'Healthy Green Sugarcane Leaf',
        titleMr: 'निरोगी हिरवे उसाचे पान',
        condition: 'Healthy Leaf',
        url: SVG_HEALTHY_LEAF,
        fallbackUrl: SVG_HEALTHY_LEAF,
        isHealthy: true,
      },
      {
        id: 'sugarcane_uncertain',
        title: 'Blurry Sugarcane Photo',
        titleMr: 'अस्पष्ट उसाचा फोटो',
        condition: 'Uncertain AI',
        url: SVG_UNCERTAIN_AI,
        fallbackUrl: SVG_UNCERTAIN_AI,
        isHealthy: false,
      }
    ]
  },
  {
    id: 'maize',
    name: 'Maize',
    nameMr: 'मका',
    icon: '🌽',
    scientificName: 'Zea mays',
    sampleImages: [
      {
        id: 'maize_blight',
        title: 'Maize Northern Leaf Blight',
        titleMr: 'मक्यावरील तुरा / करपा रोग',
        condition: 'Leaf Blight',
        url: SVG_MAIZE_BLIGHT,
        fallbackUrl: SVG_MAIZE_BLIGHT,
        isHealthy: false,
      },
      {
        id: 'maize_healthy',
        title: 'Healthy Green Maize Leaf',
        titleMr: 'निरोगी हिरवे मक्याचे पान',
        condition: 'Healthy Leaf',
        url: SVG_HEALTHY_LEAF,
        fallbackUrl: SVG_HEALTHY_LEAF,
        isHealthy: true,
      },
      {
        id: 'maize_uncertain',
        title: 'Blurry Maize Photo',
        titleMr: 'अस्पष्ट मक्याचा फोटो',
        condition: 'Uncertain AI',
        url: SVG_UNCERTAIN_AI,
        fallbackUrl: SVG_UNCERTAIN_AI,
        isHealthy: false,
      }
    ]
  },
  {
    id: 'onion',
    name: 'Onion',
    nameMr: 'कांदा',
    icon: '🧅',
    scientificName: 'Allium cepa',
    sampleImages: [
      {
        id: 'onion_purple_blotch',
        title: 'Onion Purple Blotch Disease',
        titleMr: 'कांद्यावरील जांभळा करपा',
        condition: 'Purple Blotch',
        url: SVG_ONION_BLOTCH,
        fallbackUrl: SVG_ONION_BLOTCH,
        isHealthy: false,
      },
      {
        id: 'onion_healthy',
        title: 'Healthy Green Onion Foliage',
        titleMr: 'निरोगी हिरवी कांद्याची पात',
        condition: 'Healthy Leaf',
        url: SVG_HEALTHY_LEAF,
        fallbackUrl: SVG_HEALTHY_LEAF,
        isHealthy: true,
      },
      {
        id: 'onion_uncertain',
        title: 'Blurry Onion Photo',
        titleMr: 'अस्पष्ट कांद्याचा फोटो',
        condition: 'Uncertain AI',
        url: SVG_UNCERTAIN_AI,
        fallbackUrl: SVG_UNCERTAIN_AI,
        isHealthy: false,
      }
    ]
  },
  {
    id: 'rice',
    name: 'Rice',
    nameMr: 'भात',
    icon: '🌾',
    scientificName: 'Oryza sativa',
    sampleImages: [
      {
        id: 'rice_blast',
        title: 'Rice Leaf Blast Disease',
        titleMr: 'भातावरील करपा / ब्लास्ट रोग',
        condition: 'Rice Blast',
        url: SVG_RICE_BLAST,
        fallbackUrl: SVG_RICE_BLAST,
        isHealthy: false,
      },
      {
        id: 'rice_healthy',
        title: 'Healthy Green Rice Crop',
        titleMr: 'निरोगी हिरवे भाताचे रोप',
        condition: 'Healthy Leaf',
        url: SVG_HEALTHY_LEAF,
        fallbackUrl: SVG_HEALTHY_LEAF,
        isHealthy: true,
      },
      {
        id: 'rice_uncertain',
        title: 'Blurry Rice Photo',
        titleMr: 'अस्पष्ट भाताचा फोटो',
        condition: 'Uncertain AI',
        url: SVG_UNCERTAIN_AI,
        fallbackUrl: SVG_UNCERTAIN_AI,
        isHealthy: false,
      }
    ]
  },
  {
    id: 'wheat',
    name: 'Wheat',
    nameMr: 'गहू',
    icon: '🌾',
    scientificName: 'Triticum aestivum',
    sampleImages: [
      {
        id: 'wheat_rust',
        title: 'Wheat Yellow Rust Infection',
        titleMr: 'गव्हावरील तांबेरा / पिवळा तांबेरा',
        condition: 'Yellow Rust',
        url: SVG_WHEAT_RUST,
        fallbackUrl: SVG_WHEAT_RUST,
        isHealthy: false,
      },
      {
        id: 'wheat_healthy',
        title: 'Healthy Green Wheat Blade',
        titleMr: 'निरोगी हिरवे गव्हाचे पान',
        condition: 'Healthy Leaf',
        url: SVG_HEALTHY_LEAF,
        fallbackUrl: SVG_HEALTHY_LEAF,
        isHealthy: true,
      },
      {
        id: 'wheat_uncertain',
        title: 'Blurry Wheat Photo',
        titleMr: 'अस्पष्ट गव्हाचा फोटो',
        condition: 'Uncertain AI',
        url: SVG_UNCERTAIN_AI,
        fallbackUrl: SVG_UNCERTAIN_AI,
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
  imageUrl: SVG_EARLY_BLIGHT,
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

