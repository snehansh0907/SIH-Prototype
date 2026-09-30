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
          correctedDisease: status === 'corrected' ? 'Foot-and-Mouth Disease' : diagnosis.diseaseName,
          reviewNotes: status === 'confirmed'
            ? 'Confirmed clinical skin nodules typical of Capripoxvirus (LSD) infection.'
            : 'Reclassified as Foot-and-Mouth Disease based on oral mucosal lesions.'
        }),
      });
    } catch {}
    setDiagnosis({
      ...diagnosis,
      diseaseName: status === 'corrected' ? 'Foot-and-Mouth Disease' : diagnosis.diseaseName,
      expertReviewStatus: status,
      expertNotes: status === 'confirmed' ? 'Verified by Dr. Ashok Kulkarni (LDO)' : 'Corrected by Dr. Ashok Kulkarni (LDO)',
    });
  };

  const quickChips =
    language === 'mr'
      ? ['जखमांची स्वच्छता कशी करावी?', 'लंपी/लाळ्या लस कधी टोचावी?', 'दूध पिण्यासाठी सुरक्षित आहे का?', '१९६२ वर संपर्क कसा करावा?']
      : language === 'hi'
      ? ['घावों की सफाई कैसे करें?', 'लम्पी/FMD टीका कब लगवाएं?', 'क्या दूध पीना सुरक्षित है?', '1962 हेल्पलाइन पर कॉल करें']
      : ['How to clean lesions with KMnO4?', 'When to give Goat Pox vaccine?', 'Is boiled milk safe to drink?', 'Call 1962 Veterinary Helpline'];

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
    <div className="animate-fadeIn flex flex-col text-left w-full min-w-0">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3.5">
        <button
          onClick={resetToHome}
          type="button"
          className="flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-900 btn-tactile-subtle cursor-pointer bg-forest-50/70 px-2.5 py-1 rounded-full border border-forest-200/50 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.navHome}</span>
        </button>

        {/* Helpline Call Button */}
        <a
          href="tel:1962"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100/90 text-forest-900 border border-forest-300/80 font-bold text-xs hover:bg-forest-200/90 btn-tactile-subtle shadow-xs"
        >
          <PhoneCall className="w-3.5 h-3.5 text-forest-700" />
          <span>1962 (Vet Helpline)</span>
        </a>
      </div>

      {/* Screen Title */}
      <div className="mb-3.5">
        <h2 className="text-lg font-black text-forest-950 font-display flex items-center gap-2">
          <span className="text-xl">🩺</span>
          <span>{t.expertTitle}</span>
        </h2>
        <p className="text-xs text-stone-500 font-medium">
          {t.expertSubtitle}
        </p>
      </div>

      {/* Escalation Banner if AI Diagnosis is High/Critical or Uncertain */}
      {(diagnosis.isUncertain || diagnosis.severity === 'high') && (
        <div className="rounded-2xl bg-amber-500/15 border border-amber-400/80 p-3 mb-3 flex items-start gap-2.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-black text-amber-950 font-display">
              {t.aiUncertainExpertHelp}
            </div>
            <div className="text-[11px] text-stone-700 mt-0.5 leading-relaxed">
              {language === 'mr'
                ? 'लक्षणे गंभीर स्वरूपाची आहेत. प्राथमिक उपचारासोबत शासकीय पशुवैद्यकीय अधिकाऱ्यांशी संपर्क साधा.'
                : language === 'hi'
                ? 'लक्षण गंभीर श्रेणी के हैं। प्राथमिक उपचार के साथ नजदीकी पशु चिकित्सा अधिकारी से संपर्क करें।'
                : 'Symptoms indicate acute infection. Administer first aid and seek qualified veterinary examination.'}
            </div>
          </div>
        </div>
      )}

      {/* LIVESTOCK CASE CONTEXT CARD PINNED AT TOP */}
      <div className="glass-card bg-amber-50/70 border border-amber-200/90 p-3 shadow-glass rounded-2xl mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100/90 flex items-center justify-center text-lg shadow-inner shrink-0 border border-amber-200/60">
            🐄
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-900/80 font-display">
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
              {language === 'mr' ? 'पशुवैद्यकीय पडताळणी प्रकरण' : language === 'hi' ? 'पशुचिकित्सक सत्यापन मामला' : 'Veterinary Verification Case'}
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
                ? 'तुमच्या जनावराचा फोटो आणि AI लक्षण निदान थेट शासकीय पशुवैद्यकीय अधिकाऱ्यांकडे (LDO) पडताळणीसाठी पाठवा.'
                : language === 'hi'
                ? 'अपने पशु का फोटो और AI लक्षण निदान सीधे पशुचिकित्सा अधिकारी (LDO) को सत्यापन के लिए भेजें।'
                : 'Send your animal symptom photo and AI diagnosis directly to the regional Live Stock Development Officer for verification.'}
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
                <span>🛡️ {language === 'mr' ? 'पशुवैद्यकीय पडताळणीसाठी विनंती करा' : language === 'hi' ? 'पशुचिकित्सक सत्यापन का अनुरोध करें' : 'Request Vet Verification'}</span>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-stone-700 font-medium">
              {diagnosis.expertReviewStatus === 'pending'
                ? (language === 'mr'
                    ? 'प्रकरण दाखल केले आहे. पशुवैद्यकीय अधिकारी या निदानाचे पुनरावलोकन करत आहेत.'
                    : language === 'hi'
                    ? 'मामला दर्ज किया गया है। पशुचिकित्सा अधिकारी इस निदान की समीक्षा कर रहे हैं।'
                    : 'Case filed in queue. Veterinary officers are reviewing your animal symptom photo.')
                : (diagnosis.expertNotes || 'Verified by Live Stock Development Officer.')}
            </p>

            {/* Evaluator Simulation Control (Clearly labeled for SIH evaluator demo) */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 mt-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 mb-1.5 flex items-center gap-1">
                <span>⚙️</span>
                <span>SIH Evaluator Action (Simulate Vet Review Desk)</span>
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

      {/* Veterinary Officer Profile Header */}
      <div className="glass-card bg-white/85 border border-white/90 p-3 shadow-glass rounded-2xl mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={expert.avatar}
              alt={expert.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-forest-600 shadow-sm"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"></span>
          </div>

          <div>
            <div className="text-xs font-black text-forest-950 font-display">
              {language === 'mr' ? expert.nameMr : language === 'hi' ? (expert.nameHi || expert.name) : expert.name}
            </div>
            <div className="text-[11px] text-stone-500 leading-tight">
              {language === 'mr' ? expert.stationMr : language === 'hi' ? (expert.stationHi || expert.station) : expert.station}
            </div>
          </div>
        </div>

        <span className="text-[10px] font-bold text-forest-900 bg-forest-100/80 border border-forest-200/60 px-2 py-0.5 rounded-full shadow-xs">
          {t.onlineNow}
        </span>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 glass-card bg-stone-100/60 border border-white/80 rounded-3xl p-3.5 overflow-y-auto space-y-3 mb-3 max-h-[340px] shadow-inner">
        {messages.map((msg) => {
          const isFarmer = msg.sender === 'farmer';
          const text = getMessageText(msg);

          return (
            <div
              key={msg.id}
              className={`flex flex-col animate-fadeIn ${isFarmer ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-medium shadow-xs transition-transform duration-200 ${
                  isFarmer
                    ? 'bg-gradient-to-r from-forest-800 to-forest-700 text-white rounded-br-none shadow-sm'
                    : 'glass-card bg-white/95 text-stone-800 border-white/90 rounded-bl-none shadow-xs'
                }`}
              >
                {text}
              </div>
              <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-stone-400">
                <span>{msg.timestamp}</span>
                {isFarmer && <CheckCheck className="w-3 h-3 text-forest-600" />}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 glass-card bg-white/90 px-3.5 py-2.5 rounded-2xl rounded-bl-none border border-white/90 text-stone-600 text-xs shadow-xs w-fit animate-fadeIn">
            <div className="flex items-center gap-1 text-forest-700">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-forest-600 animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-[11px] font-medium text-stone-600 italic">
              {language === 'mr'
                ? 'डॉ. अशोक कुलकर्णी उत्तर टाईप करत आहेत...'
                : language === 'hi'
                ? 'डॉ. अशोक कुलकर्णी टाइप कर रहे हैं...'
                : 'Dr. Ashok Kulkarni is typing...'}
            </span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Questions Chips */}
      <div className="mb-2.5">
        <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-forest-900/70 mb-1.5 px-1 font-display">
          <Sparkles className="w-3 h-3 text-gold-500" />
          <span>{t.quickQuestions}</span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickChips.map((chipLabel, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isTyping}
              onClick={() => handleSendMessage(chipLabel)}
              className="text-[11px] font-bold text-forest-950 glass-card bg-white/90 hover:bg-white border-white/80 px-3 py-1.5 rounded-xl whitespace-nowrap btn-tactile-subtle disabled:opacity-50 transition-all shrink-0 shadow-xs cursor-pointer"
            >
              {chipLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Message Input Box with gentle focus glow */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 glass-card bg-white/90 rounded-2xl p-1.5 border border-forest-600/40 shadow-glass transition-all duration-200 focus-within:border-forest-600 focus-within:ring-2 focus-within:ring-forest-400/30"
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
          className="w-9 h-9 rounded-xl bg-gradient-to-r from-forest-800 to-forest-700 text-white hover:from-forest-900 hover:to-forest-800 disabled:opacity-40 flex items-center justify-center btn-tactile-icon shadow-sm shrink-0 cursor-pointer border border-forest-600/40"
        >
          <Send className="w-4 h-4 text-gold-300" />
        </button>
      </form>
    </div>
  );
};
