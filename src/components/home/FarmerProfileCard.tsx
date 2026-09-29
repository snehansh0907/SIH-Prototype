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
    <div className="rounded-2xl bg-white border border-stone-200/70 p-3.5 shadow-sm hover:border-forest-600/30 transition-all text-left">
      {/* Top row: Status, Cloud Connection & Auth Action */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2.5 border-b border-stone-100">
        <div className="flex items-center gap-2">
          {isDemoMode ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
              <span>DEMO HERD</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
              <span>{user?.userType === 'registered' ? t.localProfileActive : t.cloudSyncActive}</span>
            </div>
          )}

          <span className="text-[10px] text-stone-400 font-medium hidden sm:inline">
            ID: {farmerIdDisplay}
          </span>
        </div>

        {/* Quick Auth Actions */}
        {isFarmer ? (
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1 text-[10px] font-semibold text-stone-500 hover:text-rose-600 active:scale-95 transition-all px-2 py-0.5 rounded-md hover:bg-rose-50 cursor-pointer"
            title={t.btnLogout}
          >
            <LogOut className="w-3 h-3" />
            <span>{t.btnLogout}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={openLoginModal}
            className="flex items-center gap-1 text-[10px] font-bold text-forest-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all px-2.5 py-0.5 rounded-full shadow-sm cursor-pointer"
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
            <div className="w-11 h-11 rounded-2xl bg-forest-800 text-white flex items-center justify-center text-xl shadow-sm">
              🐮
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs flex items-center justify-center">
              <span className="w-1 h-1 rounded-full bg-white" />
            </div>
          </div>

          {/* Name, Role & Location */}
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-stone-900 font-display leading-tight">
                {farmerName}
              </h3>
              {user?.userType === 'registered' ? (
                <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 text-[9px] font-semibold flex items-center gap-0.5">
                  <User className="w-2.5 h-2.5 text-stone-500" />
                  <span>{t.registeredFarmerBadge}</span>
                </span>
              ) : isFarmer ? (
                <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 text-[9px] font-semibold flex items-center gap-0.5">
                  <UserCheck className="w-2.5 h-2.5 text-forest-700" />
                  <span>{t.verifiedDemoFarmerBadge}</span>
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 text-[9px] font-semibold">
                  {t.demoSessionBadge}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-stone-500 font-medium mt-0.5">
              <MapPin className="w-3 h-3 text-forest-700 shrink-0" />
              <span className="truncate max-w-[250px]">
                {farmLocation} • {farmDisplayName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Herd Overview Micro-Stats Strip */}
      <div className="mt-3 pt-2.5 border-t border-stone-100 grid grid-cols-3 gap-2 text-center text-xs">
        <button
          type="button"
          onClick={() => requireFarmerAccess(() => setActiveTab('herd'))}
          className="bg-stone-50/90 hover:bg-stone-100 p-2 rounded-xl border border-stone-200/60 transition-colors cursor-pointer group"
        >
          <span className="text-[10px] text-stone-400 font-medium block">
            {language === 'mr' ? 'एकूण पशुधन' : language === 'hi' ? 'कुल पशुधन' : 'Total Herd'}
          </span>
          <span className="text-xs font-bold text-stone-900 group-hover:text-forest-800">
            {herd.length} {language === 'mr' ? 'जनावरे' : language === 'hi' ? 'पशु' : 'Heads'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => requireFarmerAccess(() => setActiveTab('herd'))}
          className="bg-emerald-50/70 hover:bg-emerald-100/80 p-2 rounded-xl border border-emerald-200/60 transition-colors cursor-pointer group"
        >
          <span className="text-[10px] text-emerald-800 font-medium block">
            {language === 'mr' ? 'निरोगी' : language === 'hi' ? 'स्वस्थ' : 'Healthy'}
          </span>
          <span className="text-xs font-bold text-emerald-950">
            {healthyCount} {language === 'mr' ? 'जनावरे' : language === 'hi' ? 'पशु' : 'Heads'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => requireFarmerAccess(() => setActiveTab('herd'))}
          className={`p-2 rounded-xl border transition-colors cursor-pointer group ${
            dueVaccinesCount > 0
              ? 'bg-amber-50/80 hover:bg-amber-100 border-amber-300'
              : 'bg-stone-50/90 hover:bg-stone-100 border-stone-200/60'
          }`}
        >
          <span className="text-[10px] text-amber-900 font-medium block">
            {language === 'mr' ? 'लस आठवण' : language === 'hi' ? 'टीका अलर्ट' : 'Vaccine Due'}
          </span>
          <span className="text-xs font-bold text-amber-950">
            {dueVaccinesCount > 0 ? `${dueVaccinesCount} ${language === 'mr' ? 'बाकी' : language === 'hi' ? 'देय' : 'Due'}` : 'Up to date'}
          </span>
        </button>
      </div>
    </div>
  );
};
