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
    nameHi: 'गन्ना',
    nameMr: 'ऊस',
    icon: '🎋',
    scientificName: 'Saccharum officinarum',
    sampleImages: [
      {
        id: 'sugarcane_red_rot',
        title: 'Sugarcane Red Rot Disease',
        titleHi: 'गन्ने का लाल सड़न रोग (रेड रॉट)',
        titleMr: 'उसावरील तांबरा / लाल कुज रोग',
        condition: 'Red Rot',
        url: SVG_SUGARCANE_RED_ROT,
        fallbackUrl: SVG_SUGARCANE_RED_ROT,
        isHealthy: false,
      },
      {
        id: 'sugarcane_healthy',
        title: 'Healthy Green Sugarcane Leaf',
        titleHi: 'स्वस्थ हरी गन्ने की पत्ती',
        titleMr: 'निरोगी हिरवे उसाचे पान',
        condition: 'Healthy Leaf',
        url: SVG_HEALTHY_LEAF,
        fallbackUrl: SVG_HEALTHY_LEAF,
        isHealthy: true,
      },
      {
        id: 'sugarcane_uncertain',
        title: 'Blurry Sugarcane Photo',
        titleHi: 'अस्पष्ट गन्ने का फोटो',
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
    nameHi: 'मक्का',
    nameMr: 'मका',
    icon: '🌽',
    scientificName: 'Zea mays',
    sampleImages: [
      {
        id: 'maize_blight',
        title: 'Maize Northern Leaf Blight',
        titleHi: 'मक्के का तुर्सिकम लीफ ब्लाइट रोग',
        titleMr: 'मक्यावरील तुरा / करपा रोग',
        condition: 'Leaf Blight',
        url: SVG_MAIZE_BLIGHT,
        fallbackUrl: SVG_MAIZE_BLIGHT,
        isHealthy: false,
      },
      {
        id: 'maize_healthy',
        title: 'Healthy Green Maize Leaf',
        titleHi: 'स्वस्थ हरी मक्के की पत्ती',
        titleMr: 'निरोगी हिरवे मक्याचे पान',
        condition: 'Healthy Leaf',
        url: SVG_HEALTHY_LEAF,
        fallbackUrl: SVG_HEALTHY_LEAF,
        isHealthy: true,
      },
      {
        id: 'maize_uncertain',
        title: 'Blurry Maize Photo',
        titleHi: 'अस्पष्ट मक्के का फोटो',
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
    nameHi: 'प्याज',
    nameMr: 'कांदा',
    icon: '🧅',
    scientificName: 'Allium cepa',
    sampleImages: [
      {
        id: 'onion_purple_blotch',
        title: 'Onion Purple Blotch Disease',
        titleHi: 'प्याज का बैंगनी धब्बा रोग (पर्पल ब्लॉच)',
        titleMr: 'कांद्यावरील जांभळा करपा',
        condition: 'Purple Blotch',
        url: SVG_ONION_BLOTCH,
        fallbackUrl: SVG_ONION_BLOTCH,
        isHealthy: false,
      },
      {
        id: 'onion_healthy',
        title: 'Healthy Green Onion Foliage',
        titleHi: 'स्वस्थ हरी प्याज की पत्तियां',
        titleMr: 'निरोगी हिरवी कांद्याची पात',
        condition: 'Healthy Leaf',
        url: SVG_HEALTHY_LEAF,
        fallbackUrl: SVG_HEALTHY_LEAF,
        isHealthy: true,
      },
      {
        id: 'onion_uncertain',
        title: 'Blurry Onion Photo',
        titleHi: 'अस्पष्ट प्याज का फोटो',
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
    nameHi: 'चावल / धान',
    nameMr: 'भात',
    icon: '🌾',
    scientificName: 'Oryza sativa',
    sampleImages: [
      {
        id: 'rice_blast',
        title: 'Rice Leaf Blast Disease',
        titleHi: 'धान का झुलसा रोग (राइस ब्लास्ट)',
        titleMr: 'भातावरील करपा / ब्लास्ट रोग',
        condition: 'Rice Blast',
        url: SVG_RICE_BLAST,
        fallbackUrl: SVG_RICE_BLAST,
        isHealthy: false,
      },
      {
        id: 'rice_healthy',
        title: 'Healthy Green Rice Crop',
        titleHi: 'स्वस्थ हरी धान की फसल',
        titleMr: 'निरोगी हिरवे भाताचे रोप',
        condition: 'Healthy Leaf',
        url: SVG_HEALTHY_LEAF,
        fallbackUrl: SVG_HEALTHY_LEAF,
        isHealthy: true,
      },
      {
        id: 'rice_uncertain',
        title: 'Blurry Rice Photo',
        titleHi: 'अस्पष्ट धान का फोटो',
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
    nameHi: 'गेहूं',
    nameMr: 'गहू',
    icon: '🌾',
    scientificName: 'Triticum aestivum',
    sampleImages: [
      {
        id: 'wheat_rust',
        title: 'Wheat Yellow Rust Infection',
        titleHi: 'गेहूं का पीला रतुआ / रस्ट रोग',
        titleMr: 'गव्हावरील तांबेरा / पिवळा तांबेरा',
        condition: 'Yellow Rust',
        url: SVG_WHEAT_RUST,
        fallbackUrl: SVG_WHEAT_RUST,
        isHealthy: false,
      },
      {
        id: 'wheat_healthy',
        title: 'Healthy Green Wheat Blade',
        titleHi: 'स्वस्थ हरी गेहूं की पत्ती',
        titleMr: 'निरोगी हिरवे गव्हाचे पान',
        condition: 'Healthy Leaf',
        url: SVG_HEALTHY_LEAF,
        fallbackUrl: SVG_HEALTHY_LEAF,
        isHealthy: true,
      },
      {
        id: 'wheat_uncertain',
        title: 'Blurry Wheat Photo',
        titleHi: 'अस्पष्ट गेहूं का फोटो',
        titleMr: 'अस्पष्ट गव्हाचा फोटो',
        condition: 'Uncertain AI',
        url: SVG_UNCERTAIN_AI,
        fallbackUrl: SVG_UNCERTAIN_AI,
        isHealthy: false,
      }
    ]
  }
];

export function getDefaultDiagnosisForCrop(cropIdOrName: string = 'tomato'): DiagnosisResult {
  const key = (cropIdOrName || 'tomato').toLowerCase().trim();

  if (key === 'soybean') {
    return {
      id: 'diag-soybean-default',
      cropId: 'soybean',
      cropName: 'Soybean',
      cropNameHi: 'सोयाबीन',
      cropNameMr: 'सोयाबीन',
      diseaseName: 'Soybean Rust',
      diseaseNameHi: 'सोयाबीन गेरुआ रोग (Rust)',
      diseaseNameMr: 'सोयाबीन तांबेरा रोग (Rust)',
      pathogen: 'Phakopsora pachyrhizi (Fungal Pathogen)',
      severity: 'moderate',
      confidenceLabel: 'reliable',
      isUncertain: false,
      detectedAt: 'Today, 10:15 AM',
      imageUrl: SVG_SOYBEAN_RUST,
      whatToDoToday: [
        {
          step: 1,
          title: 'Avoid late evening irrigation & clear ridges',
          titleHi: 'देर शाम सिंचाई से बचें और क्यारियों में जल निकासी रखें',
          titleMr: 'संध्याकाळी उशिरा पाणी देणे टाळा व वाफ्यांमध्ये निचरा ठेवा',
          description: 'Ensure canopy foliage dries quickly after sunrise to prevent rust spore germination.',
          descriptionHi: 'सूर्योदय के बाद पत्तियों की नमी जल्दी सूखने दें ताकि गेरुआ कवक के बीजाणु अंकुरित न हों।',
          descriptionMr: 'पानांवर रात्रभर ओलावा साचू देऊ नका. शेतातील पाण्याचा निचरा सुरळीत करा.',
          priority: 'critical',
          category: 'cultural'
        },
        {
          step: 2,
          title: 'Prune & destroy lower leaves with rust pustules',
          titleHi: 'भूरे फफोले वाली निचली पत्तियों को तोड़कर नष्ट करें',
          titleMr: 'तांबूस फोड असलेली खालची पाने तोडून नष्ट करा',
          description: 'Remove and deeply bury lower leaf canopy showing dense reddish-brown pustules.',
          descriptionHi: 'घने लाल-भूरे फफोलों वाली निचली पत्तियों को हटाकर खेत से दूर गहरा दबाएं।',
          descriptionMr: 'तांबेरा डाग असलेली खालची पाने कापून शेताबाहेर नष्ट करा.',
          priority: 'critical',
          category: 'mechanical'
        },
        {
          step: 3,
          title: 'Apply Bio-Fungicide (Trichoderma viride 5g/L)',
          titleHi: 'जैविक कवकनाशी (ट्राइकोडर्मा विरिडी 5 ग्राम/ली.) का छिड़काव करें',
          titleMr: 'ट्रायकोडर्मा व्हिरिडी (५ ग्रॅम/लिटर) जैविक बुरशीनाशक फवारणी',
          description: 'Spray Trichoderma viride @ 5g/L or NSKE 5% in the evening for natural suppression.',
          descriptionHi: 'शाम के समय ट्राइकोडर्मा विरिडी 5 ग्राम/लीटर या निमार्क 5% का छिड़काव करें।',
          descriptionMr: 'बुरशीची वाढ नैसर्गिकरीत्या रोखण्यासाठी ट्रायकोडर्मा व्हिरिडी किंवा निमार्क ५% फवारा.',
          priority: 'important',
          category: 'biological'
        },
        {
          step: 4,
          title: 'Targeted Triazole Fungicide (If rust > 5% leaf area)',
          titleHi: 'लक्षित ट्राइएजोल कवकनाशी छिड़काव (यदि रस्ट > 5% हो)',
          titleMr: 'शिफारशीत बुरशीनाशक फवारणी (प्रादुर्भाव ५% पेक्षा जास्त असल्यास)',
          description: 'Spray Hexaconazole 5% EC @ 1ml/L or Tebuconazole 25.9% EC @ 1.5ml/L during calm morning hours.',
          descriptionHi: 'सुबह के शांत मौसम में हेक्साकोनाजोल 5% ईसी @ 1 मिली/ली या टेबुकोनाजोल 25.9% ईसी @ 1.5 मिली/ली का छिड़काव करें।',
          descriptionMr: 'सकाळच्या वेळी हेक्झाकोनॅझोल ५% EC (१ मिली/लिटर) किंवा टेब्युकोनॅझोलची नियंत्रित फवारणी करा.',
          priority: 'preventive',
          category: 'chemical'
        }
      ],
      whatToMonitor: [
        {
          title: 'Pustules on leaf undersides',
          titleHi: 'पत्तियों की निचली सतह पर फफोले',
          titleMr: 'पानाच्या उलट्या बाजूवरील तांबूस फोड',
          check: 'Monitor if brown pustules increase on lower and middle canopy leaves over 48 hours.',
          checkHi: 'निगरानी रखें कि क्या अगले 48 घंटों में निचली पत्तियों पर भूरे फफोले बढ़ रहे हैं।',
          checkMr: 'पुढील ४८ तासांत खालच्या पानांवर तांबूस फोड वाढतात का ते तपासा.'
        },
        {
          title: 'Premature yellowing and leaf drop',
          titleHi: 'पत्तियों का पीला पड़ना और गिरना',
          titleMr: 'पाने पिवळी पडून गळणे',
          check: 'Check if infected leaves yellow rapidly and drop before pod filling.',
          checkHi: 'जांचें कि क्या फलियों के भरने से पहले पत्तियां पीली होकर गिर रही हैं।',
          checkMr: 'शेंगा भरण्यापूर्वी पाने पिवळी पडून गळत नाहीत ना यावर लक्ष ठेवा.'
        }
      ],
      whatMayHappenNext: {
        title: 'Rust Spore Spread Projection',
        titleHi: 'गेरुआ रोग प्रसार पूर्वानुमान',
        titleMr: 'तांबेरा रोग प्रसार अंदाज',
        text: 'High humidity (>80%) and cloudy conditions accelerate Soybean Rust multiplication. Disease pressure will elevate rapidly unless preventive cultural and bio-fungicide measures are implemented today.',
        textHi: 'उच्च आर्द्रता (>80%) और बादलों वाला मौसम सोयाबीन रस्ट के फैलाव को तेज करता है। यदि आज जैविक उपाय नहीं किए गए तो रोग का दबाव तेजी से बढ़ेगा।',
        textMr: 'हवेतील जास्त आर्द्रता (८०%+) व ढगाळ वातावरणामुळे सोयाबीन तांबेरा रोगाचा प्रसार वेगाने होऊ शकतो. आज प्रतिबंधात्मक उपाययोजना करणे अत्यंत आवश्यक आहे.',
        riskTrend: 'increasing'
      },
      advisoryVoiceScript: 'Possible Soybean Rust detected with moderate severity. Avoid evening overhead watering and prune heavily affected lower leaves. Apply recommended bio-fungicide or triazole spray during clear morning hours.',
      advisoryVoiceScriptHi: 'सोयाबीन की फसल पर मध्यम गंभीरता का गेरुआ (रस्ट) रोग पाया गया है। शाम को अतिरिक्त पानी न दें और संक्रमित निचली पत्तियां हटा दें। सुबह के समय अनुशंसित कवकनाशी का छिड़काव करें।',
      advisoryVoiceScriptMr: 'सोयाबीन पिकावर मध्यम स्वरूपाचा तांबेरा रोग आढळला आहे. संध्याकाळी पाणी साचू देऊ नका व जास्त बाधित पाने काढून टाका. सकाळच्या वेळेत योग्य बुरशीनाशकाची फवारणी करा.'
    };
  }

  if (key === 'cotton') {
    return {
      id: 'diag-cotton-default',
      cropId: 'cotton',
      cropName: 'Cotton',
      cropNameHi: 'कपास',
      cropNameMr: 'कापूस',
      diseaseName: 'Leaf Curl Virus',
      diseaseNameHi: 'पत्ती मरोड़ रोग (Leaf Curl Virus)',
      diseaseNameMr: 'पानांचा चुरमुरडा (Leaf Curl)',
      pathogen: 'Begomovirus / Whitefly-transmitted',
      severity: 'moderate',
      confidenceLabel: 'reliable',
      isUncertain: false,
      detectedAt: 'Today, 10:15 AM',
      imageUrl: SVG_COTTON_CURL,
      whatToDoToday: [
        {
          step: 1,
          title: 'Avoid excess nitrogen & balance irrigation',
          titleHi: 'अत्यधिक नाइट्रोजन से बचें और संतुलित सिंचाई करें',
          titleMr: 'नत्र खतांचा अतिवापर टाळा व पाणी नियंत्रण ठेवा',
          description: 'Excess nitrogen produces succulent foliage attractive to whitefly vectors.',
          descriptionHi: 'अधिक नाइट्रोजन से कोमल पत्तियां बनती हैं जो सफेद मक्खी को आकर्षित करती हैं।',
          descriptionMr: 'नत्र खतांमुळे पाने मऊ होऊन रसशोषक किडींचा प्रादुर्भाव वाढतो.',
          priority: 'critical',
          category: 'cultural'
        },
        {
          step: 2,
          title: 'Install Yellow Sticky Traps & rogue stunted plants',
          titleHi: 'पीले चिपचिपे जाल लगाएं व प्रभावित पौधे हटाएं',
          titleMr: 'पिवळे चिकट सापळे लावा व अतिबाधित झाडे नष्ट करा',
          description: 'Install 15-20 yellow sticky traps per acre to trap whiteflies. Uproot heavily infected plants.',
          descriptionHi: 'प्रति एकड़ 15-20 पीले चिपचिपे ट्रैप लगाएं और अत्यधिक प्रभावित पौधे उखाड़कर नष्ट करें।',
          descriptionMr: 'एकरी १५-२० पिवळे चिकट सापळे लावा आणि अतिबाधित झाडे शेतातून नष्ट करा.',
          priority: 'critical',
          category: 'mechanical'
        },
        {
          step: 3,
          title: 'Spray Neem Extract (NSKE 5% or Azadirachtin)',
          titleHi: 'नीम बीज अर्क (एनएसकेई 5%) का छिड़काव करें',
          titleMr: 'निमार्क ५% किंवा कडुनिंब अर्काची फवारणी',
          description: 'Spray Azadirachtin 10,000 ppm @ 1ml/L to deter sucking pests naturally.',
          descriptionHi: 'रस चूसक कीटों को रोकने के लिए एजाडिरैक्टिन 10000 पीपीएम @ 1 मिली/लीटर का छिड़काव करें।',
          descriptionMr: 'रसशोषक किडींचा प्रादुर्भाव रोखण्यासाठी निमार्क ५% ची फवारणी करा.',
          priority: 'important',
          category: 'biological'
        },
        {
          step: 4,
          title: 'Targeted Vector Control (If whitefly > 8-10 per leaf)',
          titleHi: 'लक्षित कीटनाशक छिड़काव (यदि सफेद मक्खी > 8/पत्ती हो)',
          titleMr: 'नियंत्रित कीटकनाशक फवारणी (पांढरी माशी जास्त असल्यास)',
          description: 'Spray Diafenthiuron 50% WP @ 1.2g/L or Flonicamid 50% WG @ 0.3g/L during early morning.',
          descriptionHi: 'सफेद मक्खी अधिक होने पर डायफेनथियुरॉन 50% डब्ल्यूपी @ 1.2 ग्राम/ली या फ्लोनिकैमिड 50% डब्ल्यूजी @ 0.3 ग्राम/ली का छिड़काव करें।',
          descriptionMr: 'पांढरी माशी जास्त असल्यास शिफारशीनुसार डायफेन्थ्युरॉन किंवा फ्लोनिकॅमिडची फवारणी करा.',
          priority: 'preventive',
          category: 'chemical'
        }
      ],
      whatToMonitor: [
        {
          title: 'Upward curling & vein thickening',
          titleHi: 'पत्तियों का ऊपर मुड़ना व नसों का मोटा होना',
          titleMr: 'पानांचा वरच्या बाजूला पडलेला चुरमुरडा',
          check: 'Check if new upper leaves show upward curling and enations.',
          checkHi: 'जांचें कि क्या ऊपरी नई पत्तियां ऊपर की ओर मुड़ रही हैं।',
          checkMr: 'नवीन फुटव्यांवर वाटीसारखी पाने तयार होत आहेत का ते तपासा.'
        },
        {
          title: 'Whitefly vector counts',
          titleHi: 'सफेद मक्खी की संख्या',
          titleMr: 'पांढऱ्या माशीचे प्रमाण',
          check: 'Inspect undersides of top 3 leaves across 20 random plants.',
          checkHi: '20 पौधों की ऊपरी 3 पत्तियों के नीचे सफेद मक्खी की जांच करें।',
          checkMr: 'वरच्या पानांच्या खाली पांढऱ्या माशीचे प्रमाण तपासा.'
        }
      ],
      whatMayHappenNext: {
        title: 'Vector Dispersal Forecast',
        titleHi: 'कीट प्रसार पूर्वानुमान',
        titleMr: 'किडींचा संभाव्य प्रसार अंदाज',
        text: 'Warm dry afternoon winds favor whitefly vector flight. Border trap crops and sticky traps reduce transmission to healthy inner rows.',
        textHi: 'दोपहर की शुष्क हवा सफेद मक्खी के फैलाव में सहायक होती है। पीले चिपचिपे जाल लगाने से आंतरिक फसल सुरक्षित रहती है।',
        textMr: 'दुपारच्या कोरड्या वाऱ्यामुळे पांढरी माशी वेगाने इतर भागात पसरू शकते. शेताच्या बांधावर आधी नियंत्रण करा.',
        riskTrend: 'increasing'
      },
      advisoryVoiceScript: 'Possible Cotton Leaf Curl detected with moderate severity. Control whitefly immediately using yellow sticky traps and avoid excess nitrogen fertilizer.',
      advisoryVoiceScriptHi: 'कपास पर पत्ती मरोड़ रोग के लक्षण पाए गए हैं। सफेद मक्खी के तुरंत नियंत्रण के लिए पीले चिपचिपे ट्रैप लगाएं और अत्यधिक नाइट्रोजन से बचें।',
      advisoryVoiceScriptMr: 'कापसावर पानांचा चुरमुरडा रोग आढळला आहे. पांढऱ्या माशीच्या नियंत्रणासाठी लगेच पिवळे चिकट सापळे लावा व नत्र खतांचा अतिवापर टाळा.'
    };
  }

  if (key === 'sugarcane') {
    return {
      id: 'diag-sugarcane-default',
      cropId: 'sugarcane',
      cropName: 'Sugarcane',
      cropNameHi: 'गन्ना',
      cropNameMr: 'ऊस',
      diseaseName: 'Red Rot',
      diseaseNameHi: 'लाल सड़न रोग (Red Rot)',
      diseaseNameMr: 'ऊस लाल कुजव्या रोग (Red Rot)',
      pathogen: 'Colletotrichum falcatum (Fungal Pathogen)',
      severity: 'moderate',
      confidenceLabel: 'reliable',
      isUncertain: false,
      detectedAt: 'Today, 10:15 AM',
      imageUrl: SVG_SUGARCANE_RED_ROT,
      whatToDoToday: [
        {
          step: 1,
          title: 'Drain stagnant field water immediately',
          titleHi: 'खेत में जमा पानी को तुरंत निकालें',
          titleMr: 'शेतात साचलेले पाणी तातडीने बाहेर काढा',
          description: 'Stagnant water accelerates fungal dissemination across sugarcane setts and root zones.',
          descriptionHi: 'खेत में रुका हुआ पानी कवक को गन्ने की जड़ों और तनों में तेजी से फैलाता है।',
          descriptionMr: 'साचलेल्या पाण्यामुळे उसाच्या मुळांमध्ये बुरशी वेगाने पसरते. चर खोदून निचरा करा.',
          priority: 'critical',
          category: 'cultural'
        },
        {
          step: 2,
          title: 'Uproot & burn drying affected clumps',
          titleHi: 'सूख रहे प्रभावित गन्ने के झुरमुटों को उखाड़कर जलाएं',
          titleMr: 'वाळलेले व बाधित उसाचे बेट मुळासकट उपटून नष्ट करा',
          description: 'Remove dying clumps with third and fourth leaves yellowing. Destroy outside field perimeter.',
          descriptionHi: 'तीसरी और चौथी पत्ती पीली पड़ने वाले सूखते पौधों को उखाड़कर खेत से बाहर नष्ट करें।',
          descriptionMr: 'रोगट उसाचे बेट उपटून शेताबाहेर नष्ट करा जेणेकरून इतर बेटांना संसर्ग होणार नाही.',
          priority: 'critical',
          category: 'mechanical'
        },
        {
          step: 3,
          title: 'Bio-Control Root Drenching (Trichoderma)',
          titleHi: 'जड़ों में ट्राइकोडर्मा विरिडी का जैविक उपचार करें',
          titleMr: 'ट्रायकोडर्मा व्हिरिडीची आळवणी (Drenching)',
          description: 'Drench root zones with Trichoderma viride enriched farmyard manure @ 10kg/acre.',
          descriptionHi: 'प्रति एकड़ 10 किग्रा ट्राइकोडर्मा समृद्ध गोबर की खाद से जड़ों के पास उपचार करें।',
          descriptionMr: 'शेणखतात मिसळून ट्रायकोडर्माची उसाच्या मुळांजवळ आळवणी करा.',
          priority: 'important',
          category: 'biological'
        },
        {
          step: 4,
          title: 'Sett Treatment Guidance for future replanting',
          titleHi: 'भावी बुवाई के लिए बीज उपचार मार्गदर्शन',
          titleMr: 'पुढील लागवडीसाठी बेणेप्रक्रिया मार्गदर्शन',
          description: 'Dip seed setts in Carbendazim 50% WP @ 1g/L for 15 minutes before any future planting.',
          descriptionHi: 'भविष्य में बुवाई से पहले गन्ने के टुकड़ों को कार्बेन्डाजिम 1 ग्राम/लीटर के घोल में 15 मिनट डुबोएं।',
          descriptionMr: 'पुढील लागवडीवेळी कार्बेन्डाझिम द्रावणात १५ मिनिटे बेणे बुडवून बेणेप्रक्रिया करा.',
          priority: 'preventive',
          category: 'chemical'
        }
      ],
      whatToMonitor: [
        {
          title: 'Midrib reddening & white patches in pith',
          titleHi: 'पत्तियों की मध्य शिरा का लाल होना व तने में सफेद चकत्ते',
          titleMr: 'पानाच्या मुख्य शिरेवरील लाल डाग व आतील गाभ्याचा रंग',
          check: 'Split affected stalks and observe if internal pith has crosswise white bands.',
          checkHi: 'प्रभावित गन्ने को चीरकर देखें कि क्या अंदर सफेद अनुप्रस्थ पट्टियां हैं।',
          checkMr: 'उस कापून आत पांढरे पट्टे व लाल रंग दिसतो का ते तपासा.'
        }
      ],
      whatMayHappenNext: {
        title: 'Crop Deterioration Risk',
        titleHi: 'फसल क्षरण जोखिम',
        titleMr: 'उसाचे नुकसान अंदाज',
        text: 'Red Rot can cause severe stalk drying and sucrose inversion. Strict field sanitation and drainage protect healthy standing cane.',
        textHi: 'लाल सड़न से गन्ने का तना सूख सकता है और सुक्रोज घट सकती है। जल निकासी और स्वच्छता बनाए रखें।',
        textMr: 'लाल कुजव्या रोगामुळे उस आतून पोकळ होऊन सुकतो. शेतातील स्वच्छता व पाण्याचा निचरा त्वरित करा.',
        riskTrend: 'increasing'
      },
      advisoryVoiceScript: 'Red Rot symptoms detected on sugarcane. Ensure proper drainage and rogue out dried clumps to prevent spread.',
      advisoryVoiceScriptHi: 'गन्ने की फसल पर लाल सड़न के लक्षण देखे गए हैं। जल निकासी सुनिश्चित करें और सूख रहे पौधों को तुरंत हटा दें।',
      advisoryVoiceScriptMr: 'उसावर लाल कुजव्या रोगाची लक्षणे आढळली आहेत. पाण्याचा त्वरित निचरा करा व रोगट बेट उपटून नष्ट करा.'
    };
  }

  if (key === 'maize') {
    return {
      id: 'diag-maize-default',
      cropId: 'maize',
      cropName: 'Maize',
      cropNameHi: 'मक्का',
      cropNameMr: 'मका',
      diseaseName: 'Turcicum Leaf Blight',
      diseaseNameHi: 'पत्ती झुलसा (Leaf Blight)',
      diseaseNameMr: 'मका करपा रोग (Leaf Blight)',
      pathogen: 'Exserohilum turcicum (Fungal Pathogen)',
      severity: 'moderate',
      confidenceLabel: 'reliable',
      isUncertain: false,
      detectedAt: 'Today, 10:15 AM',
      imageUrl: SVG_MAIZE_BLIGHT,
      whatToDoToday: [
        {
          step: 1,
          title: 'Clear lower decaying foliage & weeds',
          titleHi: 'निचली सड़ी पत्तियां व खरपतवार हटाएं',
          titleMr: 'खालची सुकलेली पाने व तण काढा',
          description: 'Improve air circulation around lower stalk canopy to lower leaf wetness duration.',
          descriptionHi: 'हवा के संचार को बेहतर बनाने और पत्तियों की नमी कम करने के लिए निचली पत्तियां हटाएं।',
          descriptionMr: 'हवा खेळती राहण्यासाठी खालची सुकलेली पाने काढून टाका.',
          priority: 'critical',
          category: 'cultural'
        },
        {
          step: 2,
          title: 'Apply Bio-Fungicide (Pseudomonas fluorescens)',
          titleHi: 'स्यूडोमोनास फ्लोरोसेंस का जैविक छिड़काव करें',
          titleMr: 'स्यूडोमोनास फ्लोरोसेन्स जैविक फवारणी',
          description: 'Spray Pseudomonas fluorescens @ 5g/L water during afternoon hours.',
          descriptionHi: 'दोपहर के समय 5 ग्राम प्रति लीटर पानी में स्यूडोमोनास का छिड़काव करें।',
          descriptionMr: 'जैविक नियंत्रणासाठी स्यूडोमोनास फ्लोरोसेन्सची फवारणी करा.',
          priority: 'important',
          category: 'biological'
        },
        {
          step: 3,
          title: 'Protective Fungicide Spray (Mancozeb 75% WP)',
          titleHi: 'सुरक्षात्मक कवकनाशी (मैन्कोजेब 75% डब्ल्यूपी) का छिड़काव',
          titleMr: 'मॅन्कोझेब ७५% WP बुरशीनाशक फवारणी',
          description: 'Spray Mancozeb 75% WP @ 2.5g/L or Azoxystrobin 23% SC @ 1ml/L during clear morning.',
          descriptionHi: 'सुबह साफ मौसम में मैन्कोजेब 2.5 ग्राम/लीटर या एजोक्सीस्ट्रोबिन 1 मिली/लीटर का छिड़काव करें।',
          descriptionMr: 'सकाळच्या वेळेत मॅन्कोझेब (२.५ ग्रॅम/लिटर) ची फवारणी करा.',
          priority: 'preventive',
          category: 'chemical'
        }
      ],
      whatToMonitor: [
        {
          title: 'Boat-shaped elliptical lesions',
          titleHi: 'पत्तियों पर नाव के आकार के लंबे धब्बे',
          titleMr: 'पानांवरील लांबट करडे डाग',
          check: 'Inspect if grey-green spindle lesions expand along leaf veins.',
          checkHi: 'जांचें कि क्या पत्तियों पर नाव के आकार के लंबे धब्बे बढ़ रहे हैं।',
          checkMr: 'पानांवर लांबट डाग वाढतात का ते तपासा.'
        }
      ],
      whatMayHappenNext: {
        title: 'Canopy Blight Projection',
        titleHi: 'झुलसा रोग प्रसार अनुमान',
        titleMr: 'करपा रोग प्रसार अंदाज',
        text: 'Cool humid conditions favor spore coalescence, leading to premature leaf scorch.',
        textHi: 'आर्द्र मौसम में धब्बे आपस में मिलकर पत्तियों को झुलसा सकते हैं।',
        textMr: 'दमट हवेत डाग एकमेकांत मिसळून पाने करपण्याचा धोका वाढतो.',
        riskTrend: 'increasing'
      },
      advisoryVoiceScript: 'Turcicum leaf blight observed on maize. Apply protective Mancozeb spray and improve field aeration.',
      advisoryVoiceScriptHi: 'मक्का पर पत्ती झुलसा के लक्षण देखे गए हैं। सुरक्षात्मक कवकनाशी का छिड़काव करें।',
      advisoryVoiceScriptMr: 'मका पिकावर करपा रोगाची लक्षणे दिसत आहेत. योग्य बुरशीनाशकाची फवारणी करा.'
    };
  }

  if (key === 'onion') {
    return {
      id: 'diag-onion-default',
      cropId: 'onion',
      cropName: 'Onion',
      cropNameHi: 'प्याज',
      cropNameMr: 'कांदा',
      diseaseName: 'Purple Blotch',
      diseaseNameHi: 'बैंगनी धब्बा रोग (Purple Blotch)',
      diseaseNameMr: 'कांदा जांभळा करपा (Purple Blotch)',
      pathogen: 'Alternaria porri (Fungal Pathogen)',
      severity: 'moderate',
      confidenceLabel: 'reliable',
      isUncertain: false,
      detectedAt: 'Today, 10:15 AM',
      imageUrl: SVG_ONION_BLOTCH,
      whatToDoToday: [
        {
          step: 1,
          title: 'Regulate irrigation & avoid overhead sprinklers in afternoon',
          titleHi: 'सिंचाई नियंत्रित करें व दोपहर में स्प्रिंकलर न चलाएं',
          titleMr: 'पाणी व्यवस्थापन सुधारा व दुपारी तुषार सिंचन टाळा',
          description: 'Prolonged leaf dampness triggers fast Alternaria spore germination.',
          descriptionHi: 'पत्तियों पर लंबे समय तक नमी रहने से बैंगनी धब्बे के बीजाणु तेजी से पनपते हैं।',
          descriptionMr: 'पातीवर ओलावा जास्त वेळ राहू देऊ नका. सकाळी किंवा ठिबकने पाणी द्या.',
          priority: 'critical',
          category: 'cultural'
        },
        {
          step: 2,
          title: 'Prune & clear purple blighted leaves',
          titleHi: 'बैंगनी धब्बों वाली खराब पत्तियां हटाएं',
          titleMr: 'जांभळे डाग पडलेली पाती कापा व नष्ट करा',
          description: 'Remove severely blighted foliage from field borders.',
          descriptionHi: 'खेत की मेड़ों और क्यारियों से अत्यधिक खराब पत्तियों को हटाएं।',
          descriptionMr: 'बाधित पाती कापून शेताबाहेर नष्ट करा.',
          priority: 'critical',
          category: 'mechanical'
        },
        {
          step: 3,
          title: 'Spray Mancozeb 75% WP + Sticker (Spreader)',
          titleHi: 'मैन्कोजेब 75% डब्ल्यूपी + स्टीकर (चिपको) का छिड़काव',
          titleMr: 'मॅन्कोझेब ७५% WP + स्टिकर फवारणी',
          description: 'Spray Mancozeb @ 2.5g/L or Tebuconazole + Trifloxystrobin @ 1g/L with non-ionic sticker.',
          descriptionHi: 'मैन्कोजेब 2.5 ग्राम/लीटर के साथ स्टीकर मिलाकर सुबह के समय छिड़काव करें।',
          descriptionMr: 'कांद्याच्या निसरड्या पातीवर औषध टिकण्यासाठी स्टिकर मिसळून मॅन्कोझेब फवारा.',
          priority: 'preventive',
          category: 'chemical'
        }
      ],
      whatToMonitor: [
        {
          title: 'Purplish concentric rings on foliage',
          titleHi: 'पत्तियों पर बैंगनी छल्लेदार धब्बे',
          titleMr: 'पातीवरील जांभळे व तपकिरी डाग',
          check: 'Check if sunken purple lesions with yellow borders expand downwards.',
          checkHi: 'जांचें कि क्या पीले घेरे वाले बैंगनी धब्बे नीचे की ओर फैल रहे हैं।',
          checkMr: 'जांभळे डाग खाली मानेकडे पसरत आहेत का ते तपासा.'
        }
      ],
      whatMayHappenNext: {
        title: 'Purple Blotch Severity Risk',
        titleHi: 'बैंगनी धब्बा जोखिम पूर्वानुमान',
        titleMr: 'जांभळा करपा धोका अंदाज',
        text: 'Morning dew and warm days accelerate Purple Blotch spread, causing foliage collapse.',
        textHi: 'सुबह की ओस और दिन की धूप से बैंगनी धब्बा तेजी से फैल सकता है।',
        textMr: 'सकाळचे दव आणि दमट वातावरणामुळे जांभळा करपा वेगाने वाढू शकतो.',
        riskTrend: 'increasing'
      },
      advisoryVoiceScript: 'Purple Blotch detected on onion. Spray Mancozeb with sticker and avoid overhead watering.',
      advisoryVoiceScriptHi: 'प्याज की फसल पर बैंगनी धब्बा रोग पाया गया है। स्टीकर मिलाकर मैन्कोजेब का छिड़काव करें।',
      advisoryVoiceScriptMr: 'कांद्यावर जांभळा करपा रोग आढळला आहे. स्टिकर मिसळून योग्य बुरशीनाशकाची फवारणी करा.'
    };
  }

  if (key === 'rice') {
    return {
      id: 'diag-rice-default',
      cropId: 'rice',
      cropName: 'Rice',
      cropNameHi: 'धान / चावल',
      cropNameMr: 'भात / धान',
      diseaseName: 'Rice Blast',
      diseaseNameHi: 'धान का झोंका रोग (Rice Blast)',
      diseaseNameMr: 'भात कडा करपा / ब्लास्ट (Blast)',
      pathogen: 'Magnaporthe oryzae (Fungal Pathogen)',
      severity: 'moderate',
      confidenceLabel: 'reliable',
      isUncertain: false,
      detectedAt: 'Today, 10:15 AM',
      imageUrl: SVG_RICE_BLAST,
      whatToDoToday: [
        {
          step: 1,
          title: 'Split nitrogen application & avoid excessive top-dressing',
          titleHi: 'नाइट्रोजन को किस्तों में दें और अधिक यूरिया से बचें',
          titleMr: 'युरिया खताचा एकाच वेळी अतिवापर टाळा',
          description: 'Excessive nitrogen increases leaf susceptibility to blast fungal infection.',
          descriptionHi: 'अधिक यूरिया से पत्तियां कोमल होकर झोंका रोग के प्रति संवेदनशील हो जाती हैं।',
          descriptionMr: 'नत्र खतांच्या अतिवापरामुळे ब्लास्ट बुरशीचा प्रादुर्भाव वाढतो.',
          priority: 'critical',
          category: 'cultural'
        },
        {
          step: 2,
          title: 'Apply Bio-Agent (Pseudomonas fluorescens 5g/L)',
          titleHi: 'स्यूडोमोनास फ्लोरोसेंस का जैविक छिड़काव करें',
          titleMr: 'स्यूडोमोनास फ्लोरोसेन्स जैविक फवारणी',
          description: 'Foliar spray Pseudomonas fluorescens @ 5g/L water during late afternoon.',
          descriptionHi: 'दोपहर बाद 5 ग्राम प्रति लीटर पानी में स्यूडोमोनास का छिड़काव करें।',
          descriptionMr: 'दुपारी स्यूडोमोनास फ्लोरोसेन्सची जैविक फवारणी करा.',
          priority: 'important',
          category: 'biological'
        },
        {
          step: 3,
          title: 'Targeted Blast Fungicide (Tricyclazole 75% WP)',
          titleHi: 'झोंका रोधी कवकनाशी (ट्राइसाइक्लाजोल 75% डब्ल्यूपी) का छिड़काव',
          titleMr: 'ट्रायसायक्लॅझोल ७५% WP बुरशीनाशक फवारणी',
          description: 'Spray Tricyclazole 75% WP @ 0.6g/L or Isoprothiolane 40% EC @ 1.5ml/L.',
          descriptionHi: 'ट्राइसाइक्लाजोल 0.6 ग्राम/लीटर या इसोप्रोथियोलेन 1.5 मिली/लीटर का छिड़काव करें।',
          descriptionMr: 'सकाळच्या वेळी ट्रायसायक्लॅझोल (०.६ ग्रॅम/लिटर) ची फवारणी करा.',
          priority: 'preventive',
          category: 'chemical'
        }
      ],
      whatToMonitor: [
        {
          title: 'Spindle-shaped diamond lesions on leaves',
          titleHi: 'पत्तियों पर धुरी के आकार के धब्बे (ग्रे केंद्र)',
          titleMr: 'पानांवरील डोळ्याच्या आकाराचे करडे डाग',
          check: 'Observe if spindle lesions with grey centers and brown borders multiply.',
          checkHi: 'जांचें कि क्या भूरे किनारों वाले धुरी आकार के धब्बे बढ़ रहे हैं।',
          checkMr: 'पानांवर करड्या रंगाचे लांबट डाग वाढतात का ते तपासा.'
        }
      ],
      whatMayHappenNext: {
        title: 'Blast Transmission Risk',
        titleHi: 'झोंका रोग प्रसार जोखिम',
        titleMr: 'ब्लास्ट रोग प्रसार अंदाज',
        text: 'Night dew and cloudy days create optimal conditions for neck and leaf blast expansion.',
        textHi: 'रात की ओस और बादलों वाले मौसम में झोंका रोग तेजी से फैल सकता है।',
        textMr: 'ढगाळ वातावरण व रात्रीच्या दवामुळे करपा रोगाचा प्रसार वाढू शकतो.',
        riskTrend: 'increasing'
      },
      advisoryVoiceScript: 'Rice Blast detected on paddy foliage. Avoid excess urea and spray Tricyclazole promptly.',
      advisoryVoiceScriptHi: 'धान की फसल पर झोंका रोग (ब्लास्ट) पाया गया है। अधिक यूरिया से बचें और ट्राइसाइक्लाजोल का छिड़काव करें।',
      advisoryVoiceScriptMr: 'भातावर कडा करपा (ब्लास्ट) रोग आढळला आहे. युरिया खत कमी करा व ट्रायसायक्लॅझोलची फवारणी करा.'
    };
  }

  if (key === 'wheat') {
    return {
      id: 'diag-wheat-default',
      cropId: 'wheat',
      cropName: 'Wheat',
      cropNameHi: 'गेहूं',
      cropNameMr: 'गहू',
      diseaseName: 'Stripe Rust (Yellow Rust)',
      diseaseNameHi: 'पीला रतुआ / गेरुआ रोग (Yellow Rust)',
      diseaseNameMr: 'पिवळा तांबेरा (Yellow Rust)',
      pathogen: 'Puccinia striiformis (Fungal Pathogen)',
      severity: 'moderate',
      confidenceLabel: 'reliable',
      isUncertain: false,
      detectedAt: 'Today, 10:15 AM',
      imageUrl: SVG_WHEAT_RUST,
      whatToDoToday: [
        {
          step: 1,
          title: 'Regulate irrigation & avoid canopy standing water',
          titleHi: 'सिंचाई नियंत्रित करें व खेत में पानी न रुकने दें',
          titleMr: 'पाणी व्यवस्थापन योग्य ठेवा व शेतात ओलावा जास्त साचू देऊ नका',
          description: 'Over-irrigation in cool weather promotes stripe rust spore development.',
          descriptionHi: 'ठंडे मौसम में अधिक पानी से पीले रतुआ के कवक तेजी से बढ़ते हैं।',
          descriptionMr: 'थंड हवेत जास्त पाणी दिल्यास पिवळ्या तांबेऱ्याची वाढ वेगाने होते.',
          priority: 'critical',
          category: 'cultural'
        },
        {
          step: 2,
          title: 'Rogue & destroy initial yellow rust foci spots',
          titleHi: 'शुरुआती पीले रतुआ वाले पौधों को नष्ट करें',
          titleMr: 'सुरुवातीची तांबेरा बाधित पाने नष्ट करा',
          description: 'Uproot early infected focus patches to prevent field-wide wind dispersal.',
          descriptionHi: 'शुरुआती संक्रमित पौधों को उखाड़कर नष्ट करें ताकि हवा से फैलाव रुके।',
          descriptionMr: 'हवेमुळे रोग इतर भागात पसरू नये म्हणून सुरुवातीची बाधित पाने नष्ट करा.',
          priority: 'critical',
          category: 'mechanical'
        },
        {
          step: 3,
          title: 'Targeted Triazole Spray (Propiconazole 25% EC)',
          titleHi: 'लक्षित कवकनाशी (प्रोपिकोनाजोल 25% ईसी) का छिड़काव',
          titleMr: 'प्रोपिकोनॅझोल २५% EC बुरशीनाशक फवारणी',
          description: 'Spray Propiconazole 25% EC @ 1ml/L or Tebuconazole 25.9% EC @ 1.2ml/L.',
          descriptionHi: 'सुबह शांत मौसम में प्रोपिकोनाजोल 1 मिली/लीटर पानी में घोलकर छिड़काव करें।',
          descriptionMr: 'सकाळच्या वेळेत प्रोपिकोनॅझोल (१ मिली/लिटर) ची फवारणी करा.',
          priority: 'preventive',
          category: 'chemical'
        }
      ],
      whatToMonitor: [
        {
          title: 'Linear yellow pustule stripes on leaf blades',
          titleHi: 'पत्तियों पर पीले फफोलों की लंबी धारियां',
          titleMr: 'पानांवर पिवळ्या फोडांच्या लांब पट्ट्या',
          check: 'Check if bright yellow powdery stripes develop parallel to leaf veins.',
          checkHi: 'जांचें कि क्या पत्तियों पर नसों के समानांतर चमकीले पीले फफोले बन रहे हैं।',
          checkMr: 'पानांच्या शिरांना समांतर पिवळे पट्टे वाढतात का ते तपासा.'
        }
      ],
      whatMayHappenNext: {
        title: 'Yellow Rust Wind Dispersion Forecast',
        titleHi: 'पीला रतुआ फैलाव पूर्वानुमान',
        titleMr: 'पिवळा तांबेरा प्रसार अंदाज',
        text: 'Cool humid breezes can disperse yellow rust spores rapidly across neighbouring fields.',
        textHi: 'ठंडी नम हवा के कारण पीला रतुआ तेजी से आसपास के खेतों में फैल सकता है।',
        textMr: 'थंड वाऱ्यामुळे पिवळा तांबेरा वेगाने शेजारच्या शेतांमध्ये पसरू शकतो.',
        riskTrend: 'increasing'
      },
      advisoryVoiceScript: 'Yellow rust stripes detected on wheat. Spray Propiconazole immediately to protect crop yield.',
      advisoryVoiceScriptHi: 'गेहूं पर पीला रतुआ के लक्षण पाए गए हैं। तुरंत प्रोपिकोनाजोल का छिड़काव करें।',
      advisoryVoiceScriptMr: 'गव्हावर पिवळा तांबेरा आढळला आहे. उत्पादनाचे रक्षण करण्यासाठी लगेच योग्य बुरशीनाशक फवारा.'
    };
  }

  // Default fallback to Tomato
  return {
    id: 'diag-tomato-default',
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
}

export function getDefaultRiskForecastForCrop(cropIdOrName: string = 'tomato', liveWeather?: WeatherCondition): RiskForecast {
  const key = (cropIdOrName || 'tomato').toLowerCase().trim();
  const humidity = liveWeather?.humidity ?? 84;
  const rainChance = liveWeather?.rainfallChance ?? 78;

  const cropDiseaseNames: Record<string, { crop: string; cropHi: string; cropMr: string; disease: string; diseaseHi: string; diseaseMr: string }> = {
    tomato: { crop: 'Tomato', cropHi: 'टमाटर', cropMr: 'टोमॅटो', disease: 'Early Blight', diseaseHi: 'अगेती झुलसा', diseaseMr: 'करपा' },
    cotton: { crop: 'Cotton', cropHi: 'कपास', cropMr: 'कापूस', disease: 'Leaf Curl Virus', diseaseHi: 'पत्ती मरोड़', diseaseMr: 'पानांचा चुरमुरडा' },
    soybean: { crop: 'Soybean', cropHi: 'सोयाबीन', cropMr: 'सोयाबीन', disease: 'Soybean Rust', diseaseHi: 'सोयाबीन गेरुआ', diseaseMr: 'सोयाबीन तांबेरा' },
    sugarcane: { crop: 'Sugarcane', cropHi: 'गन्ना', cropMr: 'ऊस', disease: 'Red Rot', diseaseHi: 'लाल सड़न', diseaseMr: 'लाल कुजव्या' },
    maize: { crop: 'Maize', cropHi: 'मक्का', cropMr: 'मका', disease: 'Leaf Blight', diseaseHi: 'पत्ती झुलसा', diseaseMr: 'मका करपा' },
    onion: { crop: 'Onion', cropHi: 'प्याज', cropMr: 'कांदा', disease: 'Purple Blotch', diseaseHi: 'बैंगनी धब्बा', diseaseMr: 'जांभळा करपा' },
    rice: { crop: 'Rice', cropHi: 'धान', cropMr: 'भात', disease: 'Rice Blast', diseaseHi: 'झोंका रोग', diseaseMr: 'कडा करपा' },
    wheat: { crop: 'Wheat', cropHi: 'गेहूं', cropMr: 'गहू', disease: 'Stripe Rust', diseaseHi: 'पीला रतुआ', diseaseMr: 'पिवळा तांबेरा' },
  };

  const info = cropDiseaseNames[key] || cropDiseaseNames.tomato;

  return {
    cropId: key,
    currentLevel: 'moderate',
    summary: `Disease risk for ${info.crop} is INCREASING because relative humidity is at ${humidity}% and rainfall is expected tomorrow.`,
    summaryHi: `सापेक्ष आर्द्रता ${humidity}% होने और कल बारिश की संभावना के कारण ${info.cropHi} में ${info.diseaseHi} का जोखिम बढ़ रहा है।`,
    summaryMr: `हवेतील आर्द्रता ${humidity}% असून उद्या पावसाची शक्यता असल्याने ${info.cropMr} पिकात ${info.diseaseMr} रोगाचा धोका वाढणार आहे।`,
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
        title: `High Relative Humidity (${humidity}%)`,
        titleHi: `उच्च सापेक्ष आर्द्रता (${humidity}%)`,
        titleMr: `जास्त हवेतील आर्द्रता (${humidity}%)`,
        icon: 'droplet',
        detail: `80% - 88% humidity projected continuously over next 3 days, accelerating ${info.disease} spore germination on ${info.crop} foliage.`,
        detailHi: `अगले 3 दिनों में लगातार 80% - 88% आर्द्रता का अनुमान, जो ${info.cropHi} की पत्तियों पर ${info.diseaseHi} के बीजाणुओं के अंकुरण को बढ़ाता है।`,
        detailMr: `पुढील ३ दिवस आर्द्रता ८०% ते ८८% दरम्यान राहण्याचा अंदाज, ज्याने ${info.cropMr} पिकावर ${info.diseaseMr} बुरशीचे बीजाणू वेगाने वाढतात.`
      },
      {
        id: 'r-rain',
        title: `Rainfall Expected in 24 hrs (${rainChance}%)`,
        titleHi: `24 घंटों में बारिश की संभावना (${rainChance}%)`,
        titleMr: `२४ तासांत पावसाची शक्यता (${rainChance}%)`,
        icon: 'cloud-rain',
        detail: `Rain splash spreads ${info.disease} pathogens onto upper healthy ${info.crop} leaves.`,
        detailHi: `बारिश की बूंदों के छींटे ${info.diseaseHi} रोगजनकों को ${info.cropHi} की ऊपरी स्वस्थ पत्तियों तक फैलाते हैं।`,
        detailMr: `पावसाच्या पाण्यामुळे ${info.diseaseMr} बुरशीचे कण ${info.cropMr} च्या निरोगी पानांवर उडतात.`
      },
      {
        id: 'r-cluster',
        title: `Active ${info.crop} Disease Clusters Nearby`,
        titleHi: `आस-पास 14 पुष्ट मामले (${info.cropHi})`,
        titleMr: `परिसरात ${info.cropMr} प्रादुर्भाव`,
        icon: 'map-pin',
        detail: `Neighboring farms within 5 km report active ${info.disease} clusters.`,
        detailHi: `5 किमी के भीतर पड़ोसी खेतों में ${info.cropHi} के ${info.diseaseHi} के सक्रिय समूह पाए गए हैं।`,
        detailMr: `५ किमी परिसरातील शेतांमध्ये ${info.cropMr} च्या ${info.diseaseMr} रोगाचे क्लस्टर आढळले आहेत.`
      }
    ],
    recommendation: `Complete cultural field sanitation and protective spray for ${info.crop} today before rain starts.`,
    recommendationHi: `बारिश शुरू होने से पहले आज ही ${info.cropHi} के लिए पत्तियों की छंटाई और जैविक/कॉपर का छिड़काव पूरा करें।`,
    recommendationMr: `पाऊस सुरू होण्यापूर्वी आजच सकाळच्या सत्रात ${info.cropMr} साठी बाधित पाने कापा व योग्य फवारणी पूर्ण करा.`
  };
}

export const DEFAULT_DIAGNOSIS: DiagnosisResult = getDefaultDiagnosisForCrop('tomato');

export const MOCK_RISK_FORECAST: RiskForecast = getDefaultRiskForecastForCrop('tomato');

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

