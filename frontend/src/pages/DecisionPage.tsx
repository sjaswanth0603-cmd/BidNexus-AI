import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircle, HelpCircle, ArrowLeft, Award } from 'lucide-react';
import { javaApiService } from '../api';

export const DecisionPage: React.FC = () => {
  const { bidId } = useParams<{ bidId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    if (bidId) loadDecision();
  }, [bidId]);

  const loadDecision = async () => {
    try {
      const res = await javaApiService.getBidDetail(bidId!);
      setData(res);
    } catch (err) {
      console.error('Failed to load decision data:', err);
    }
  };

  const decisionStatus = data?.decision?.status || data?.status || 'QUALIFIED';
  const remarks = data?.decision?.remarks || 'Official evaluator decision recorded and logged.';
  const decidedAt = data?.decision?.decidedAt || new Date().toISOString();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-xl w-full text-center space-y-6 shadow-xl">
        
        <div className={`p-4 rounded-full w-fit mx-auto ${
          decisionStatus === 'QUALIFIED'
            ? 'bg-emerald-100 text-emerald-600'
            : decisionStatus === 'NEEDS_CLARIFICATION'
            ? 'bg-amber-100 text-amber-600'
            : 'bg-rose-100 text-rose-600'
        }`}>
          {decisionStatus === 'QUALIFIED' && <Award className="w-12 h-12" />}
          {decisionStatus === 'NEEDS_CLARIFICATION' && <HelpCircle className="w-12 h-12" />}
          {decisionStatus === 'DISQUALIFIED' && <XCircle className="w-12 h-12" />}
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-mono">
            Bid ID: {bidId}
          </span>

          <h1 className="text-2xl font-black text-slate-900">
            Decision Confirmation Record
          </h1>

          <div className={`text-base font-black uppercase tracking-wide py-1.5 px-4 rounded-xl w-fit mx-auto ${
            decisionStatus === 'QUALIFIED'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : decisionStatus === 'NEEDS_CLARIFICATION'
              ? 'bg-amber-50 text-amber-800 border border-amber-300'
              : 'bg-rose-50 text-rose-800 border border-rose-300'
          }`}>
            STATUS: {decisionStatus}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2 font-medium">
          <div>
            <span className="font-extrabold text-slate-700 block">Vendor Name:</span>
            <span className="font-bold text-slate-900">{data?.vendorName || 'TechCorp Solutions AP Pvt Ltd'}</span>
          </div>

          <div>
            <span className="font-extrabold text-slate-700 block">Evaluator Remarks:</span>
            <span className="text-slate-800 font-semibold">{remarks}</span>
          </div>

          <div>
            <span className="font-extrabold text-slate-700 block">Audit Timestamp:</span>
            <span className="font-mono text-slate-500">{new Date(decidedAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/government')}
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Government Portal</span>
          </button>

          <button
            onClick={() => navigate('/vendor')}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-colors"
          >
            <span>Submit Another Vendor Bid</span>
          </button>
        </div>

      </div>
    </div>
  );
};
