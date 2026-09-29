import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, PhoneCall, Sparkles, CheckCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { expertService, calculateDaysSinceDiagnosis, type ExpertChatContext } from '../../services/expertService';
import type { ExpertProfile, ChatMessage } from '../../types';
import { MOCK_EXPERT } from '../../services/mockData';
import { getExpertInitialGreeting } from '../../i18n/translations';
import { apiClient } from '../../services/apiClient';

export const ExpertConsultView: React.FC = () => {
  const { language, t } = useLanguage();
  const { diagnosis, setDiagnosis, weather, riskForecast, resetToHome, selectedFarm } = useCrop();
  const { user } = useAuth();

  const [expert, setExpert] = useState<ExpertProfile>(MOCK_EXPERT);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRequestingReview, setIsRequestingReview] = useState(false);
  const [reviewCaseId, setReviewCaseId] = useState<string | null>(diagnosis.id || 'case-1');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const cropName =
    language === 'mr'
      ? diagnosis.cropNameMr
      : language === 'hi'
      ? (diagnosis.cropNameHi || diagnosis.cropName)
      : diagnosis.cropName;

  const diseaseName =
    language === 'mr'
      ? diagnosis.diseaseNameMr
      : language === 'hi'
      ? (diagnosis.diseaseNameHi || diagnosis.diseaseName)
      : diagnosis.diseaseName;

  const userKey = user?.id || user?.farmerId || 'demo-user';

  const buildChatContext = useCallback((): ExpertChatContext => {
    return {
      farmerName: user?.name,
      farmName: selectedFarm?.farm_name || user?.farmName,
      cropName,
      diseaseName,
      cropNameEn: diagnosis.cropName,
      cropNameHi: diagnosis.cropNameHi,
      cropNameMr: diagnosis.cropNameMr,
      diseaseNameEn: diagnosis.diseaseName,
      diseaseNameHi: diagnosis.diseaseNameHi,
      diseaseNameMr: diagnosis.diseaseNameMr,
      pathogen: diagnosis.pathogen,
      severity: diagnosis.severity,
      detectedAt: diagnosis.detectedAt,
      daysSinceDiagnosis: calculateDaysSinceDiagnosis(diagnosis.detectedAt),
      humidity: weather?.humidity ?? 78,
      rainChance: weather?.rainfallChance ?? 60,
      rainfallStatus:
        language === 'mr'
          ? weather?.rainfallStatusMr || 'पावसाची शक्यता'
          : language === 'hi'
          ? weather?.rainfallStatusHi || 'बारिश की संभावना'
          : weather?.rainfallStatus || 'Rain expected',
      temperature: weather?.temp ?? 27,
      riskSummary:
        language === 'mr'
          ? riskForecast?.summaryMr || riskForecast?.summary
          : language === 'hi'
          ? riskForecast?.summaryHi || riskForecast?.summary
          : riskForecast?.summary,
      riskLevel: riskForecast?.currentLevel || diagnosis.severity,
      variety: selectedFarm?.variety || 'Local / Hybrid',
      cropStage: selectedFarm?.crop_stage || 'Active growth',
      village: user?.village,
      district: user?.district,
      state: user?.state,
      whatToDoToday: diagnosis.whatToDoToday,
      language,
    };
  }, [user, selectedFarm, diagnosis, weather, riskForecast, cropName, diseaseName, language]);

  // Load isolated messages for the active user & crop upon mount or account switch
  useEffect(() => {
    expertService.getExpertProfile().then(setExpert).catch(() => {});
    const ctx = buildChatContext();
    const userMsgs = expertService.getMessagesForUser(userKey, ctx);
    setMessages(userMsgs);
  }, [userKey, diagnosis.cropId, diagnosis.diseaseName, buildChatContext]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage.trim();
    if (!text || isTyping) return;

    setInputMessage('');
    setIsTyping(true);

    const messageId = `msg-farmer-${messages.length + 1}`;
    const farmerMsg: ChatMessage = {
      id: messageId,
      sender: 'farmer',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Show farmer message in UI immediately
    setMessages((prev) => [...prev, farmerMsg]);

    try {
      const ctx = buildChatContext();
      const updated = await expertService.sendMessage(
        text,
        ctx,
        messageId,
        userKey
      );
      setMessages([...updated]);
    } catch (err) {
      console.warn('[ExpertConsultView] Message send error:', err);
      const refreshed = expertService.getMessagesForUser(userKey, buildChatContext());
      setMessages([...refreshed]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRequestExpertVerification = async () => {
    setIsRequestingReview(true);
    try {
      const res = await apiClient<{ success: boolean; data: { case_id: string } }>('/expert/request', {
        method: 'POST',
        body: JSON.stringify({
          case_id: diagnosis.id || 'case-1',
          farmer_id: user?.id || user?.farmerId || 'farmer123',
          crop: diagnosis.cropName || 'Onion',
          disease: diagnosis.diseaseName || 'Purple Blotch',
          image_url: diagnosis.imageUrl || null,
          confidence: diagnosis.confidence || 0.91,
          severity: diagnosis.severity || 'moderate',
          notes: 'Farmer requested verification from regional KVK agronomist.'
        }),
      });
      if (res.success && res.data?.case_id) {
        setReviewCaseId(res.data.case_id);
      }
    } catch (err) {
      console.warn('[ExpertConsultView] Offline or backend call fallback:', err);
    } finally {
      setDiagnosis({
        ...diagnosis,
        expertReviewStatus: 'pending',
      });
      setIsRequestingReview(false);
    }
  };

  const handleExpertAction = async (status: 'confirmed' | 'corrected') => {
    try {
      await apiClient('/expert/review', {
        method: 'POST',
        body: JSON.stringify({
          caseId: reviewCaseId || diagnosis.id || 'case-1',
          expertId: 'exp-patil-1',
          status,
          correctedCrop: diagnosis.cropName,
          correctedDisease: status === 'corrected' ? 'Alternaria Leaf Blight' : diagnosis.diseaseName,
          reviewNotes: status === 'confirmed'
            ? 'Confirmed symptoms match classical fungal lesions with concentric rings.'
            : 'Reclassified as Alternaria based on target-board concentric markings.'
        }),
      });
    } catch {}
    setDiagnosis({
      ...diagnosis,
      diseaseName: status === 'corrected' ? 'Alternaria Leaf Blight' : diagnosis.diseaseName,
      expertReviewStatus: status,
      expertNotes: status === 'confirmed' ? 'Verified by Dr. Patil (KVK)' : 'Corrected to Alternaria by Dr. Patil (KVK)',
    });
  };

  const quickChips = [
    t.chipFungicide,
    t.chipSprayBeforeRain,
    t.chipOrganicAlternative,
  ];

  const getMessageText = (msg: ChatMessage) => {
    if (language === 'mr' && msg.textMr) return msg.textMr;
    if (language === 'hi' && msg.textHi) return msg.textHi;
    if (msg.id === 'm1') {
      if (language === 'mr' || language === 'hi') {
        const sev =
          language === 'mr'
            ? (diagnosis.severity === 'high' ? 'गंभीर' : diagnosis.severity === 'moderate' ? 'मध्यम' : 'कमी')
            : (diagnosis.severity === 'high' ? 'गंभीर' : diagnosis.severity === 'moderate' ? 'मध्यम' : 'कम');
        return getExpertInitialGreeting(language, cropName, diseaseName, sev);
      }
    }
    return msg.text;
  };

  return (
    <div className="pb-6 animate-fadeIn flex flex-col min-h-[calc(100vh-140px)]">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={resetToHome}
          type="button"
          className="flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.navHome}</span>
        </button>

        {/* Demo Helpline Call Button */}
        <button
          type="button"
          onClick={() => alert(t.demoHelplineCall)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-900 border border-forest-300 font-bold text-xs hover:bg-forest-200 transition-colors shadow-sm"
        >
          <PhoneCall className="w-3.5 h-3.5 text-forest-700" />
          <span>1800-000-0000 (Demo)</span>
        </button>
      </div>

      {/* Screen Title */}
      <div className="mb-3">
        <h2 className="text-lg font-black text-stone-900 font-display flex items-center gap-2">
          <span>👨‍🌾</span>
          <span>{t.expertTitle}</span>
        </h2>
        <p className="text-xs text-stone-500 font-medium">
          {t.expertSubtitle}
        </p>
      </div>

      {/* Escalation Banner if AI Diagnosis is Uncertain */}
      {diagnosis.isUncertain && (
        <div className="rounded-2xl bg-amber-500/15 border-2 border-amber-500 p-3 mb-3 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-black text-amber-950 font-display">
              {t.aiUncertainExpertHelp}
            </div>
            <div className="text-[11px] text-stone-700 mt-0.5">
              {t.aiUncertainExpertHelpDesc}
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY CROP CONTEXT CARD PINNED AT TOP */}
      <div className="rounded-2xl bg-amber-50/90 border border-amber-300 p-3.5 shadow-sm mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shadow-inner shrink-0">
            🌿
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-800 font-display">
              {t.cropContextTitle}
            </div>
            <div className="text-xs font-black text-stone-900">
              {cropName} • 🦠 {diseaseName}
            </div>
          </div>
        </div>

        <StatusBadge level={diagnosis.severity} type="severity" size="sm" />
      </div>

      {/* Expert Case Verification Workflow Card */}
      <div className="rounded-2xl bg-white border border-stone-200/90 p-3.5 shadow-sm mb-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🛡️</span>
            <span className="text-xs font-black uppercase tracking-wider text-stone-800 font-display">
              {language === 'mr' ? 'तज्ज्ञ पडताळणी प्रकरण' : language === 'hi' ? 'विशेषज्ञ सत्यापन मामला' : 'Expert Verification Case'}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              diagnosis.expertReviewStatus === 'confirmed'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : diagnosis.expertReviewStatus === 'corrected'
                ? 'bg-sky-100 text-sky-900 border border-sky-300'
                : diagnosis.expertReviewStatus === 'pending'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                : 'bg-stone-100 text-stone-600'
            }`}
          >
            {diagnosis.expertReviewStatus === 'confirmed'
              ? 'CONFIRMED'
              : diagnosis.expertReviewStatus === 'corrected'
              ? 'CORRECTED'
              : diagnosis.expertReviewStatus === 'pending'
              ? 'PENDING'
              : 'NOT REQUESTED'}
          </span>
        </div>

        {!diagnosis.expertReviewStatus ? (
          <div className="space-y-2">
            <p className="text-[11px] text-stone-600">
              {language === 'mr'
                ? 'तुमच्या पिकाचा फोटो आणि AI निदान थेट KVK कृषी शास्त्रज्ञांकडे पडताळणीसाठी पाठवा.'
                : language === 'hi'
                ? 'अपनी फसल का फोटो और AI निदान सीधे KVK कृषि वैज्ञानिक को सत्यापन के लिए भेजें।'
                : 'Send your leaf photo and AI diagnosis directly to the regional KVK agronomist for official verification.'}
            </p>
            <button
              type="button"
              disabled={isRequestingReview}
              onClick={handleRequestExpertVerification}
              className="w-full py-2 px-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              {isRequestingReview ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>Submitting Case...</span>
                </>
              ) : (
                <span>🛡️ {language === 'mr' ? 'तज्ज्ञ पडताळणीसाठी विनंती करा' : language === 'hi' ? 'विशेषज्ञ सत्यापन का अनुरोध करें' : 'Request Expert Verification'}</span>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-stone-700 font-medium">
              {diagnosis.expertReviewStatus === 'pending'
                ? (language === 'mr'
                    ? 'प्रकरण दाखल केले आहे. KVK नाशिकचे तज्ज्ञ या निदानाचे पुनरावलोकन करत आहेत.'
                    : language === 'hi'
                    ? 'मामला दर्ज किया गया है। KVK नासिक के विशेषज्ञ इस निदान की समीक्षा कर रहे हैं।'
                    : 'Case filed in queue. KVK agronomists are reviewing your crop photo and AI diagnosis.')
                : (diagnosis.expertNotes || 'Verified by regional KVK specialist.')}
            </p>

            {/* Evaluator Simulation Control (Clearly labeled for SIH evaluator demo) */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 mt-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 mb-1.5 flex items-center gap-1">
                <span>⚙️</span>
                <span>SIH Evaluator Action (Simulate KVK Desk)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleExpertAction('confirmed')}
                  className="py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold active:scale-95 transition-all text-center"
                >
                  ✓ Confirm Diagnosis
                </button>
                <button
                  type="button"
                  onClick={() => handleExpertAction('corrected')}
                  className="py-1.5 px-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-[11px] font-bold active:scale-95 transition-all text-center"
                >
                  ✎ Correct Diagnosis
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agronomist Profile Header (Demo Labeled) */}
      <div className="bg-white rounded-2xl p-3 border border-stone-200/90 shadow-soft mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={expert.avatar}
              alt={expert.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-forest-600 shadow-sm"
            />
            <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"></span>
          </div>

          <div>
            <div className="text-xs font-black text-stone-900 font-display">
              {language === 'mr' ? expert.nameMr : language === 'hi' ? (expert.nameHi || expert.name) : expert.name}
            </div>
            <div className="text-[11px] text-stone-500 leading-tight">
              {language === 'mr' ? expert.stationMr : language === 'hi' ? (expert.stationHi || expert.station) : expert.station}
            </div>
          </div>
        </div>

        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
          {t.onlineNow}
        </span>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 bg-stone-100/70 border border-stone-200/70 rounded-3xl p-3.5 overflow-y-auto space-y-3 mb-3 max-h-[340px]">
        {messages.map((msg) => {
          const isFarmer = msg.sender === 'farmer';
          const text = getMessageText(msg);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isFarmer ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-medium shadow-sm ${
                  isFarmer
                    ? 'bg-forest-800 text-white rounded-br-none'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none'
                }`}
              >
                {text}
              </div>
              <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-stone-400">
                <span>{msg.timestamp}</span>
                {isFarmer && <CheckCheck className="w-3 h-3 text-emerald-600" />}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-2xl rounded-bl-none border border-stone-200 text-stone-600 text-xs shadow-sm w-fit animate-pulse">
            <div className="flex items-center gap-1 text-forest-700">
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-[11px] font-medium text-stone-600 italic">
              {language === 'mr'
                ? 'डॉ. पाटील उत्तर टाईप करत आहेत...'
                : language === 'hi'
                ? 'डॉ. पाटिल टाइप कर रहे हैं...'
                : 'Dr. Patil is typing...'}
            </span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Questions Chips */}
      <div className="mb-2">
        <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-stone-500 mb-1.5 px-1 font-display">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>{t.quickQuestions}</span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickChips.map((chipLabel, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isTyping}
              onClick={() => handleSendMessage(chipLabel)}
              className="text-[11px] font-bold text-forest-900 bg-white hover:bg-forest-50 border border-stone-200 px-3 py-1.5 rounded-xl whitespace-nowrap active:scale-95 disabled:opacity-50 transition-all shrink-0 shadow-sm cursor-pointer"
            >
              {chipLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border-2 border-forest-700/60 shadow-md"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={t.typeMessagePlaceholder}
          disabled={isTyping}
          className="flex-1 px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none bg-transparent disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isTyping}
          className="w-10 h-10 rounded-xl bg-forest-800 text-white hover:bg-forest-900 disabled:opacity-40 disabled:hover:bg-forest-800 flex items-center justify-center transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4 text-amber-300" />
        </button>
      </form>
    </div>
  );
};
