import React, { useState } from 'react';
import { X, UserCheck, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import type { ComplianceResult } from '../types';
import { complianceService } from '../services/api';

interface HumanOverrideModalProps {
  result: ComplianceResult | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const HumanOverrideModal: React.FC<HumanOverrideModalProps> = ({
  result,
  onClose,
  onSuccess,
}) => {
  if (!result) return null;

  const [finalStatus, setFinalStatus] = useState<string>('APPROVED');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please enter a valid audit justification for overriding the AI decision.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await complianceService.overrideResult({
        result_id: result.id,
        final_status: finalStatus,
        reason: reason.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit human review override.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Human Evaluator Decision Override</h3>
              <p className="text-[11px] text-slate-500 font-medium">Audit-Compliant Procurement Decision Override</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-700">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold block">Requirement Target</span>
            <p className="font-bold text-slate-900">{result.requirement?.requirement_id}: {result.requirement?.requirement}</p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500 font-medium">Original AI Result:</span>
              <span className="font-mono text-amber-700 font-bold">{result.status}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
              Select Final Human Decision
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFinalStatus('APPROVED')}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  finalStatus === 'APPROVED'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block text-xs">Approve Requirement</span>
                  <span className="text-[10px] text-slate-500 font-medium">Mark as Compliant</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFinalStatus('REJECTED')}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  finalStatus === 'REJECTED'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold block text-xs">Reject Requirement</span>
                  <span className="text-[10px] text-slate-500 font-medium">Mark as Non-Compliant</span>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Audit Justification / Evaluator Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide explicit technical or legal justification for overriding the AI recommendation..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting Override...' : 'Commit Evaluator Override'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
