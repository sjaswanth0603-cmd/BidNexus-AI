import React from 'react';
import { X, FileText, ShieldCheck, UserCheck } from 'lucide-react';
import type { ComplianceResult } from '../types';
import { StatusBadge } from './StatusBadge';

interface EvidenceModalProps {
  result: ComplianceResult | null;
  onClose: () => void;
  onOverrideClick?: (result: ComplianceResult) => void;
  canOverride?: boolean;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  result,
  onClose,
  onOverrideClick,
  canOverride = false,
}) => {
  if (!result) return null;

  const req = result.requirement;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-700">{req?.requirement_id || 'REQ'}</span>
                <span className="text-xs text-slate-500 font-medium">Category: <strong className="text-slate-800">{req?.category}</strong></span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{req?.requirement}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-[11px] text-slate-500 block mb-1 font-semibold">Compliance Status</span>
              <StatusBadge status={result.status} />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block mb-1 font-semibold">AI Confidence</span>
              <span className="font-mono text-xs font-bold text-slate-900">{Math.round(result.confidence * 100)}%</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block mb-1 font-semibold">Verification Method</span>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                {result.verification_method}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>AI Decision Reasoning</span>
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 leading-relaxed text-slate-800 font-medium">
              {result.reasoning}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Extracted Vendor Evidence</span>
              </h4>
              {result.source_doc_name && (
                <span className="text-[11px] font-mono text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full font-bold">
                  {result.source_doc_name} — Page {result.source_page || 1}
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 font-mono text-[11px] text-slate-800 leading-normal max-h-44 overflow-y-auto whitespace-pre-wrap font-medium">
              {result.evidence_text || 'No explicit evidence snippet retrieved.'}
            </div>
          </div>

          {result.human_reviews && result.human_reviews.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-600" />
                <span>Human Evaluator Override History</span>
              </h4>
              <div className="space-y-2">
                {result.human_reviews.map((hr) => (
                  <div key={hr.id} className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold">Evaluator Decision: {hr.final_status}</span>
                      <span className="text-slate-500 font-mono font-medium">{new Date(hr.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">Reason: {hr.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
          >
            Close
          </button>

          {canOverride && onOverrideClick && (
            <button
              onClick={() => {
                onClose();
                onOverrideClick(result);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Override AI Decision</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
