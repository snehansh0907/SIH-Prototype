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

  return `You are Dr. Ashok Kulkarni, B.V.Sc & A.H., Senior Veterinary Officer at the Department of Animal Husbandry, Govt. of Maharashtra (District Veterinary Polyclinic & Mobile Veterinary Unit 1962). You are advising a livestock owner regarding animal disease diagnosis, biosecurity, and emergency supportive care.

CASE CONTEXT:
- Livestock Owner: ${ctx.farmerName || 'Pashupalak'}
- Location: ${[ctx.village, ctx.district, ctx.state].filter(Boolean).join(', ') || 'Local Herd'}
- Species / Animal: ${ctx.cropName}${ctx.cropNameEn && ctx.cropNameEn !== ctx.cropName ? ` (${ctx.cropNameEn})` : ''}
- Breed / Herd Stage: ${ctx.cropStage || 'Milch Cattle / Herd'}
- Suspected Disease: ${ctx.diseaseName}${ctx.diseaseNameEn && ctx.diseaseNameEn !== ctx.diseaseName ? ` (${ctx.diseaseNameEn})` : ''}${ctx.pathogen ? ` [Pathogen: ${ctx.pathogen}]` : ''}
- Severity Level: ${ctx.severity}
- Days Since Symptom Onset: ${ctx.daysSinceDiagnosis || '0 days (diagnosed today)'}
- Bioclimatic Weather & Risk Factors:
  * Relative Humidity: ${ctx.humidity ?? 78}%
  * Ambient Temperature: ${ctx.temperature ? `${ctx.temperature}°C` : '28°C'}
  * Risk Level: ${ctx.riskLevel || ctx.severity}
  * Advisory Context: ${ctx.riskSummary || 'Elevated vector and outbreak pressure.'}

BEHAVIORAL INSTRUCTIONS:
1. Role-play as Dr. Ashok Kulkarni, an empathetic, highly experienced veterinary officer.
2. If the user sends casual greetings, respond warmly, acknowledge their animal (${ctx.cropName}) and suspected condition (${ctx.diseaseName}).
3. Keep answers concise: strictly 2 to 4 sentences. Make them simple, clear, and livestock-owner-readable.
4. Prioritize immediate biosecurity (isolation), antiseptic lesion wash (KMnO4 1:1000 or 1% baking soda), soft mash nutrition, and toll-free helpline 1962.
5. Emphasize that antibiotics or prescription drugs must be administered by a registered veterinarian, never over-the-counter self-dosing.
6. Reassure the owner about milk safety (boil milk thoroughly; LSD/FMD do not harm humans through boiled milk).
7. LANGUAGE REQUIREMENT: Respond ENTIRELY in ${targetLanguage}. Use respectful phrasing appropriate for rural livestock keepers.`;
}

/**
 * Generate initial dynamic greeting message tailored specifically to the authenticated livestock owner and animal.
 */
export function createInitialGreeting(context: ExpertChatContext): ChatMessage {
  const species = context.cropName || 'Livestock';
  const disease = context.diseaseName || 'Condition';
  const severity = context.severity || 'moderate';
  const name = context.farmerName ? ` ${context.farmerName}` : '';

  const sevMr = severity === 'high' ? 'गंभीर' : severity === 'moderate' ? 'मध्यम' : 'कमी';
  const sevHi = severity === 'high' ? 'गंभीर' : severity === 'moderate' ? 'मध्यम' : 'कम';

  return {
    id: 'm1',
    sender: 'expert',
    text: `Namaste${name}! I reviewed your ${species} health diagnosis (${disease} - ${severity}). How many animals in your shed are showing fever, nodules, or mouth ulcers, and have you isolated the sick animal?`,
    textHi: `नमस्ते${name}! मैंने आपके ${species} के स्वास्थ्य निदान (${disease} - ${sevHi}) की समीक्षा की है। आपके गोठे में कितने पशुओं में बुखार, त्वचा पर गांठे या मुंह के छाले हैं, और क्या आपने बीमार पशु को अलग कर दिया है?`,
    textMr: `नमस्कार${name}! मी आपल्या ${species} जनावरांचा तपासणी अहवाल पाहिला (${disease} - ${sevMr}). आपल्या गोठ्यातील किती जनावरांना ताप, अंगावर गाठी किंवा लाळ गळण्याचे लक्षण आहे, आणि बाधित जनावरास आपण वेगळे केले आहे का?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Intelligent Multi-Level Conversational Response Engine for Livestock Health.
 */
export function generateIntelligentExpertResponse(
  userText: string,
  context: ExpertChatContext
): { text: string; textHi: string; textMr: string } {
  const rawLower = (userText || '').trim().toLowerCase();
  const lower = rawLower.replace(/[?!.,;:]/g, ' ').replace(/\s+/g, ' ').trim();

  const species = context.cropName || 'animal';
  const disease = context.diseaseName || 'disease';
  const severity = context.severity || 'moderate';
  const name = context.farmerName ? ` ${context.farmerName}` : '';
  const normDisease = (context.diseaseNameEn || context.diseaseName || '').toLowerCase().trim();

  // =========================================================================
  // LEVEL 1: CASUAL INTENT & CONVERSATIONAL GREETINGS
  // =========================================================================
  if (
    lower === 'how are you' ||
    lower.startsWith('how are you') ||
    lower.includes('how r u') ||
    lower.includes('how are u') ||
    lower.includes('kaise ho') ||
    lower.includes('kasa ahes') ||
    lower.includes('kase ahat')
  ) {
    return {
      text: `Namaste${name}! I'm doing well, thank you 😊 I'm here to advise on your ${species}'s health and the suspected ${disease} condition. How is your animal's feeding and rumination today?`,
      textHi: `नमस्ते${name}! मैं बिल्कुल ठीक हूँ, पूछने के लिए धन्यवाद 😊 मैं यहाँ आपके ${species} के स्वास्थ्य और ${disease} की स्थिति में सहायता के लिए उपलब्ध हूँ। आज पशु का चारा खाना और जुगाली कैसी है?`,
      textMr: `नमस्कार${name}! मी व्यवस्थित आहे, विचारल्याबद्दल धन्यवाद 😊 मी आपल्या ${species} जनावराच्या ${disease} समस्येवर मार्गदर्शन करण्यासाठी येथे आहे. आज जनावराचे चारा खाणे व रवंथ करणे व्यवस्थित आहे का?`,
    };
  }

  if (
    lower === 'hello' ||
    lower === 'hi' ||
    lower === 'hey' ||
    lower.startsWith('hello ') ||
    lower.startsWith('hi ') ||
    lower.includes('namaste') ||
    lower.includes('namaskar') ||
    lower.includes('नमस्ते') ||
    lower.includes('नमस्कार') ||
    lower.includes('राम राम')
  ) {
    return {
      text: `Namaste${name}! 👋 I'm Dr. Ashok Kulkarni, Senior Veterinary Officer. How can I help you care for your ${species} today?`,
      textHi: `नमस्ते${name}! 👋 मैं डॉ. अशोक कुलकर्णी, वरिष्ठ पशुचिकित्सा अधिकारी हूँ। आज आपके ${species} के उपचार में मैं क्या सहायता कर सकता हूँ?`,
      textMr: `नमस्कार${name}! 👋 मी डॉ. अशोक कुलकर्णी, वरिष्ठ पशुवैद्यकीय अधिकारी. आज आपल्या ${species} जनावराच्या उपचारासाठी मी काय मदत करू शकतो?`,
    };
  }

  if (
    lower === 'thank you' ||
    lower === 'thanks' ||
    lower.includes('thank you') ||
    lower.includes('thanks') ||
    lower.includes('dhanyawad') ||
    lower.includes('shukriya') ||
    lower.includes('धन्यवाद') ||
    lower.includes('आभार')
  ) {
    return {
      text: `You're welcome${name}! 😊 Keep the shed clean, monitor animal temperature, and dial toll-free 1962 if you notice worsening symptoms.`,
      textHi: `आपका स्वागत है${name}! 😊 गोठे को स्वच्छ रखें, पशु के तापमान पर नज़र रखें और लक्षण बिगड़ने पर 1962 टोल-फ्री पर संपर्क करें।`,
      textMr: `आपले स्वागत आहे${name}! 😊 गोठ्यात स्वच्छता ठेवा, जनावरांचे तापमान तपासा आणि काही अडचण आल्यास १९६२ टोल-फ्री क्रमांकावर नक्की संपर्क करा.`,
    };
  }

  if (
    lower.includes('who are you') ||
    lower.includes('who r u') ||
    lower.includes('who is dr kulkarni') ||
    lower.includes('kaun ho') ||
    lower.includes('tumhi kon aahat')
  ) {
    return {
      text: `I'm Dr. Ashok Kulkarni (B.V.Sc & A.H.), Senior Veterinary Officer at the Department of Animal Husbandry, Govt. of Maharashtra. I assist livestock owners with early disease triage, biosecurity, and emergency supportive treatment.`,
      textHi: `मैं डॉ. अशोक कुलकर्णी (B.V.Sc & A.H.) हूँ, पशुसंवर्धन विभाग, महाराष्ट्र शासन में वरिष्ठ पशुचिकित्सा अधिकारी। मैं पशुपालकों को रोग निदान, जैव-सुरक्षा और प्राथमिक उपचार में मार्गदर्शन करता हूँ।`,
      textMr: `मी डॉ. अशोक कुलकर्णी (B.V.Sc & A.H.) आहे, पशुसंवर्धन विभाग, महाराष्ट्र शासन येथे वरिष्ठ पशुवैद्यकीय अधिकारी. मी पशुपालकांना आजार निदान, गोठा स्वच्छता आणि तातडीच्या उपचारांचे मार्गदर्शन करतो.`,
    };
  }

  // =========================================================================
  // LEVEL 2 & 3: CONTEXT-AWARE ACTIONS ("What should I do?")
  // =========================================================================
  if (
    lower.includes('what should i do') ||
    lower.includes('what to do') ||
    lower.includes('next step') ||
    lower.includes('kya karu') ||
    lower.includes('kya kare') ||
    lower.includes('kay karu') ||
    lower.includes('action') ||
    lower.includes('उपाय') ||
    lower.includes('काय करू')
  ) {
    if (normDisease.includes('lumpy') || normDisease.includes('lsd') || normDisease.includes('nodule')) {
      return {
        text: `For Lumpy Skin Disease (${severity} severity): 1) Isolate the infected animal in an insect-proof stall immediately. 2) Clean nodular lesions with 1:1000 Potassium Permanganate (KMnO4) solution. 3) Apply herbal neem oil and turmeric paste on burst nodules. 4) Burn dried neem leaves at dusk to repel biting flies (Stomoxys). Call 1962 for Goat Pox ring vaccination of healthy herd members.`,
        textHi: `लम्पी त्वचा रोग (${severity} गंभीरता) के लिए: 1) बीमार पशु को तुरंत अलग मच्छरदानी वाले शेड में रखें। 2) त्वचा की गांठों को 1:1000 पोटेशियम परमैंगनेट घोल से साफ करें। 3) फूटी हुई गांठों पर नीम तेल व हल्दी का लेप लगाएं। 4) शाम को गोठे में कड़वे नीम की पत्तियों का धुआं करें और 1962 पर संपर्क कर स्वस्थ पशुओं का गोट पॉक्स टीकाकरण करवाएं।`,
        textMr: `लंपी चर्मरोगासाठी (${severity} प्रादुर्भाव): १) बाधित जनावरास निरोगी कळपापासून तात्काळ वेगळे करा. २) त्वचेवरील गाठी १:१००० पोटॅशियम परमँगनेटच्या पाण्याने स्वच्छ धुवा. ३) फुटलेल्या गाठींवर हळद व कडुनिंब तेलाचा लेप लावा. ४) चावणाऱ्या माश्या व डास रोखण्यासाठी गोठ्यात कडुनिंबाचा धूर करा आणि निरोगी जनावरांसाठी १९६२ वर गोट पॉक्स लस मागवा.`,
      };
    }

    if (normDisease.includes('foot') || normDisease.includes('fmd') || normDisease.includes('mouth')) {
      return {
        text: `For Foot-and-Mouth Disease (${severity} severity): 1) Segregate animal in a dry, clean area. 2) Gently wash mouth blisters with 1% Sodium Bicarbonate (baking soda) or 0.1% KMnO4 solution. 3) Walk animal through a 2% Copper Sulfate (CuSO4) antiseptic foot-bath twice daily. 4) Feed soft, cool cooked gruel (rice/maize mash with jaggery) because oral ulcers make chewing fodder painful.`,
        textHi: `खुरपका-मुंहपका (FMD - ${severity} गंभीरता) के लिए: 1) पशु को सूखे और साफ स्थान पर अलग करें। 2) मुंह के छालों को 1% सोडियम बाइकार्बोनेट (मीठा सोडा) या 0.1% KMnO4 घोल से धोएं। 3) खुरों के घावों को 2% कॉपर सल्फेट (नीला थोथा) के घोल से दिन में दो बार साफ करें। 4) पशु को दलिया या नरम मांड गुड़ मिलाकर दें क्योंकि मुंह में दर्द के कारण सूखा चारा खाना कठिन होता है।`,
        textMr: `लाळ्या खुरकूत आजारासाठी (${severity} प्रादुर्भाव): १) जनावरास कोरड्या व स्वच्छ जागेत वेगळे बांधा. २) तोंडातील फोड १% खाण्याचा सोडा (सोडियम बायकार्बोनेट) किंवा पोटॅशियम परमँगनेटच्या हलक्या पाण्याने धुवा. ३) पायांच्या खुरांमधील जखमा २% मोरचूद (कॉपर सल्फेट) द्रावणाने दिवसातून दोनदा स्वच्छ करा. ४) तोंडातील जखमांमुळे चारा चावता येत नसल्याने मऊ शिजवलेली पेज किंवा लापशी गुळ मिसळून खाऊ घाला.`,
      };
    }

    return {
      text: `For ${species} showing ${disease} symptoms: 1) Isolate the animal from the herd immediately to stop disease transmission. 2) Provide clean, cool drinking water with oral electrolytes. 3) Record body temperature using a rectal thermometer (normal: 101.5°F). 4) Disinfect the shed with lime powder and dial toll-free 1962 for veterinary examination.`,
      textHi: `${species} में ${disease} के लक्षणों के लिए: 1) संक्रमण रोकने के लिए बीमार पशु को तुरंत बाकी पशुओं से अलग करें। 2) इलेक्ट्रोल युक्त ताजा पानी दें। 3) गुदा थर्मामीटर से बुखार मापें (सामान्य: 101.5°F)। 4) गोठे में चूना छिड़कें और 1962 पर पशुचिकित्सक से परामर्श लें।`,
      textMr: `${species} मध्ये ${disease} लक्षणे दिसल्यास: १) रोगप्रसार रोखण्यासाठी बाधित जनावरास निरोगी कळपापासून तात्काळ वेगळे करा. २) मुबलक स्वच्छ पाणी व इलेक्ट्रोलाइट्स द्या. ३) जनावराचे तापमान थर्मामीटरने मोजा (सामान्य: १०१.५°F). ४) गोठ्यात चुन्याची भुकटी पसरवा आणि १९६२ वर शासकीय पशुवैद्यकीय अधिकाऱ्यांशी संपर्क साधा.`,
    };
  }

  // =========================================================================
  // LEVEL 4: ANTISEPTIC WASH & MEDICINE
  // =========================================================================
  if (
    lower.includes('antiseptic') ||
    lower.includes('wash') ||
    lower.includes('clean') ||
    lower.includes('kmno4') ||
    lower.includes('permanganate') ||
    lower.includes('soda') ||
    lower.includes('medicine') ||
    lower.includes('dawa') ||
    lower.includes('injection') ||
    lower.includes('औषध') ||
    lower.includes('दवा')
  ) {
    return {
      text: `For external lesion care: Use 1:1000 Potassium Permanganate (KMnO4 - pale pink water) for washing skin nodules. For mouth ulcers, use 1% Sodium Bicarbonate (10g baking soda in 1 litre boiled water). For foot wounds, use 2% Copper Sulfate. Never inject antibiotics without a prescription from a registered veterinarian.`,
      textHi: `घावों की सफाई के लिए: त्वचा की गांठों पर 1:1000 पोटेशियम परमैंगनेट (हल्का गुलाबी पानी) का प्रयोग करें। मुंह के छालों के लिए 1% मीठा सोडा (10 ग्राम प्रति लीटर पानी) और खुरों के लिए 2% नीला थोथा इस्तेमाल करें। बिना पशुचिकित्सक की पर्ची के कोई भी एंटीबायोटिक इंजेक्शन न लगाएं।`,
      textMr: `जखमांच्या स्वच्छतेसाठी: अंगावरील गाठी १:१००० पोटॅशियम परमँगनेटच्या हलक्या गुलाबी पाण्याने धुवा. तोंडातील फोडांसाठी १% खाण्याचा सोडा (१० ग्रॅम प्रति लिटर कोमट पाणी) आणि खुरांसाठी २% मोरचूद वापरा. पशुवैद्यकीय डॉक्टरांच्या सल्ल्याशिवाय कोणतेही अँटिबायोटिक इंजेक्शन स्वतः टोचू नका.`,
    };
  }

  // =========================================================================
  // LEVEL 4: VACCINE QUESTIONS
  // =========================================================================
  if (
    lower.includes('vaccine') ||
    lower.includes('vaccination') ||
    lower.includes('lasikaran') ||
    lower.includes('lasi') ||
    lower.includes('लस') ||
    lower.includes('टीका') ||
    lower.includes('टीकाकरण')
  ) {
    return {
      text: `Vaccination protocols: For Lumpy Skin Disease, healthy cattle and buffaloes in a 5 km ring receive Goat Pox vaccine (Uttarkashi strain, 3 ml s/c). For Foot-and-Mouth Disease, animals receive polyvalent inactivated oil adjuvant vaccine under the NADCP program every 6 months. Note: Never vaccinate actively sick animals showing fever.`,
      textHi: `टीकाकरण दिशा-निर्देश: लम्पी त्वचा रोग के लिए 5 किमी परिधि के स्वस्थ गोवंश को गोट पॉक्स टीका (3 मिली) लगाया जाता है। FMD के लिए राष्ट्रीय पशु रोग नियंत्रण कार्यक्रम (NADCP) के तहत हर 6 माह में तेल आधारित टीका दिया जाता है। ध्यान दें: बुखार वाले बीमार पशु को टीका न लगाएं।`,
      textMr: `लसीकरण नियम: लंपी चर्मरोगासाठी बाधित क्षेत्राच्या ५ किमी परिसरातील निरोगी जनावरांना गोट पॉक्स लस (३ मिली) दिली जाते. लाळ्या खुरकूत आजारासाठी राष्ट्रीय पशु रोग नियंत्रण (NADCP) अंतर्गत दर ६ महिन्यांनी लस टोचली जाते. टीप: ताप असलेल्या आजारी जनावरास लस टोचू नये.`,
    };
  }

  // =========================================================================
  // LEVEL 4: MILK SAFETY
  // =========================================================================
  if (
    lower.includes('milk') ||
    lower.includes('dudh') ||
    lower.includes('doodh') ||
    lower.includes('dairy') ||
    lower.includes('दूध')
  ) {
    return {
      text: `Milk safety: Milk from LSD or FMD affected animals is safe for human consumption after boiling at 100°C for at least 5 minutes. Do not feed unboiled milk to young calves. Milk yield may drop by 15-30% during fever, but recovers as lesions heal with adequate bypass fat and mineral mixtures.`,
      textHi: `दूध की सुरक्षा: लम्पी या FMD प्रभावित पशु का दूध कम से कम 5 मिनट अच्छी तरह उबालने के बाद पीने के लिए पूरी तरह सुरक्षित है। बिना उबला दूध छोटे बछड़ों को न पिलाएं। बुखार के दौरान दूध में 15-30% की गिरावट आ सकती है जो स्वस्थ होने पर ठीक हो जाती है।`,
      textMr: `दूध सुरक्षितता: लंपी किंवा लाळ्या खुरकूत झालेल्या जनावरांचे दूध किमान ५ मिनिटे उकळवून पिणे मानवी आरोग्यासाठी पूर्णपणे सुरक्षित आहे. न उकळलेले दूध लहान वासरांना पाजू नका. तापाच्या काळात दुधात १५-३०% घट होऊ शकते, जी नंतर पोषक आहाराने पूर्ववत होते.`,
    };
  }

  // =========================================================================
  // LEVEL 4: VECTOR CONTROL (FLIES, MOSQUITOES, TICKS)
  // =========================================================================
  if (
    lower.includes('fly') ||
    lower.includes('mosquito') ||
    lower.includes('tick') ||
    lower.includes('makkhi') ||
    lower.includes('machhar') ||
    lower.includes('gocheed') ||
    lower.includes('गोचीड') ||
    lower.includes('डास') ||
    lower.includes('माश्या')
  ) {
    return {
      text: `Vector management: Biting stable flies (Stomoxys calcitrans) and mosquitoes mechanically spread LSD. Hang insect-proof nylon nets around the shed, burn dried neem leaves with camphor at dusk, and apply diluted neem oil (5%) or cypermethrin around shed exterior walls. Keep dung dry and remove manure daily.`,
      textHi: `वाहक मक्खी व मच्छर नियंत्रण: चावने वाली मक्खियां (स्टोमोक्सिस) लम्पी वायरस फैलाती हैं। गोठे में जाली लगाएं, शाम को नीम की सूखी पत्ती व कपूर का धुआं करें। शेड की बाहरी दीवारों पर साइपरमेथ्रिन का छिड़काव करें और गोबर रोजाना साफ करें।`,
      textMr: `कीटक व डास नियंत्रण: चावणाऱ्या माश्या (स्टोमोक्सिस) आणि डास लंपी रोगाचा प्रसार करतात. गोठ्याभोवती डास प्रतिबंधक जाळी लावा, संध्याकाळी कडुनिंबाचा पाला व कापूरचा धूर करा. गोठ्याच्या बाहेरील भिंतींवर सायपरमेथ्रीन फवारा आणि शेण दररोज स्वच्छ करून गोठा कोरडा ठेवा.`,
    };
  }

  // =========================================================================
  // LEVEL 4: 1962 HELPLINE & GOVERNMENT SUPPORT
  // =========================================================================
  if (
    lower.includes('1962') ||
    lower.includes('helpline') ||
    lower.includes('hospital') ||
    lower.includes('doctor') ||
    lower.includes('vet') ||
    lower.includes('दवाखाना') ||
    lower.includes('डॉक्टर')
  ) {
    return {
      text: `Government Veterinary Support: Dial toll-free 1962 for Maharashtra's Mobile Veterinary Clinics. You can also visit your nearest Taluka Veterinary Dispensary (Pashuvaidyakiya Davakhana Grade-1) for free diagnostic swabs and supportive medication kits.`,
      textHi: `शासकीय पशुचिकित्सा सहायता: महाराष्ट्र शासन की सचल पशुचिकित्सा इकाई के लिए 1962 पर कॉल करें। आप निशुल्क जांच और प्राथमिक दवा किट के लिए अपने नजदीकी तालुका पशु चिकित्सालय (ग्रेड-1) से संपर्क कर सकते हैं।`,
      textMr: `शासकीय पशुवैद्यकीय मदत: महाराष्ट्र शासनाच्या फिरत्या पशुवैद्यकीय दवाखान्यासाठी १९६२ या टोल-फ्री क्रमांकावर संपर्क साधा. नजीकच्या तालुका पशुवैद्यकीय दवाखान्यात (श्रेणी-१) मोफत तपासणी व औषधोपचार उपलब्ध आहेत.`,
    };
  }

  // General Fallback
  return {
    text: `As your Veterinary Officer, I advise monitoring your ${species}'s body temperature, appetite, and water intake. Isolate any animal showing skin nodules or drooling, disinfect the shed, and dial 1962 for official veterinary assistance.`,
    textHi: `पशुचिकित्सा अधिकारी के रूप में मेरी सलाह है कि अपने ${species} के तापमान, भूख और पानी पीने पर नजर रखें। त्वचा पर गांठ या लार वाले पशु को अलग करें और 1962 पर संपर्क करें।`,
    textMr: `पशुवैद्यकीय अधिकारी म्हणून माझा सल्ला आहे की आपल्या ${species} जनावराचे तापमान, चारा खाणे आणि रवंथ तपासत राहा. लक्षणे दिसल्यास जनावरास वेगळे ठेवा, गोठा स्वच्छ ठेवा आणि १९६२ वर संपर्क साधा.`,
  };
}

const userChatSessions: Record<string, ChatMessage[]> = {};

export const expertService = {
  async getExpertProfile(): Promise<ExpertProfile> {
    try {
      const response = await apiClient<{ success: boolean; data: ExpertProfile }>('/expert/profile');
      if (response?.data) return response.data;
    } catch {}
    return MOCK_EXPERT;
  },

  getMessagesForUser(userKey: string, context: ExpertChatContext): ChatMessage[] {
    const sessionKey = `${userKey}-${context.cropName}-${context.diseaseName}`;
    if (!userChatSessions[sessionKey] || userChatSessions[sessionKey].length === 0) {
      const initial = createInitialGreeting(context);
      userChatSessions[sessionKey] = [initial];
    }
    return [...userChatSessions[sessionKey]];
  },

  async requestVerification(submission: {
    caseId: string;
    farmerId?: string;
    crop?: string;
    species?: string;
    disease?: string;
    imageUrl?: string;
    confidence?: number;
    severity?: string;
    notes?: string;
  }) {
    return apiClient('/expert/request', {
      method: 'POST',
      body: JSON.stringify(submission),
    });
  },

  async getCaseStatus(caseId: string) {
    return apiClient(`/expert/case/${caseId}/status`);
  },

  async sendMessage(
    text: string,
    activeContext: ExpertChatContext,
    userKey: string = 'demo-user',
    messageId?: string
  ): Promise<ChatMessage[]> {
    const sessionKey = `${userKey}-${activeContext.cropName}-${activeContext.diseaseName}`;
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

    // 1. Attempt server-side LLM if configured on backend
    let remoteSuccess = false;
    let remoteReplyText = '';

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

      const res = await apiClient<{ success: boolean; text?: string; fallback?: boolean }>('/expert/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: conversationHistory,
          systemPrompt,
        }),
      });

      if (res?.success && res.text) {
        remoteReplyText = res.text;
        remoteSuccess = true;
      }
    } catch {
      // Fall through to local intelligent engine
    }

    // 2. Local Intelligent Response Engine for Veterinary Health
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
