import { MapPin, ArrowRight } from 'lucide-react';
import type { VeterinaryCaseRecord } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface OfficerCaseCardProps {
  caseRecord: VeterinaryCaseRecord;
  onSelect: (caseRecord: VeterinaryCaseRecord) => void;
}

export const OfficerCaseCard: React.FC<OfficerCaseCardProps> = ({ caseRecord, onSelect }) => {
  const { language } = useLanguage();

  const isMarathi = language === 'mr';
  const isHindi = language === 'hi';

  const isMort = caseRecord.report_type === 'mortality';
  const status = caseRecord.status || 'New';

  let statusBadgeStyle = 'bg-blue-100 text-blue-800 border-blue-200';
  if (status === 'Under Review') statusBadgeStyle = 'bg-amber-100 text-amber-800 border-amber-200';
  if (status === 'Sample Collected') statusBadgeStyle = 'bg-purple-100 text-purple-800 border-purple-200';
  if (status === 'Escalated') statusBadgeStyle = 'bg-rose-100 text-rose-800 border-rose-200';
  if (status === 'Resolved') statusBadgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-200';

  const diseaseTitle = isMarathi
    ? caseRecord.disease_name_mr || caseRecord.disease_name
    : isHindi
    ? caseRecord.disease_name_hi || caseRecord.disease_name
    : caseRecord.disease_name || caseRecord.suspected_cause || 'Suspected Condition';

  return (
    <div
      onClick={() => onSelect(caseRecord)}
      className="bg-white/95 p-3.5 rounded-2xl border border-stone-200/90 shadow-glass-sm hover:shadow-glass-md transition-all cursor-pointer flex flex-col justify-between space-y-3 active:scale-[0.99] group min-w-0"
    >
      <div className="flex items-start gap-3 min-w-0">
        {/* Thumbnail Image / Icon */}
        <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
          {caseRecord.image_url ? (
            <img
              src={caseRecord.image_url}
              alt="Symptom"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <span className="text-xl">{isMort ? '🪦' : '🐄'}</span>
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[10px] font-mono font-bold text-stone-500">
              #{caseRecord.id?.slice(0, 12)}
            </span>
            <span
              className={`text-[9px] font-black uppercase px-2 py-0.2 rounded-full border ${
                caseRecord.severity === 'high'
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              Risk: {caseRecord.severity || 'Mod'}
            </span>
            {caseRecord.is_outbreak_flagged && (
              <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-rose-600 text-white animate-pulse">
                Cluster
              </span>
            )}
            {isMort && (
              <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-stone-900 text-amber-300">
                🪦 Mortality
              </span>
            )}
          </div>

          <h4 className="text-xs sm:text-sm font-black text-stone-900 truncate font-display group-hover:text-forest-800 transition-colors">
            {caseRecord.species || 'Cattle'} • {diseaseTitle}
          </h4>

          <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5 min-w-0">
            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
            <span className="truncate">{caseRecord.village || 'Niphad'}, {caseRecord.taluka || 'Niphad'}</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-500 truncate max-w-[100px]">{caseRecord.farmer_name || 'Owner'}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${statusBadgeStyle}`}>
            {status}
          </span>
          {caseRecord.sample_id && (
            <span className="text-[9px] font-mono bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded-md truncate max-w-[110px]">
              🧪 {caseRecord.sample_id}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(caseRecord);
          }}
          className="px-2.5 py-1 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-900 border border-forest-200 font-extrabold text-[11px] flex items-center gap-1 transition-all cursor-pointer shrink-0"
        >
          <span>Review</span>
          <ArrowRight className="w-3 h-3 text-forest-700" />
        </button>
      </div>
    </div>
  );
};
