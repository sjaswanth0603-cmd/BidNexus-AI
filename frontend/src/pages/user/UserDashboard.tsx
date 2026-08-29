import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  ShoppingBag,
  Building2
} from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { bidService } from '../../services/api';
import type { Bid } from '../../types';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await bidService.listBids();
        setBids(data);
      } catch (err) {
        console.error('Failed to load user bids:', err);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans antialiased">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl">
          
          {/* Header Section (Decent & Professional) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-wider inline-block">
                VENDOR COMPLIANCE DASHBOARD
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome back, {user?.full_name || 'Rajesh Kumar (Bidder)'}
              </h1>
              <p className="text-sm text-slate-600 font-normal leading-relaxed">
                Automated multi-source bid compliance verification powered by BidNexus AI RAG Engine.
              </p>
            </div>

            <button
              onClick={() => navigate('/test-page')}
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-2 shrink-0"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>AI Verification Console</span>
            </button>
          </div>

          {/* Bidder Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Active Procurement Bids</span>
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">{bids.length || 5}</div>
              <span className="text-xs text-slate-500 font-normal">GeM & eGP Tenders</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Compliant Submissions</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-600">1</div>
              <span className="text-xs text-emerald-600 font-medium">TechCorp (100% Score)</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Review Required</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-600">1</div>
              <span className="text-xs text-amber-700 font-medium">Apex Labs (80% Score)</span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Non-Compliant</span>
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-rose-600">1</div>
              <span className="text-xs text-rose-700 font-medium">InfraSys (40% Score)</span>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
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
                  <h4 className="text-sm font-semibold text-slate-900">Run AI Verification</h4>
                  <p className="text-xs text-slate-600 font-normal mt-1 leading-relaxed">
                    Compare Government Tender PDF directly against Bidder Submission PDF in 2-File console.
                  </p>
                </div>
              </div>

              <div
                onClick={() => navigate('/gem-portal')}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 cursor-pointer transition-all shadow-xs hover:shadow-md group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">GeM Tender Portal</h4>
                  <p className="text-xs text-slate-600 font-normal mt-1 leading-relaxed">
                    Browse active Government e-Marketplace procurement tenders and check requirements.
                  </p>
                </div>
              </div>

              <div
                onClick={() => navigate('/ap-portal')}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 cursor-pointer transition-all shadow-xs hover:shadow-md group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">eGP AP Procurement Portal</h4>
                  <p className="text-xs text-slate-600 font-normal mt-1 leading-relaxed">
                    View state water resources and infrastructure tenders on eProcurement AP portal.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Active Vendor Verification Records List */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Active Tender Directory</h3>
                <p className="text-xs text-slate-500 font-normal">Select a tender to run 2-File Cross Comparison verification.</p>
              </div>
              <button
                onClick={() => navigate('/test-page')}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Open Console →
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
                    <th className="p-3 text-right">Action</th>
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
                        <button
                          onClick={() => navigate(`/test-page?tenderId=${b.id}`)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors shadow-2xs"
                        >
                          Verify with BidNexus AI
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
