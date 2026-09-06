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

  async sendMessage(text: string): Promise<ChatMessage[]> {
    const farmerMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'farmer',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    localMessages.push(farmerMsg);

    try {
      const response = await apiClient<ChatMessage>('/expert/messages', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      localMessages.push(response);
    } catch {
      // Simulate intelligent agronomist auto-reply after short delay
      setTimeout(() => {
        let replyText =
          'Understood. Since high humidity and rain are approaching, prioritize applying Mancozeb or Copper Oxychloride spray on dry foliage. Avoid spraying right before heavy rainfall.';
        let replyTextMr =
          'समजले. आर्द्रता जास्त असल्याने आणि पावसाची शक्यता असल्याने कोरड्या पानांवर मॅन्कोझेब किंवा कॉपरची फवारणी करा. पाऊस सुरू होण्यापूर्वी फवारणी पूर्ण करा.';

        if (text.toLowerCase().includes('organic') || text.toLowerCase().includes('जैविक')) {
          replyText =
            'For organic control, prepare 5% Neem seed kernel extract (NSKE) or Trichoderma viride @ 5g/L water. Spray in late afternoon.';
          replyTextMr =
            'सेंद्रिय नियंत्रणासाठी ५% निंबोळी अर्क किंवा ट्रायकोडर्मा व्हिरिडी (५ ग्रॅम प्रति लिटर) संध्याकाळी फवारावे.';
        } else if (text.toLowerCase().includes('rain') || text.toLowerCase().includes('पाऊस')) {
          replyText =
            'Add an agricultural sticker/spreader (1ml/L) to prevent the fungicide from getting washed away by rain.';
          replyTextMr =
            'पावसामुळे औषध वाहून जाऊ नये म्हणून फवारणीच्या द्रावणात चांगल्या दर्जाचे स्टिकर (१ मिली प्रति लिटर) आवर्जून वापरा.';
        }

        const replyMsg: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          sender: 'expert',
          text: replyText,
          textMr: replyTextMr,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        localMessages.push(replyMsg);
      }, 1000);
    }

    return localMessages;
  },
};
