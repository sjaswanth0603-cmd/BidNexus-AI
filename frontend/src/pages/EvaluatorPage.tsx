import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserCheck, CheckCircle2, XCircle, HelpCircle, Database } from 'lucide-react';
import { javaApiService } from '../api';

export const EvaluatorPage: React.FC = () => {
  const { bidId } = useParams<{ bidId: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<any | null>(null);
  const [govtRecords, setGovtRecords] = useState<any | null>(null);
  const [remarks, setRemarks] = useState('Official evaluator verification completed based on AI evidence extraction.');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [bidId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const bData = await javaApiService.getBidDetail(bidId || '983373');
      setData(bData);

      const gData = await javaApiService.getGovtRecords();
      setGovtRecords(gData);
    } catch (err) {
      console.error('Failed to load evaluator data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (status: string) => {
    try {
      await javaApiService.submitDecision(bidId || '983373', status, remarks);
      navigate(`/decision/${bidId || '983373'}`);
    } catch (err) {
      console.error('Failed to submit decision:', err);
      navigate(`/decision/${bidId || '983373'}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">Procurement Officer Evaluation Console</h1>
            <p className="text-xs text-slate-500 font-semibold">Side-by-side evidence analysis & official qualification decision</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
          Evaluator Mode Active
        </span>
      </header>

      <main className="max-w-6xl mx-auto w-full p-6 space-y-6 flex-1">
        
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-500">
            Loading evaluator decision context...
          </div>
        ) : (
          <>
            {/* Vendor & Tender Summary Header */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block">
                    Vendor Submission Under Evaluation
                  </span>
                  <h2 className="text-xl font-black text-slate-900">{data?.vendorName || 'TechCorp Solutions AP Pvt Ltd'}</h2>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono font-bold">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    AI Score: {data?.complianceScore ?? 100}% ({data?.scoreBadge || 'GREEN'})
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                Tender ID: <span className="font-mono font-bold text-slate-900">{data?.tender?.refNo || 'GEM/2026/B/983373'}</span> — {data?.tender?.title || 'Supply of High-Performance Compute Nodes'}
              </p>
            </div>

            {/* Mock Government Verification Records Lookup Bar */}
            {govtRecords && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Mock Government Verification API Lookup (mock_govt_records.json)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="font-extrabold text-slate-700 block">GSTN Record</span>
                    <span className="font-mono text-emerald-700 font-bold block">{govtRecords.gst_records?.[0]?.gstin || 'GST37AAACT9876F1Z8'}</span>
                    <span className="text-[10px] text-slate-500 font-bold">Status: {govtRecords.gst_records?.[0]?.status || 'ACTIVE'}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="font-extrabold text-slate-700 block">PAN Corporate Record</span>
                    <span className="font-mono text-indigo-700 font-bold block">{govtRecords.pan_records?.[0]?.pan || 'AAACT9876F'}</span>
                    <span className="text-[10px] text-slate-500 font-bold">Status: {govtRecords.pan_records?.[0]?.status || 'VALID'}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="font-extrabold text-slate-700 block">Udyam MSME Registry</span>
                    <span className="font-mono text-amber-700 font-bold block">{govtRecords.udyam_records?.[0]?.udyam_no || 'UDYAM-AP-03-0012345'}</span>
                    <span className="text-[10px] text-slate-500 font-bold">Category: {govtRecords.udyam_records?.[0]?.category || 'Medium Enterprise'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Evaluator Requirements Table */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                Evaluation Breakdown Table (AI Reasoning Grounding)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
                      <th className="p-3.5 w-48">Requirement</th>
                      <th className="p-3.5 w-28">Type</th>
                      <th className="p-3.5 w-24">Match</th>
                      <th className="p-3.5">AI Reasoning & Evidence Citation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {(data?.evaluations?.length > 0 ? data.evaluations : [
                      { requirementName: 'Financial Turnover', requirementType: 'Financial', matched: true, reasoning: 'Financial turnover verified: Reported ₹14.5 Cr exceeds ₹5.0 Cr threshold.' },
                      { requirementName: 'System Memory RAM', requirementType: 'Technical', matched: true, reasoning: 'Datasheet confirms 32 GB DDR5 installed memory per node.' },
                      { requirementName: 'ISO Quality Certificate', requirementType: 'Certification', matched: true, reasoning: 'ISO 9001:2015 Quality Management Certificate valid till 2028.' },
                      { requirementName: 'OEM MAF Authorization', requirementType: 'Eligibility', matched: true, reasoning: 'Valid Manufacturer Authorization Form (MAF) attached.' },
                      { requirementName: 'OEM On-Site Warranty', requirementType: 'Warranty', matched: true, reasoning: '3 Years Comprehensive Onsite OEM Warranty undertaking confirmed.' },
                    ]).map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">{item.requirementName}</td>
                        <td className="p-3.5 font-mono text-slate-500 font-bold">{item.requirementType || 'Technical'}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            item.matched ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.matched ? 'MATCHED' : 'FAIL'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 font-medium leading-relaxed max-w-md">
                          {item.reasoning}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evaluator Remarks & Action Decision Buttons */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Official Procurement Evaluator Decision
              </h3>

              <div className="space-y-1 text-xs font-bold">
                <label className="text-slate-700">Evaluator Remarks / Justification Notes</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <button
                  onClick={() => handleDecision('QUALIFIED')}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Qualify Vendor Bid</span>
                </button>

                <button
                  onClick={() => handleDecision('NEEDS_CLARIFICATION')}
                  className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>Request Clarification</span>
                </button>

                <button
                  onClick={() => handleDecision('DISQUALIFIED')}
                  className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Disqualify Vendor Bid</span>
                </button>
              </div>
            </div>
          </>
        )}

      </main>

    </div>
  );
};
