import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Lock, User, Sparkles, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { login, loginAsDemo } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAutofill = () => {
    setUsername('farmer123');
    setPassword('farmer123');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await login(username, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#ECE6DA] flex flex-col items-center justify-center p-4 antialiased selection:bg-forest-200">
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

      {/* Main Mobile Smartphone Shell */}
      <div className="w-full max-w-md bg-[#F7F4EC] rounded-3xl shadow-2xl overflow-hidden border border-stone-300/60 flex flex-col relative">
        {/* Header Bar */}
        <div className="bg-forest-900 text-white px-5 py-4 flex items-center justify-between border-b border-forest-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 font-display">
              {t.farmerBadge}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold border border-white/20 transition-all active:scale-95"
          >
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'en' ? 'मराठी' : 'English'}</span>
          </button>
        </div>

        {/* Brand Banner Hero */}
        <div className="bg-gradient-to-b from-forest-900 to-forest-800 text-white px-6 pt-6 pb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

          {/* Logo Icon */}
          <div className="w-16 h-16 rounded-2xl bg-forest-700/80 border-2 border-forest-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
            🌾
          </div>

          {/* Brand Name & Slogan */}
          <h1 className="text-2xl font-black font-display tracking-tight text-white mb-1">
            {t.appName}
          </h1>
          <p className="text-sm font-bold text-amber-300 font-display mb-3">
            "{t.appTagline}"
          </p>

          {/* Trust Message Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-950/60 border border-forest-700/80 text-[11px] font-semibold text-wheat-200/90">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{t.trustMessage}</span>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="p-6 -mt-4 bg-[#F7F4EC] rounded-t-3xl flex-1 flex flex-col justify-between">
          <div>
            <div className="text-center mb-5">
              <h2 className="text-lg font-black text-stone-900 font-display">
                {t.loginTitle}
              </h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {language === 'mr' ? 'आपल्या शेतकरी खात्याने प्रवेश करा' : 'Sign in to access personalized crop monitoring'}
              </p>
            </div>

            {/* Error Feedback */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-start gap-2">
                <span className="text-sm">⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Evaluator 1-Click Autofill Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleAutofill}
                className="w-full py-2 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.autofillCredentials}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Farmer ID / Email Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-display">
                  {t.farmerIdLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.farmerIdPlaceholder}
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 font-display">
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-transparent transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Primary LOGIN Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-forest-800 hover:bg-forest-900 active:scale-[0.98] text-white font-black text-sm font-display transition-all duration-200 shadow-elevated flex items-center justify-center gap-2 cursor-pointer border-2 border-forest-700"
              >
                <span>{isSubmitting ? t.loading : t.btnLogin}</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </button>
            </form>
          </div>

          {/* Secondary Action: Continue as Demo User */}
          <div className="mt-6 pt-4 border-t border-stone-200 text-center">
            <button
              type="button"
              onClick={loginAsDemo}
              className="w-full py-3.5 px-4 rounded-2xl bg-white border-2 border-stone-300 hover:bg-stone-50 active:scale-[0.98] text-stone-800 font-extrabold text-xs transition-all shadow-soft flex items-center justify-center gap-2 cursor-pointer font-display"
            >
              <span>{t.btnDemoUser}</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
            </button>
            <p className="text-[10px] text-stone-500 font-medium mt-2">
              {language === 'mr' ? 'डेमो मोडमध्ये मूलभूत माहिती पाहू शकता' : 'Explore public features without logging in'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
