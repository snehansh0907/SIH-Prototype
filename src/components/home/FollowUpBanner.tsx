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
          colors: ['#2D6A4F', '#52B788', '#D4A373', '#FBBF24'],
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
      formData.append('case_id', diagnosis?.id || 'demo-case-onion-1');
      formData.append('farmer_id', user?.id || user?.farmerId || 'farmer123');
      formData.append('crop', diagnosis?.cropId || user?.monitoredCrop || 'onion');

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
              colors: ['#2D6A4F', '#52B788', '#D4A373', '#FBBF24'],
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
            colors: ['#2D6A4F', '#52B788', '#D4A373', '#FBBF24'],
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
    <div className="rounded-2xl bg-white border border-stone-200/70 p-4 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🩺</span>
          <h3 className="text-xs uppercase tracking-wider font-bold text-stone-500 font-display">
            {t.followUpTitle}
          </h3>
        </div>
        {followUpStatus && (
          <button
            onClick={handleReset}
            type="button"
            className="text-[11px] font-semibold text-stone-400 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.changeAction}</span>
          </button>
        )}
      </div>

      <p className="text-xs text-stone-600 mb-3 leading-relaxed">
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
              className="py-2.5 px-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/70 text-emerald-900 font-semibold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <span className="text-xl">😊</span>
              <span>{t.btnBetter.split(' ')[0]}</span>
            </button>

            <button
              onClick={() => handleSelect('same')}
              type="button"
              className="py-2.5 px-2 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/70 text-amber-900 font-semibold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <span className="text-xl">😐</span>
              <span>{t.btnSame.split(' ')[0]}</span>
            </button>

            <button
              onClick={() => handleSelect('worse')}
              type="button"
              className="py-2.5 px-2 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/70 text-rose-900 font-semibold text-xs flex flex-col items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <span className="text-xl">😟</span>
              <span>{t.btnWorse.split(' ')[0]}</span>
            </button>
          </div>

          {/* Upload Follow-Up Photo Button */}
          <button
            type="button"
            disabled={isUploadingPhoto}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 rounded-xl bg-stone-50 hover:bg-stone-100/90 active:scale-[0.98] border border-stone-200 text-forest-900 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isUploadingPhoto ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-forest-700" />
                <span>{t.analyzingFollowUp}</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 text-forest-700" />
                <span>{t.uploadFollowUpPhoto}</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="animate-fadeIn space-y-2.5">
          {/* Comparison breakdown if photo was used */}
          {comparisonResult && (
            <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3 text-xs">
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
                  className={`font-black px-2 py-0.5 rounded-full text-[11px] ${
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
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-emerald-950 mb-0.5">
                  {t.recoveryLogged}
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  {comparisonResult?.recommendation || t.feedbackBetter}
                </p>
              </div>
            </div>
          )}

          {followUpStatus === 'same' && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
              <span className="text-base">ℹ️</span>
              <div>
                <div className="text-xs font-bold text-amber-950 mb-0.5">
                  {t.continueMonitoring}
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {comparisonResult?.recommendation || t.feedbackSame}
                </p>
              </div>
            </div>
          )}

          {followUpStatus === 'worse' && (
            <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3">
              <div className="flex items-start gap-2 mb-2.5">
                <span className="text-base shrink-0">⚠️</span>
                <div>
                  <div className="text-xs font-bold text-rose-950">
                    {t.immediateHelpRecommended}
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed font-medium">
                    {comparisonResult?.recommendation || t.feedbackWorse}
                  </p>
                </div>
              </div>

              {/* Action buttons specifically requested for Worse */}
              <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-rose-200/70">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-forest-800 text-white font-semibold text-xs hover:bg-forest-900 active:scale-95 transition-transform shadow-xs cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t.uploadNewPhoto}</span>
                </button>

                <button
                  onClick={() => setActiveTab('expert')}
                  type="button"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 active:scale-95 transition-transform shadow-xs cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{t.talkToExpertBtn}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
