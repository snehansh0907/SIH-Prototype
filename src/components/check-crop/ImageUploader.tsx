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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const hasImage = Boolean(selectedImage || selectedFile);

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
      setUploadError(null);
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
    setUploadError(null);
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
    setUploadError(null);
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
    if (!selectedImage && !selectedFile) {
      console.warn('[ImageUploader] Submit blocked: No image selected');
      setUploadError(t.pleaseUploadImage || 'Please upload a photo of the affected animal to continue');
      return;
    }

    setUploadError(null);

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

    try {
      const imageToDiagnose = selectedFile || selectedImage!;
      await performDiagnosis(selectedCropId, imageToDiagnose, payload);
    } catch (err: any) {
      console.error('[ImageUploader] Diagnosis failed:', err);
      let userFriendlyError = err?.message || 'An error occurred while analyzing the animal photo. Please try again.';
      if (/signal is aborted|abort|timeout|timed out/i.test(userFriendlyError)) {
        userFriendlyError = 'The diagnosis server took too long to respond. Please check your connection and try again.';
      } else if (/failed to fetch|network|connection|econnrefused/i.test(userFriendlyError)) {
        userFriendlyError = 'Unable to reach the diagnosis server. Please ensure the backend server is running.';
      }
      setUploadError(userFriendlyError);
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
    <main className="w-full max-w-full h-auto min-h-0 overflow-x-clip text-left animate-fadeIn">
      {/* Hidden File Inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

      {/* Main Vertical Content Flow Container */}
      <div className="w-full max-w-full h-auto min-h-0 flex flex-col gap-4 box-border">
        {/* 1. Header / Title Section */}
        <section aria-label="Check Animal Header" className="w-full max-w-full h-auto min-h-0 box-border shrink-1">
          <h2 className="text-xl font-extrabold text-forest-950 font-display flex items-center gap-2">
            <span className="text-2xl">🩺</span>
            <span>{t.checkCropTitle}</span>
          </h2>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
            {t.checkCropSubtitle}
          </p>
        </section>

        {/* 2. Step 1 & 2: Select Animal & Species */}
        <section aria-label="Animal and Species Selector" className="w-full max-w-full h-auto min-h-0 box-border shrink-1">
          <CropSelector />
        </section>

        {/* 3. Step 3: Affected Body Area */}
        <section aria-label="Affected Body Area" className="w-full max-w-full h-auto min-h-0 box-border shrink-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-forest-900/80 mb-1.5 font-display">
            {t.stepBodyAreaSelection || '3. Affected Body Area'}
          </label>
          <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 w-full min-w-0 h-auto">
            {bodyAreas.map((b) => {
              const isSelected = selectedBodyArea === b.key;
              return (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => setSelectedBodyArea(b.key)}
                  className={`flex items-center gap-2 p-2.5 rounded-2xl border text-left btn-tactile-subtle cursor-pointer min-w-0 h-auto w-full box-border ${
                    isSelected
                      ? 'bg-gradient-to-r from-forest-800 to-forest-700 text-white border-forest-600/50 shadow-md ring-2 ring-forest-400/40 font-bold'
                      : 'glass-card text-stone-700 border-white/80 hover:bg-white/90 shadow-xs'
                  }`}
                >
                  <span className="text-lg shrink-0">{b.icon}</span>
                  <span className="text-xs font-semibold leading-tight break-words flex-1 min-w-0">{b.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Step 4: Photo Upload / Preview Area */}
        <section aria-label="Photo Upload" className="w-full max-w-full h-auto min-h-0 box-border shrink-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-forest-900/80 mb-1.5 font-display">
            {t.stepPhotoUpload || '4. Symptom Photograph'}
          </label>

          {!selectedImage ? (
            <div className="glass-card rounded-3xl border-2 border-dashed border-forest-500/40 p-5 text-center shadow-glass hover:border-forest-600/60 transition-all bg-white/70 w-full max-w-full box-border h-auto">
              <div className="w-14 h-14 rounded-2xl bg-forest-100/90 text-forest-800 flex items-center justify-center mx-auto mb-2 text-2xl shadow-inner border border-forest-200/50">
                📸
              </div>
              <h4 className="text-sm font-extrabold text-forest-950 mb-1">{t.dragDropText}</h4>
              <p className="text-xs text-stone-500 mb-4 max-w-xs mx-auto leading-relaxed">{t.guideVisible}</p>

              <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-forest-800 to-forest-700 text-white font-bold text-xs hover:from-forest-900 hover:to-forest-800 btn-tactile shadow-md cursor-pointer border border-forest-600/40"
                >
                  <Camera className="w-4 h-4 text-gold-300" />
                  <span>{t.takePhoto}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-white/90 border border-forest-600/40 text-forest-900 font-bold text-xs hover:bg-forest-50/80 btn-tactile-subtle shadow-xs cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-forest-700" />
                  <span>{t.uploadImage}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden border border-forest-600/40 shadow-glass-xl bg-stone-950 w-full max-w-full box-border">
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
                <span className="px-3 py-1 rounded-full bg-forest-950/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 shadow-sm">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isSample ? t.fieldSample : t.photoReady}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full bg-forest-950/80 backdrop-blur-md text-white hover:bg-forest-900 text-xs transition-colors border border-white/20 cursor-pointer shadow-sm"
                    title={t.replacePhoto}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-2 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 text-xs transition-colors border border-white/20 cursor-pointer shadow-sm"
                    title={t.removePhoto}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent p-3 pt-6 text-white text-xs">
                <span className="font-semibold text-gold-300">
                  {language === 'mr' ? currentCrop.nameMr : language === 'hi' ? currentCrop.nameHi || currentCrop.name : currentCrop.name}
                </span>{' '}
                • {t.readyForAnalysis}
              </div>
            </div>
          )}
        </section>

        {/* 5. Verified Test Samples Section */}
        <section aria-label="Sample Cases" className="w-full max-w-full h-auto min-h-0 box-border shrink-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-forest-950">{t.orUseSample}</span>
            <span className="text-[11px] text-forest-700 font-semibold flex items-center gap-1 bg-forest-100/70 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-gold-500" />
              {t.oneClickTest}
            </span>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 w-full min-w-0 h-auto">
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
                  className={`flex items-center gap-2.5 p-2 rounded-2xl border text-left btn-tactile-subtle cursor-pointer min-w-0 h-auto w-full box-border ${
                    isPicked
                      ? 'bg-forest-100/90 border-forest-600/50 ring-2 ring-forest-400/40 shadow-sm'
                      : 'glass-card border-white/80 hover:bg-white/90 shadow-xs'
                  }`}
                >
                  <img
                    src={sample.url}
                    alt={title}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/60 shadow-xs"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (sample.fallbackUrl && target.src !== sample.fallbackUrl) {
                        target.src = sample.fallbackUrl;
                      }
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-extrabold text-forest-950 truncate leading-tight">
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
        </section>

        {/* 6. Symptoms & Observations Main Card */}
        <section aria-label="Symptoms and Clinical Observations" className="w-full max-w-full h-auto min-h-0 box-border shrink-1 glass-card rounded-3xl border-white/80 p-4 sm:p-5 shadow-glass bg-white/85">
          {/* 6A: Observed Symptoms Checklist */}
          <div className="w-full min-w-0 mb-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-forest-950 mb-2.5 font-display">
              {t.stepSymptomsDetail || '5. Observed Symptoms'}
            </label>

            {/* Natural Wrapping Flex Chip Layout */}
            <div className="flex flex-wrap items-start gap-2 w-full h-auto min-h-0 box-border">
              {symptomList.map((sym) => {
                const isChecked = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`inline-flex items-center justify-start gap-2 px-3.5 py-2.5 rounded-2xl font-semibold text-xs min-h-[40px] h-auto w-auto max-w-full box-border whitespace-normal text-left cursor-pointer btn-tactile-subtle ${
                      isChecked
                        ? 'bg-gradient-to-r from-forest-800 to-forest-700 text-white font-bold shadow-xs'
                        : 'bg-white/85 border border-stone-200/90 text-stone-700 hover:bg-forest-50/50'
                    }`}
                  >
                    {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-gold-300 shrink-0" /> : <Square className="w-3.5 h-3.5 text-stone-400 shrink-0" />}
                    <span className="whitespace-normal break-words max-w-full flex-1 min-w-0 leading-snug">{sym}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6B: Clinical History Form Fields */}
          <div className="w-full min-w-0 pt-3.5 border-t border-forest-100/70">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-forest-950 mb-3 font-display">
              {language === 'mr' ? 'तपासणी तपशील व नोंदी' : language === 'hi' ? 'निरीक्षण व स्थिति विवरण' : 'Clinical History & Details'}
            </label>

            {/* Duration & Appetite Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3 w-full min-w-0">
              <div className="min-w-0 w-full">
                <label className="block text-[10px] font-bold text-forest-900/70 mb-1">{t.durationLabel}</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full max-w-full box-border min-w-0 px-3 py-2.5 rounded-2xl bg-white/90 border border-stone-200/90 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 shadow-xs"
                >
                  <option value="Less than 24 hours">{t.duration1Day}</option>
                  <option value="2 to 3 days">{t.duration23Days}</option>
                  <option value="4 to 7 days">{t.duration47Days}</option>
                  <option value="More than a week">{t.durationMoreWeek}</option>
                </select>
              </div>

              <div className="min-w-0 w-full">
                <label className="block text-[10px] font-bold text-forest-900/70 mb-1">{t.appetiteLabel}</label>
                <select
                  value={appetiteStatus}
                  onChange={(e) => setAppetiteStatus(e.target.value)}
                  className="w-full max-w-full box-border min-w-0 px-3 py-2.5 rounded-2xl bg-white/90 border border-stone-200/90 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 shadow-xs"
                >
                  <option value="Normal feeding">{t.appetiteNormal}</option>
                  <option value="Reduced appetite (~50%)">{t.appetiteReduced}</option>
                  <option value="Completely off-feed">{t.appetiteNone}</option>
                </select>
              </div>
            </div>

            {/* Milk Yield Impact */}
            <div className="mb-3 min-w-0 w-full">
              <label className="block text-[10px] font-bold text-forest-900/70 mb-1">{t.milkYieldLabel}</label>
              <select
                value={milkYieldImpact}
                onChange={(e) => setMilkYieldImpact(e.target.value)}
                className="w-full max-w-full box-border min-w-0 px-3 py-2.5 rounded-2xl bg-white/90 border border-stone-200/90 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 shadow-xs"
              >
                <option value="Normal yield">{t.milkNormal}</option>
                <option value="Reduced (20-40% drop)">{t.milkReduced}</option>
                <option value="Severe drop (>50% or discolored)">{t.milkDrastic}</option>
                <option value="Not applicable">{t.milkNA}</option>
              </select>
            </div>

            {/* Other Observations Notes */}
            <div className="min-w-0 w-full">
              <label className="block text-[10px] font-bold text-forest-900/70 mb-1">{t.otherObservationsLabel}</label>
              <input
                type="text"
                placeholder={t.otherObservationsPlaceholder}
                value={otherNotes}
                onChange={(e) => setOtherNotes(e.target.value)}
                className="w-full max-w-full box-border min-w-0 px-3.5 py-2.5 rounded-2xl bg-white/90 border border-stone-200/90 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600 shadow-xs"
              />
            </div>
          </div>
        </section>

        {/* 7. Photo Guidelines Section */}
        <section aria-label="Photo Guidelines" className="w-full max-w-full h-auto min-h-0 box-border shrink-1">
          <PhotoGuidance />
        </section>

        {/* 8. Upload / Validation Error Banner (if any) */}
        {uploadError && (
          <section aria-label="Error Notice" className="w-full max-w-full h-auto min-h-0 box-border shrink-1">
            <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn w-full box-border">
              <span className="text-base shrink-0 mt-0.5">⚠️</span>
              <div className="leading-snug min-w-0 flex-1">
                <div className="font-bold text-rose-950 mb-0.5">
                  {uploadError.toLowerCase().includes('upload a photo') ||
                  uploadError.toLowerCase().includes('फोटो') ||
                  uploadError.toLowerCase().includes('photo')
                    ? language === 'mr'
                      ? 'फोटो आवश्यक आहे'
                      : language === 'hi'
                      ? 'फोटो आवश्यक है'
                      : 'Image Required'
                    : language === 'mr'
                    ? 'सूचना'
                    : language === 'hi'
                    ? 'सूचना'
                    : 'Notice'}
                </div>
                <div className="text-rose-800 break-words">{uploadError}</div>
              </div>
            </div>
          </section>
        )}

        {/* Helper text if no photo */}
        {!hasImage && (
          <div className="w-full max-w-full h-auto min-h-0 box-border">
            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center font-medium animate-fadeIn w-full box-border">
              📸 {t.pleaseUploadImage || 'Please upload a photo of the affected animal to continue'}
            </p>
          </div>
        )}

        {/* 9. Primary Submit CTA Section */}
        <section aria-label="Submit Health Check" className="w-full max-w-full h-auto min-h-0 box-border shrink-1 mt-1 mb-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isAnalyzing}
            className="w-full max-w-full h-auto min-h-[48px] py-4 px-6 rounded-2xl bg-gradient-to-r from-forest-800 via-forest-700 to-forest-800 hover:from-forest-900 hover:to-forest-800 text-white font-extrabold text-base shadow-float-glow flex items-center justify-center gap-2.5 font-display btn-tactile-hero cursor-pointer border border-forest-600/40"
          >
            <span className="text-xl">🩺</span>
            <span>{t.btnCheckCrop}</span>
          </button>
        </section>
      </div>

      {/* Processing Modal */}
      {isAnalyzing && <ProcessingModal />}

      {/* Invalid Crop Image Alert Modal */}
      {showInvalidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md modal-backdrop-anim">
          <div className="glass-card bg-white/95 rounded-3xl p-6 max-w-sm w-full shadow-glass-xl border border-white/90 text-center modal-surface-anim">
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
              className="w-full py-3.5 px-5 rounded-2xl bg-forest-800 hover:bg-forest-900 btn-tactile text-white font-extrabold text-sm shadow-md font-display cursor-pointer"
            >
              {t.btnOk}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
