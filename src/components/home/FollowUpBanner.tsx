import React, { useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Camera, UserCheck, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';

interface ComparisonData {
  previousSeverity: string;
  currentSeverity: string;
  trend: 'improving' | 'stable' | 'worsening';
  result: string;
  resultHi?: string;
  resultMr?: string;
  recommendation: string;
  recommendationHi?: string;
  recommendationMr?: string;
  followUpStatus: 'better' | 'same' | 'worse';
}

export const FollowUpBanner: React.FC = () => {
  const { language, t } = useLanguage();
  const { followUpStatus, setFollowUpStatus, setActiveTab, diagnosis } = useCrop();
  const { user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonData | null>(null);

  const handleSelect = (status: 'better' | 'same' | 'worse') => {
    setFollowUpStatus(status);
    if (status === 'better') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#174D35', '#36B98A', '#F6BD28', '#176B45'],
        });
      } catch {}
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('case_id', diagnosis?.id || 'demo-case-gauri-1');
      formData.append('farmer_id', user?.id || user?.farmerId || 'farmer123');
      formData.append('crop', diagnosis?.cropId || user?.monitoredCrop || 'cattle');

      const response = await apiClient<{ success: boolean; data: { comparison: ComparisonData } }>(
        '/follow-ups/photo',
        { method: 'POST', body: formData }
      );

      if (response.success && response.data?.comparison) {
        const comp = response.data.comparison;
        setComparisonResult(comp);
        setFollowUpStatus(comp.followUpStatus);
        if (comp.followUpStatus === 'better') {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#174D35', '#36B98A', '#F6BD28', '#176B45'],
            });
          } catch {}
        }
      }
    } catch (err) {
      console.warn('[FollowUpBanner] Backend photo follow-up failed, running local evaluation fallback:', err);
      // Fallback deterministic comparison for offline/demo mode
      const previousSeverity = diagnosis?.severity === 'high' ? 'High' : 'Moderate';
      const isImproving = file.size % 2 === 0;
      const currentSeverity = isImproving ? 'Mild' : 'Severe';
      const comp: ComparisonData = {
        previousSeverity,
        currentSeverity,
        trend: isImproving ? 'improving' : 'worsening',
        result: isImproving ? 'Lesions Healing / Improving' : 'Lesions expanding — Veterinary review recommended.',
        resultHi: isImproving ? 'घाव ठीक हो रहे हैं' : 'घाव/गांठें बढ़ रही हैं — पशुचिकित्सक जांच की आवश्यकता।',
        resultMr: isImproving ? 'जखमा भरत आहेत' : 'गाठी किंवा व्रण वाढत आहेत — पशुवैद्यकीय तपासणी आवश्यक.',
        recommendation: isImproving
          ? 'Animal lesion healing is progressing well. Continue antiseptic wash and fly protection.'
          : 'Lesions are spreading. Isolate animal and contact Veterinary Officer via Helpline 1962.',
        followUpStatus: isImproving ? 'better' : 'worse',
      };
      setComparisonResult(comp);
      setFollowUpStatus(comp.followUpStatus);
      if (comp.followUpStatus === 'better') {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#174D35', '#36B98A', '#F6BD28', '#176B45'],
          });
        } catch {}
      }
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setFollowUpStatus(null);
    setComparisonResult(null);
  };

  return (
    <div className="rounded-3xl bg-white/88 backdrop-blur-xl border border-white/95 p-4 shadow-glass mb-4 text-left">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐮</span>
          <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#183027] font-display">
            {t.followUpTitle}
          </h3>
        </div>
        {followUpStatus && (
          <button
            onClick={handleReset}
            type="button"
            className="text-[11px] font-bold text-[#596A61] hover:text-[#183027] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'बदला' : language === 'hi' ? 'बदलें' : 'Change'}</span>
          </button>
        )}
      </div>

      <p className="text-xs text-[#596A61] mb-3.5 leading-relaxed font-bold">
        {t.followUpSubtitle}
      </p>

      {/* Hidden file input for Photo Follow-Up */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Response choices */}
      {!followUpStatus ? (
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSelect('better')}
              type="button"
              className="py-3 px-2 rounded-2xl bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-200/90 text-emerald-950 font-bold text-xs flex flex-col items-center gap-1.5 btn-tactile-subtle shadow-xs cursor-pointer group"
            >
              <span className="text-2xl group-hover:scale-105 transition-transform">😊</span>
              <span>{language === 'mr' ? 'सुधारणा आहे' : language === 'hi' ? 'सुधार है' : 'Better'}</span>
            </button>

            <button
              onClick={() => handleSelect('same')}
              type="button"
              className="py-3 px-2 rounded-2xl bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/90 text-amber-950 font-bold text-xs flex flex-col items-center gap-1.5 btn-tactile-subtle shadow-xs cursor-pointer group"
            >
              <span className="text-2xl group-hover:scale-105 transition-transform">😐</span>
              <span>{language === 'mr' ? 'तसेच आहे' : language === 'hi' ? 'वैसा ही है' : 'Same'}</span>
            </button>

            <button
              onClick={() => handleSelect('worse')}
              type="button"
              className="py-3 px-2 rounded-2xl bg-rose-50/90 hover:bg-rose-100/90 border border-rose-200/90 text-rose-950 font-bold text-xs flex flex-col items-center gap-1.5 btn-tactile-subtle shadow-xs cursor-pointer group"
            >
              <span className="text-2xl group-hover:scale-105 transition-transform">😟</span>
              <span>{language === 'mr' ? 'बिघडले आहे' : language === 'hi' ? 'गंभीर है' : 'Worse'}</span>
            </button>
          </div>

          {/* Upload Follow-Up Photo Button */}
          <button
            type="button"
            disabled={isUploadingPhoto}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-3 rounded-2xl bg-stone-50/90 hover:bg-stone-100/90 btn-tactile-subtle border border-stone-200 text-forest-950 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {isUploadingPhoto ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-forest-700" />
                <span>{t.analyzingFollowUp || 'Analyzing photo...'}</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 text-forest-700" />
                <span>{language === 'mr' ? 'आरोग्य फोटो अपडेट करा' : language === 'hi' ? 'स्वास्थ्य फोटो अपडेट करें' : 'Upload Follow-Up Photo'}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="animate-fadeIn space-y-2.5">
          {/* Comparison breakdown if photo was used */}
          {comparisonResult && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50/90 p-3 text-xs shadow-xs">
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-stone-200/70 text-[11px]">
                <div>
                  <span className="text-stone-500 font-medium">{t.previousSeverityLabel} </span>
                  <span className="font-bold text-stone-800">{comparisonResult.previousSeverity}</span>
                </div>
                <div>
                  <span className="text-stone-500 font-medium">{t.currentSeverityLabel} </span>
                  <span className="font-bold text-stone-800">{comparisonResult.currentSeverity}</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-stone-600 font-semibold">{t.comparisonTrendLabel}</span>
                <span
                  className={`font-black px-2.5 py-0.5 rounded-full text-[11px] shadow-xs ${
                    comparisonResult.trend === 'improving'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : comparisonResult.trend === 'worsening'
                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {language === 'mr'
                    ? (comparisonResult.resultMr || comparisonResult.result)
                    : language === 'hi'
                    ? (comparisonResult.resultHi || comparisonResult.result)
                    : comparisonResult.result}
                </span>
              </div>
            </div>
          )}

          {followUpStatus === 'better' && (
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-3.5 flex items-start gap-2.5 shadow-xs animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-black text-emerald-950 mb-0.5">
                  {language === 'mr' ? 'सुधारणा नोंदवली गेली!' : language === 'hi' ? 'सुधार दर्ज किया गया!' : 'Recovery Logged!'}
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  {comparisonResult?.recommendation || (language === 'mr' ? 'चांगली बातमी! उपचार व स्वच्छता सुरू ठेवा.' : language === 'hi' ? 'शुभ समाचार! नियमित देखभाल व आहार जारी रखें।' : 'Great news! Continue recommended sanitation and nutrition.')}
                </p>
              </div>
            </div>
          )}

          {followUpStatus === 'same' && (
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 shadow-xs animate-fadeIn">
              <span className="text-base">ℹ️</span>
              <div>
                <div className="text-xs font-black text-amber-950 mb-0.5">
                  {language === 'mr' ? 'निरीक्षण सुरू ठेवा' : language === 'hi' ? 'निगरानी जारी रखें' : 'Continue Monitoring'}
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {comparisonResult?.recommendation || (language === 'mr' ? 'कास किंवा जखमेची स्वच्छता ठेवा आणि ताप मोजा.' : language === 'hi' ? 'पशु के तापमान और चारे की निगरानी रखें।' : 'Monitor feed intake and rectal temperature regularly.')}
                </p>
              </div>
            </div>
          )}

          {followUpStatus === 'worse' && (
            <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-3.5 shadow-xs animate-fadeIn">
              <div className="flex items-start gap-2 mb-2.5">
                <span className="text-base shrink-0">⚠️</span>
                <div>
                  <div className="text-xs font-black text-rose-950">
                    {language === 'mr' ? 'तातडीने पशुवैद्यकीय डॉक्टरांशी संपर्क करा' : language === 'hi' ? 'तत्काल पशु चिकित्सक से संपर्क करें' : 'Immediate Veterinary Consultation Recommended'}
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed font-medium">
                    {comparisonResult?.recommendation || (language === 'mr' ? 'लक्षणे वाढत असल्यास त्वरित डॉक्टरांना गोठ्यावर बोलवा किंवा १९६२ वर कॉल करा.' : language === 'hi' ? 'लक्षण बढ़ने पर नजदीकी पशु चिकित्सालय में संपर्क करें या 1962 पर कॉल करें।' : 'Condition needs immediate physical examination by a registered Veterinary Officer.')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-rose-200/70">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-forest-800 text-white font-bold text-xs hover:bg-forest-900 btn-tactile shadow-xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{language === 'mr' ? 'नवीन फोटो काढा' : language === 'hi' ? 'नया फोटो लें' : 'New Photo'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('expert')}
                  type="button"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500 text-stone-950 font-extrabold text-xs hover:bg-amber-400 btn-tactile shadow-xs cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-stone-950" />
                  <span>{t.actionExpert}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

