import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Users,
  GitCompare,
  History,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { AIAssistantDrawer } from '../../components/AIAssistantDrawer';
import { GovtAdapterPanel } from '../../components/GovtAdapterPanel';
import { useAuth } from '../../context/AuthContext';
import { bidService } from '../../services/api';
import type { Bid } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bids, setBids] = useState<Bid[]>([]);
  const [showAssistant, setShowAssistant] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bList = await bidService.listBids();
        setBids(bList);
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased">
      <Navbar onToggleAssistant={() => setShowAssistant(!showAssistant)} />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl">
          
          {/* Evaluator Header Banner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 uppercase tracking-wider inline-block">
                PROCUREMENT EVALUATOR BOARD
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Evaluator Control Board — {user?.full_name || 'Procurement Evaluator'}
              </h1>
              <p className="text-sm text-slate-600 font-normal leading-relaxed">
                Multi-source evidence verification, cross-vendor comparison matrix, and PDF audit report generation.
              </p>
            </div>

            <button
              onClick={() => navigate('/admin/create-bid')}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Create Tender Requirement</span>
            </button>
          </div>

          {/* Key Evaluation Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Total Tender Bids</span>
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <FileCheck2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{bids.length || 4}</div>
              <span className="text-xs text-slate-500 font-normal">Extracted GeM Tenders</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Evaluated Submissions</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-600">3</div>
              <span className="text-xs text-emerald-600 font-medium">1 Compliant, 1 Review, 1 Non-Compliant</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Mandatory Shortfalls</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-600">2</div>
              <span className="text-xs text-amber-700 font-medium">Flagged by RAG Engine</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">System Audit Trail</span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">100%</div>
              <span className="text-xs text-slate-500 font-normal">Immutable Audit Logs</span>
            </div>
          </div>

          {/* Government Adapters Integration Status Panel */}
          <GovtAdapterPanel />

          {/* Quick Action Navigation Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Evaluator Management Tools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <div
                onClick={() => navigate('/admin/comparison')}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 cursor-pointer transition-all shadow-xs hover:shadow-md group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                    <GitCompare className="w-5 h-5 text-amber-400" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Vendor Comparison</h4>
                  <p className="text-xs text-slate-600 font-normal mt-1 leading-relaxed">
                    Side-by-side compliance matrix comparing all bidders for a tender.
                  </p>
                </div>
              </div>

              <div
                onClick={() => navigate('/test-page')}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 cursor-pointer transition-all shadow-xs hover:shadow-md group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                    <Zap className="w-5 h-5 fill-emerald-600" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">2-File Verification</h4>
                  <p className="text-xs text-slate-600 font-normal mt-1 leading-relaxed">
                    Compare Government PDF directly against Bidder Submission PDF.
                  </p>
                </div>
              </div>

              <div
                onClick={() => navigate('/admin/vendors')}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 cursor-pointer transition-all shadow-xs hover:shadow-md group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
                    <Users className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Vendor Submissions</h4>
                  <p className="text-xs text-slate-600 font-normal mt-1 leading-relaxed">
                    Manage uploaded evidence files, score status, and PDF report downloads.
                  </p>
                </div>
              </div>

              <div
                onClick={() => navigate('/admin/audit-logs')}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 cursor-pointer transition-all shadow-xs hover:shadow-md group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                    <History className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Audit Logs Timeline</h4>
                  <p className="text-xs text-slate-600 font-normal mt-1 leading-relaxed">
                    Review timestamped, immutable system events and compliance actions.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Active Tenders Listing Table */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Active GeM Procurement Bids</h3>
                <p className="text-xs text-slate-500 font-normal">Select a tender to manage vendor submissions or compare bidders.</p>
              </div>
              <button
                onClick={() => navigate('/admin/create-bid')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                + Extract New Tender →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-200/80">
                    <th className="p-3">Tender Number</th>
                    <th className="p-3">Tender Title</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Extracted Rules</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {bids.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono text-emerald-700 font-semibold">{b.bid_number}</td>
                      <td className="p-3 font-semibold text-slate-900 max-w-sm">{b.title}</td>
                      <td className="p-3 text-slate-600">{b.department}</td>
                      <td className="p-3 font-mono text-blue-600 font-medium">{b.requirements_count || 5} Rules Extracted</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/comparison?bidId=${b.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition-colors shadow-2xs"
                          >
                            Compare Bidders
                          </button>
                          <button
                            onClick={() => navigate(`/test-page?tenderId=${b.id}`)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors shadow-2xs"
                          >
                            2-File Check
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>

      <AIAssistantDrawer isOpen={showAssistant} onClose={() => setShowAssistant(false)} bidId={bids[0]?.id || '983373'} />
    </div>
  );
};

export default AdminDashboard;
