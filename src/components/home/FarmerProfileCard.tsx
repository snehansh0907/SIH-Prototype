import React from 'react';
import { UserCheck, MapPin, LogOut, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCrop } from '../../context/CropContext';
import { useAuth } from '../../context/AuthContext';

export const FarmerProfileCard: React.FC = () => {
  const { language, t } = useLanguage();
  const { herd, vaccinations, setActiveTab } = useCrop();
  const { user, isFarmer, logout, openLoginModal, requireFarmerAccess } = useAuth();

  const farmerName = user
    ? language === 'mr'
      ? user.nameMr || user.name
      : language === 'hi'
      ? user.nameHi || user.name
      : user.name
    : t.guestFarmer;

  const farmLocation = user
    ? language === 'mr'
      ? user.locationMr || `${user.village}, ${user.taluka} (${user.district})`
      : language === 'hi'
      ? user.locationHi || `${user.village}, ${user.taluka} (${user.district})`
      : `${user.village || user.location}, ${user.taluka}${user.district ? ` (${user.district})` : ''}`
    : language === 'mr'
    ? 'नाशिक, महाराष्ट्र'
    : language === 'hi'
    ? 'नासिक, महाराष्ट्र'
    : 'Nashik, Maharashtra';

  const defaultBarn = language === 'mr' ? 'माझा गोठा' : language === 'hi' ? 'मेरी पशुशाला' : 'My Barn';
  const farmDisplayName = user?.farmName || defaultBarn;
  const farmerIdDisplay = user?.farmerId || (user?.id ? user.id.slice(0, 8) : 'PSF-1042');

  const healthyCount = herd.filter((a) => a.healthStatus === 'healthy').length;
  const dueVaccinesCount = vaccinations.filter((v) => v.status === 'due_soon' || v.status === 'overdue').length;

  const isDemoMode = (import.meta as any).env?.VITE_DEMO_MODE === 'true';

  return (
    <div className="glass-card bg-white/88 border border-white/95 p-4 shadow-glass hover:shadow-glass-hover transition-all duration-300 rounded-3xl text-left relative overflow-hidden group">
      {/* Subtle organic corner glow with gentle drift */}
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-forest-400/10 blur-xl pointer-events-none group-hover:bg-forest-400/20 transition-all ambient-bubble-drift" />

      {/* Top row: Status, Cloud Connection & Auth Action */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-stone-200/60">
        <div className="flex items-center gap-2">
          {isDemoMode ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/90 text-amber-950 text-[10px] font-extrabold border border-amber-300 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
              <span>DEMO HERD</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50/90 text-emerald-950 text-[10px] font-extrabold border border-emerald-300/70 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse-subtle shrink-0" />
              <span>{user?.userType === 'registered' ? t.localProfileActive : t.cloudSyncActive}</span>
            </div>
          )}

          <span className="text-[10px] text-[#78867F] font-bold font-mono hidden sm:inline">
            ID: {farmerIdDisplay}
          </span>
        </div>

        {/* Quick Auth Actions */}
        {isFarmer ? (
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 text-[10px] font-bold text-stone-600 hover:text-rose-600 btn-tactile-subtle px-2 py-0.5 rounded-lg hover:bg-rose-50 cursor-pointer"
            title={t.btnLogout}
          >
            <LogOut className="w-3 h-3" />
            <span>{t.btnLogout}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={openLoginModal}
            className="flex items-center gap-1 text-[10px] font-extrabold text-forest-950 bg-[#F6BD28] hover:bg-amber-300 btn-tactile-subtle px-3 py-1 rounded-full shadow-xs cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3" />
            <span>{t.btnFarmerLogin}</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Main Profile Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar with status indicator */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#174D35] to-[#176B45] text-white flex items-center justify-center text-2xl shadow-md border border-white/40">
              🐮
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>

          {/* Name, Role & Location */}
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-black text-[#183027] font-display leading-tight">
                {farmerName}
              </h3>
              {user?.userType === 'registered' ? (
                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 text-[9px] font-extrabold flex items-center gap-0.5 border border-stone-200">
                  <User className="w-2.5 h-2.5 text-stone-600" />
                  <span>{t.registeredFarmerBadge}</span>
                </span>
              ) : isFarmer ? (
                <span className="px-2 py-0.5 rounded-full bg-forest-100 text-forest-900 text-[9px] font-extrabold flex items-center gap-0.5 border border-forest-200">
                  <UserCheck className="w-2.5 h-2.5 text-forest-700" />
                  <span>{t.verifiedDemoFarmerBadge}</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 text-[9px] font-extrabold border border-amber-300">
                  {t.demoSessionBadge}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-[#596A61] font-semibold mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
              <span className="truncate max-w-[240px]">
                {farmLocation} • <span className="text-[#183027] font-bold">{farmDisplayName}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Herd Overview Micro-Stats Strip (Floating Glass Pills) */}
      <div className="mt-3.5 pt-2.5 border-t border-stone-200/60 grid grid-cols-3 gap-2 text-center text-xs min-w-0">
        <button
          type="button"
          onClick={() => requireFarmerAccess(() => setActiveTab('herd'))}
          className="bg-white/90 hover:bg-white p-2 sm:p-2.5 rounded-2xl border border-stone-200/80 btn-tactile-subtle cursor-pointer group shadow-xs flex flex-col justify-center min-w-0 min-h-[60px] h-auto"
        >
          <span className="text-[10px] text-[#596A61] font-bold block leading-tight truncate xs:whitespace-normal">
            {language === 'mr' ? 'एकूण पशुधन' : language === 'hi' ? 'कुल पशुधन' : 'Total Herd'}
          </span>
          <span className="text-xs font-black text-[#183027] group-hover:text-forest-900 mt-0.5 block leading-tight break-words">
            {herd.length} {language === 'mr' ? 'जनावरे' : language === 'hi' ? 'पशु' : 'Heads'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => requireFarmerAccess(() => setActiveTab('herd'))}
          className="bg-emerald-50/90 hover:bg-emerald-100/90 p-2 sm:p-2.5 rounded-2xl border border-emerald-300/80 btn-tactile-subtle cursor-pointer group shadow-xs flex flex-col justify-center min-w-0 min-h-[60px] h-auto"
        >
          <span className="text-[10px] text-emerald-900 font-bold block leading-tight truncate xs:whitespace-normal">
            {language === 'mr' ? 'निरोगी' : language === 'hi' ? 'स्वस्थ' : 'Healthy'}
          </span>
          <span className="text-xs font-black text-emerald-950 mt-0.5 block leading-tight break-words">
            {healthyCount} {language === 'mr' ? 'जनावरे' : language === 'hi' ? 'पशु' : 'Heads'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => requireFarmerAccess(() => setActiveTab('herd'))}
          className={`p-2 sm:p-2.5 rounded-2xl border btn-tactile-subtle cursor-pointer group shadow-xs flex flex-col justify-center min-w-0 min-h-[60px] h-auto ${
            dueVaccinesCount > 0
              ? 'bg-amber-50/95 hover:bg-amber-100/95 border-amber-300/90 ring-1 ring-amber-300/50'
              : 'bg-white/90 hover:bg-white border-stone-200/80'
          }`}
        >
          <span className="text-[10px] text-amber-950 font-bold block leading-tight truncate xs:whitespace-normal">
            {language === 'mr' ? 'लस आठवण' : language === 'hi' ? 'टीका अलर्ट' : 'Vaccine Due'}
          </span>
          <span className="text-xs font-black text-amber-950 mt-0.5 block leading-tight break-words">
            {dueVaccinesCount > 0 ? `${dueVaccinesCount} ${language === 'mr' ? 'बाकी' : language === 'hi' ? 'देय' : 'Due'}` : 'Up to date'}
          </span>
        </button>
      </div>
    </div>
  );
};

