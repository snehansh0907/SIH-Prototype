import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, PhoneCall, Sparkles, CheckCheck, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { expertService, calculateDaysSinceDiagnosis, type ExpertChatContext } from '../../services/expertService';
import type { ExpertProfile, ChatMessage } from '../../types';
import { MOCK_EXPERT } from '../../services/mockData';

export const ExpertConsultView: React.FC = () => {
  const { language, t } = useLanguage();
  const { diagnosis, weather, resetToHome, selectedFarm } = useCrop();
  const { user } = useAuth();

  const [expert] = useState<ExpertProfile>(MOCK_EXPERT);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const animalSpecies =
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
      cropName: animalSpecies,
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
      language,
    };
  }, [user, selectedFarm, animalSpecies, diseaseName, diagnosis, weather, language]);

  useEffect(() => {
    const loaded = expertService.getMessagesForUser(userKey, buildChatContext());
    setMessages(loaded);
  }, [userKey, buildChatContext]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputMessage).trim();
    if (!content) return;

    const newFarmerMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'farmer',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newFarmerMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await expertService.sendMessage(content, buildChatContext());
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.warn('[ExpertConsultView] Message send error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const quickChips = [
    language === 'mr' ? 'काय प्रथमोपचार करावा?' : language === 'hi' ? 'क्या प्राथमिक उपचार करें?' : 'What first aid should I apply?',
    language === 'mr' ? 'जनावराला वेगळे बांधावे का?' : language === 'hi' ? 'क्या पशु को अलग बांधना चाहिए?' : 'Should I isolate the animal?',
    language === 'mr' ? 'कोणती लस द्यावी लागेल?' : language === 'hi' ? 'कौन सा टीका लगाना होगा?' : 'Which vaccine is recommended?',
  ];

  const getMessageText = (msg: ChatMessage) => {
    if (language === 'mr' && msg.textMr) return msg.textMr;
    if (language === 'hi' && msg.textHi) return msg.textHi;
    return msg.text;
  };

  return (
    <div className="pb-6 animate-fadeIn flex flex-col min-h-[calc(100vh-140px)]">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={resetToHome}
          type="button"
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.navHome}</span>
        </button>

        {/* Helpline Call Button */}
        <a
          href="tel:1962"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs hover:bg-emerald-200 transition-colors shadow-sm"
        >
          <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
          <span>1962 (Pashu Arogya Seva)</span>
        </a>
      </div>

      {/* Screen Title */}
      <div className="mb-3">
        <h2 className="text-lg font-black text-stone-900 font-display flex items-center gap-2">
          <span>🩺</span>
          <span>{t.expertTitle}</span>
        </h2>
        <p className="text-xs text-stone-500 font-medium">
          {t.expertSubtitle}
        </p>
      </div>

      {/* Escalation Banner if AI Diagnosis is High/Critical */}
      {diagnosis.severity === 'high' && (
        <div className="rounded-2xl bg-amber-500/15 border-2 border-amber-500 p-3 mb-3 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-black text-amber-950 font-display">
              {language === 'mr' ? 'तातडीचा पशुवैद्यकीय सल्ला आवश्यक' : language === 'hi' ? 'तत्काल पशु चिकित्सकीय परामर्श अनुशंसित' : 'Urgent Veterinary Guidance Recommended'}
            </div>
            <div className="text-[11px] text-stone-700 mt-0.5">
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
      <div className="rounded-2xl bg-amber-50/90 border border-amber-300 p-3.5 shadow-sm mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shadow-inner shrink-0">
            🐄
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-amber-800 font-display">
              {t.cropContextTitle}
            </div>
            <div className="text-xs font-black text-stone-900">
              {animalSpecies} • 🦠 {diseaseName}
            </div>
          </div>
        </div>

        <StatusBadge level={diagnosis.severity} type="severity" size="sm" />
      </div>

      {/* Veterinary Officer Profile Header */}
      <div className="bg-white rounded-2xl p-3 border border-stone-200/90 shadow-soft mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={expert.avatar}
              alt={expert.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-emerald-600 shadow-sm"
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
                    ? 'bg-emerald-800 text-white rounded-br-none'
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
            <div className="flex items-center gap-1 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-[11px] font-medium text-stone-600 italic">
              {language === 'mr'
                ? 'डॉ. देशमुख उत्तर टाईप करत आहेत...'
                : language === 'hi'
                ? 'डॉ. देशमुख टाइप कर रहे हैं...'
                : 'Dr. Deshmukh is typing...'}
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
              className="text-[11px] font-bold text-emerald-950 bg-white hover:bg-emerald-50 border border-stone-200 px-3 py-1.5 rounded-xl whitespace-nowrap active:scale-95 disabled:opacity-50 transition-all shrink-0 shadow-sm cursor-pointer"
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
        className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border-2 border-emerald-700/60 shadow-md"
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
          className="w-10 h-10 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 disabled:opacity-40 disabled:hover:bg-emerald-800 flex items-center justify-center transition-all active:scale-95 shadow-sm shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4 text-amber-300" />
        </button>
      </form>
    </div>
  );
};
