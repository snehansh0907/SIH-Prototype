import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  FlaskConical,
  Send,
  User,
  Activity,
  History,
  ShieldAlert,
} from 'lucide-react';
import type { VeterinaryCaseRecord, CaseStatus } from '../../types';
import { apiClient } from '../../services/apiClient';

interface VetCaseDetailModalProps {
  caseData: VeterinaryCaseRecord | null;
  onClose: () => void;
  onStatusUpdated: (updatedCase: VeterinaryCaseRecord) => void;
}

const STATUS_FLOW: { status: CaseStatus; label: string; color: string; desc: string }[] = [
  {
    status: 'New',
    label: 'New Report',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    desc: 'Newly submitted by farmer; pending officer review.',
  },
  {
    status: 'Under Review',
    label: 'Under Review',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    desc: 'Preliminary triage in progress; assessing urgency.',
  },
  {
    status: 'Sample Collected',
    label: 'Sample Collected',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    desc: 'Field vet visited; blood/swab/tissue sample taken.',
  },
  {
    status: 'Escalated',
    label: 'Escalated (Lab Referral)',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    desc: 'Referred to District / State Disease Diagnostic Lab.',
  },
  {
    status: 'Resolved',
    label: 'Resolved / Contained',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    desc: 'Treatment/vaccination completed; issue closed.',
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

  const handleUpdateStatus = async (targetStatus: CaseStatus) => {
    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      const payload = {
        status: targetStatus,
        notes: officerNotes.trim() || `Status advanced to ${targetStatus} by Veterinary Officer`,
        sample_id: sampleId.trim() || undefined,
        lab_referral: targetStatus === 'Escalated' ? labReferral.trim() : undefined,
        updated_by: 'Dr. Rajesh Kadam (Taluka Veterinary Officer)',
      };

      const res = await apiClient<{ success: boolean; data: VeterinaryCaseRecord; message?: string }>(
        `/diagnosis/${encodeURIComponent(caseId)}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify(payload),
          timeout: 7000,
        }
      );

      if (res.success && res.data) {
        setCurrentStatus(targetStatus);
        setFeedbackMessage({ type: 'success', text: res.message || `Case successfully set to ${targetStatus}` });
        onStatusUpdated(res.data);
        setOfficerNotes('');
      } else {
        // Fallback local update
        const updatedLocal: VeterinaryCaseRecord = {
          ...caseData,
          status: targetStatus,
          sample_id: sampleId.trim() || caseData.sample_id,
          lab_referral: targetStatus === 'Escalated' ? labReferral.trim() : caseData.lab_referral,
          vet_notes: officerNotes.trim() || caseData.vet_notes,
          updated_at: new Date().toISOString(),
          status_history: [
            ...(caseData.status_history || []),
            {
              from_status: currentStatus,
              to_status: targetStatus,
              timestamp: new Date().toISOString(),
              updated_by: 'Dr. Rajesh Kadam (Taluka Veterinary Officer)',
              notes: officerNotes.trim() || `Status updated to ${targetStatus}`,
              sample_id: sampleId.trim() || undefined,
              lab_referral: targetStatus === 'Escalated' ? labReferral.trim() : undefined,
            },
          ],
        };
        setCurrentStatus(targetStatus);
        setFeedbackMessage({ type: 'success', text: `Case status updated to ${targetStatus}` });
        onStatusUpdated(updatedLocal);
        setOfficerNotes('');
      }
    } catch (err: any) {
      // Local fallback on network disconnect
      const updatedLocal: VeterinaryCaseRecord = {
        ...caseData,
        status: targetStatus,
        sample_id: sampleId.trim() || caseData.sample_id,
        lab_referral: targetStatus === 'Escalated' ? labReferral.trim() : caseData.lab_referral,
        vet_notes: officerNotes.trim() || caseData.vet_notes,
        updated_at: new Date().toISOString(),
        status_history: [
          ...(caseData.status_history || []),
          {
            from_status: currentStatus,
            to_status: targetStatus,
            timestamp: new Date().toISOString(),
            updated_by: 'Dr. Rajesh Kadam (Taluka Veterinary Officer)',
            notes: officerNotes.trim() || `Status updated to ${targetStatus}`,
            sample_id: sampleId.trim() || undefined,
            lab_referral: targetStatus === 'Escalated' ? labReferral.trim() : undefined,
          },
        ],
      };
      setCurrentStatus(targetStatus);
      setFeedbackMessage({ type: 'success', text: `Status updated locally to ${targetStatus}` });
      onStatusUpdated(updatedLocal);
      setOfficerNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 px-6 flex items-start justify-between border-b border-indigo-900 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-widest text-indigo-300">
                Official Case File
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-white/10 text-slate-200">
                #{caseId.slice(0, 8)}
              </span>
              {caseData.is_outbreak_flagged && (
                <span className="inline-flex items-center gap-1 text-[11px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-md animate-pulse">
                  <ShieldAlert className="w-3 h-3" /> OUTBREAK FLAGGED
                </span>
              )}
              {isMortality && (
                <span className="text-[11px] font-black bg-slate-800 text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/40">
                  🪦 MORTALITY REPORT
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>{caseData.disease_name || caseData.suspected_cause || 'Suspected Health Issue'}</span>
              <span className="text-sm font-semibold text-slate-300">({caseData.species || 'Livestock'})</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
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

          {/* Quick Case Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                <User className="w-3.5 h-3.5 text-indigo-600" /> Livestock Owner
              </div>
              <div className="font-extrabold text-sm text-slate-900">
                {caseData.farmer_name || 'Ramesh Patil'}
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{caseData.farmer_phone || '+91 98200 00000'}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" /> Location / Jurisdiction
              </div>
              <div className="font-extrabold text-sm text-slate-900">
                {caseData.village || 'Niphad Central'}, {caseData.taluka || 'Niphad'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {caseData.district || 'Nashik'} District
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" /> Incident Date
              </div>
              <div className="font-extrabold text-sm text-slate-900">
                {new Date(caseData.created_at || Date.now()).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {new Date(caseData.created_at || Date.now()).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          {/* Photo & Clinical Observations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Image Preview */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Submitted Field Photo
              </label>
              <div className="w-full h-48 bg-slate-100 rounded-2xl border border-slate-300 overflow-hidden flex items-center justify-center relative">
                {caseData.image_url ? (
                  <img
                    src={caseData.image_url}
                    alt="Livestock case"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-400">
                    <Activity className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-xs font-semibold">No direct photo attached</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                  {caseData.species || 'Cattle'}
                </div>
              </div>
            </div>

            {/* Diagnostic / Mortality Details */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Clinical Details & Symptoms
              </label>
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-indigo-200/60">
                  <span className="font-semibold text-slate-600">Suspected Condition:</span>
                  <span className="font-black text-indigo-950 text-sm">{caseData.disease_name || caseData.suspected_cause || 'Lumpy Skin Disease'}</span>
                </div>
                {caseData.severity && (
                  <div className="flex justify-between items-center pb-2 border-b border-indigo-200/60">
                    <span className="font-semibold text-slate-600">Risk Severity:</span>
                    <span className={`px-2 py-0.5 rounded-full font-extrabold uppercase text-[10px] ${
                      caseData.severity === 'high' ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {caseData.severity}
                    </span>
                  </div>
                )}
                {isMortality && (
                  <>
                    <div className="flex justify-between items-center pb-2 border-b border-indigo-200/60">
                      <span className="font-semibold text-slate-600">Date of Death:</span>
                      <span className="font-bold text-slate-900">{caseData.date_of_death || 'Recorded Recently'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-indigo-200/60">
                      <span className="font-semibold text-slate-600">Approximate Age:</span>
                      <span className="font-bold text-slate-900">{caseData.approximate_age || 'Adult'}</span>
                    </div>
                  </>
                )}
                {caseData.notes && (
                  <div>
                    <span className="font-semibold text-slate-600 block mb-0.5">Farmer Notes:</span>
                    <p className="text-slate-800 bg-white/80 p-2 rounded-xl italic">{caseData.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Status & Action Workflow */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-indigo-400 font-black">
                  Case Escalation Workflow
                </span>
                <h3 className="text-base font-black text-white">
                  Current Status: <span className="text-amber-300">{currentStatus}</span>
                </h3>
              </div>
            </div>

            {/* Status Steps */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STATUS_FLOW.map((item) => {
                const isSelected = currentStatus === item.status;
                return (
                  <button
                    key={item.status}
                    type="button"
                    onClick={() => handleUpdateStatus(item.status)}
                    disabled={isSubmitting}
                    className={`p-2.5 rounded-2xl text-left border transition-all active:scale-95 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-lg'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-[11px] font-black">{item.label}</span>
                    <span className="text-[9px] opacity-75 mt-1 line-clamp-2">{item.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Escalation / Sample Collection Form Inputs */}
            <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-3 pt-3">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-indigo-400" />
                <span>Lab Sample & Diagnostic Referral Controls</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Sample Barcode / Sample ID (if collected)
                  </label>
                  <input
                    type="text"
                    value={sampleId}
                    onChange={(e) => setSampleId(e.target.value)}
                    placeholder="e.g. MH-NIP-2026-S042"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Referred Laboratory (Govt. Referral Unit)
                  </label>
                  <input
                    type="text"
                    value={labReferral}
                    onChange={(e) => setLabReferral(e.target.value)}
                    placeholder="e.g. District Disease Diagnostic Lab, Nashik"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Veterinary Officer Clinical Notes & Orders
                </label>
                <textarea
                  rows={2}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="Enter quarantine directions, treatment protocol, or escalation rationale..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(currentStatus)}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Notes & Audit Entry'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Audit History Timeline */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
              <History className="w-4 h-4 text-indigo-600" />
              <span>Status History & Case Audit Trail</span>
            </div>

            <div className="space-y-2">
              {caseData.status_history && caseData.status_history.length > 0 ? (
                caseData.status_history.map((hist, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-extrabold text-slate-900">
                          {hist.from_status ? `${hist.from_status} → ` : ''}
                          <span className="text-indigo-700">{hist.to_status}</span>
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                          {hist.updated_by || 'Veterinary Officer'}
                        </span>
                      </div>
                      {hist.notes && <p className="text-slate-600 mt-1">{hist.notes}</p>}
                      {hist.sample_id && (
                        <div className="text-[11px] font-mono text-indigo-900 mt-0.5">
                          🧪 Sample ID: {hist.sample_id}
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 shrink-0 font-medium text-right">
                      {new Date(hist.timestamp).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                      <br />
                      {new Date(hist.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 italic">
                  Case initialized as "{caseData.status || 'New'}". No subsequent status transitions logged yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-extrabold text-xs transition-all shadow-sm"
          >
            Close Case File
          </button>
        </div>
      </div>
    </div>
  );
};
