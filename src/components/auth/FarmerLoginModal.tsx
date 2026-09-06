import React, { useState } from 'react';
import { Lock, X, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const FarmerLoginModal: React.FC = () => {
  const { language, t } = useLanguage();
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();

  const [username, setUsername] = useState('farmer123');
  const [password, setPassword] = useState('farmer123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInlineForm, setShowInlineForm] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleFarmerLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await login(username, password);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-[#F7F4EC] rounded-3xl border-2 border-forest-700/60 shadow-2xl overflow-hidden relative animate-scaleUp">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeLoginModal}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Top Banner */}
        <div className="bg-forest-900 text-white p-5 pt-6 text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-forest-950 flex items-center justify-center mx-auto mb-3 shadow-lg text-2xl font-black">
            🔒
          </div>

          <h3 className="text-lg font-black font-display tracking-tight text-white mb-1">
            {t.farmerLoginRequired}
          </h3>
          <p className="text-xs text-wheat-200/90 font-medium px-2 leading-relaxed">
            {t.restrictionSubtitle}
          </p>
        </div>

        {/* Modal Content & Action Buttons */}
        <div className="p-5">
          {!showInlineForm ? (
            <div className="space-y-3">
              {/* Quick Login Helper Box */}
              <div className="bg-amber-50 rounded-2xl p-3 border border-amber-300 text-xs text-stone-800">
                <div className="font-extrabold text-amber-950 flex items-center gap-1 mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === 'mr' ? 'डेमो शेतकरी खाते उपलब्ध' : 'Demo Credentials Available'}</span>
                </div>
                <div className="text-[11px] text-stone-600 font-medium">
                  {language === 'mr' ? 'आयडी: farmer123 | पासवर्ड: farmer123' : 'Use farmer123 / farmer123 for full access.'}
                </div>
              </div>

              {/* Primary CTA: LOGIN AS FARMER */}
              <button
                type="button"
                onClick={() => setShowInlineForm(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-forest-800 hover:bg-forest-900 active:scale-[0.98] text-white font-black text-xs font-display transition-all shadow-elevated flex items-center justify-center gap-2 cursor-pointer border-2 border-forest-700"
              >
                <Lock className="w-4 h-4 text-amber-300" />
                <span>{t.btnLoginAsFarmer}</span>
              </button>

              {/* Secondary CTA: Continue Exploring */}
              <button
                type="button"
                onClick={closeLoginModal}
                className="w-full py-3 px-4 rounded-2xl bg-white border border-stone-300 hover:bg-stone-50 active:scale-[0.98] text-stone-700 font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer font-display"
              >
                <span>{t.btnContinueExploring}</span>
              </button>
            </div>
          ) : (
            /* Fast Inline Farmer Login Form */
            <form onSubmit={handleFarmerLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1 font-display">
                  {t.farmerIdLabel}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-700 mb-1 font-display">
                  {t.passwordLabel}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-extrabold text-xs active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>{isSubmitting ? t.loading : t.btnLogin}</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </button>

              <button
                type="button"
                onClick={() => setShowInlineForm(false)}
                className="w-full text-center text-[11px] font-bold text-stone-500 hover:text-stone-700 py-1"
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
