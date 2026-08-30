import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Filter,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { StatusBadge } from '../../components/StatusBadge';
import { HumanOverrideModal } from '../../components/HumanOverrideModal';
import { EvidenceModal } from '../../components/EvidenceModal';
import { AIAssistantDrawer } from '../../components/AIAssistantDrawer';
import { GovtAdapterPanel } from '../../components/GovtAdapterPanel';
import { RiskRadarModal } from '../../components/RiskRadarModal';
import { bidService, complianceService } from '../../services/api';

export const VendorComparisonPage: React.FC = () => {
  const [bids, setBids] = useState<any[]>([]);
  const [selectedBidId, setSelectedBidId] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<any | null>(null);

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [selectedResultForOverride, setSelectedResultForOverride] = useState<any | null>(null);
  const [selectedResultForDetail, setSelectedResultForDetail] = useState<any | null>(null);
  const [selectedVendorForRadar, setSelectedVendorForRadar] = useState<string | null>(null);
  const [showAssistant, setShowAssistant] = useState(false);

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    try {
      const list = await bidService.listBids();
      setBids(list);
      if (list.length > 0) {
        setSelectedBidId(list[0].id);
        fetchComparison(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load bids:', err);
    }
  };

  const fetchComparison = async (bidId: string) => {
    try {
      const data = await complianceService.compareVendors(bidId);
      setComparisonData(data);
    } catch (err) {
      console.error('Failed to fetch comparison matrix:', err);
    }
  };

  const handleBidChange = (bidId: string) => {
    setSelectedBidId(bidId);
    fetchComparison(bidId);
  };

  const filteredRequirements = comparisonData?.requirements.filter((r: any) => {
    if (filterCategory === 'ALL') return true;
    return r.category.toUpperCase() === filterCategory.toUpperCase();
  }) || [];

  return (
    <div className="min-h-screen bg-white text-[#0B1228] flex flex-col font-sans">
      <Navbar onToggleAssistant={() => setShowAssistant(!showAssistant)} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full">
          
          <div className="apple-card p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200 shrink-0">
                <GitCompare className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  Side-by-Side Vendor Comparison Board
                </h1>
                <p className="text-xs text-slate-600 font-medium">Comparative technical & financial evaluation matrix</p>
              </div>
            </div>

            {bids.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
                <label className="text-xs font-bold text-slate-600 shrink-0">Select Tender:</label>
                <select
                  value={selectedBidId}
                  onChange={(e) => handleBidChange(e.target.value)}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-cyan-500"
                >
                  {bids.map((b) => (
                    <option key={b.id} value={b.id}>{b.bid_number} — {b.title.slice(0, 25)}...</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Government API Adapter Gateway Live Panel */}
          <GovtAdapterPanel />

          {comparisonData && comparisonData.vendors && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Critical Mandatory Failures Highlights</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {comparisonData.vendors.map((v: any) => (
                  <div
                    key={v.vendor_id}
                    className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border space-y-2 shadow-xs ${
                      v.mandatory_failures && v.mandatory_failures.length > 0
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : v.review_required_count > 0
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-xs text-slate-900 truncate">{v.company_name}</span>
                      <span className="font-mono text-sm font-extrabold shrink-0">{v.compliance_score}%</span>
                    </div>

                    {v.mandatory_failures && v.mandatory_failures.length > 0 ? (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-rose-700 uppercase block">
                          🔴 {v.mandatory_failures.length} Mandatory Failures:
                        </span>
                        <ul className="text-[11px] list-disc list-inside space-y-0.5 text-rose-800 font-medium">
                          {v.mandatory_failures.map((f: string, fIdx: number) => (
                            <li key={fIdx} className="line-clamp-1">{f}</li>
                          ))}
                        </ul>
                      </div>
                    ) : v.review_required_count > 0 ? (
                      <p className="text-[11px] text-amber-800 font-medium">
                        🟡 {v.review_required_count} Requirement(s) flagged for human review (Technical mismatch / Contradiction).
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-800 font-medium">
                        🟢 Fully Compliant. All mandatory technical & financial requirements satisfied.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="apple-card p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-medium">
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-hidden">
              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-bold text-slate-700 shrink-0">Category:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 sm:pb-0 scrollbar-none w-full">
                {['ALL', 'Technical', 'Financial', 'Eligibility', 'Certification', 'Warranty'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 sm:px-3 py-1 rounded-xl transition-all text-[11px] sm:text-xs shrink-0 ${
                      filterCategory === cat
                        ? 'bg-cyan-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-slate-500 font-mono text-[10px] sm:text-[11px] font-semibold shrink-0">
              {filteredRequirements.length} requirements across {comparisonData?.vendors?.length || 0} vendors
            </span>
          </div>

          {comparisonData && (
            <div className="apple-card p-3 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4">
              <div className="overflow-x-auto w-full max-w-full block">
                <table className="w-full text-left text-xs border-collapse min-w-[680px]">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 uppercase text-[10px] tracking-wider font-bold">
                      <th className="p-3 w-64">Requirement Clause</th>
                      <th className="p-3 w-24">Cat</th>
                      {comparisonData.vendors.map((v: any) => (
                        <th key={v.vendor_id} className="p-3 min-w-[200px] text-center border-l border-slate-200">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-900 block truncate">{v.company_name}</span>
                            <span className="font-mono text-emerald-700 text-xs font-bold block">Score: {v.compliance_score}%</span>
                            <button
                              onClick={() => setSelectedVendorForRadar(v.vendor_id)}
                              className="mt-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-extrabold border border-amber-200 transition-all flex items-center gap-1 mx-auto"
                            >
                              <Activity className="w-3 h-3 text-amber-600" />
                              <span>Risk Radar</span>
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 font-medium">
                    {filteredRequirements.map((req: any) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900">
                          <div className="space-y-1">
                            <span className="font-mono text-emerald-700 text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
                              {req.requirement_id}
                            </span>
                            <p className="text-xs text-slate-800 font-semibold leading-snug break-words">
                              {req.requirement}
                            </p>
                          </div>
                        </td>
                        <td className="p-3 text-slate-500 font-mono text-[11px] font-semibold">{req.category}</td>

                        {comparisonData.vendors.map((v: any) => {
                          const statusObj = v.requirement_statuses[req.id];
                          if (!statusObj) {
                            return (
                              <td key={v.vendor_id} className="p-3 border-l border-slate-200 text-center text-slate-400 font-medium">
                                Unchecked
                              </td>
                            );
                          }

                          return (
                            <td key={v.vendor_id} className="p-3 border-l border-slate-200 text-center">
                              <div className="space-y-1.5 flex flex-col items-center max-w-[200px] mx-auto">
                                <StatusBadge status={statusObj.status} />
                                <p className="text-[10px] text-slate-600 font-medium leading-tight line-clamp-2 break-words">
                                  {statusObj.reasoning}
                                </p>
                                {statusObj.doc && (
                                  <span className="text-[9px] font-mono text-sky-700 font-bold break-all">
                                    {statusObj.doc} p.{statusObj.page}
                                  </span>
                                )}

                                <button
                                  onClick={() => setSelectedResultForOverride({
                                    id: `${v.vendor_id}_${req.id}`,
                                    status: statusObj.status,
                                    requirement: req
                                  })}
                                  className="text-[10px] text-indigo-600 hover:text-indigo-800 underline font-bold pt-1"
                                >
                                  Override Status
                                </button>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          <HumanOverrideModal
            result={selectedResultForOverride}
            onClose={() => setSelectedResultForOverride(null)}
            onSuccess={() => fetchComparison(selectedBidId)}
          />

          <EvidenceModal
            result={selectedResultForDetail}
            onClose={() => setSelectedResultForDetail(null)}
          />

          {selectedVendorForRadar && (
            <RiskRadarModal
              vendorId={selectedVendorForRadar}
              onClose={() => setSelectedVendorForRadar(null)}
            />
          )}

        </main>
      </div>

      <AIAssistantDrawer
        isOpen={showAssistant}
        onClose={() => setShowAssistant(false)}
        bidId={selectedBidId}
      />
    </div>
  );
};
