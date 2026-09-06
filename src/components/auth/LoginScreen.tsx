import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Sparkles,
  Globe,
  MapPin,
  Phone,
  Mail,
  Sprout,
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
  Map as MapIcon,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { SEEDED_DEMO_FARMERS } from '../../services/authService';
import { ALL_INDIAN_STATES_AND_UTS } from '../../data/indianStates';
import { locationService, type LocationSearchResult } from '../../services/locationService';

export const LoginScreen: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { login, register, loginAsDemo } = useAuth();

  const isMarathi = language === 'mr';

  // Active Tab: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Quick Demo Autofill Selector ('ramesh' | 'vikas')
  const [selectedDemoKey, setSelectedDemoKey] = useState<'ramesh' | 'vikas'>('ramesh');

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
  const [regState, setRegState] = useState('Maharashtra');
  const [regDistrict, setRegDistrict] = useState('Nashik');
  const [regTaluka, setRegTaluka] = useState('Niphad');
  const [regVillage, setRegVillage] = useState('Niphad');
  const [regPincode, setRegPincode] = useState('422303');
  const [regLatitude, setRegLatitude] = useState<number | undefined>(20.0797);
  const [regLongitude, setRegLongitude] = useState<number | undefined>(74.1071);

  // Geolocation & Detection Feedback State
  const [detectStatus, setDetectStatus] = useState<
    'idle' | 'detecting_coords' | 'finding_address' | 'success' | 'error'
  >('idle');
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);

  // Farm Details
  const [regFarmName, setRegFarmName] = useState('My Green Farm');
  const [regAreaAcres, setRegAreaAcres] = useState<number | string>('2.5');
  const [regMainCrop, setRegMainCrop] = useState<'Tomato' | 'Cotton' | 'Soybean'>('Tomato');

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

  // ----------------------------------------------------
  // Handlers
  // ----------------------------------------------------

  // Auto-fill Demo credentials without automatically logging in
  const handleAutofillDemo = (farmerKey: 'ramesh' | 'vikas' = 'ramesh') => {
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
      // 1. Request browser GPS permission and acquire coordinates
      const coords = await locationService.getCurrentCoordinates();
      setDetectStatus('finding_address');

      // 2. Reverse geocode coordinates into structured address
      const result = await locationService.reverseGeocode(coords.latitude, coords.longitude);
      if (result.success) {
        if (result.state) setRegState(result.state);
        if (result.district) setRegDistrict(result.district);
        if (result.taluka) setRegTaluka(result.taluka);
        if (result.village) setRegVillage(result.village);
        if (result.pincode) setRegPincode(result.pincode);
        setRegLatitude(result.latitude);
        setRegLongitude(result.longitude);

        const place = result.village || result.taluka || result.district || 'Location';
        setLocationSuccessMsg(
          isMarathi
            ? `✓ स्थान यशस्वीरित्या आढळले: ${place}, ${result.district}`
            : `✓ Location detected successfully: ${place}, ${result.district}`
        );
        setDetectStatus('success');
      }
    } catch (err: any) {
      setDetectStatus('error');
      setLocationErrorMsg(
        err.message ||
          (isMarathi
            ? 'आम्ही तुमचे स्थान ॲक्सेस करू शकलो नाही. कृपया स्थान मॅन्युअली शोधा.'
            : "We couldn't access your location. Please search for your location manually.")
      );
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
    setRegState(item.state || 'Maharashtra');
    setRegDistrict(item.district || '');
    setRegTaluka(item.taluka || item.village || '');
    setRegVillage(item.village || item.taluka || '');
    if (item.pincode) setRegPincode(item.pincode);
    setRegLatitude(item.latitude);
    setRegLongitude(item.longitude);

    setSearchQuery(item.displayName);
    setShowDropdown(false);
    setLocationSuccessMsg(
      isMarathi
        ? `✓ स्थान निवडले: ${item.village || item.taluka}, ${item.district}`
        : `✓ Selected: ${item.village || item.taluka}, ${item.district}`
    );
    setLocationErrorMsg(null);
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError(isMarathi ? 'कृपया शेतकरी आयडी आणि पासवर्ड टाका' : 'Please enter your Farmer ID/Mobile and Password.');
      return;
    }

    setIsLoggingIn(true);
    const res = await login(loginIdentifier.trim(), loginPassword.trim());
    setIsLoggingIn(false);

    if (!res.success) {
      setLoginError(res.message || (isMarathi ? 'लॉगिन अयशस्वी झाले. कृपया माहिती तपासा.' : 'Login failed. Please check your credentials.'));
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    // Validation
    if (!regName.trim()) {
      setRegError(isMarathi ? 'कृपया तुमचे पूर्ण नाव प्रविष्ट करा' : 'Please enter your full name.');
      return;
    }
    if (!regPhone.trim() || regPhone.trim().length < 10) {
      setRegError(isMarathi ? 'कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!regPassword.trim() || regPassword.trim().length < 4) {
      setRegError(isMarathi ? 'पासवर्ड किमान ४ अक्षरांचा असावा' : 'Password must be at least 4 characters long.');
      return;
    }
    if (!regState.trim()) {
      setRegError(isMarathi ? 'कृपया तुमचे राज्य निवडा' : 'Please select your state.');
      return;
    }
    if (!regDistrict.trim()) {
      setRegError(isMarathi ? 'कृपया तुमचा जिल्हा प्रविष्ट करा' : 'Please enter your district.');
      return;
    }
    if (!regVillage.trim()) {
      setRegError(isMarathi ? 'कृपया तुमचे गाव / परिसर प्रविष्ट करा' : 'Please enter your village / locality.');
      return;
    }
    if (!regFarmName.trim()) {
      setRegError(isMarathi ? 'कृपया तुमच्या शेताचे नाव प्रविष्ट करा' : 'Please enter your farm name.');
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
      areaAcres: regAreaAcres || 1,
      mainCrop: regMainCrop,
      latitude: regLatitude,
      longitude: regLongitude,
    });
    setIsRegistering(false);

    if (res.success && res.user) {
      setRegisteredFarmerId(res.user.farmerId);
    } else {
      setRegError(res.message || (isMarathi ? 'नोंदणी अयशस्वी झाली' : 'Registration failed.'));
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
    <div className="min-h-screen bg-[#ECE6DA] flex flex-col items-center justify-center p-3 sm:p-4 antialiased selection:bg-forest-200">
      {/* Desktop Helper Banner */}
      <div className="hidden md:flex items-center justify-between w-full max-w-md mb-3 px-2 text-xs text-stone-600">
        <div className="flex items-center gap-1.5 font-semibold text-forest-900">
          <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse"></span>
          <span>🌾 Krishi Sarthak Authentication</span>
        </div>
        <div className="text-stone-500 font-medium">
          SIH26131 Prototype
        </div>
      </div>

      {/* Main Card Shell */}
      <div className="w-full max-w-md bg-[#F7F4EC] rounded-3xl shadow-2xl overflow-hidden border border-stone-300/80 flex flex-col relative">
        {/* Header Bar */}
        <div className="bg-forest-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-forest-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-display">
              {t.farmerBadge}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold border border-white/20 transition-all active:scale-95 cursor-pointer"
            aria-label="Toggle language (English / हिंदी / मराठी)"
          >
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'मराठी'}</span>
          </button>
        </div>

        {/* Brand Banner Hero */}
        <div className="bg-gradient-to-b from-forest-900 via-forest-800 to-forest-900 text-white px-6 pt-5 pb-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

          {/* Logo Icon */}
          <div className="w-14 h-14 rounded-2xl bg-forest-700/90 border-2 border-forest-500/80 flex items-center justify-center text-3xl mx-auto mb-2.5 shadow-inner">
            🌱
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl font-black font-display tracking-tight text-white mb-0.5">
            {t.appName}
          </h1>
          <p className="text-xs font-bold text-amber-300 font-display mb-2.5">
            "{t.appTagline}"
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-950/70 border border-forest-700 text-[11px] font-semibold text-wheat-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
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
              className={`py-2.5 px-4 rounded-xl text-xs font-extrabold font-display transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-forest-800 text-white shadow-md'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <span>🔑 {isMarathi ? 'लॉगिन करा' : 'Login'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setRegError(null);
              }}
              className={`py-2.5 px-4 rounded-xl text-xs font-extrabold font-display transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-forest-800 text-white shadow-md'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <span>🌾 {isMarathi ? 'नवीन खाते तयार करा' : 'Create Account'}</span>
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: LOGIN FORM */}
        {/* ==================================================== */}
        {activeTab === 'login' && (
          <div className="p-5 sm:p-6 bg-[#F7F4EC] flex-1 flex flex-col justify-between animate-fadeIn">
            <div>
              <div className="text-center mb-4">
                <h2 className="text-base font-black text-stone-900 font-display">
                  {t.loginTitle}
                </h2>
                <p className="text-xs text-stone-500 font-medium mt-0.5">
                  {isMarathi ? 'आपल्या शेतकरी आयडीने प्रवेश करा' : 'Sign in to access personalized crop monitoring'}
                </p>
              </div>

              {/* Error Feedback */}
              {loginError && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-bold flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Evaluator 1-Click Autofill Area with Demo Farmer Switcher */}
              <div className="mb-4 bg-amber-50 rounded-2xl p-3 border border-amber-300/90 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-950 font-display">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isMarathi ? 'डेमो क्रेडेन्शियल्स ऑटो-फिल' : 'Auto-fill Demo Credentials'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                    Evaluator Ready
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAutofillDemo('ramesh')}
                    className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all active:scale-95 flex flex-col items-start ${
                      selectedDemoKey === 'ramesh' && loginIdentifier === 'farmer123'
                        ? 'bg-amber-200/90 border-amber-400 text-amber-950 font-black shadow-sm'
                        : 'bg-white border-amber-200 text-stone-700 hover:bg-amber-100/60'
                    }`}
                  >
                    <span className="font-extrabold">🍅 Ramesh Patil</span>
                    <span className="text-[10px] text-stone-500">farmer123 (Tomato)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAutofillDemo('vikas')}
                    className={`py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all active:scale-95 flex flex-col items-start ${
                      selectedDemoKey === 'vikas' && loginIdentifier === 'vikas123'
                        ? 'bg-amber-200/90 border-amber-400 text-amber-950 font-black shadow-sm'
                        : 'bg-white border-amber-200 text-stone-700 hover:bg-amber-100/60'
                    }`}
                  >
                    <span className="font-extrabold">🌱 Vikas More</span>
                    <span className="text-[10px] text-stone-500">vikas123 (Soybean)</span>
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 mt-1.5 text-center font-medium">
                  {isMarathi ? 'माहिती भरण्यासाठी वर टॅप करा, नंतर खाली लॉगिन बटनावर क्लिक करा' : 'Tap above to fill fields, then click Login below'}
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {/* Farmer ID / Email / Mobile Input */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1 font-display">
                    {t.farmerIdLabel} / {isMarathi ? 'मोबाईल' : 'Mobile'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={isMarathi ? 'उदा. farmer123 किंवा KSF-...' : 'e.g. farmer123, KSF-..., or Mobile'}
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
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
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>

                {/* Primary LOGIN Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 rounded-2xl bg-forest-800 hover:bg-forest-900 active:scale-[0.98] text-white font-black text-sm font-display transition-all duration-200 shadow-elevated flex items-center justify-center gap-2 cursor-pointer border-2 border-forest-700 disabled:opacity-75"
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
                {isMarathi ? 'लॉगिन न करता थेट मुख्य माहिती पाहण्यासाठी डेमो वापरा' : 'Explore public features without entering credentials'}
              </p>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: CREATE NEW FARMER ACCOUNT */}
        {/* ==================================================== */}
        {activeTab === 'register' && (
          <div className="p-5 sm:p-6 bg-[#F7F4EC] flex-1 flex flex-col justify-between animate-fadeIn max-h-[72vh] overflow-y-auto">
            <div>
              <div className="text-center mb-4">
                <h2 className="text-base font-black text-stone-900 font-display">
                  {isMarathi ? 'नवीन शेतकरी नोंदणी' : 'New Farmer Registration'}
                </h2>
                <p className="text-xs text-stone-500 font-medium mt-0.5">
                  {isMarathi ? 'भारतातील कोणत्याही भागातील शेतकरी नोंदणी करू शकतात' : 'Register your farm anywhere across India'}
                </p>
              </div>

              {/* Error Feedback */}
              {regError && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-300 text-xs text-rose-900 font-bold flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* SECTION 1: 👤 About You */}
                <div className="bg-white rounded-2xl p-3.5 border border-stone-300/80 shadow-sm space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-forest-900 font-display pb-1 border-b border-stone-100">
                    <span>👤</span>
                    <span>{isMarathi ? 'आपल्याविषयी (Personal Details)' : 'About You'}</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5">
                      {isMarathi ? 'पूर्ण नाव *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder={isMarathi ? 'उदा. ज्ञानेश्वर पाटील' : 'e.g. Snehansh Patil'}
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5">
                        {isMarathi ? 'मोबाईल नंबर *' : 'Mobile Number *'}
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="9876543210"
                          maxLength={10}
                          className="w-full pl-8 pr-2.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5">
                        {isMarathi ? 'पासवर्ड *' : 'Password *'}
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••"
                          className="w-full pl-8 pr-2.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5">
                      {isMarathi ? 'ईमेल (ऐच्छिक)' : 'Email (Optional)'}
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="farmer@example.com"
                        className="w-full pl-8 pr-2.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: 📍 Your Farm Location (Scalable India-wide System) */}
                <div className="bg-white rounded-2xl p-4 border border-stone-300/80 shadow-sm space-y-3">
                  <div className="pb-1 border-b border-stone-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black text-forest-900 font-display">
                        <MapPin className="w-4 h-4 text-forest-700" />
                        <span>{isMarathi ? '📍 तुमच्या शेताचे स्थान' : '📍 Your Farm Location'}</span>
                      </div>
                      <span className="text-[10px] font-bold text-forest-800 bg-forest-100/90 px-2 py-0.5 rounded-full">
                        {isMarathi ? 'अखिल भारतीय' : 'All-India'}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                      {isMarathi
                        ? 'शेताचे स्थान शोधा किंवा तुमचे सध्याचे स्थान वापरा.'
                        : 'Search your farm location across India or use current location.'}
                    </p>
                  </div>

                  {/* OPTION A: Use My Current Location Button */}
                  <button
                    type="button"
                    onClick={handleDetectCurrentLocation}
                    disabled={detectStatus === 'detecting_coords' || detectStatus === 'finding_address'}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-forest-50 hover:bg-forest-100 active:scale-[0.99] border-2 border-forest-600/70 text-forest-900 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {detectStatus === 'detecting_coords' ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-forest-700 border-t-transparent animate-spin" />
                        <span>{isMarathi ? 'स्थान शोधत आहे...' : 'Detecting your location...'}</span>
                      </>
                    ) : detectStatus === 'finding_address' ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-forest-700 border-t-transparent animate-spin" />
                        <span>{isMarathi ? 'पत्ता शोधत आहे...' : 'Finding your address...'}</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3.5 h-3.5 text-forest-700 shrink-0" />
                        <span>{isMarathi ? '📍 माझे सध्याचे स्थान वापरा' : '📍 Use My Current Location'}</span>
                      </>
                    )}
                  </button>

                  {/* Geolocation Success Feedback */}
                  {locationSuccessMsg && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-[11px] font-bold flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{locationSuccessMsg}</span>
                    </div>
                  )}

                  {/* Geolocation Error Feedback */}
                  {locationErrorMsg && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-semibold flex items-start gap-2 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>{locationErrorMsg}</span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="relative flex items-center py-0.5">
                    <div className="flex-grow border-t border-stone-200"></div>
                    <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-stone-400">
                      {isMarathi ? 'किंवा शोधा' : 'OR SEARCH'}
                    </span>
                    <div className="flex-grow border-t border-stone-200"></div>
                  </div>

                  {/* OPTION B: Smart India-Wide Search Bar */}
                  <div className="relative">
                    <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1 font-display">
                      {isMarathi
                        ? '🔎 गाव, शहर, जिल्हा किंवा पिनकोड शोधा'
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
                            : 'e.g. Niphad, Nashik, Pune, Rampur, 422303...'
                        }
                        className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 shadow-sm"
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

                    {/* Dynamic Auto-Complete Search Results Dropdown */}
                    {showDropdown && (
                      <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-xl border border-stone-300/80 overflow-hidden max-h-56 overflow-y-auto">
                        {isSearching && (
                          <div className="p-3 text-xs text-stone-500 flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-forest-600 border-t-transparent animate-spin" />
                            <span>{isMarathi ? 'स्थान शोधत आहे...' : 'Searching across India...'}</span>
                          </div>
                        )}
                        {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                          <div className="p-3 text-xs text-stone-500">
                            {isMarathi
                              ? 'अचूक स्थान सापडले नाही. खालील फील्डमध्ये तुमचे गाव मॅन्युअली टाईप करा.'
                              : 'No exact location found. You can type your village name directly in the fields below.'}
                          </div>
                        )}
                        {searchResults.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectSearchResult(item)}
                            className="w-full px-3 py-2 text-left text-xs text-stone-800 hover:bg-forest-50 border-b border-stone-100 last:border-0 flex items-start gap-2 transition-colors cursor-pointer"
                          >
                            <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0 mt-0.5" />
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

                  {/* STRUCTURED EDITABLE DETAILS (Review & Rural Fallback) */}
                  <div className="space-y-2.5 pt-2 border-t border-stone-100">
                    <div className="text-[10px] uppercase font-bold text-stone-500 flex items-center justify-between">
                      <span>{isMarathi ? 'पडताळणी व दुरुस्ती (दुरुस्त करता येतील)' : 'Address Details (Review & Edit)'}</span>
                      <span className="text-forest-700 font-medium lowercase">
                        {isMarathi ? 'गाव स्वतः टाईप करू शकता' : 'village can be typed manually'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* STATE Dropdown (All 28 States + 8 UTs) */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5 font-display">
                          {isMarathi ? 'राज्य (State) *' : 'State *'}
                        </label>
                        <div className="relative">
                          <select
                            value={regState}
                            onChange={(e) => setRegState(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-forest-600 appearance-none cursor-pointer"
                          >
                            {ALL_INDIAN_STATES_AND_UTS.map((s) => (
                              <option key={s.code} value={s.name}>
                                {isMarathi ? (s.nameMr || s.name) : s.name} {s.isUT ? '(UT)' : ''}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-stone-500 absolute right-2.5 top-2.5 pointer-events-none" />
                        </div>
                      </div>

                      {/* DISTRICT Input */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5 font-display">
                          {isMarathi ? 'जिल्हा (District) *' : 'District *'}
                        </label>
                        <input
                          type="text"
                          value={regDistrict}
                          onChange={(e) => setRegDistrict(e.target.value)}
                          placeholder={isMarathi ? 'उदा. Nashik' : 'e.g. Nashik, Rampur'}
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* TALUKA / TEHSIL Input */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5 font-display">
                          {isMarathi ? 'तालुका / तहसील (Taluka)' : 'Taluka / Tehsil'}
                        </label>
                        <input
                          type="text"
                          value={regTaluka}
                          onChange={(e) => setRegTaluka(e.target.value)}
                          placeholder={isMarathi ? 'उदा. Niphad' : 'e.g. Niphad'}
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
                        />
                      </div>

                      {/* VILLAGE / LOCALITY Input (Rural Friendly) */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5 font-display">
                          {isMarathi ? 'गाव / परिसर (Village) *' : 'Village / Locality *'}
                        </label>
                        <input
                          type="text"
                          value={regVillage}
                          onChange={(e) => setRegVillage(e.target.value)}
                          placeholder={isMarathi ? 'तुमच्या गावाचे नाव' : 'Enter your village name'}
                          className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
                          required
                        />
                      </div>
                    </div>

                    {/* PINCODE Input */}
                    <div className="w-full sm:w-1/2">
                      <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5 font-display">
                        {isMarathi ? 'पिनकोड (Pincode)' : 'Pincode'}
                      </label>
                      <input
                        type="text"
                        value={regPincode}
                        onChange={(e) => setRegPincode(e.target.value)}
                        placeholder="e.g. 422303"
                        maxLength={6}
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
                      />
                    </div>
                  </div>

                  {/* Farm Location Summary & Map Coordinates Preview */}
                  {regLatitude && regLongitude && (
                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] bg-stone-50 rounded-xl p-2.5 border border-stone-200">
                        <div className="flex items-center gap-1.5 text-stone-700 font-bold truncate">
                          <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
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

                      {/* Optional Interactive Map Embed Preview */}
                      <div className="rounded-2xl overflow-hidden border-2 border-forest-600/40 shadow-sm relative h-28 bg-stone-100">
                        <iframe
                          title="Farm Location Map"
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          marginHeight={0}
                          marginWidth={0}
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${regLongitude - 0.04}%2C${regLatitude - 0.03}%2C${regLongitude + 0.04}%2C${regLatitude + 0.03}&layer=mapnik&marker=${regLatitude}%2C${regLongitude}`}
                          className="w-full h-full pointer-events-none"
                        />
                        <div className="absolute top-2 left-2 bg-stone-950/80 text-wheat-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                          <MapIcon className="w-3 h-3 text-amber-300" />
                          <span>
                            {regLatitude.toFixed(4)}°N, {regLongitude.toFixed(4)}°E
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 3: 🌾 Your Farm */}
                <div className="bg-white rounded-2xl p-3.5 border border-stone-300/80 shadow-sm space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-forest-900 font-display pb-1 border-b border-stone-100">
                    <Sprout className="w-3.5 h-3.5 text-forest-700" />
                    <span>{isMarathi ? 'तुमचे शेत (Farm Details)' : 'Your Farm'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5">
                        {isMarathi ? 'शेताचे नाव *' : 'Farm Name *'}
                      </label>
                      <input
                        type="text"
                        value={regFarmName}
                        onChange={(e) => setRegFarmName(e.target.value)}
                        placeholder="My Green Farm"
                        className="w-full px-2.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-stone-600 mb-0.5">
                        {isMarathi ? 'क्षेत्र (एकर) *' : 'Area (Acres) *'}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={regAreaAcres}
                        onChange={(e) => setRegAreaAcres(e.target.value)}
                        placeholder="2.5"
                        className="w-full px-2.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-600"
                        required
                      />
                    </div>
                  </div>

                  {/* Main Crop Selectable Cards */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1.5">
                      {isMarathi ? 'मुख्य पीक निवडा *' : 'Select Main Crop *'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'Tomato', label: isMarathi ? 'टोमॅटो' : 'Tomato', icon: '🍅' },
                        { key: 'Cotton', label: isMarathi ? 'कापूस' : 'Cotton', icon: '🌿' },
                        { key: 'Soybean', label: isMarathi ? 'सोयाबीन' : 'Soybean', icon: '🌱' },
                      ].map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => setRegMainCrop(c.key as any)}
                          className={`py-2 px-1 rounded-xl border text-xs font-extrabold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                            regMainCrop === c.key
                              ? 'bg-forest-800 text-white border-forest-900 shadow-md scale-[1.02]'
                              : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          <span className="text-base">{c.icon}</span>
                          <span>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Registration Button */}
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-forest-950 font-black text-sm font-display transition-all duration-200 shadow-elevated flex items-center justify-center gap-2 cursor-pointer border-2 border-amber-300 disabled:opacity-75"
                >
                  <span>
                    {isRegistering
                      ? isMarathi
                        ? 'नोंदणी होत आहे...'
                        : 'Creating Account...'
                      : isMarathi
                      ? 'खाते तयार करा व पुढे जा'
                      : 'Create Account & Continue'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-forest-950" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* REGISTRATION SUCCESS MODAL SCREEN */}
      {/* ==================================================== */}
      {registeredFarmerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-[#F7F4EC] rounded-3xl border-2 border-forest-700 shadow-2xl overflow-hidden text-center animate-scaleUp">
            {/* Top Celebration Banner */}
            <div className="bg-gradient-to-b from-forest-900 to-forest-800 text-white p-6 relative">
              <div className="w-16 h-16 rounded-3xl bg-amber-400 text-forest-950 flex items-center justify-center mx-auto mb-3 text-3xl shadow-lg animate-bounce">
                🌱
              </div>
              <h3 className="text-xl font-black font-display tracking-tight text-white mb-1">
                {isMarathi ? 'कृषी सार्थक मध्ये आपले स्वागत आहे! 🌱' : 'Welcome to Krishi Sarthak! 🌱'}
              </h3>
              <p className="text-xs text-wheat-200 font-medium">
                {isMarathi ? 'आपले शेतकरी खाते यशस्वीरित्या तयार झाले आहे.' : 'Your farmer account has been created successfully.'}
              </p>
            </div>

            {/* Farmer ID High-Contrast Display Card */}
            <div className="p-5 space-y-4">
              <div className="bg-white rounded-2xl p-4 border-2 border-forest-600/60 shadow-sm">
                <div className="text-[11px] uppercase font-bold text-stone-500 mb-1">
                  {isMarathi ? 'तुमचा कायमस्वरूपी शेतकरी आयडी' : 'Your Permanent Farmer ID'}
                </div>
                <div className="text-2xl font-black font-mono tracking-wider text-forest-900 select-all mb-2">
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
                      <span className="text-emerald-700">{isMarathi ? 'कॉपी झाले!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-600" />
                      <span>{isMarathi ? 'आयडी कॉपी करा' : 'Copy Farmer ID'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-left text-xs text-emerald-900 font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {isMarathi
                    ? 'हा आयडी किंवा तुमचा मोबाईल नंबर वापरून तुम्ही भविष्यात पुन्हा कधीही लॉगिन करू शकता.'
                    : 'Save this ID! You can use this ID or your Mobile Number to log in on any device.'}
                </span>
              </div>

              {/* Continue to Dashboard CTA */}
              <button
                type="button"
                onClick={() => {
                  setRegisteredFarmerId(null);
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-forest-800 hover:bg-forest-900 active:scale-[0.98] text-white font-black text-xs font-display transition-all shadow-elevated flex items-center justify-center gap-2 cursor-pointer border-2 border-forest-700"
              >
                <span>{isMarathi ? 'माझ्या डॅशबोर्डवर जा' : 'Continue to Dashboard'}</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
