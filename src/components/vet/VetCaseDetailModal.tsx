import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  FlaskConical,
  User,
  Activity,
  ShieldAlert,
  Barcode,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import type { VeterinaryCaseRecord, CaseStatus } from '../../types';
import { veterinaryOfficerService } from '../../services/veterinaryOfficerService';

interface VetCaseDetailModalProps {
  caseData: VeterinaryCaseRecord | null;
  onClose: () => void;
  onStatusUpdated: (updatedCase: VeterinaryCaseRecord) => void;
}

const GOVT_REFERRAL_LABS = [
  'District Disease Diagnostic Laboratory (DDDL), Nashik',
  'State Disease Diagnostic Laboratory (SDDL), Pune',
  'Western Regional Disease Diagnostic Laboratory (WRDDL), Pune',
  'Disease Investigation Section (DIS), Aundh, Pune',
  'National Institute of High Security Animal Diseases (NIHSAD), Bhopal',
  'ICAR - Indian Veterinary Research Institute (IVRI), Bareilly',
  'Custom / Other Diagnostic Center',
];

const STATUS_FLOW: { status: CaseStatus; step: number; label: string; color: string; desc: string }[] = [
  {
    status: 'New',
    step: 1,
    label: 'New Report',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    desc: 'Newly submitted by farmer; pending officer review.',
  },
  {
    status: 'Under Review',
    step: 2,
    label: 'Under Review',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    desc: 'Preliminary triage in progress; field visit assigned.',
  },
  {
    status: 'Sample Collected',
    step: 3,
    label: 'Sample Collected',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    desc: 'Blood, swab or tissue sample collected.',
  },
  {
    status: 'Escalated',
    step: 4,
    label: 'Escalated (Lab)',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    desc: 'Referred to District/State Diagnostic Laboratory.',
  },
  {
    status: 'Resolved',
    step: 5,
    label: 'Resolved / Closed',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    desc: 'Treatment/ring vaccination completed and contained.',
  },
];

export const VetCaseDetailModal: React.FC<VetCaseDetailModalProps> = ({
  caseData,
  onClose,
  onStatusUpdated,
}) => {
  if (!caseData) return null;

  const [currentStatus, setCurrentStatus] = useState<CaseStatus>(caseData.status || 'New');
  const [officerNotes, setOfficerNotes] = useState('');
  const [sampleId, setSampleId] = useState(caseData.sample_id || '');
  const [labReferral, setLabReferral] = useState(
    caseData.lab_referral || 'District Disease Diagnostic Laboratory (DDDL), Nashik'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isMortality = caseData.report_type === 'mortality';
  const caseId = caseData.id || caseData.case_id || 'UNKNOWN';

  const handleGenerateBarcode = () => {
    const code = `MH-NIP-${new Date().getFullYear()}-S${Math.floor(1000 + Math.random() * 9000)}`;
    setSampleId(code);
  };

  const getNextAction = () => {
    if (currentStatus === 'New') {
      return {
        targetStatus: 'Under Review' as CaseStatus,
        label: 'Advance to Under Review',
        subtext: 'Initiate clinical verification & field inspection',
      };
    }
    if (currentStatus === 'Under Review') {
      return {
        targetStatus: 'Sample Collected' as CaseStatus,
        label: 'Record Sample Collection',
        subtext: 'Attach specimen barcode for laboratory dispatch',
      };
    }
    if (currentStatus === 'Sample Collected') {
      return {
        targetStatus: 'Escalated' as CaseStatus,
        label: 'Escalate to Referral Laboratory',
        subtext: 'Refer specimen to District / State Disease Diagnostic Lab',
      };
    }
    if (currentStatus === 'Escalated') {
      return {
        targetStatus: 'Resolved' as CaseStatus,
        label: 'Mark Case Resolved & Contained',
        subtext: 'Containment, treatment and ring vaccination completed',
      };
    }
    return null;
  };

  const nextAction = getNextAction();

  const handleUpdateStatus = async (targetStatus: CaseStatus) => {
    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      const res = await veterinaryOfficerService.updateCaseStatus(
        caseId,
        targetStatus,
        officerNotes.trim(),
        sampleId.trim() || undefined,
        targetStatus === 'Escalated' ? labReferral.trim() : undefined
      );

      if (res.success && res.data) {
        setCurrentStatus(targetStatus);
        setFeedbackMessage({ type: 'success', text: res.message || `Case successfully set to ${targetStatus}` });
        onStatusUpdated(res.data);
        setOfficerNotes('');
      } else {
        setFeedbackMessage({ type: 'error', text: 'Failed to update case status. Please retry.' });
      }
    } catch {
      setFeedbackMessage({ type: 'error', text: 'Error updating case status.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#F7F6F0] rounded-3xl shadow-glass-xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col relative">
        {/* Header - Forest Green */}
        <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 text-white p-4 sm:p-5 flex items-start justify-between border-b border-forest-700/60 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-gold-300 font-display">
                Official Case File
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-white/15 text-white">
                #{caseId.slice(0, 14)}
              </span>
              {caseData.is_outbreak_flagged && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-md animate-pulse">
                  <ShieldAlert className="w-3 h-3" /> OUTBREAK FLAGGED
                </span>
              )}
              {isMortality && (
                <span className="text-[10px] font-black bg-stone-900 text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/40">
                  🪦 MORTALITY REPORT
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2 font-display">
              <span>{caseData.disease_name || caseData.suspected_cause || 'Suspected Health Condition'}</span>
              <span className="text-xs font-semibold text-gold-200">({caseData.species || 'Livestock'})</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Case File"
            className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-stone-800">
          {feedbackMessage && (
            <div
              className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                feedbackMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border border-rose-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Transparent AI / Preliminary Triage Disclaimer */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="font-extrabold text-amber-950">AI-assisted Preliminary Assessment:</strong>{' '}
              Symptom pattern matches suspected {caseData.disease_name || 'condition'}.{' '}
              <em>Requires on-site clinical verification and confirmatory diagnostic testing by the Veterinary Officer.</em>
            </div>
          </div>

          {/* Case Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 mb-1 font-display">
                <User className="w-3.5 h-3.5 text-forest-700" /> Livestock Owner
              </div>
              <div className="font-extrabold text-xs text-stone-900 truncate">
                {caseData.farmer_name || 'Ramesh Patil'}
              </div>
              <div className="text-[11px] text-stone-600 flex items-center justify-between mt-1">
                <span>{caseData.farmer_phone || '+91 98200 00000'}</span>
                {caseData.farmer_phone && (
                  <a
                    href={`tel:${caseData.farmer_phone.replace(/\s+/g, '')}`}
                    className="px-2 py-0.5 rounded-lg bg-forest-50 text-forest-800 hover:bg-forest-100 font-bold text-[10px] border border-forest-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-2.5 h-2.5" />
                    <span>Call</span>
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 mb-1 font-display">
                <MapPin className="w-3.5 h-3.5 text-rose-600" /> Village / Taluka
              </div>
              <div className="font-extrabold text-xs text-stone-900 truncate">
                {caseData.village || 'Niphad Central'}, {caseData.taluka || 'Niphad'}
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5">
                {caseData.district || 'Nashik'} District, Maharashtra
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 mb-1 font-display">
                <Calendar className="w-3.5 h-3.5 text-amber-600" /> Report Timestamp
              </div>
              <div className="font-extrabold text-xs text-stone-900">
                {new Date(caseData.created_at || Date.now()).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
              <div className="text-[10px] text-stone-500 mt-0.5">
                {new Date(caseData.created_at || Date.now()).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          {/* Photo & Clinical Symptoms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Field Photo Preview */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-600 uppercase tracking-wider font-display">
                Submitted Field Photo
              </label>
              <div className="w-full h-44 bg-stone-100 rounded-2xl border border-stone-200 overflow-hidden flex items-center justify-center relative shadow-inner">
                {caseData.image_url ? (
                  <img
                    src={caseData.image_url}
                    alt="Livestock Symptom Case"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-stone-400">
                    <Activity className="w-7 h-7 mx-auto mb-1 opacity-50 text-forest-700" />
                    <span className="text-[11px] font-semibold">No direct photo attached</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-forest-950/80 text-white text-[9px] font-bold backdrop-blur-xs">
                  {caseData.species || 'Cattle'}
                </div>
              </div>
            </div>

            {/* Diagnostic Triage Details */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-600 uppercase tracking-wider font-display">
                Clinical Details & Observations
              </label>
              <div className="bg-white p-3 rounded-2xl border border-stone-200 text-xs space-y-2 shadow-xs">
                <div className="flex justify-between items-center pb-1.5 border-b border-stone-100">
                  <span className="font-semibold text-stone-600 text-[11px]">Suspected Condition:</span>
                  <span className="font-black text-forest-950 text-xs">{caseData.disease_name || caseData.suspected_cause || 'Lumpy Skin Disease'}</span>
                </div>
                {caseData.severity && (
                  <div className="flex justify-between items-center pb-1.5 border-b border-stone-100">
                    <span className="font-semibold text-stone-600 text-[11px]">Risk Severity:</span>
                    <span className={`px-2 py-0.5 rounded-full font-extrabold uppercase text-[9px] ${
                      caseData.severity === 'high' ? 'bg-rose-100 text-rose-900 border border-rose-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}>
                      {caseData.severity}
                    </span>
                  </div>
                )}
                {isMortality && (
                  <>
                    <div className="flex justify-between items-center pb-1.5 border-b border-stone-100">
                      <span className="font-semibold text-stone-600 text-[11px]">Date of Death:</span>
                      <span className="font-bold text-stone-900 text-[11px]">{caseData.date_of_death || 'Recently'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-stone-100">
                      <span className="font-semibold text-stone-600 text-[11px]">Approximate Age:</span>
                      <span className="font-bold text-stone-900 text-[11px]">{caseData.approximate_age || 'Adult'}</span>
                    </div>
                  </>
                )}
                {caseData.notes && (
                  <div>
                    <span className="font-semibold text-stone-600 block text-[10px] mb-0.5">Report Notes:</span>
                    <p className="text-stone-800 bg-stone-50 p-2 rounded-xl text-[11px] italic border border-stone-100 leading-relaxed">
                      "{caseData.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Workflow & Status Stepper Section */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-forest-700 font-black font-display">
                  Case Escalation Workflow & Triage
                </span>
                <h3 className="text-sm font-black text-stone-900 font-display">
                  Current Status: <span className="text-forest-800 underline underline-offset-2">{currentStatus}</span>
                </h3>
              </div>
              {caseData.is_outbreak_flagged && (
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-600 text-white">
                  ⚡ Cluster Active
                </span>
              )}
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between px-2 py-2.5 bg-[#F7F6F0] rounded-2xl border border-stone-200 overflow-x-auto scrollbar-none">
              {STATUS_FLOW.map((s, idx) => {
                const isCurrent = currentStatus === s.status;
                const currentStepIndex = STATUS_FLOW.findIndex((item) => item.status === currentStatus);
                const isCompleted = idx < currentStepIndex;

                return (
                  <React.Fragment key={s.status}>
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          isCurrent
                            ? 'bg-forest-800 text-white ring-3 ring-forest-400/40'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-200 text-stone-500'
                        }`}
                      >
                        {isCompleted ? '✓' : s.step}
                      </div>
                      <span
                        className={`text-[8px] sm:text-[9px] font-bold mt-1 text-center whitespace-nowrap ${
                          isCurrent
                            ? 'text-forest-900 font-black'
                            : isCompleted
                            ? 'text-emerald-700'
                            : 'text-stone-400'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < STATUS_FLOW.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-1 min-w-3 transition-all ${
                          idx < currentStepIndex ? 'bg-emerald-500' : 'bg-stone-300'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Next Action Quick-Advance CTA */}
            {nextAction && (
              <button
                type="button"
                onClick={() => handleUpdateStatus(nextAction.targetStatus)}
                disabled={isSubmitting}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-forest-800 to-forest-700 hover:from-forest-900 hover:to-forest-800 text-white font-black text-xs flex items-center justify-between shadow-md cursor-pointer transition-all active:scale-[0.99] border border-forest-600 disabled:opacity-60"
              >
                <div className="flex items-center gap-2 text-left">
                  <Sparkles className="w-4 h-4 text-gold-300 shrink-0" />
                  <div>
                    <div className="text-white font-extrabold font-display">{nextAction.label}</div>
                    <div className="text-[10px] text-gold-200 font-medium">{nextAction.subtext}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-xl text-xs font-black">
                  <span>Advance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            )}

            {/* Status Steps Manual Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {STATUS_FLOW.map((item) => {
                const isSelected = currentStatus === item.status;
                return (
                  <button
                    key={item.status}
                    type="button"
                    onClick={() => handleUpdateStatus(item.status)}
                    disabled={isSubmitting}
                    className={`p-2 rounded-xl text-left border transition-all active:scale-95 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-forest-900 text-white font-black border-forest-800 shadow-sm'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span className="text-[10px] font-black">{item.label}</span>
                    <span className="text-[8px] opacity-75 mt-0.5 line-clamp-1">{item.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Lab Sample & Referral Controls */}
            <div className="bg-[#F7F6F0] p-3.5 rounded-2xl border border-stone-200 space-y-3">
              <div className="text-xs font-extrabold text-forest-950 flex items-center gap-1.5 font-display">
                <FlaskConical className="w-3.5 h-3.5 text-forest-700" />
                <span>Diagnostic Sample & Referral Controls</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Sample ID Barcode */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Specimen Barcode / Sample ID
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={sampleId}
                      onChange={(e) => setSampleId(e.target.value)}
                      placeholder="e.g. MH-NIP-2026-S4081"
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-forest-600"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateBarcode}
                      className="px-2.5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Generate Barcode"
                    >
                      <Barcode className="w-3.5 h-3.5" />
                      <span>Auto</span>
                    </button>
                  </div>
                </div>

                {/* Referral Lab */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Referral Laboratory
                  </label>
                  <select
                    value={labReferral}
                    onChange={(e) => setLabReferral(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-600 cursor-pointer"
                  >
                    {GOVT_REFERRAL_LABS.map((lab) => (
                      <option key={lab} value={lab}>
                        {lab}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Officer Notes */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Veterinary Officer Clinical Notes & Containment Instructions
                </label>
                <textarea
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  rows={2}
                  placeholder="Record clinical observations, ring vaccination directives, antibiotic treatment or quarantine advisory..."
                  className="w-full p-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-forest-600 resize-none"
                />
              </div>
            </div>

            {/* Audit History Timeline */}
            {caseData.status_history && caseData.status_history.length > 0 && (
              <div className="pt-2 border-t border-stone-200">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2 font-display flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>Audit History Timeline</span>
                </div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {caseData.status_history.map((hist, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] flex items-start justify-between gap-2"
                    >
                      <div>
                        <div className="font-extrabold text-stone-900 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-forest-600" />
                          <span>{hist.to_status}</span>
                          {hist.sample_id && (
                            <span className="text-[9px] font-mono font-normal text-purple-700 bg-purple-50 px-1.5 rounded border border-purple-200">
                              🧪 {hist.sample_id}
                            </span>
                          )}
                        </div>
                        {hist.notes && (
                          <div className="text-stone-600 text-[10px] mt-0.5">
                            {hist.notes}
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-stone-400 font-mono shrink-0">
                        {new Date(hist.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-white border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="text-[10px] text-stone-500 font-medium">
            Surveillance Unit • Taluka Veterinary Hospital, Niphad
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-all cursor-pointer"
          >
            Close File
          </button>
        </div>
      </div>
    </div>
  );
};
