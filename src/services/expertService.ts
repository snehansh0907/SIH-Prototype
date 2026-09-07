import type { ExpertProfile, ChatMessage } from '../types';
import { apiClient } from './apiClient';
import { MOCK_EXPERT } from './mockData';

export interface PendingCase {
  id: string;
  farmer_id?: string;
  farm_id?: string;
  crop_cycle_id?: string;
  image_url: string;
  predicted_disease: string;
  confidence: number;
  severity_band: string;
  severity_percent: number;
  latitude?: number;
  longitude?: number;
  status: string;
  created_at: string;
}

export interface ExpertReviewSubmission {
  case_id: string;
  expert_id?: string;
  review_status: 'confirmed' | 'corrected' | 'rejected';
  expert_diagnosis?: string;
  remarks?: string;
}

export interface ExpertChatContext {
  farmerName?: string;
  farmName?: string;
  cropName: string;
  diseaseName: string;
  cropNameEn?: string;
  cropNameHi?: string;
  cropNameMr?: string;
  diseaseNameEn?: string;
  diseaseNameHi?: string;
  diseaseNameMr?: string;
  pathogen?: string;
  severity: string;
  detectedAt?: string;
  daysSinceDiagnosis?: string;
  humidity?: number;
  rainChance?: number;
  rainfallStatus?: string;
  temperature?: number;
  riskSummary?: string;
  riskLevel?: string;
  variety?: string;
  cropStage?: string;
  village?: string;
  district?: string;
  state?: string;
  whatToDoToday?: Array<{ step: number; title: string; description: string; priority?: string }>;
  language: 'en' | 'hi' | 'mr';
}

export function calculateDaysSinceDiagnosis(detectedAt?: string): string {
  if (!detectedAt) return '0 days (diagnosed today)';
  const lower = detectedAt.toLowerCase();
  if (lower.includes('today') || lower.includes('आज') || lower.includes('just now')) {
    return '0 days (diagnosed today)';
  }
  if (lower.includes('yesterday') || lower.includes('काल') || lower.includes('कल')) {
    return '1 day (diagnosed yesterday)';
  }
  const dateObj = new Date(detectedAt);
  if (!isNaN(dateObj.getTime())) {
    const diffDays = Math.max(0, Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24)));
    return diffDays === 0 ? '0 days (diagnosed today)' : `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
  return detectedAt;
}

export function buildExpertSystemPrompt(ctx: ExpertChatContext): string {
  const languageNames: Record<string, string> = {
    en: 'English',
    hi: 'Hindi',
    mr: 'Marathi',
  };
  const targetLanguage = languageNames[ctx.language] || 'English';

  return `You are Dr. R. Patil, an experienced KVK (Krishi Vigyan Kendra) agronomist and crop protection specialist reviewing this specific field case with a farmer.

CASE CONTEXT:
- Farmer Name: ${ctx.farmerName || 'Kisan Bhai'}
- Location: ${[ctx.village, ctx.district, ctx.state].filter(Boolean).join(', ') || 'Local Farm'}
- Diagnosed Crop: ${ctx.cropName}${ctx.cropNameEn && ctx.cropNameEn !== ctx.cropName ? ` (${ctx.cropNameEn})` : ''}${ctx.variety ? ` [Variety: ${ctx.variety}]` : ''}
- Crop Stage: ${ctx.cropStage || 'Active vegetative growth'}
- Diagnosed Disease: ${ctx.diseaseName}${ctx.diseaseNameEn && ctx.diseaseNameEn !== ctx.diseaseName ? ` (${ctx.diseaseNameEn})` : ''}${ctx.pathogen ? ` [Pathogen: ${ctx.pathogen}]` : ''}
- Severity Level: ${ctx.severity}
- Days Since Diagnosis: ${ctx.daysSinceDiagnosis || '0 days (diagnosed today)'}
- Recent Weather Conditions & Risk Forecast:
  * Relative Humidity: ${ctx.humidity ?? 78}%
  * Rain Probability: ${ctx.rainChance ?? 60}%
  * Rainfall Forecast: ${ctx.rainfallStatus || 'Rain expected'}
  * Ambient Temperature: ${ctx.temperature ? `${ctx.temperature}°C` : '26°C'}
  * Risk Level: ${ctx.riskLevel || ctx.severity}
  * Advisory Summary: ${ctx.riskSummary || 'Elevated infection pressure.'}

BEHAVIORAL INSTRUCTIONS:
1. Role-play as Dr. R. Patil, a compassionate, practical KVK agronomist.
2. If the farmer sends casual greetings ("hello", "how are you", "who are you", "thank you"), respond warmly, acknowledge their specific crop (${ctx.cropName}) and disease (${ctx.diseaseName}), and converse naturally.
3. Keep answers concise: strictly 2 to 4 sentences. Make them simple, clear, and farmer-readable, avoiding complex academic terminology.
4. Default to Integrated Pest Management (IPM)-first advice before chemical treatments.
5. If chemical treatment or spraying is discussed, ALWAYS consider the weather conditions: warn that high humidity fosters fungal spread, and recommend applying on dry leaves with an agricultural sticker or waiting until after heavy rain.
6. Ground all advice directly in this farmer's specific crop (${ctx.cropName}), disease (${ctx.diseaseName}), and location.
7. LANGUAGE REQUIREMENT: Respond ENTIRELY in ${targetLanguage}. Use respectful phrasing appropriate for rural farmers.`;
}

/**
 * Generate initial dynamic greeting message tailored specifically to the authenticated farmer and active crop.
 */
export function createInitialGreeting(context: ExpertChatContext): ChatMessage {
  const crop = context.cropName || 'Crop';
  const disease = context.diseaseName || 'Condition';
  const severity = context.severity || 'moderate';
  const name = context.farmerName ? ` ${context.farmerName}` : '';

  const sevMr = severity === 'high' ? 'गंभीर' : severity === 'moderate' ? 'मध्यम' : 'कमी';
  const sevHi = severity === 'high' ? 'गंभीर' : severity === 'moderate' ? 'मध्यम' : 'कम';

  return {
    id: 'm1',
    sender: 'expert',
    text: `Namaste${name}! I reviewed your ${crop} diagnosis (${disease} - ${severity}). How many acres are affected, and have you applied any spray in the last 7 days?`,
    textHi: `नमस्ते${name}! मैंने आपके ${crop} निदान (${disease} - ${sevHi}) की समीक्षा की है। कितने एकड़ क्षेत्र प्रभावित है, और क्या आपने पिछले 7 दिनों में कोई छिड़काव किया है?`,
    textMr: `नमस्कार${name}! मी आपल्या ${crop} पिकाचा अहवाल पाहिला (${disease} - ${sevMr}). किती क्षेत्र बाधित आहे आणि आपण गेल्या ७ दिवसांत कोणती फवारणी केली आहे का?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Intelligent Multi-Level Conversational Response Engine.
 * Covers:
 *   Level 1: Greeting & Casual conversation ("how are you", "hello", "who are you", "thank you", "bye")
 *   Level 2: General farming & weather questions
 *   Level 3: Context-aware action questions ("what should I do?")
 *   Level 4: Disease-specific and chemical / organic treatment questions
 *   Level 5: Unclear questions (asking for clarification politely)
 *   Level 6: Open-ended helpful fallback (never technical error!)
 */
export function generateIntelligentExpertResponse(
  userText: string,
  context: ExpertChatContext
): { text: string; textHi: string; textMr: string } {
  const rawLower = (userText || '').trim().toLowerCase();
  const lower = rawLower.replace(/[?!.,;:]/g, ' ').replace(/\s+/g, ' ').trim();

  const crop = context.cropName || 'crop';
  const disease = context.diseaseName || 'disease';
  const severity = context.severity || 'moderate';
  const name = context.farmerName ? ` ${context.farmerName}` : '';
  const district = context.district || '';
  const normCrop = (context.cropNameEn || context.cropName || '').toLowerCase().trim();
  const normDisease = (context.diseaseNameEn || context.diseaseName || '').toLowerCase().trim();

  // =========================================================================
  // LEVEL 1: CASUAL INTENT & CONVERSATIONAL GREETINGS
  // =========================================================================

  // 1A. "how are you" / "kaise ho" / "kasa ahes"
  if (
    lower === 'how are you' ||
    lower.startsWith('how are you') ||
    lower.includes('how r u') ||
    lower.includes('how are u') ||
    lower.includes('how are you doing') ||
    lower.includes('kaise ho') ||
    lower.includes('kasa ahes') ||
    lower.includes('kashi ahes') ||
    lower.includes('kase ahat') ||
    lower.includes('kaisi ho')
  ) {
    return {
      text: `Namaste${name}! I'm doing well, thank you 😊 I'm here to help with your ${crop} crop and the ${disease} issue on your farm. How are things in your field today?`,
      textHi: `नमस्ते${name}! मैं बिल्कुल ठीक हूँ, पूछने के लिए धन्यवाद 😊 मैं यहाँ आपकी ${crop} की फसल और खेत में पाए गए ${disease} के समाधान के लिए उपलब्ध हूँ। आज आपके खेत में कैसी स्थिति है?`,
      textMr: `नमस्कार${name}! मी मजेत आहे, विचारल्याबद्दल धन्यवाद 😊 मी आपल्या ${crop} पिकावरील ${disease} समस्येचे मार्गदर्शन करण्यासाठी येथे उपस्थित आहे. आज आपल्या शेतात पिकाची काय स्थिती आहे?`,
    };
  }

  // 1B. "hello" / "hi" / "hey" / "namaste" / "ram ram"
  if (
    lower === 'hello' ||
    lower === 'hi' ||
    lower === 'hey' ||
    lower.startsWith('hello ') ||
    lower.startsWith('hi ') ||
    lower.startsWith('hey ') ||
    lower.includes('namaste') ||
    lower.includes('namaskar') ||
    lower.includes('नमस्ते') ||
    lower.includes('नमस्कार') ||
    lower.includes('राम राम') ||
    lower.includes('pranam') ||
    lower.includes('pranaam')
  ) {
    return {
      text: `Namaste${name}! 👋 I'm Dr. Patil from the KVK advisory desk. How can I help you with your ${crop} crop today?`,
      textHi: `नमस्ते${name}! 👋 मैं केवीके सलाह डेस्क से डॉ. पाटिल हूँ। आज मैं आपकी ${crop} की फसल के लिए क्या सहायता कर सकता हूँ?`,
      textMr: `नमस्कार${name}! 👋 मी केव्हीके सल्ला केंद्रातून डॉ. पाटील. आज मी आपल्या ${crop} पिकासाठी काय मदत करू शकतो?`,
    };
  }

  // 1C. "thank you" / "thanks" / "dhanyawad" / "shukriya"
  if (
    lower === 'thank you' ||
    lower === 'thanks' ||
    lower.includes('thank you') ||
    lower.includes('thanks') ||
    lower.includes('thank u') ||
    lower.includes('dhanyawad') ||
    lower.includes('dhanyavad') ||
    lower.includes('shukriya') ||
    lower.includes('धन्यवाद') ||
    lower.includes('शुक्रिया') ||
    lower.includes('आभार') ||
    lower.includes('aabhar')
  ) {
    return {
      text: `You're welcome${name}! 😊 Take care of your ${crop} crop, and feel free to ask me anything about the disease, treatment, weather, or crop management.`,
      textHi: `आपका स्वागत है${name}! 😊 अपनी ${crop} की फसल का ध्यान रखें, और जब भी रोग, उपचार, मौसम या फसल प्रबंधन के बारे में कोई सवाल हो तो बेझिझक मुझसे संपर्क करें।`,
      textMr: `आपले स्वागत आहे${name}! 😊 आपल्या ${crop} पिकाची योग्य काळजी घ्या, आणि रोग, उपचार, हवामान किंवा पीक व्यवस्थापनाबाबत काहीही विचारायचे असल्यास नक्की विचारा.`,
    };
  }

  // 1D. "who are you" / "who r u" / "kaun ho" / "tumhi kon aahat"
  if (
    lower.includes('who are you') ||
    lower.includes('who r u') ||
    lower.includes('who is dr patil') ||
    lower.includes('who r you') ||
    lower.includes('kaun ho') ||
    lower.includes('tum kaun ho') ||
    lower.includes('tumhi kon aahat') ||
    lower.includes('ap kaun ho') ||
    lower.includes('introduce yourself') ||
    lower.includes('tum kon ho')
  ) {
    return {
      text: `I'm Dr. Patil, your agricultural advisory assistant from the KVK support desk. I can help you understand crop diseases, prevention, treatment, weather-related risks, and good farming practices.`,
      textHi: `मैं डॉ. पाटिल हूँ, केवीके सपोर्ट डेस्क से आपका कृषि सलाहकार सहायक। मैं आपको फसल के रोगों, उनकी रोकथाम, उपचार, मौसम के जोखिम और उन्नत कृषि पद्धतियों को समझने में मदद कर सकता हूँ।`,
      textMr: `मी डॉ. पाटील आहे, केव्हीके मदत केंद्रातून आपला कृषी सल्लागार. मी आपल्याला पिकांवरील रोग, प्रतिबंध, उपचार, हवामानाचा धोका आणि चांगल्या शेती पद्धती समजून घेण्यास मदत करू शकतो.`,
    };
  }

  // 1E. "what can you do" / "what can you help me with" / "help me"
  if (
    lower.includes('what can you do') ||
    lower.includes('what can u do') ||
    lower.includes('what can you help') ||
    lower.includes('how can you help') ||
    lower.includes('how can u help') ||
    lower.includes('what help') ||
    lower.includes('kya kar sakte ho') ||
    lower.includes('kay karu shaktat')
  ) {
    return {
      text: `I can help you review your ${crop} diagnosis (${disease}), suggest organic and chemical spray options, guide spray timing based on upcoming weather, and plan preventive field measures for your ${district || 'farm'} field.`,
      textHi: `मैं आपकी ${crop} की फसल में ${disease} के निदान की समीक्षा, जैविक व रासायनिक उपचार, आगामी मौसम के अनुसार छिड़काव का सही समय और आपके खेत के लिए सुरक्षात्मक उपाय सुझाने में मदद कर सकता हूँ।`,
      textMr: `मी आपल्या ${crop} पिकातील ${disease} रोगाचे निदान तपासणे, सेंद्रिय व रासायनिक फवारणी पर्याय, हवामानानुसार फवारणीची योग्य वेळ आणि प्रतिबंधात्मक उपायांचे मार्गदर्शन करू शकतो.`,
    };
  }

  // 1F. "good morning" / "good evening" / "good afternoon"
  if (lower.includes('good morning') || lower.includes('shubh prabhat') || lower.includes('शुभ प्रभात')) {
    return {
      text: `Good morning${name}! 🌅 Morning is a great time to walk your ${crop} field. Inspect the lower canopy and underside of leaves where moisture lingers. How can I help with your crop today?`,
      textHi: `शुभ प्रभात${name}! 🌅 सुबह का समय अपनी ${crop} की फसल का निरीक्षण करने के लिए बहुत अच्छा है। पत्तियों की निचली सतह की जांच करें जहां नमी बनी रहती है। आज क्या सवाल है?`,
      textMr: `शुभ सकाळ${name}! 🌅 सकाळच्या वेळी आपल्या ${crop} पिकाची पाहणी करणे अत्यंत उपयुक्त ठरते. पानांच्या खालच्या भागावर ओलावा असल्यास बुरशी वाढू शकते. आज मी काय मदत करू शकतो?`,
    };
  }

  if (lower.includes('good evening') || lower.includes('shubh sandhya') || lower.includes('शुभ संध्या')) {
    return {
      text: `Good evening${name}! 🌇 Late afternoon and evening are ideal for bio-agent sprays like Trichoderma or Neem oil to avoid strong midday sun. How is your ${crop} doing today?`,
      textHi: `शुभ संध्या${name}! 🌇 शाम का समय ट्राइकोडर्मा या नीम तेल जैसे जैविक छिड़काव के लिए बहुत उपयुक्त होता है ताकि तेज धूप से बचा जा सके। आपकी ${crop} की क्या स्थिति है?`,
      textMr: `शुभ संध्याकाळ${name}! 🌇 संध्याकाळची वेळ ट्रायकोडर्मा किंवा निंबोळी अर्कासारख्या जैविक फवारणीसाठी उत्तम असते. आपल्या ${crop} पिकाची स्थिती कशी आहे?`,
    };
  }

  // 1G. "bye" / "goodbye" / "alvida"
  if (
    lower === 'bye' ||
    lower === 'goodbye' ||
    lower.startsWith('bye ') ||
    lower.startsWith('goodbye ') ||
    lower.includes('alvida') ||
    lower.includes('see you') ||
    lower.includes('chalo bye')
  ) {
    return {
      text: `Good luck with your farming! 👋 Take care of your ${crop} field, and feel free to reach out whenever you need crop advice or see any symptoms. Have a bountiful harvest!`,
      textHi: `आपकी खेती के लिए हार्दिक शुभकामनाएं! 👋 अपने खेत का ध्यान रखें, और जब भी आपकी ${crop} में कोई लक्षण दिखें तो तुरंत संपर्क करें। अच्छी फसल हो!`,
      textMr: `शेतीच्या कामासाठी हार्दिक शुभेच्छा! 👋 आपल्या शेताची काळजी घ्या, आणि ${crop} पिकात काहीही अडचण आल्यास लगेच संपर्क करा. भरघोस पीक येवो!`,
    };
  }

  // =========================================================================
  // LEVEL 2 & 3: CONTEXT-AWARE ACTIONS ("What should I do?")
  // =========================================================================
  if (
    lower.includes('what should i do') ||
    lower.includes('what should we do') ||
    lower.includes('what to do') ||
    lower.includes('next step') ||
    lower.includes('next steps') ||
    lower.includes('what do you suggest') ||
    lower.includes('how to save') ||
    lower.includes('how to treat') ||
    lower.includes('kya karu') ||
    lower.includes('kya kare') ||
    lower.includes('kay karu') ||
    lower.includes('action') ||
    lower.includes('treatment plan') ||
    lower.includes('उपाय') ||
    lower.includes('काय करू')
  ) {
    // Sugarcane - Red Rot
    if (normCrop.includes('sugarcane') || normDisease.includes('red rot')) {
      return {
        text: `Since your Sugarcane crop has been flagged for Red Rot (${severity} severity), the first priority is to isolate affected plants and inspect nearby stalks at soil level. Ensure active field furrow drainage, rogue out and destroy severely drying canes, and drench the root zone with Carbendazim 50% WP (2 g/L) or Trichoderma viride.`,
        textHi: `चूंकि आपकी गन्ने की फसल में लाल सड़न (Red Rot - ${severity} गंभीरता) पाया गया है, पहली प्राथमिकता प्रभावित पौधों को अलग करना और जमीन के पास तनों की जांच करना है। खेत में पानी न रुकने दें, सूखे गन्नों को उखाड़कर नष्ट करें और कार्बेन्डाजिम (2 ग्राम/लीटर) या ट्राइकोडर्मा से जड़ क्षेत्र का उपचार करें।`,
        textMr: `आपल्या उसाच्या पिकात लाल कुजव्या (Red Rot - ${severity} प्रादुर्भाव) आढळल्याने, पहिली प्राथमिकता बाधित उसाचे गड्डे वेगळे करणे व बुंध्याजवळ खोडाची तपासणी करणे ही आहे. शेतात पाणी साचू देऊ नका, सुकलेले ऊस काढून नष्ट करा आणि ट्रायकोडर्मा किंवा कार्बेन्डाझिमची आळवणी करा.`,
      };
    }

    // Wheat - Yellow Rust
    if (normCrop.includes('wheat') || normDisease.includes('rust')) {
      return {
        text: `Since your Wheat crop has been flagged for Yellow Rust (${severity} severity), your first priority is to survey the field for yellow powdery pustules along leaf veins. Spray Propiconazole 25% EC @ 1 ml/L water on dry foliage immediately, and avoid excess urea which softens leaves and speeds up rust spread.`,
        textHi: `चूंकि आपकी गेहूं की फसल में पीला रतुआ (Yellow Rust - ${severity} गंभीरता) देखा गया है, पहली प्राथमिकता पत्तियों की नसों पर पीले पाउडर जैसे निशानों की जांच करना है। तुरंत सूखी पत्तियों पर प्रोपिकोनाज़ोल 25% ईसी (1 मिली/लीटर) का छिड़काव करें और यूरिया की अधिक मात्रा डालने से बचें।`,
        textMr: `आपल्या गहू पिकात पिवळा तांबेरा (Yellow Rust - ${severity} प्रादुर्भाव) आढळल्याने, पानांवरील पिवळ्या पट्ट्यांची त्वरित पाहणी करा. कोरड्या पानांवर प्रोपिकोनाझोल २५% ईसी (१ मिली/लिटर) फवारा आणि नत्राचा अतिवापर टाळा.`,
      };
    }

    // Soybean - Yellow Mosaic
    if (normCrop.includes('soybean') || normDisease.includes('mosaic')) {
      return {
        text: `Since your Soybean crop has been flagged for Yellow Mosaic (${severity} severity), the key is managing the whitefly vector transmitting it. Install yellow sticky traps (10/acre), rogue out early infected yellow plants, and spray Thiamethoxam 25% WG (0.5 g/L) or Acetamiprid to arrest insect transmission.`,
        textHi: `चूंकि आपकी सोयाबीन की फसल में येलो मोज़ेक (${severity} गंभीरता) का प्रकोप है, मुख्य कदम इसे फैलाने वाली सफेद मक्खी को नियंत्रित करना है। प्रति एकड़ 10 पीले चिपचिपे जाल लगाएं, शुरुआती पीले पौधों को उखाड़ दें और सफेद मक्खी के लिए थायामेथॉक्सम का छिड़काव करें।`,
        textMr: `आपल्या सोयाबीन पिकात पिवळा मोज़ेक (${severity} प्रादुर्भाव) आढळल्यामुळे, हा रोग पसरवणाऱ्या पांढऱ्या माशीचे नियंत्रण करणे अत्यंत गरजेचे आहे. एकरी १० पिवळे चिकट सापळे लावा, पिवळी पडलेली झाडे उपटून नष्ट करा व कीटकनाशक फवारा.`,
      };
    }

    // Tomato - Early Blight
    if (normCrop.includes('tomato') || normDisease.includes('blight')) {
      return {
        text: `Since your Tomato crop has been flagged for Early Blight (${severity} severity), the first step is removing infected lower leaves that touch the soil. Maintain 4-foot ridge drainage, and apply Copper Oxychloride (2.5 g/L) or Mancozeb (2 g/L) mixed with an agricultural sticker on dry leaves.`,
        textHi: `चूंकि आपकी टमाटर की फसल में अगेती झुलसा (Early Blight - ${severity} गंभीरता) देखा गया है, पहला कदम जमीन से छूने वाली निचली संक्रमित पत्तियों को हटाना है। जल निकासी सुधारे और सूखी पत्तियों पर स्टीकर के साथ कॉपर ऑक्सीक्लोराइड (2.5 ग्राम/लीटर) या मैंकोजेब का छिड़काव करें।`,
        textMr: `आपल्या टोमॅटो पिकात करपा रोग (Early Blight - ${severity} प्रादुर्भाव) आढळल्याने, जमिनीला टेकलेली बाधित खालची पाने काढून नष्ट करा. शेतात पाण्याचा योग्य निचरा ठेवा आणि कोरड्या पानांवर स्टिकरसह कॉपर ऑक्सिक्लोराईड (२.५ ग्रॅम/लिटर) किंवा मॅन्कोझेब फवारा.`,
      };
    }

    // General Crop Fallback for Action Steps
    return {
      text: `Since your ${crop} crop has been flagged for ${disease} (${severity} severity), inspect nearby plants within 5-10 meters immediately. Remove and bury initial diseased foliage, ensure optimal furrow drainage, and apply a preventive bio-fungicide like Trichoderma viride before chemical intervention.`,
      textHi: `चूंकि आपकी ${crop} की फसल में ${disease} (${severity} गंभीरता) पाई गई है, तुरंत 5-10 मीटर के दायरे में पौधों का निरीक्षण करें। संक्रमित पत्तियों को हटाकर नष्ट करें, जल निकासी ठीक करें और रासायनिक दवा से पहले ट्राइकोडर्मा का सुरक्षात्मक छिड़काव करें।`,
      textMr: `आपल्या ${crop} पिकात ${disease} (${severity} प्रादुर्भाव) आढळल्यामुळे, ५-१० मीटर परिसरातील झाडांची पाहणी करा. बाधित पाने नष्ट करा, पाण्याचा निचरा योग्य ठेवा आणि रासायनिक फवारणीपूर्वी ट्रायकोडर्माचा संरक्षणात्मक वापर करा.`,
    };
  }

  // =========================================================================
  // LEVEL 4: CHEMICAL / FUNGICIDE QUESTIONS
  // =========================================================================
  if (
    lower.includes('fungicide') ||
    lower.includes('chemical') ||
    lower.includes('medicine') ||
    lower.includes('dawa') ||
    lower.includes('dawae') ||
    lower.includes('aushadh') ||
    lower.includes('pesticide') ||
    lower.includes('dose') ||
    lower.includes('dosage') ||
    lower.includes('कवकनाशी') ||
    lower.includes('दवा') ||
    lower.includes('औषध') ||
    lower.includes('फवारणी औषध')
  ) {
    if (normCrop.includes('sugarcane') || normDisease.includes('red rot')) {
      return {
        text: `For ${disease} on ${crop}, Carbendazim 50% WP @ 2g/L or Thiophanate-methyl 70% WP @ 1.5g/L is recommended as a sett dip and root drench. Ensure the soil has good drainage before application, and avoid spraying during high noon heat.`,
        textHi: `गन्ने में लाल सड़न (${disease}) के लिए, कार्बेन्डाजिम 50% डब्ल्यूपी (2 ग्राम/लीटर) या थायोफेनेट-मिथाइल (1.5 ग्राम/लीटर) से जड़ क्षेत्र का उपचार करें। दवा डालने से पहले खेत में जल निकासी सुनिश्चित करें और दोपहर की तेज धूप में छिड़काव न करें।`,
        textMr: `उसातील ${disease} रोगासाठी कार्बेन्डाझिम ५०% डब्ल्यूपी (२ ग्रॅम/लिटर) किंवा थायोफिनेट मिथाईल (१.५ ग्रॅम/लिटर) ची आळवणी करावी. शेतात पाण्याचा निचरा सुरळीत ठेवा आणि दुपारच्या कडक उन्हात फवारणी करू नका.`,
      };
    }

    if (normCrop.includes('wheat') || normDisease.includes('rust')) {
      return {
        text: `For ${disease} on ${crop}, Propiconazole 25% EC (Tilt) @ 1 ml/L or Tebuconazole 25.9% EC @ 1 ml/L is highly effective. Spray in the morning when the wind is calm and leaves are dry, mixing with a non-ionic sticker.`,
        textHi: `गेहूं में पीला रतुआ (${disease}) के लिए, प्रोपिकोनाज़ोल 25% ईसी (1 मिली/लीटर) या टेबुकोनाज़ोल (1 मिली/लीटर) बहुत प्रभावी है। सुबह के समय जब हवा शांत हो और पत्तियां सूखी हों, स्टीकर मिलाकर छिड़काव करें।`,
        textMr: `गहू पिकातील तांबेरा (${disease}) नियंत्रणासाठी प्रोपिकोनाझोल २५% ईसी (१ मिली/लिटर) किंवा टेबुकोनाझोल (१ मिली/लिटर) अत्यंत प्रभावी आहे. हवा शांत असताना व पाने कोरडी असताना स्टिकर मिसळून फवारा.`,
      };
    }

    if (normCrop.includes('soybean') || normDisease.includes('mosaic')) {
      return {
        text: `Because Yellow Mosaic on ${crop} is viral, fungicides will not cure it directly—you must control the whitefly vector. Spray Thiamethoxam 25% WG @ 0.5g/L or Acetamiprid 20% SP @ 0.3g/L. If fungal spots coexist, add Mancozeb @ 2g/L.`,
        textHi: `सोयाबीन में येलो मोज़ेक वायरस जनित है, इसलिए कवकनाशी सीधे असर नहीं करेगा—आपको सफेद मक्खी पर नियंत्रण करना होगा। थायामेथॉक्सम 25% डब्ल्यूजी (0.5 ग्राम/लीटर) या एसिटामिप्रिड का छिड़काव करें। फंगल धब्बे हों तो साथ में मैंकोजेब मिलाएं।`,
        textMr: `सोयाबीनवरील पिवळा मोज़ेक हा विषाणूजन्य असल्याने बुरशीनाशकाने थेट बरा होत नाही—त्यासाठी पांढऱ्या माशीचे नियंत्रण आवश्यक आहे. थायामेथोक्साम २५% डब्ल्यूजी (०.५ ग्रॅम/लिटर) फवारा. बुरशीचे डाग असल्यास मॅन्कोझेब मिसळा.`,
      };
    }

    // Default Tomato / General
    return {
      text: `For ${disease} on ${crop}, apply Copper Oxychloride 50% WP @ 2.5g/L or Mancozeb 75% WP @ 2g/L water on dry foliage. Always include an agricultural wetting agent/sticker and do not spray under extreme heat or before rains.`,
      textHi: `${crop} में ${disease} के लिए, सूखी पत्तियों पर कॉपर ऑक्सीक्लोराइड (2.5 ग्राम/लीटर) या मैंकोजेब (2 ग्राम/लीटर) का छिड़काव स्टीकर मिलाकर करें। तेज धूप या बारिश से तुरंत पहले छिड़काव न करें।`,
      textMr: `${crop} पिकातील ${disease} साठी कोरड्या पानांवर स्टिकरसह कॉपर ऑक्सिक्लोराईड (२.५ ग्रॅम/लिटर) किंवा मॅन्कोझेब (२ ग्रॅम/लिटर) फवारा. कडक ऊन किंवा पावसापूर्वी फवारणी टाळा.`,
    };
  }

  // =========================================================================
  // LEVEL 4: ORGANIC / BIO ALTERNATIVES
  // =========================================================================
  if (
    lower.includes('organic') ||
    lower.includes('neem') ||
    lower.includes('bio') ||
    lower.includes('trichoderma') ||
    lower.includes('jaivik') ||
    lower.includes('sendriya') ||
    lower.includes('natural') ||
    lower.includes('desi') ||
    lower.includes('जैविक') ||
    lower.includes('सेंद्रिय')
  ) {
    return {
      text: `For organic management on ${crop}, spray Trichoderma viride @ 5g/L or 5% Neem Seed Kernel Extract (NSKE) in the late afternoon. This biologically suppresses ${disease} without damaging beneficial pollinators or soil microbes.`,
      textHi: `${crop} के जैविक प्रबंधन के लिए, शाम के समय ट्राइकोडर्मा विरिडी (5 ग्राम/लीटर) या 5% नीम बीज अर्क (NSKE) का छिड़काव करें। यह मिट्टी और मित्र कीटों को नुकसान पहुँचाए बिना ${disease} को रोकता है।`,
      textMr: `${crop} च्या सेंद्रिय नियंत्रणासाठी संध्याकाळी ट्रायकोडर्मा व्हिरिडी (५ ग्रॅम/लिटर) किंवा ५% निंबोळी अर्काची फवारणी करा. यामुळे मित्र कीटकांना इजा न पोहोचता ${disease} रोगाचा प्रसार थांबतो.`,
    };
  }

  // =========================================================================
  // LEVEL 4: WEATHER & SPRAY TIMING
  // =========================================================================
  if (
    lower.includes('rain') ||
    lower.includes('spray before rain') ||
    lower.includes('weather') ||
    lower.includes('humidity') ||
    lower.includes('wind') ||
    lower.includes('timing') ||
    lower.includes('when to spray') ||
    lower.includes('बारिश') ||
    lower.includes('पाऊस') ||
    lower.includes('हवामान')
  ) {
    const rainChance = context.rainChance ?? 60;
    const humidity = context.humidity ?? 78;

    return {
      text: `With ${humidity}% humidity and a ${rainChance}% rain chance in your area, only spray when foliage is completely dry. If rainfall is expected within 3-4 hours, delay spraying to prevent chemical wash-off, and always add a spreader/sticker.`,
      textHi: `आपके क्षेत्र में ${humidity}% आर्द्रता और ${rainChance}% बारिश की संभावना को देखते हुए, केवल सूखी पत्तियों पर ही छिड़काव करें। यदि अगले 3-4 घंटे में बारिश का अंदेशा हो तो छिड़काव टालें और घोल में स्टीकर जरूर मिलाएं।`,
      textMr: `आपल्या भागात ${humidity}% दमट हवामान आणि ${rainChance}% पावसाची शक्यता असल्याने पाने पूर्णपणे कोरडी असतानाच फवारणी करा. पुढील ३-४ तासांत पाऊस येणार असल्यास फवारणी थांबवा आणि स्टिकर नक्की वापरा.`,
    };
  }

  // =========================================================================
  // LEVEL 4: IS IT SERIOUS / WILL IT SPREAD?
  // =========================================================================
  if (
    lower.includes('dangerous') ||
    lower.includes('serious') ||
    lower.includes('spread') ||
    lower.includes('fatal') ||
    lower.includes('loss') ||
    lower.includes('damage') ||
    lower.includes('nuksan') ||
    lower.includes('dhoka') ||
    lower.includes('नुकसान') ||
    lower.includes('धोका')
  ) {
    return {
      text: `At ${severity} severity, ${disease} in ${crop} poses a moderate-to-high risk to crop yield if untreated. However, taking prompt IPM measures—removing initial infected foliage and applying a protective spray—will effectively contain the spread.`,
      textHi: `${severity} गंभीरता पर, ${crop} में ${disease} बिना उपचार के फसल को नुकसान पहुँचा सकता है। हालांकि, समय पर संक्रमित पत्तियों को नष्ट करने और सुरक्षात्मक छिड़काव से रोग को आसानी से नियंत्रित किया जा सकता है।`,
      textMr: `${severity} प्रादुर्भावात, ${crop} पिकातील ${disease} रोगावर वेळीच उपाय न केल्यास उत्पादनात घट होऊ शकते. परंतु सुरुवातीची बाधित पाने काढून संरक्षणात्मक फवारणी केल्यास हा रोग नक्की आटोक्यात येतो.`,
    };
  }

  // =========================================================================
  // LEVEL 5: UNCLEAR / AMBIGUOUS MESSAGES (Polite Clarification)
  // =========================================================================
  if (lower.length <= 4 || lower === '?' || lower === 'help' || lower === 'kya' || lower === 'kay') {
    return {
      text: `Could you tell me a little more about what you're seeing in your ${crop} field? For example, are you noticing spots, leaf wilting, insects, or yellow leaves?`,
      textHi: `क्या आप मुझे थोड़ा और बता सकते हैं कि आप अपने ${crop} के खेत में क्या देख रहे हैं? उदाहरण के लिए, क्या पत्तियों पर धब्बे, मुरझाना, कीड़े या पीलापन दिखाई दे रहा है?`,
      textMr: `आपण आपल्या ${crop} शेतात नेमके काय पाहत आहात याबद्दल थोडी अधिक माहिती देऊ शकाल का? उदाहरणार्थ, पानांवर डाग, झाडे सुकणे, कीड किंवा पाने पिवळी पडणे असे काही दिसत आहे का?`,
    };
  }

  // =========================================================================
  // LEVEL 6: GENERAL OPEN QUESTIONS (Helpful Contextual Guidance)
  // =========================================================================
  return {
    text: `I'm here to help with your ${crop} farming concerns. You can ask me about crop health, symptoms of ${disease}, chemical or organic spray schedules, weather risks, irrigation, or pest management. What would you like to know?`,
    textHi: `मैं आपकी ${crop} की खेती से जुड़े सवालों में मदद के लिए उपलब्ध हूँ। आप मुझसे फसल के स्वास्थ्य, ${disease} के लक्षणों, जैविक या रासायनिक छिड़काव, मौसम के जोखिम या कीट नियंत्रण के बारे में पूछ सकते हैं। आप क्या जानना चाहते हैं?`,
    textMr: `मी आपल्या ${crop} शेतीशी संबंधित सर्व प्रश्नांसाठी येथे उपस्थित आहे. आपण मला पिकाचे आरोग्य, ${disease} ची लक्षणे, सेंद्रिय किंवा रासायनिक फवारणी, हवामानाचा धोका किंवा कीड नियंत्रणाबाबत विचारू शकता. आपल्याला काय जाणून घ्यायचे आहे?`,
  };
}

// In-memory per-user chat sessions (isolated per user key to prevent cross-contamination)
const userChatSessions: Record<string, ChatMessage[]> = {};

export const expertService = {
  // ---------------- Backend Expert Review API ----------------
  async getPendingCases(): Promise<PendingCase[]> {
    try {
      const res = await apiClient<{ success: boolean; data: PendingCase[] }>('/expert/cases/pending');
      return res.data || [];
    } catch (err) {
      console.warn('[expertService] Failed to fetch pending cases:', err);
      return [];
    }
  },

  async getCaseDetails(caseId: string): Promise<{ case: PendingCase; reviews: any[] } | null> {
    try {
      const res = await apiClient<{ success: boolean; data: { case: PendingCase; reviews: any[] } }>(
        `/expert/cases/${caseId}`
      );
      return res.data || null;
    } catch (err) {
      console.warn(`[expertService] Failed to fetch case ${caseId}:`, err);
      return null;
    }
  },

  async submitReview(review: ExpertReviewSubmission): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await apiClient<{ success: boolean; data: any; message?: string }>('/expert/review', {
        method: 'POST',
        body: JSON.stringify(review),
      });
      return { success: true, data: res.data };
    } catch (err: any) {
      console.warn('[expertService] Failed to submit expert review:', err);
      return { success: false, message: err.message || 'Submission failed' };
    }
  },

  // ---------------- Farmer Interactive Chat & Consultation ----------------
  async getExpertProfile(): Promise<ExpertProfile> {
    try {
      return await apiClient<ExpertProfile>('/expert/profile');
    } catch {
      return MOCK_EXPERT;
    }
  },

  /**
   * Returns isolated chat messages for the active user context.
   * Cleans and resets when user or crop changes.
   */
  getMessagesForUser(userKey: string, context: ExpertChatContext): ChatMessage[] {
    const key = `${userKey}_${context.cropName}_${context.diseaseName}`;
    if (!userChatSessions[key] || userChatSessions[key].length === 0) {
      userChatSessions[key] = [createInitialGreeting(context)];
    }
    return [...userChatSessions[key]];
  },

  async getMessages(): Promise<ChatMessage[]> {
    return userChatSessions['default'] || [];
  },

  clearUserSession(userKey: string): void {
    for (const k of Object.keys(userChatSessions)) {
      if (k.startsWith(userKey)) {
        delete userChatSessions[k];
      }
    }
  },

  /**
   * Send a farmer message and generate an intelligent, context-aware agricultural response.
   * Priority:
   *   1. If Anthropic API key configured and reachable, attempt online LLM.
   *   2. If not configured or if network fails, execute intelligent local response engine.
   *   3. Casual greetings and common queries NEVER return "temporarily offline"!
   */
  async sendMessage(
    text: string,
    context?: ExpertChatContext,
    messageId?: string,
    userKey: string = 'default'
  ): Promise<ChatMessage[]> {
    const activeContext: ExpertChatContext = context || {
      cropName: 'Tomato',
      diseaseName: 'Early Blight',
      severity: 'moderate',
      language: 'en',
    };

    const sessionKey = `${userKey}_${activeContext.cropName}_${activeContext.diseaseName}`;
    if (!userChatSessions[sessionKey]) {
      userChatSessions[sessionKey] = [createInitialGreeting(activeContext)];
    }

    const session = userChatSessions[sessionKey];

    const farmerMsg: ChatMessage = {
      id: messageId || `msg-${Date.now()}`,
      sender: 'farmer',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    session.push(farmerMsg);

    // 1. Attempt optional remote LLM if an API key is available
    let remoteSuccess = false;
    let remoteReplyText = '';

    const apiKey =
      (import.meta as any).env?.VITE_ANTHROPIC_API_KEY ||
      (typeof localStorage !== 'undefined'
        ? localStorage.getItem('ANTHROPIC_API_KEY') || localStorage.getItem('VITE_ANTHROPIC_API_KEY')
        : '') ||
      '';

    if (apiKey) {
      try {
        const systemPrompt = buildExpertSystemPrompt(activeContext);
        const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

        for (const msg of session) {
          if (msg.id === 'm1') continue;
          const role = msg.sender === 'farmer' ? 'user' : 'assistant';
          const content = msg.text;
          if (!content) continue;

          if (conversationHistory.length === 0 && role !== 'user') continue;

          const prev = conversationHistory[conversationHistory.length - 1];
          if (prev && prev.role === role) {
            prev.content += `\n${content}`;
          } else {
            conversationHistory.push({ role, content });
          }
        }

        if (conversationHistory.length === 0 || conversationHistory[conversationHistory.length - 1].role !== 'user') {
          conversationHistory.push({ role: 'user', content: text });
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 1024,
            system: systemPrompt,
            messages: conversationHistory,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          remoteReplyText =
            data.content?.find((c: any) => c.type === 'text')?.text ||
            data.content?.[0]?.text ||
            '';
          if (remoteReplyText) remoteSuccess = true;
        }
      } catch {
        // Fall through to local intelligent engine gracefully
      }
    }

    // 2. Local Intelligent Response Engine (Always responsive, conversational, and agricultural)
    if (!remoteSuccess) {
      const intelligentReply = generateIntelligentExpertResponse(text, activeContext);

      const replyMsg: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'expert',
        text: intelligentReply.text,
        textHi: intelligentReply.textHi,
        textMr: intelligentReply.textMr,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      session.push(replyMsg);
    } else {
      const replyMsg: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'expert',
        text: remoteReplyText,
        textHi: activeContext.language === 'hi' ? remoteReplyText : undefined,
        textMr: activeContext.language === 'mr' ? remoteReplyText : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      session.push(replyMsg);
    }

    return [...session];
  },
};
