import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2, RefreshCw, Sparkles, Check, CheckSquare, Square } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { CropSelector } from './CropSelector';
import { PhotoGuidance } from './PhotoGuidance';
import { ProcessingModal } from './ProcessingModal';
import { MOCK_CROPS } from '../../services/mockData';
import type { AffectedBodyArea } from '../../types';

export const ImageUploader: React.FC = () => {
  const { language, t } = useLanguage();
  const { selectedCropId, performDiagnosis, isAnalyzing, selectedAnimal } = useCrop();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSample, setIsSample] = useState<boolean>(false);
  const [showInvalidModal, setShowInvalidModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Body Area
  const [selectedBodyArea, setSelectedBodyArea] = useState<AffectedBodyArea>('udder');

  // Step 5: Symptoms Checklist
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([t.symptomUdderSwelling]);
  const [duration, setDuration] = useState<string>('2 to 3 days');
  const [appetiteStatus, setAppetiteStatus] = useState<string>('Reduced appetite (~50%)');
  const [milkYieldImpact, setMilkYieldImpact] = useState<string>('Reduced (20-40% drop)');
  const [otherNotes, setOtherNotes] = useState<string>('');

  const currentCrop = MOCK_CROPS.find((c) => c.id === selectedCropId) || MOCK_CROPS[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setIsSample(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (url: string, sampleBodyArea?: AffectedBodyArea, condition?: string) => {
    setSelectedImage(url);
    setSelectedFile(null);
    setIsSample(true);
    if (sampleBodyArea) {
      setSelectedBodyArea(sampleBodyArea);
    }
    if (condition?.toLowerCase().includes('lumpy') || condition?.toLowerCase().includes('lsd')) {
      setSelectedSymptoms([t.symptomSkinNodules, t.symptomFever]);
    } else if (condition?.toLowerCase().includes('mastitis')) {
      setSelectedSymptoms([t.symptomUdderSwelling, t.symptomDropInMilk]);
    } else if (condition?.toLowerCase().includes('fmd')) {
      setSelectedSymptoms([t.symptomDrooling, t.symptomLimping]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setIsSample(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      animalId: selectedAnimal?.id,
      animalTag: selectedAnimal?.tagNumber,
      animalName: selectedAnimal?.name,
      affectedBodyArea: selectedBodyArea,
      symptoms: selectedSymptoms,
      symptomDuration: duration,
      appetiteStatus,
      milkYieldImpact,
      otherObservations: otherNotes,
    };

    if (selectedImage) {
      await performDiagnosis(selectedCropId, selectedImage, payload);
    } else if (selectedFile) {
      await performDiagnosis(selectedCropId, selectedFile, payload);
    } else {
      const fallbackUrl = currentCrop?.sampleImages?.[0]?.url || MOCK_CROPS[0].sampleImages[0].url;
      await performDiagnosis(selectedCropId, fallbackUrl, payload);
    }
  };

  const bodyAreas: { key: AffectedBodyArea; label: string; icon: string }[] = [
    { key: 'udder', label: language === 'mr' ? 'कास / स्तन' : language === 'hi' ? 'थन / अयन' : 'Udder / Teats', icon: '🥛' },
    { key: 'skin', label: language === 'mr' ? 'त्वचा / कातडी' : language === 'hi' ? 'त्वचा / गांठें' : 'Skin / Coat', icon: '🔴' },
    { key: 'mouth', label: language === 'mr' ? 'तोंड / लाळ' : language === 'hi' ? 'मुंह / छाले' : 'Mouth / Saliva', icon: '👅' },
    { key: 'hooves', label: language === 'mr' ? 'खूर / पाय' : language === 'hi' ? 'खुर / लंगड़ाना' : 'Hooves / Feet', icon: '🦶' },
    { key: 'eyes', label: language === 'mr' ? 'डोळे / नाक' : language === 'hi' ? 'आंखें / स्राव' : 'Eyes / Nose', icon: '👀' },
    { key: 'general', label: language === 'mr' ? 'पचन / ताप / अन्य' : language === 'hi' ? 'पाचन / बुखार' : 'Digestive / Fever', icon: '🌡️' },
  ];

  const symptomList = [
    t.symptomFever,
    t.symptomLossOfAppetite,
    t.symptomDropInMilk,
    t.symptomDrooling,
    t.symptomSkinNodules,
    t.symptomUdderSwelling,
    t.symptomLimping,
    t.symptomDiarrhea,
    t.symptomCoughing,
    t.symptomNasalDischarge,
    t.symptomLethargy,
  ];

  return (
    <div className="pb-8 animate-fadeIn text-left">
      {/* Title & Subtitle */}
      <div className="mb-4">
        <h2 className="text-xl font-extrabold text-stone-900 font-display flex items-center gap-2">
          <span>🩺</span>
          <span>{t.checkCropTitle}</span>
        </h2>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
          {t.checkCropSubtitle}
        </p>
      </div>

      {/* 1 & 2: Select Animal & Species */}
      <CropSelector />

      {/* 3: Select Affected Body Area */}
      <div className="mb-4">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5 font-display">
          {t.stepBodyAreaSelection || '3. Affected Body Area'}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {bodyAreas.map((b) => {
            const isSelected = selectedBodyArea === b.key;
            return (
              <button
                key={b.key}
                type="button"
                onClick={() => setSelectedBodyArea(b.key)}
                className={`flex items-center gap-1.5 p-2 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-forest-950 border-amber-500 font-bold shadow-sm ring-2 ring-amber-300'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span className="text-base shrink-0">{b.icon}</span>
                <span className="text-xs font-semibold leading-tight">{b.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

      {/* 4: Main Upload / Preview Area */}
      <div className="mb-4">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1.5 font-display">
          {t.stepPhotoUpload || '4. Symptom Photograph'}
        </label>

        {!selectedImage ? (
          <div className="rounded-3xl border-2 border-dashed border-forest-600/50 bg-white/80 p-5 text-center shadow-soft hover:bg-forest-50/40 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto mb-2 text-2xl shadow-inner">
              📸
            </div>
            <h4 className="text-sm font-extrabold text-stone-900 mb-1">{t.dragDropText}</h4>
            <p className="text-xs text-stone-500 mb-3 max-w-xs mx-auto">{t.guideVisible}</p>

            <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-forest-800 text-white font-bold text-xs hover:bg-forest-900 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Camera className="w-4 h-4 text-amber-300" />
                <span>{t.takePhoto}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white border-2 border-forest-700 text-forest-900 font-bold text-xs hover:bg-forest-50 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-forest-700" />
                <span>{t.uploadImage}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative rounded-3xl overflow-hidden border-2 border-forest-600 shadow-card bg-stone-900">
            <img
              src={selectedImage}
              alt="Animal Symptom Preview"
              className="w-full h-56 object-cover object-center"
              onError={(e) => {
                const target = e.currentTarget;
                const sample = currentCrop?.sampleImages?.find((s) => s.url === selectedImage || s.fallbackUrl === selectedImage);
                if (sample?.fallbackUrl && target.src !== sample.fallbackUrl) {
                  target.src = sample.fallbackUrl;
                }
              }}
            />

            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isSample ? t.fieldSample : t.photoReady}</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full bg-stone-900/80 backdrop-blur-md text-white hover:bg-stone-800 text-xs transition-colors border border-white/20 cursor-pointer"
                  title={t.replacePhoto}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-2 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 text-xs transition-colors border border-white/20 cursor-pointer"
                  title={t.removePhoto}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent p-3 pt-6 text-white text-xs">
              <span className="font-semibold text-amber-300">
                {language === 'mr' ? currentCrop.nameMr : language === 'hi' ? currentCrop.nameHi || currentCrop.name : currentCrop.name}
              </span>{' '}
              • {t.readyForAnalysis}
            </div>
          </div>
        )}
      </div>

      {/* Verified Test Samples */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-stone-600">{t.orUseSample}</span>
          <span className="text-[11px] text-forest-700 font-semibold flex items-center gap-0.5">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {t.oneClickTest}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {currentCrop.sampleImages.map((sample) => {
            const isPicked = selectedImage === sample.url || (Boolean(sample.fallbackUrl) && selectedImage === sample.fallbackUrl);
            const title =
              language === 'mr'
                ? sample.titleMr
                : language === 'hi'
                ? sample.titleHi || sample.title
                : sample.title;

            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample.url, sample.bodyArea, sample.condition)}
                className={`flex items-center gap-2 p-2 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer ${
                  isPicked
                    ? 'bg-forest-100 border-forest-600 ring-2 ring-forest-400'
                    : 'bg-white border-stone-200 hover:bg-stone-50'
                }`}
              >
                <img
                  src={sample.url}
                  alt={title}
                  className="w-10 h-10 rounded-xl object-cover shrink-0"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (sample.fallbackUrl && target.src !== sample.fallbackUrl) {
                      target.src = sample.fallbackUrl;
                    }
                  }}
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-extrabold text-stone-900 truncate leading-tight">
                    {sample.condition}
                  </div>
                  <div className="text-[10px] text-stone-500 truncate mt-0.5">
                    {sample.isHealthy
                      ? language === 'mr' ? '🟢 निरोगी' : language === 'hi' ? '🟢 स्वस्थ' : '🟢 Healthy'
                      : language === 'mr' ? '🔴 लक्षणे' : language === 'hi' ? '🔴 लक्षण' : '🔴 Diseased'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5: Step 5: Symptoms Checklist & History */}
      <div className="mb-4 bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-2 font-display">
          {t.stepSymptomsDetail || '5. Observed Symptoms & History'}
        </label>

        {/* Symptoms checklist */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {symptomList.map((sym) => {
            const isChecked = selectedSymptoms.includes(sym);
            return (
              <button
                key={sym}
                type="button"
                onClick={() => toggleSymptom(sym)}
                className={`text-[11px] px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-amber-400 text-forest-950 font-bold shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-forest-900" /> : <Square className="w-3.5 h-3.5 text-stone-400" />}
                <span>{sym}</span>
              </button>
            );
          })}
        </div>

        {/* Duration & Appetite Grids */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div>
            <label className="block text-[10px] font-bold text-stone-500 mb-1">{t.durationLabel}</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <option value="Less than 24 hours">{t.duration1Day}</option>
              <option value="2 to 3 days">{t.duration23Days}</option>
              <option value="4 to 7 days">{t.duration47Days}</option>
              <option value="More than a week">{t.durationMoreWeek}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-500 mb-1">{t.appetiteLabel}</label>
            <select
              value={appetiteStatus}
              onChange={(e) => setAppetiteStatus(e.target.value)}
              className="w-full px-2 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <option value="Normal feeding">{t.appetiteNormal}</option>
              <option value="Reduced appetite (~50%)">{t.appetiteReduced}</option>
              <option value="Completely off-feed">{t.appetiteNone}</option>
            </select>
          </div>
        </div>

        {/* Milk yield change */}
        <div className="mb-2">
          <label className="block text-[10px] font-bold text-stone-500 mb-1">{t.milkYieldLabel}</label>
          <select
            value={milkYieldImpact}
            onChange={(e) => setMilkYieldImpact(e.target.value)}
            className="w-full px-2 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
          >
            <option value="Normal yield">{t.milkNormal}</option>
            <option value="Reduced (20-40% drop)">{t.milkReduced}</option>
            <option value="Severe drop (>50% or discolored)">{t.milkDrastic}</option>
            <option value="Not applicable">{t.milkNA}</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[10px] font-bold text-stone-500 mb-1">{t.otherObservationsLabel}</label>
          <input
            type="text"
            placeholder={t.otherObservationsPlaceholder}
            value={otherNotes}
            onChange={(e) => setOtherNotes(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
        </div>
      </div>

      {/* Photo Guidance */}
      <PhotoGuidance />

      {/* Primary Submit CTA */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isAnalyzing}
        className="w-full py-4 px-6 rounded-2xl bg-forest-800 hover:bg-forest-900 active:scale-[0.98] text-white font-extrabold text-base transition-all duration-200 shadow-elevated flex items-center justify-center gap-2 font-display cursor-pointer"
      >
        <span className="text-lg">🩺</span>
        <span>{t.btnCheckCrop}</span>
      </button>

      {/* Processing Modal */}
      {isAnalyzing && <ProcessingModal />}

      {/* Invalid Crop Image Alert Modal */}
      {showInvalidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-elevated border-2 border-stone-200 text-center animate-scaleUp">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-inner">
              <span className="text-2xl">⚠️</span>
            </div>

            <h3 className="text-lg font-black text-stone-900 font-display mb-2">
              {t.invalidImageTitle}
            </h3>

            <p className="text-xs text-stone-600 mb-6 font-medium leading-relaxed">
              {t.invalidImageMsg}
            </p>

            <button
              type="button"
              onClick={() => setShowInvalidModal(false)}
              className="w-full py-3.5 px-5 rounded-2xl bg-forest-800 hover:bg-forest-900 active:scale-95 text-white font-extrabold text-sm transition-all shadow-md font-display cursor-pointer"
            >
              {t.btnOk}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
