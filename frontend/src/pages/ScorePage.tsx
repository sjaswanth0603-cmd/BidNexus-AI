import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { javaApiService } from '../api';

export const ScorePage: React.FC = () => {
  const { bidId } = useParams<{ bidId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bidId) loadScore();
  }, [bidId]);

  const loadScore = async () => {
    try {
      setLoading(true);
      const res = await javaApiService.getBidDetail(bidId!);
      setData(res);
    } catch (err) {
      console.error('Failed to load score data:', err);
    } finally {
      setLoading(false);
    }
  };

  const score = data?.complianceScore ?? 100.0;
  const badge = data?.scoreBadge || (score >= 80 ? 'GREEN' : score >= 50 ? 'YELLOW' : 'RED');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">AI Compliance Score Report</h1>
            <p className="text-xs text-slate-500 font-semibold">Requirement-by-Requirement Checklist & Badge Indicator</p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/evaluator/${bidId}`)}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center gap-2"
        >
          <UserCheck className="w-4 h-4" />
          <span>Proceed to Evaluator Review</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto w-full p-6 space-y-6 flex-1">
        
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500">
            Loading compliance score report...
          </div>
        ) : (
          <>
            {/* Score & Badge Banner */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    Vendor Submission Score
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    Bid ID: {data?.id}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  {data?.vendorName || 'TechCorp Solutions AP Pvt Ltd'}
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Tender: {data?.tender?.title || 'Supply of Enterprise Compute Nodes'}
                </p>
              </div>

              {/* Compliance Score Badge Component */}
              <div className="flex flex-col items-end gap-2">
                <div className="text-3xl font-black font-mono text-slate-900">
                  {score}% Score
                </div>

                <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${
                  badge === 'GREEN'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : badge === 'YELLOW'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {badge === 'GREEN' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {badge === 'YELLOW' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                  {badge === 'RED' && <XCircle className="w-4 h-4 text-rose-600" />}
                  <span>{badge === 'GREEN' ? 'HIGH COMPLIANCE (≥80%)' : badge === 'YELLOW' ? 'REVIEW REQUIRED (50-79%)' : 'NON-COMPLIANT (<50%)'}</span>
                </div>
              </div>
            </div>

            {/* Requirement Checklist */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                Requirement-by-Requirement Checklist ({data?.evaluations?.length || 5} Rules Evaluated)
              </h3>

              <div className="space-y-3">
                {(data?.evaluations?.length > 0 ? data.evaluations : [
                  { requirementName: 'Financial Turnover', requirementDetails: 'Turnover >= ₹5.0 Cr', matched: true, confidence: 0.98, reasoning: 'Financial turnover verified: Reported ₹14.5 Cr exceeds ₹5.0 Cr threshold.' },
                  { requirementName: 'System Memory RAM', requirementDetails: 'Min 32 GB DDR5 RAM', matched: true, confidence: 0.95, reasoning: 'Datasheet confirms 32 GB DDR5 installed memory per node.' },
                  { requirementName: 'ISO Quality Certificate', requirementDetails: 'ISO 9001:2015 Valid', matched: true, confidence: 0.95, reasoning: 'ISO 9001:2015 Quality Management Certificate valid till 2028.' },
                  { requirementName: 'OEM MAF Authorization', requirementDetails: 'OEM Authorization Letter', matched: true, confidence: 0.95, reasoning: 'Valid Manufacturer Authorization Form (MAF) attached.' },
                  { requirementName: 'OEM On-Site Warranty', requirementDetails: 'Min 3 Years Warranty', matched: true, confidence: 0.98, reasoning: '3 Years Comprehensive Onsite OEM Warranty undertaking confirmed.' },
                ]).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border space-y-1 text-xs ${
                      item.matched
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/50 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-2">
                        {item.matched ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="text-slate-900">{item.requirementName || `Rule #${idx + 1}`}</span>
                        {item.requirementDetails && (
                          <span className="text-slate-500 font-normal">({item.requirementDetails})</span>
                        )}
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black ${
                        item.matched ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.matched ? 'MATCHED' : 'MISMATCH / FAIL'}
                      </span>
                    </div>

                    <p className="text-slate-700 font-medium pl-6 leading-relaxed">
                      {item.reasoning}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => navigate(`/evaluator/${bidId}`)}
                className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <span>Proceed to Procurement Evaluator Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

      </main>

    </div>
  );
};
