import type { ExpertProfile, ChatMessage } from '../types';
import { apiClient } from './apiClient';
import { MOCK_EXPERT, INITIAL_EXPERT_MESSAGES } from './mockData';

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
  cropName: string;
  diseaseName: string;
  cropNameEn?: string;
  diseaseNameEn?: string;
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
- Diagnosed Crop: ${ctx.cropName}${ctx.cropNameEn && ctx.cropNameEn !== ctx.cropName ? ` (${ctx.cropNameEn})` : ''}
- Diagnosed Disease: ${ctx.diseaseName}${ctx.diseaseNameEn && ctx.diseaseNameEn !== ctx.diseaseName ? ` (${ctx.diseaseNameEn})` : ''}${ctx.pathogen ? ` [Pathogen: ${ctx.pathogen}]` : ''}
- Severity Level: ${ctx.severity}
- Days Since Diagnosis: ${ctx.daysSinceDiagnosis || '0 days (diagnosed today)'}
- Recent Weather Conditions & Risk Forecast:
  * Relative Humidity: ${ctx.humidity ?? 78}%
  * Rain Probability: ${ctx.rainChance ?? 60}%
  * Rainfall Forecast: ${ctx.rainfallStatus || 'Rain expected'}
  * Ambient Temperature: ${ctx.temperature ? `${ctx.temperature}°C` : '26°C'}
  * Risk Level: ${ctx.riskLevel || ctx.severity}
  * Advisory Summary: ${ctx.riskSummary || 'Elevated fungal infection pressure.'}

BEHAVIORAL INSTRUCTIONS:
1. Role-play as Dr. R. Patil, a compassionate, practical agronomist reviewing this specific case.
2. If the farmer types an off-script message like a greeting ("hello", "hi", "namaste", "ram ram"), greet them warmly in return, acknowledge their ${ctx.cropName} (${ctx.diseaseName}) case, and ask how you can help them manage their crop today. Do not jump to unrequested fungicide advice unless asked.
3. Keep answers concise: strictly 2 to 4 sentences. Make them simple, clear, and farmer-readable, avoiding complex academic terminology.
4. Default to Integrated Pest Management (IPM)-first advice (e.g. field sanitation, removing infected foliage, bio-agents like Trichoderma viride or 5% Neem seed kernel extract) before recommending chemical treatments.
5. If chemical treatment or spraying is discussed, ALWAYS consider the weather conditions: warn that high humidity fosters fungal spread, and if rain is approaching, recommend applying when leaves are dry with an agricultural sticker/spreader or waiting until after heavy rain.
6. Ground all advice directly in this farmer's specific crop, disease, and weather conditions.
7. LANGUAGE REQUIREMENT: You MUST respond ENTIRELY in ${targetLanguage}. Do not provide an English translation or preamble if replying in Hindi or Marathi. Use natural, respectful phrasing appropriate for rural farmers.`;
}

function getFallbackResponse(
  userText: string,
  context?: ExpertChatContext
): { text: string; textHi?: string; textMr?: string } {
  const lang = context?.language || 'en';
  const crop = context?.cropName || 'crop';
  const disease = context?.diseaseName || 'disease';
  const lower = userText.toLowerCase();

  const isGreeting =
    lower.includes('hello') ||
    lower.includes('hi') ||
    lower.includes('hey') ||
    lower.includes('namaste') ||
    lower.includes('नमस्ते') ||
    lower.includes('नमस्कार') ||
    lower.includes('राम राम');

  if (isGreeting) {
    if (lang === 'hi') {
      const msg = `नमस्ते! मैं डॉ. आर. पाटिल हूँ। मैं आपके ${crop} में ${disease} के मामले की समीक्षा कर रहा हूँ। आज मैं आपकी फसल के लिए क्या सहायता कर सकता हूँ?`;
      return { text: msg, textHi: msg };
    }
    if (lang === 'mr') {
      const msg = `नमस्कार! मी डॉ. आर. पाटील. मी आपल्या ${crop} पिकावरील ${disease} रोगाची पाहणी करत आहे. आज आपल्या पिकाच्या आरोग्यासाठी मी काय मदत करू शकतो?`;
      return { text: msg, textMr: msg };
    }
    const msg = `Hello! Dr. R. Patil here. I am reviewing your ${crop} case (${disease}). How can I assist you with your field today?`;
    return { text: msg };
  }

  if (
    lower.includes('rain') ||
    lower.includes('spray') ||
    lower.includes('पाऊस') ||
    lower.includes('बारिश') ||
    lower.includes('छिड़काव') ||
    lower.includes('फवारणी')
  ) {
    if (lang === 'hi') {
      const msg = `आगामी बारिश और उच्च आर्द्रता को देखते हुए, केवल सूखी पत्तियों पर ही छिड़काव करें। दवा को धुलने से बचाने के लिए घोल में स्टीकर अवश्य मिलाएं और भारी बारिश से पहले छिड़काव न करें।`;
      return { text: msg, textHi: msg };
    }
    if (lang === 'mr') {
      const msg = `पावसाची शक्यता आणि जास्त आर्द्रता लक्षात घेता, झाडांची पाने कोरडी असतानाच फवारणी करा. औषध वाहून जाऊ नये म्हणून द्रावणात स्टिकर नक्की वापरा आणि जोराचा पाऊस येण्यापूर्वी फवारणी टाळा.`;
      return { text: msg, textMr: msg };
    }
    const msg = `Given the upcoming rain and high humidity, ensure foliage is completely dry before spraying. Always add an agricultural sticker/spreader to prevent wash-off, and avoid spraying immediately before heavy rainfall.`;
    return { text: msg };
  }

  if (
    lower.includes('organic') ||
    lower.includes('जैविक') ||
    lower.includes('सेंद्रिय') ||
    lower.includes('alternative')
  ) {
    if (lang === 'hi') {
      const msg = `जैविक उपचार के लिए, शाम के समय ट्राइकोडर्मा विरिडी (5 ग्राम/लीटर) या 5% नीम बीज अर्क (NSKE) का छिड़काव करें। यह फसल को नुकसान पहुँचाए बिना रोगजनक को दबाने में मदद करता है।`;
      return { text: msg, textHi: msg };
    }
    if (lang === 'mr') {
      const msg = `सेंद्रिय नियंत्रणासाठी संध्याकाळच्या वेळी ट्रायकोडर्मा व्हिरिडी (५ ग्रॅम/लिटर) किंवा ५% निंबोळी अर्काची फवारणी करा. यामुळे पर्यावरणाला हानी न पोहोचता बुरशीचा प्रसार रोखता येतो.`;
      return { text: msg, textMr: msg };
    }
    const msg = `For organic management, spray Trichoderma viride @ 5g/L water or 5% Neem Seed Kernel Extract (NSKE) in the late afternoon. This biologically suppresses pathogen spread while protecting your soil health.`;
    return { text: msg };
  }

  if (
    lower.includes('fungicide') ||
    lower.includes('दवा') ||
    lower.includes('औषध') ||
    lower.includes('बुरशीनाशक') ||
    lower.includes('कवकनाशी')
  ) {
    if (lang === 'hi') {
      const msg = `शुरुआती अवस्था में पहले ट्राइकोडर्मा जैसे जैविक नियंत्रण का उपयोग करें। यदि संक्रमण अधिक है, तो सूखी पत्तियों पर मैन्कोजेब (2 ग्राम/लीटर) का सुरक्षात्मक छिड़काव स्टीकर के साथ करें।`;
      return { text: msg, textHi: msg };
    }
    if (lang === 'mr') {
      const msg = `सुरुवातीला ट्रायकोडर्मासारख्या जैविक घटकांचा वापर करा. प्रादुर्भाव वाढल्यास कोरड्या पानांवर मॅन्कोझेब (२ ग्रॅम/लिटर) स्टिकरसह संरक्षणात्मक फवारा घ्या.`;
      return { text: msg, textMr: msg };
    }
    const msg = `Start with bio-controls like Trichoderma viride. If severity remains elevated, apply a contact protective fungicide like Mancozeb @ 2g/L water on dry foliage along with an agricultural spreader.`;
    return { text: msg };
  }

  if (lang === 'hi') {
    const msg = `सलाहकार सर्वर से जुड़ने में कुछ विलंब हो रहा है। आपके ${crop} में ${disease} के लिए, पहले संक्रमित पत्तियों को नष्ट करें और बारिश के दौरान अतिरिक्त नमी न जमने दें। कृपया कुछ क्षण बाद पुनः पूछें।`;
    return { text: msg, textHi: msg };
  }
  if (lang === 'mr') {
    const msg = `सल्लागार नेटवर्कशी संपर्क साधण्यात तात्पुरता विलंब होत आहे. आपल्या ${crop} पिकातील ${disease} रोगासाठी बाधित पाने काढून टाका आणि शेतात पाण्याचा निचरा योग्य ठेवा. कृपया थोड्या वेळाने पुन्हा संपर्क साधा.`;
    return { text: msg, textMr: msg };
  }
  const msg = `Dr. Patil's desk is temporarily offline. For your ${crop} (${disease}), practice IPM by clearing infected leaves and maintaining good field drainage before rains. Please try asking again shortly.`;
  return { text: msg };
}

let localMessages = [...INITIAL_EXPERT_MESSAGES];

export const expertService = {
  // ---------------- Backend Expert Review API ----------------
  /**
   * Fetch all cases awaiting agricultural expert review.
   * GET /api/expert/cases/pending
   */
  async getPendingCases(): Promise<PendingCase[]> {
    try {
      const res = await apiClient<{ success: boolean; data: PendingCase[] }>('/expert/cases/pending');
      return res.data || [];
    } catch (err) {
      console.warn('[expertService] Failed to fetch pending cases:', err);
      return [];
    }
  },

  /**
   * Fetch details of a single diagnosis case and prior expert reviews.
   * GET /api/expert/cases/:caseId
   */
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

  /**
   * Submit an expert diagnosis review.
   * POST /api/expert/review
   */
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

  async getMessages(): Promise<ChatMessage[]> {
    try {
      return await apiClient<ChatMessage[]>('/expert/messages');
    } catch {
      return localMessages;
    }
  },

  async sendMessage(
    text: string,
    context?: ExpertChatContext,
    messageId?: string
  ): Promise<ChatMessage[]> {
    const farmerMsg: ChatMessage = {
      id: messageId || `msg-${Date.now()}`,
      sender: 'farmer',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    localMessages.push(farmerMsg);

    const activeContext: ExpertChatContext = context || {
      cropName: 'Tomato',
      diseaseName: 'Early Blight',
      pathogen: 'Alternaria solani',
      severity: 'moderate',
      detectedAt: 'Today',
      daysSinceDiagnosis: '0 days (diagnosed today)',
      humidity: 78,
      rainChance: 60,
      rainfallStatus: 'Rain expected',
      temperature: 26,
      language: 'en',
    };

    const systemPrompt = buildExpertSystemPrompt(activeContext);

    // Build message history alternating 'user' and 'assistant', starting with 'user'
    const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    for (const msg of localMessages) {
      if (msg.id === 'm1') continue;
      const role = msg.sender === 'farmer' ? 'user' : 'assistant';
      const content = msg.text;
      if (!content) continue;

      if (conversationHistory.length === 0 && role !== 'user') {
        continue;
      }

      const prev = conversationHistory[conversationHistory.length - 1];
      if (prev && prev.role === role) {
        prev.content += `\n${content}`;
      } else {
        conversationHistory.push({ role, content });
      }
    }

    if (
      conversationHistory.length === 0 ||
      conversationHistory[conversationHistory.length - 1].role !== 'user'
    ) {
      conversationHistory.push({ role: 'user', content: text });
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      };

      const apiKey =
        (import.meta as any).env?.VITE_ANTHROPIC_API_KEY ||
        (typeof localStorage !== 'undefined'
          ? localStorage.getItem('ANTHROPIC_API_KEY') || localStorage.getItem('VITE_ANTHROPIC_API_KEY')
          : '') ||
        (typeof (globalThis as any).process !== 'undefined'
          ? (globalThis as any).process?.env?.ANTHROPIC_API_KEY
          : '') ||
        '';

      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          messages: conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Anthropic API request failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const replyText =
        data.content?.find((c: any) => c.type === 'text')?.text ||
        data.content?.[0]?.text ||
        '';

      if (!replyText) {
        throw new Error('No text content returned from Claude');
      }

      const replyMsg: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'expert',
        text: replyText,
        textHi: activeContext.language === 'hi' ? replyText : undefined,
        textMr: activeContext.language === 'mr' ? replyText : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      localMessages.push(replyMsg);
    } catch (err) {
      console.warn('[expertService] Real-time Anthropic call failed, using contextual agronomist fallback:', err);
      const fallback = getFallbackResponse(text, activeContext);
      const replyMsg: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'expert',
        text: fallback.text,
        textHi: fallback.textHi,
        textMr: fallback.textMr,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      localMessages.push(replyMsg);
    }

    return localMessages;
  },
};
