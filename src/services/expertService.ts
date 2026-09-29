import type { ExpertProfile, ChatMessage, ActionItem, SeverityLevel } from '../types';
import { apiClient } from './apiClient';
import { MOCK_EXPERT, MOCK_CHAT_MESSAGES } from './mockData';
import { getExpertInitialGreeting } from '../i18n/translations';

export interface ExpertChatContext {
  farmerName?: string;
  farmName?: string;
  cropName?: string;
  diseaseName?: string;
  cropNameEn?: string;
  cropNameHi?: string;
  cropNameMr?: string;
  diseaseNameEn?: string;
  diseaseNameHi?: string;
  diseaseNameMr?: string;
  pathogen?: string;
  severity?: SeverityLevel;
  detectedAt?: string;
  daysSinceDiagnosis?: number;
  humidity?: number;
  rainChance?: number;
  rainfallStatus?: string;
  temperature?: number;
  riskSummary?: string;
  riskLevel?: SeverityLevel;
  variety?: string;
  cropStage?: string;
  village?: string;
  district?: string;
  state?: string;
  whatToDoToday?: ActionItem[];
  language?: 'en' | 'hi' | 'mr';
}

export function calculateDaysSinceDiagnosis(detectedAt?: string): number {
  if (!detectedAt) return 0;
  if (detectedAt.toLowerCase().includes('today')) return 0;
  if (detectedAt.toLowerCase().includes('yesterday')) return 1;
  const d = new Date(detectedAt);
  if (isNaN(d.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / (1000 * 3600 * 24)));
}

export const expertService = {
  async getExpertProfile(): Promise<ExpertProfile> {
    try {
      const res = await apiClient<{ success: boolean; data: ExpertProfile }>('/expert/profile');
      if (res.data) return res.data;
    } catch { }
    return MOCK_EXPERT;
  },

  getMessagesForUser(_userKey: string, ctx: ExpertChatContext): ChatMessage[] {
    const lang = ctx.language || 'mr';
    const greeting = getExpertInitialGreeting(lang, ctx.farmerName, ctx.cropName);

    return [
      {
        id: 'initial-greeting',
        sender: 'expert',
        text: greeting,
        textHi: getExpertInitialGreeting('hi', ctx.farmerName, ctx.cropNameHi || ctx.cropName),
        textMr: getExpertInitialGreeting('mr', ctx.farmerName, ctx.cropNameMr || ctx.cropName),
        timestamp: 'Just now',
      },
      ...MOCK_CHAT_MESSAGES.slice(1),
    ];
  },

  async sendMessage(userMessage: string, ctx: ExpertChatContext): Promise<ChatMessage> {
    const lang = ctx.language || 'mr';
    const textLower = userMessage.toLowerCase();

    let replyEn = `Thank you for sharing the symptoms. As Veterinary Officer, I recommend isolating the animal, providing clean fresh water with electrolytes, and strictly avoiding any self-injections before an official physical examination. If fever exceeds 103°F, call our Mobile Veterinary Unit at 1962.`;
    let replyHi = `लक्षण साझा करने के लिए धन्यवाद। पशु चिकित्सा अधिकारी के रूप में मेरी सलाह है कि पशु को अलग बांधें, साफ पानी में इलेक्ट्रोलाइट दें और बिना डॉक्टर की जांच के कोई भी इंजेक्शन न लगाएं। यदि बुखार 103°F से अधिक हो तो 1962 पर कॉल करें।`;
    let replyMr = `लक्षणे सांगितल्याबद्दल धन्यवाद. पशुवैद्यकीय अधिकारी म्हणून मी सल्ला देईन की जनावराला वेगळे बांधा, स्वच्छ पाण्यात ओआरएस/इलेक्ट्रोलाइट द्या आणि डॉक्टरांच्या सल्ल्याशिवाय कोणतेही इंजेक्शन देऊ नका. ताप १०३°F पेक्षा जास्त असल्यास १९६२ या हेल्पलाइनवर संपर्क करा.`;

    if (textLower.includes('dawa') || textLower.includes('medicine') || textLower.includes('औषध') || textLower.includes('दवा')) {
      replyEn = `For early first aid, you may apply turmeric-aloe vera paste on swelling or wash wounds with 1% potassium permanganate. For prescription antibiotics or IV fluids, an in-person veterinary check is compulsory.`;
      replyHi = `प्राथमिक उपचार के लिए आप सूजन पर हल्दी-एलोवेरा का लेप लगा सकते हैं व घावों को पोटाश पानी से धो सकते हैं। एंटीबायोटिक दवाओं के लिए डॉक्टर की प्रत्यक्ष जांच अनिवार्य है।`;
      replyMr = `प्राथमिक उपचारासाठी आपण कासेवर किंवा सुजेवर हळद-कोरफडीचा लेप लावू शकता. अँटिबायोटिक औषधांसाठी प्रत्यक्ष डॉक्टरांची तपासणी आवश्यक आहे.`;
    }

    if (textLower.includes('vaccin') || textLower.includes('tika') || textLower.includes('लस') || textLower.includes('टीका')) {
      replyEn = `Government compulsory vaccination for Foot & Mouth Disease (FMD) is administered every 6 months, and Lumpy Skin Disease (Goat Pox) annually. Contact your local veterinary dispensary for free vaccination drives.`;
      replyHi = `खुरपका-मुंहपका (FMD) का टीका हर 6 महीने में और लंपी (गोट पॉक्स) का टीका साल में एक बार लगाया जाता है। सरकारी मुफ्त टीकाकरण हेतु अपने नजदीकी पशु औषधालय से संपर्क करें।`;
      replyMr = `लाळ्या खुरकूत (FMD) लस दर ६ महिन्यांनी आणि लंपी लस वर्षातून एकदा दिली जाते. शासकीय मोफत लसीकरणासाठी स्थानिक पशुवैद्यकीय दवाखान्याशी संपर्क साधा.`;
    }

    return {
      id: `expert-reply-${Date.now()}`,
      sender: 'expert',
      text: lang === 'mr' ? replyMr : lang === 'hi' ? replyHi : replyEn,
      textHi: replyHi,
      textMr: replyMr,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  },
};
