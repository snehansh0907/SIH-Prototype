import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Sparkles,
  Globe,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  AlertCircle,
  ChevronDown,
  Navigation,
  Search,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { SEEDED_DEMO_FARMERS } from '../../services/authService';
import { ALL_INDIAN_STATES_AND_UTS } from '../../data/indianStates';
import {
  getDistrictsForState,
  getTalukasForDistrict,
  getVillagesForTaluka,
  findPincodeForVillage,
  normalizeStateName,
} from '../../data/locations';
import { SearchableSelect, type SelectOption } from '../common/SearchableSelect';
import { locationService, type LocationSearchResult } from '../../services/locationService';
import type { Language } from '../../types';

const SPECIES_LIST = [
  { key: 'cattle', transKey: 'cattle', defaultLabel: 'Cattle / Cow', icon: '🐄' },
  { key: 'buffalo', transKey: 'buffalo', defaultLabel: 'Buffalo', icon: '🐃' },
  { key: 'goat', transKey: 'goat', defaultLabel: 'Goat', icon: '🐐' },
  { key: 'sheep', transKey: 'sheep', defaultLabel: 'Sheep', icon: '🐑' },
  { key: 'poultry', transKey: 'poultry', defaultLabel: 'Poultry', icon: '🐔' },
];

export const LoginScreen: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { login, register, loginAsDemo } = useAuth();

  const isMarathi = language === 'mr';

  // Language Popover Menu State
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Active Tab: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Quick Demo Autofill Selector ('suresh' | 'ramesh' | 'vikas')
  const [selectedDemoKey, setSelectedDemoKey] = useState<'suresh' | 'ramesh' | 'vikas'>('suresh');

  // Registration Form State: Personal Details
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // India-Wide Location Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<any>(null);

  // Structured Editable Address Details
  const [regState, setRegState] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  const [regTaluka, setRegTaluka] = useState('');
  const [regVillage, setRegVillage] = useState('');
  const [regPincode, setRegPincode] = useState('');
  const [regLatitude, setRegLatitude] = useState<number | undefined>(undefined);
  const [regLongitude, setRegLongitude] = useState<number | undefined>(undefined);

  // Geolocation & Detection Feedback State
  const [detectStatus, setDetectStatus] = useState<
    'idle' | 'detecting_coords' | 'finding_address' | 'success' | 'error'
  >('idle');
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);

  // Herd / Farm Details
  const [regFarmName, setRegFarmName] = useState('Gauri Livestock Dairy');
  const [regHerdCount, setRegHerdCount] = useState<number | string>('8');
  const [regMainSpecies, setRegMainSpecies] = useState<string>('cattle');

  const [regError, setRegError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Success Screen State
  const [registeredFarmerId, setRegisteredFarmerId] = useState<string | null>(null);
  const [hasCopiedId, setHasCopiedId] = useState(false);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    };
  }, [searchDebounceTimer]);

  // Auto-fill Demo credentials without automatically logging in
  const handleAutofillDemo = (farmerKey: 'suresh' | 'ramesh' | 'vikas' = 'suresh') => {
    setSelectedDemoKey(farmerKey);
    const demo = SEEDED_DEMO_FARMERS[farmerKey];
    if (demo) {
      setLoginIdentifier(demo.farmerId);
      setLoginPassword(demo.passwords[0]);
      setLoginError(null);
    }
  };

  // Option A: Use My Current Location
  const handleDetectCurrentLocation = async () => {
    setLocationErrorMsg(null);
    setLocationSuccessMsg(null);
    setDetectStatus('detecting_coords');

    try {
      const coords = await locationService.getCurrentCoordinates();
      setDetectStatus('finding_address');

      const result = await locationService.reverseGeocode(coords.latitude, coords.longitude);

      if (result.success && (result.state || result.district || result.village)) {
        const detectedState = normalizeStateName(result.state) || result.state || '';
        const detectedDist = result.district || '';
        const detectedTal = result.taluka || result.village || '';
        const detectedVill = result.village || result.taluka || '';
        let detectedPin = result.pincode || '';

        if (detectedState) setRegState(detectedState);
        if (detectedDist) setRegDistrict(detectedDist);
        if (detectedTal) setRegTaluka(detectedTal);
        if (detectedVill) setRegVillage(detectedVill);

        if (!detectedPin && detectedState && detectedDist && (detectedTal || detectedVill)) {
          const pin = findPincodeForVillage(
            detectedState,
            detectedDist,
            detectedTal,
            detectedVill
          );
          if (pin) detectedPin = pin;
        }
        if (detectedPin) setRegPincode(detectedPin);

        setRegLatitude(result.latitude);
        setRegLongitude(result.longitude);

        const locationLabel = [detectedVill || detectedTal, detectedDist, detectedState]
          .filter(Boolean)
          .filter((v, i, a) => a.indexOf(v) === i)
          .join(', ');

        setLocationSuccessMsg(
          isMarathi
            ? `✓ स्थान आढळले: ${locationLabel}`
            : language === 'hi'
            ? `✓ स्थान मिल गया: ${locationLabel}`
            : `✓ Location detected: ${locationLabel}`
        );
        setDetectStatus('success');
      } else if (result.latitude && result.longitude) {
        setRegLatitude(result.latitude);
        setRegLongitude(result.longitude);
        setDetectStatus('success');
        setLocationSuccessMsg(
          isMarathi
            ? `✓ GPS समन्वय मिळाले (${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}). कृपया राज्य व जिल्हा निवडा.`
            : language === 'hi'
            ? `✓ GPS निर्देशांक प्राप्त हुए (${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)})। कृपया राज्य और ज़िला चुनें।`
            : `✓ GPS coordinates acquired (${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}). Please select State & District.`
        );
      } else {
        setDetectStatus('error');
        setLocationErrorMsg(
          result.errorMessage ||
            (isMarathi
              ? 'स्थान आढळले, परंतु पत्ता शोधता आला नाही. कृपया मॅन्युअली स्थान निवडा.'
              : language === 'hi'
              ? 'स्थान मिल गया, लेकिन पता नहीं खोजा जा सका। कृपया मैन्युअल रूप से स्थान चुनें।'
              : "Location detected, but we couldn't determine the address. Please select your location manually.")
        );
      }
    } catch (err: any) {
      setDetectStatus('error');
      const msg = err?.message || 'Unable to detect your location. Please select your location manually.';
      let localizedMsg = msg;
      if (isMarathi) {
        if (/permission was denied/i.test(msg)) {
          localizedMsg = 'स्थान परवानगी नाकारली गेली. कृपया स्थान परवानगी द्या किंवा मॅन्युअली स्थान निवडा.';
        } else if (/timed out/i.test(msg)) {
          localizedMsg = 'स्थान शोधण्याची वेळ संपली. कृपया पुन्हा प्रयत्न करा.';
        } else if (/not supported/i.test(msg)) {
          localizedMsg = 'तुमच्या ब्राउझरमध्ये स्थान शोधण्याची सुविधा उपलब्ध नाही. कृपया मॅन्युअली स्थान निवडा.';
        } else if (/unable to determine/i.test(msg) || /could not be determined/i.test(msg)) {
          localizedMsg = 'तुमचे स्थान शोधता आले नाही. कृपया पुन्हा प्रयत्न करा किंवा मॅन्युअली स्थान निवडा.';
        }
      } else if (language === 'hi') {
        if (/permission was denied/i.test(msg)) {
          localizedMsg = 'स्थान अनुमति अस्वीकृत कर दी गई। कृपया स्थान अनुमति दें या मैन्युअल रूप से स्थान चुनें।';
        } else if (/timed out/i.test(msg)) {
          localizedMsg = 'स्थान अनुरोध का समय समाप्त हो गया। कृपया पुनः प्रयास करें।';
        } else if (/not supported/i.test(msg)) {
          localizedMsg = 'आपके ब्राउज़र में स्थान सुविधा समर्थित नहीं है। कृपया मैन्युअल रूप से स्थान चुनें।';
        } else if (/unable to determine/i.test(msg) || /could not be determined/i.test(msg)) {
          localizedMsg = 'आपका स्थान निर्धारित नहीं किया जा सका। कृपया पुनः प्रयास करें या मैन्युअल रूप से स्थान चुनें।';
        }
      }
      setLocationErrorMsg(localizedMsg);
    }
  };

  // Option B: India-Wide Location Search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowDropdown(true);

    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    if (val.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await locationService.searchLocation(val);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    setSearchDebounceTimer(timer);
  };

  const handleSelectSearchResult = (item: LocationSearchResult) => {
    const matchedState = normalizeStateName(item.state) || item.state || '';
    setRegState(matchedState);
    setRegDistrict(item.district || '');
    setRegTaluka(item.taluka || item.village || '');
    setRegVillage(item.village || item.taluka || '');
    if (item.pincode) {
      setRegPincode(item.pincode);
    } else if (matchedState && item.district && (item.taluka || item.village)) {
      const pin = findPincodeForVillage(
        matchedState,
        item.district,
        item.taluka || item.village || '',
        item.village || item.taluka || ''
      );
      if (pin) setRegPincode(pin);
    }
    setRegLatitude(item.latitude);
    setRegLongitude(item.longitude);

    setSearchQuery(item.displayName);
    setShowDropdown(false);
    setLocationSuccessMsg(
      isMarathi
        ? `✓ स्थान निवडले: ${item.village || item.taluka}, ${item.district}`
        : language === 'hi'
        ? `✓ चयनित: ${item.village || item.taluka}, ${item.district}`
        : `✓ Selected: ${item.village || item.taluka}, ${item.district}`
    );
    setLocationErrorMsg(null);
  };

  // Cascading Location Handlers
  const handleStateChange = (newState: string) => {
    setRegState(newState);
    setRegDistrict('');
    setRegTaluka('');
    setRegVillage('');
    setRegPincode('');
    setLocationErrorMsg(null);
    setLocationSuccessMsg(null);
  };

  const handleDistrictChange = (newDistrict: string) => {
    setRegDistrict(newDistrict);
    setRegTaluka('');
    setRegVillage('');
    setRegPincode('');
  };

  const handleTalukaChange = (newTaluka: string) => {
    setRegTaluka(newTaluka);
    setRegVillage('');
    setRegPincode('');
  };

  const handleVillageChange = (newVillage: string, meta?: any) => {
    setRegVillage(newVillage);
    if (meta && meta.pincode) {
      setRegPincode(meta.pincode);
    } else if (regState && regDistrict && regTaluka && newVillage) {
      const pin = findPincodeForVillage(regState, regDistrict, regTaluka, newVillage);
      if (pin) setRegPincode(pin);
    }
  };

  const stateOptions: SelectOption[] = ALL_INDIAN_STATES_AND_UTS.map((s) => ({
    label: (isMarathi || language === 'hi') && s.nameMr ? `${s.nameMr} (${s.name})` : s.name,
    value: s.name,
    subLabel: s.isUT ? (isMarathi ? 'केंद्रशासित प्रदेश (UT)' : language === 'hi' ? 'केंद्र शासित प्रदेश (UT)' : 'Union Territory') : undefined,
  }));

  const districtList = regState ? getDistrictsForState(regState) : [];
  const districtOptions: SelectOption[] = districtList.map((d) => ({
    label: d,
    value: d,
  }));

  const talukaList = regState && regDistrict ? getTalukasForDistrict(regState, regDistrict) : [];
  const talukaOptions: SelectOption[] = talukaList.map((t) => ({
    label: (isMarathi || language === 'hi') && t.nameMr ? `${t.nameMr} (${t.name})` : t.name,
    value: t.name,
    subLabel: (isMarathi || language === 'hi') && t.nameMr ? t.nameMr : undefined,
  }));

  const villageList =
    regState && regDistrict && regTaluka
      ? getVillagesForTaluka(regState, regDistrict, regTaluka)
      : [];
  const villageOptions: SelectOption[] = villageList.map((v) => ({
    label: (isMarathi || language === 'hi') && v.nameMr ? `${v.nameMr} (${v.name})` : v.name,
    value: v.name,
    subLabel: v.pincode ? `PIN: ${v.pincode}` : undefined,
    meta: { pincode: v.pincode },
  }));

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError(t.valEnterIdPass);
      return;
    }

    setIsLoggingIn(true);
    const res = await login(loginIdentifier.trim(), loginPassword.trim());
    setIsLoggingIn(false);

    if (!res.success) {
      setLoginError(res.message || t.valLoginFailed);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError(t.valEnterName);
      return;
    }
    if (!regPhone.trim() || regPhone.trim().length < 10) {
      setRegError(t.valValidMobile);
      return;
    }
    if (!regPassword.trim() || regPassword.trim().length < 4) {
      setRegError(t.valPassLength);
      return;
    }
    if (!regState.trim()) {
      setRegError(isMarathi ? 'कृपया तुमचे राज्य निवडा' : language === 'hi' ? 'कृपया अपना राज्य चुनें।' : 'Please select your state.');
      return;
    }
    if (!regVillage.trim() || !regTaluka.trim() || !regDistrict.trim()) {
      setRegError(t.valLocationFields);
      return;
    }
    if (!regFarmName.trim()) {
      setRegError(isMarathi ? 'कृपया गोठा / डेअरी नाव प्रविष्ट करा' : language === 'hi' ? 'कृपया डेयरी/पशुपालन फार्म का नाम दर्ज करें।' : 'Please enter your dairy or herd name.');
      return;
    }

    setIsRegistering(true);
    const res = await register({
      name: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim() || undefined,
      password: regPassword.trim(),
      state: regState.trim(),
      district: regDistrict.trim(),
      taluka: regTaluka.trim() || regVillage.trim(),
      village: regVillage.trim(),
      pincode: regPincode.trim() || undefined,
      farmName: regFarmName.trim(),
      areaAcres: Number(regHerdCount) || 5,
      mainCrop: regMainSpecies,
      latitude: regLatitude,
      longitude: regLongitude,
    });
    setIsRegistering(false);

    if (res.success && res.user) {
      setRegisteredFarmerId(res.user.farmerId);
    } else {
      setRegError(res.message || t.valRegFailed);
    }
  };

  const handleCopyFarmerId = () => {
    if (registeredFarmerId) {
      navigator.clipboard.writeText(registeredFarmerId);
      setHasCopiedId(true);
      setTimeout(() => setHasCopiedId(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECE6DA] flex flex-col items-center justify-center p-3 sm:p-4 antialiased selection:bg-amber-200">
      {/* Desktop Helper Banner */}
      <div className="hidden md:flex items-center justify-between w-full max-w-md mb-3 px-2 text-xs text-stone-600">
        <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>🐄 Pashu Sarthak Authentication</span>
        </div>
        <div className="text-stone-500 font-medium">
          SIH26128 Prototype
        </div>
      </div>

      {/* Main Card Shell */}
      <div className="w-full max-w-md bg-[#F7F4EC] rounded-3xl shadow-2xl overflow-hidden border border-stone-300/80 flex flex-col relative">
        {/* Header Bar - High Contrast Green with 3-Language Selector */}
        <div className="bg-emerald-950 text-white px-5 py-3 flex items-center justify-between border-b border-emerald-800 relative z-30">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-300 font-display">
              {t.farmerBadge}
            </span>
          </div>

          {/* 3-Language Explicit Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-900 hover:bg-emerald-800 text-amber-300 border-2 border-amber-400/70 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
              aria-label="Select language (English / हिंदी / मराठी)"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{language === 'en' ? '🇬🇧 English' : language === 'hi' ? '🇮🇳 हिन्दी' : '🐄 मराठी'}</span>
              <ChevronDown className="w-3 h-3 text-amber-300/90 shrink-0" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-emerald-950 border-2 border-amber-400/90 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn py-1">
                {[
                  { code: 'en', label: '🇬🇧 English' },
                  { code: 'hi', label: '🇮🇳 हिन्दी' },
                  { code: 'mr', label: '🐄 मराठी' },
                ].map((langItem) => (
                  <button
                    key={langItem.code}
                    type="button"
                    onClick={() => {
                      setLanguage(langItem.code as Language);
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between transition-colors ${language === langItem.code
                        ? 'bg-amber-400 text-emerald-950 font-black'
                        : 'text-stone-200 hover:bg-emerald-800'
                      }`}
                  >
                    <span>{langItem.label}</span>
                    {language === langItem.code && <Check className="w-3.5 h-3.5 text-emerald-950" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Brand Banner Hero - Clear High Contrast Contrast */}
        <div className="bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 text-white px-6 pt-5 pb-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

          {/* Logo Icon */}
          <div className="w-14 h-14 rounded-2xl bg-emerald-700/90 border-2 border-amber-400/40 flex items-center justify-center text-3xl mx-auto mb-2.5 shadow-inner">
            🐄
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl font-black font-display tracking-tight text-white mb-0.5">
            {t.appName}
          </h1>
          <p className="text-xs font-bold text-amber-300 font-display mb-2.5">
            "{t.appTagline}"
          </p>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-600 text-xs font-bold text-amber-100 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t.trustMessage}</span>
          </div>
        </div>

        {/* Two Clear Choices/Tabs: [ Login ] [ Create Account ] */}
        <div className="px-5 pt-4 bg-[#F7F4EC]">
          <div className="grid grid-cols-2 p-1 bg-stone-200/90 rounded-2xl border border-stone-300">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setLoginError(null);
              }}
              className={`py-2.5 px-4 rounded-xl text-xs font-extrabold font-display transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'login'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-stone-700 hover:text-stone-900'
                }`}
            >
              <span>🔑 {t.loginTab}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setRegError(null);
              }}
              className={`py-2.5 px-4 rounded-xl text-xs font-extrabold font-display transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'register'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'text-stone-700 hover:text-stone-900'
                }`}
            >
              <span>🐄 {t.createAccountTab}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LOGIN FORM */}
        {activeTab === 'login' && (
          <div className="p-5 sm:p-6 bg-[#F7F4EC] flex-1 flex flex-col justify-between animate-fadeIn">
            <div>
              <div className="text-center mb-4">
                <h2 className="text-base font-black text-stone-900 font-display">
                  {t.loginTitle}
                </h2>
                <p className="text-xs text-stone-500 font-medium mt-0.5">
                  {t.loginSubtitle}
                </p>
              </div>

              {/* Error Feedback */}
              {loginError && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-bold flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Evaluator 1-Click Autofill Area */}
              <div className="mb-4 bg-amber-50 rounded-2xl p-3 border border-amber-300/90 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-950 font-display">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.autofillCredentials}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                    Evaluator Demo
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAutofillDemo('ramesh')}
                    className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-all active:scale-95 flex flex-col items-start ${
                      selectedDemoKey === 'ramesh' && loginIdentifier === 'farmer123'
                        ? 'bg-amber-200/90 border-amber-400 text-amber-950 font-black shadow-sm'
                        : 'bg-white border-amber-200 text-stone-700 hover:bg-amber-100/60'
                    }`}
                  >
                    <span className="font-extrabold truncate w-full text-left">🐄 Ramesh Patil</span>
                    <span className="text-[9px] text-stone-500">farmer123 (Gir)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutofillDemo('vikas')}
                    className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-all active:scale-95 flex flex-col items-start ${
                      selectedDemoKey === 'vikas' && loginIdentifier === 'vikas123'
                        ? 'bg-amber-200/90 border-amber-400 text-amber-950 font-black shadow-sm'
                        : 'bg-white border-amber-200 text-stone-700 hover:bg-amber-100/60'
                    }`}
                  >
                    <span className="font-extrabold truncate w-full text-left">🐃 Vikas More</span>
                    <span className="text-[9px] text-stone-500">vikas123 (Murrah)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutofillDemo('suresh')}
                    className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-all active:scale-95 flex flex-col items-start ${
                      selectedDemoKey === 'suresh' && loginIdentifier === 'suresh123'
                        ? 'bg-amber-200/90 border-amber-400 text-amber-950 font-black shadow-sm'
                        : 'bg-white border-amber-200 text-stone-700 hover:bg-amber-100/60'
                    }`}
                  >
                    <span className="font-extrabold truncate w-full text-left">🐐 Suresh Jadhav</span>
                    <span className="text-[9px] text-stone-500">suresh123 (Goats)</span>
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 mt-1.5 text-center font-medium">
                  {t.autofillPrompt}
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1 font-display">
                    {t.farmerIdLabel} / {t.mobile}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={t.loginIdPlaceholder}
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1 font-display">
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Primary LOGIN Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] text-white font-black text-sm font-display transition-all duration-200 shadow-elevated flex items-center justify-center gap-2 cursor-pointer border-2 border-emerald-700 disabled:opacity-75"
                >
                  <span>{isLoggingIn ? t.loading : t.btnLogin}</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </form>
            </div>

            {/* Secondary Action: Continue as Demo User */}
            <div className="mt-5 pt-3.5 border-t border-stone-200 text-center">
              <button
                type="button"
                onClick={() => loginAsDemo(selectedDemoKey)}
                className="w-full py-3 px-4 rounded-2xl bg-white border-2 border-stone-300 hover:bg-stone-50 active:scale-[0.98] text-stone-800 font-extrabold text-xs transition-all shadow-soft flex items-center justify-center gap-2 cursor-pointer font-display"
              >
                <span>{t.btnDemoUser}</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
              </button>
              <p className="text-[10px] text-stone-500 font-medium mt-1.5">
                {t.demoNoticeSub}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: CREATE NEW LIVESTOCK OWNER ACCOUNT */}
        {activeTab === 'register' && (
          <div className="p-5 sm:p-6 bg-[#F7F4EC] flex-1 flex flex-col justify-between animate-fadeIn max-h-[72vh] overflow-y-auto">
            <div>
              <div className="text-center mb-4">
                <h2 className="text-base font-black text-stone-900 font-display">
                  {t.newFarmerRegistration}
                </h2>
                <p className="text-xs text-stone-500 font-medium mt-0.5">
                  {t.setupFarmProfileSub}
                </p>
              </div>

              {regError && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-bold flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* SECTION 1: 👤 Livestock Owner Details */}
                <div className="bg-white rounded-2xl p-3.5 border border-stone-300/80 shadow-sm space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 font-display pb-1 border-b border-stone-100">
                    <span>👤</span>
                    <span>{t.aboutYou}</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-0.5">
                      {t.fullNameLabel}
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder={t.fullNamePlaceholder}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-0.5">
                        {t.mobileNumberLabel}
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="9876543210"
                          maxLength={10}
                          className="w-full pl-8 pr-2.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-0.5">
                        {t.passwordLabel}
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••"
                          className="w-full pl-8 pr-2.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-0.5">
                      {t.emailOptionalLabel}
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="owner@example.com"
                        className="w-full pl-8 pr-2.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: 📍 Farm / Barn Location */}
                <div className="bg-white rounded-2xl p-4 border border-stone-300/80 shadow-sm space-y-3">
                  <div className="pb-1 border-b border-stone-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 font-display">
                        <MapPin className="w-4 h-4 text-emerald-700" />
                        <span>{isMarathi ? '📍 तुमच्या गोठ्याचे / गावाचे स्थान' : language === 'hi' ? '📍 आपके पशुपालन / गाँव का स्थान' : '📍 Barn / Village Location'}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                        {isMarathi ? 'अखिल भारतीय' : language === 'hi' ? 'अखिल भारतीय' : 'All-India'}
                      </span>
                    </div>
                  </div>

                  {/* OPTION A: Use My Current Location Button */}
                  <button
                    type="button"
                    onClick={handleDetectCurrentLocation}
                    disabled={detectStatus === 'detecting_coords' || detectStatus === 'finding_address'}
                    className={`w-full py-2.5 px-3.5 rounded-xl border-2 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99] ${
                      detectStatus === 'success'
                        ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-600 text-emerald-950'
                        : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-600/70 text-emerald-900'
                    }`}
                  >
                    {detectStatus === 'detecting_coords' ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin" />
                        <span>{isMarathi ? '⏳ स्थान शोधत आहे...' : language === 'hi' ? '⏳ स्थान का पता लगा रहे हैं...' : '⏳ Detecting location...'}</span>
                      </>
                    ) : detectStatus === 'finding_address' ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin" />
                        <span>{isMarathi ? '📍 स्थान आढळले. पत्ता शोधत आहे...' : language === 'hi' ? '📍 स्थान मिल गया। पता खोज रहे हैं...' : '📍 Location detected. Finding address...'}</span>
                      </>
                    ) : detectStatus === 'success' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{isMarathi ? '✓ स्थान आढळले (पुन्हा शोधण्यासाठी दाबा)' : language === 'hi' ? '✓ स्थान मिल गया (पुनः खोजने के लिए क्लिक करें)' : '✓ Location Detected (Click to re-detect)'}</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{isMarathi ? '📍 माझे सध्याचे स्थान वापरा' : language === 'hi' ? '📍 मेरे वर्तमान स्थान का उपयोग करें' : '📍 Use My Current Location'}</span>
                      </>
                    )}
                  </button>

                  {locationSuccessMsg && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] font-bold flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{locationSuccessMsg}</span>
                    </div>
                  )}

                  {locationErrorMsg && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-semibold flex items-start gap-2 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>{locationErrorMsg}</span>
                    </div>
                  )}

                  {/* OPTION B: Smart India-Wide Search Bar */}
                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1 font-display">
                      {isMarathi
                        ? '🔎 गाव, शहर, जिल्हा किंवा पिनकोड शोधा'
                        : language === 'hi'
                        ? '🔎 गाँव, शहर, ज़िला या पिनकोड खोजें'
                        : '🔎 Search Village, Town, City, District, or Pincode'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <Search className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => {
                          if (searchResults.length > 0) setShowDropdown(true);
                        }}
                        placeholder={
                          isMarathi
                            ? 'उदा. निफाड, नाशिक, 422303 किंवा रामपूर...'
                            : language === 'hi'
                            ? 'उदा. निफाड़, नासिक, 422303 या रामपुर...'
                            : 'e.g. Niphad, Nashik, Pune, Rampur, 422303...'
                        }
                        className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-sm"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                            setShowDropdown(false);
                          }}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-stone-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {showDropdown && (
                      <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-xl border border-stone-300/80 overflow-hidden max-h-56 overflow-y-auto">
                        {isSearching && (
                          <div className="p-3 text-xs text-stone-500 flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                            <span>{isMarathi ? 'स्थान शोधत आहे...' : language === 'hi' ? 'स्थान खोज रहे हैं...' : 'Searching across India...'}</span>
                          </div>
                        )}
                        {searchResults.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectSearchResult(item)}
                            className="w-full px-3 py-2 text-left text-xs text-stone-800 hover:bg-emerald-50 border-b border-stone-100 last:border-0 flex items-start gap-2 transition-colors cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                            <div className="truncate">
                              <div className="font-bold text-stone-900 truncate">
                                {item.village || item.taluka || item.displayName}
                              </div>
                              <div className="text-[10px] text-stone-500 truncate">{item.displayName}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* STRUCTURED EDITABLE DETAILS */}
                  <div className="space-y-2.5 pt-2 border-t border-stone-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <SearchableSelect
                        id="reg-state-select"
                        label={isMarathi ? 'राज्य (State)' : language === 'hi' ? 'राज्य (State)' : 'State'}
                        required
                        value={regState}
                        onChange={handleStateChange}
                        options={stateOptions}
                        placeholder={isMarathi ? '-- राज्य निवडा --' : language === 'hi' ? '-- राज्य चुनें --' : '-- Select State --'}
                        searchPlaceholder={isMarathi ? 'राज्य शोधा...' : language === 'hi' ? 'राज्य खोजें...' : 'Search state...'}
                        noOptionsText={isMarathi ? 'राज्य आढळले नाही' : language === 'hi' ? 'कोई राज्य नहीं मिला' : 'No state found'}
                      />

                      <SearchableSelect
                        id="reg-district-select"
                        label={isMarathi ? 'जिल्हा (District)' : language === 'hi' ? 'ज़िला (District)' : 'District'}
                        required
                        value={regDistrict}
                        onChange={handleDistrictChange}
                        options={districtOptions}
                        disabled={!regState}
                        disabledPlaceholder={isMarathi ? '-- आधी राज्य निवडा --' : language === 'hi' ? '-- पहले राज्य चुनें --' : '-- Select State First --'}
                        placeholder={isMarathi ? '-- जिल्हा निवडा --' : language === 'hi' ? '-- ज़िला चुनें --' : '-- Select District --'}
                        searchPlaceholder={isMarathi ? 'जिल्हा शोधा...' : language === 'hi' ? 'ज़िला खोजें...' : 'Search district...'}
                        noOptionsText={isMarathi ? 'जिल्हा आढळला नाही' : language === 'hi' ? 'कोई ज़िला नहीं मिला' : 'No district found'}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <SearchableSelect
                        id="reg-taluka-select"
                        label={isMarathi ? 'तालुका / तहसील (Taluka)' : language === 'hi' ? 'तहसील / तालुका (Tehsil)' : 'Taluka / Tehsil'}
                        value={regTaluka}
                        onChange={handleTalukaChange}
                        options={talukaOptions}
                        allowCustomInput={true}
                        disabled={!regDistrict}
                        disabledPlaceholder={isMarathi ? '-- आधी जिल्हा निवडा --' : language === 'hi' ? '-- पहले ज़िला चुनें --' : '-- Select District First --'}
                        placeholder={isMarathi ? 'उदा. निफाड किंवा टाईप करा' : language === 'hi' ? 'उदा. निफाड़ या तहसील टाइप करें' : 'e.g. Niphad or type tehsil'}
                        searchPlaceholder={isMarathi ? 'तालुका शोधा...' : language === 'hi' ? 'तहसील/तालुका खोजें...' : 'Search taluka...'}
                        noOptionsText={isMarathi ? 'तालुका सापडला नाही. स्वतः टाईप करू शकता.' : language === 'hi' ? 'तहसील नहीं मिली। आप सीधे टाइप कर सकते हैं।' : 'No pre-indexed taluka. You can type directly.'}
                      />

                      <SearchableSelect
                        id="reg-village-select"
                        label={isMarathi ? 'गाव / परिसर (Village)' : language === 'hi' ? 'गाँव / क्षेत्र (Village)' : 'Village / Locality'}
                        required
                        value={regVillage}
                        onChange={handleVillageChange}
                        options={villageOptions}
                        allowCustomInput={true}
                        disabled={!regTaluka}
                        disabledPlaceholder={isMarathi ? '-- आधी तालुका निवडा --' : language === 'hi' ? '-- पहले तहसील चुनें --' : '-- Select Taluka First --'}
                        placeholder={isMarathi ? 'तुमच्या गावाचे नाव किंवा निवडा' : language === 'hi' ? 'अपने गाँव का नाम दर्ज करें या चुनें' : 'Enter your village name or select'}
                        searchPlaceholder={isMarathi ? 'गाव शोधा...' : language === 'hi' ? 'गाँव खोजें...' : 'Search village...'}
                        noOptionsText={isMarathi ? 'गाव यादीत नाही. थेट टाईप करा.' : language === 'hi' ? 'गाँव सूची में नहीं है। सीधे टाइप कर सकते हैं।' : 'Not in quick list. You can type directly.'}
                      />
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5 font-display">
                        {isMarathi ? 'पिनकोड (Pincode)' : language === 'hi' ? 'पिनकोड (Pincode)' : 'Pincode'}
                      </label>
                      <input
                        type="text"
                        value={regPincode}
                        onChange={(e) => setRegPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder={isMarathi ? 'उदा. 422303' : language === 'hi' ? 'उदा. 422303' : 'e.g. 422303'}
                        maxLength={6}
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  {regLatitude && regLongitude && (
                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] bg-stone-50 rounded-xl p-2.5 border border-stone-200">
                        <div className="flex items-center gap-1.5 text-stone-700 font-bold truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="truncate">
                            📍 {regVillage || regTaluka}, {regDistrict}, {regState}
                            {regPincode ? ` - ${regPincode}` : ''}
                          </span>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          <span>GPS ✓</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 3: 🐄 Your Herd & Livestock Setup */}
                <div className="bg-white rounded-2xl p-3.5 border border-stone-300/80 shadow-sm space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 font-display pb-1 border-b border-stone-100">
                    <span className="text-base">🐄</span>
                    <span>{t.myHerd}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-0.5">
                        {isMarathi ? 'गोठा / डेअरी नाव' : language === 'hi' ? 'डेयरी / पशुपालन का नाम' : 'Dairy / Herd Name'}
                      </label>
                      <input
                        type="text"
                        value={regFarmName}
                        onChange={(e) => setRegFarmName(e.target.value)}
                        placeholder="Gauri Dairy Farm"
                        className="w-full px-2.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-0.5">
                        {isMarathi ? 'एकूण पशू संख्या' : language === 'hi' ? 'कुल पशु संख्या' : 'Total Livestock Count'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={regHerdCount}
                        onChange={(e) => setRegHerdCount(e.target.value)}
                        placeholder="8"
                        className="w-full px-2.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        required
                      />
                    </div>
                  </div>

                  {/* Primary Species Selector */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1.5 font-display">
                      {isMarathi ? 'मुख्य पशु प्रकार निवडा' : language === 'hi' ? 'मुख्य पशु प्रकार चुनें' : 'Primary Animal Species'}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {SPECIES_LIST.map((s) => (
                        <button
                          key={s.key}
                          type="button"
                          onClick={() => setRegMainSpecies(s.key)}
                          className={`py-2 px-1 rounded-xl border text-xs font-extrabold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                            regMainSpecies === s.key
                              ? 'bg-emerald-800 text-white border-emerald-900 shadow-md scale-[1.02]'
                              : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          <span className="text-base">{s.icon}</span>
                          <span className="truncate max-w-full text-[10px]">
                            {t[s.transKey as keyof typeof t] || s.defaultLabel}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Registration Button */}
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-emerald-950 font-black text-sm font-display transition-all duration-200 shadow-elevated flex items-center justify-center gap-2 cursor-pointer border-2 border-amber-300 disabled:opacity-75"
                >
                  <span>{isRegistering ? t.creatingAccount : t.btnCreateAccountSubmit}</span>
                  <ArrowRight className="w-4 h-4 text-emerald-950" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* REGISTRATION SUCCESS MODAL */}
      {registeredFarmerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#F7F4EC] rounded-3xl border-2 border-emerald-700 shadow-2xl overflow-hidden text-center animate-scaleUp">
            <div className="bg-gradient-to-b from-emerald-900 to-emerald-800 text-white p-6 relative">
              <div className="w-16 h-16 rounded-3xl bg-amber-400 text-emerald-950 flex items-center justify-center mx-auto mb-3 text-3xl shadow-lg animate-bounce">
                🐄
              </div>
              <h3 className="text-xl font-black font-display tracking-tight text-white mb-1">
                {t.welcomeModalTitle}
              </h3>
              <p className="text-xs text-amber-200 font-medium">
                {t.accountCreatedSub}
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-white rounded-2xl p-4 border-2 border-emerald-600/60 shadow-sm">
                <div className="text-[11px] uppercase font-bold text-stone-500 mb-1">
                  {t.permanentFarmerId}
                </div>
                <div className="text-2xl font-black font-mono tracking-wider text-emerald-900 select-all mb-2">
                  {registeredFarmerId}
                </div>

                <button
                  type="button"
                  onClick={handleCopyFarmerId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all active:scale-95 cursor-pointer border border-stone-300"
                >
                  {hasCopiedId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-600" />
                      <span>{t.btnCopyId}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-left text-xs text-emerald-900 font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{t.saveIdNotice}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRegisteredFarmerId(null);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] text-white font-black text-xs font-display transition-all shadow-elevated flex items-center justify-center gap-2 cursor-pointer border-2 border-emerald-700"
              >
                <span>{t.btnContinueToDashboard}</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
