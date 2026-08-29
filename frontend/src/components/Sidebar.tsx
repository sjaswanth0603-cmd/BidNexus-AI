import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  GitCompare,
  History,
  ShieldAlert,
  FlaskConical,
  UserCheck,
  ShieldCheck,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatutoryDocumentSidebar } from './StatutoryDocumentSidebar';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showStatutorySidebar, setShowStatutorySidebar] = useState<boolean>(false);

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 hidden md:flex flex-col justify-between min-h-[calc(100vh-4.5rem)] p-5 shadow-2xs font-sans shrink-0">
      <div className="space-y-6">
        
        {/* Role Badge Indicator */}
        <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-3 font-semibold ${
          isAdmin
            ? 'bg-slate-900 text-white border-slate-800'
            : 'bg-slate-50 text-slate-800 border-slate-200/80'
        }`}>
          {isAdmin ? (
            <>
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-medium">Active Role</span>
                <span className="font-bold">Procurement Evaluator</span>
              </div>
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-medium">Active Role</span>
                <span className="font-bold text-slate-900">Registered Bidder</span>
              </div>
            </>
          )}
        </div>

        {/* BIDDER NAVIGATION */}
        {!isAdmin ? (
          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              BIDDER NAVIGATION
            </h3>
            <nav className="space-y-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>Bidder Dashboard</span>
              </NavLink>

              <NavLink
                to="/test-page"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <FlaskConical className="w-4 h-4 text-emerald-500" />
                <span>AI Verification Console</span>
              </NavLink>

              <button
                onClick={() => setShowStatutorySidebar(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all text-left"
              >
                <Fingerprint className="w-4 h-4 text-blue-600" />
                <span>Statutory Proofs (Aadhaar, GST, PAN)</span>
              </button>
            </nav>
          </div>
        ) : (
          /* EVALUATOR NAVIGATION */
          <div>
            <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              EVALUATOR MANAGEMENT
            </h3>
            <nav className="space-y-1">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>Evaluator Dashboard</span>
              </NavLink>

              <NavLink
                to="/admin/create-bid"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <FileCheck2 className="w-4 h-4 text-slate-500" />
                <span>Create Tender Bid</span>
              </NavLink>

              <NavLink
                to="/admin/vendors"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span>Vendor Submissions</span>
              </NavLink>

              <NavLink
                to="/admin/comparison"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <GitCompare className="w-4 h-4 text-slate-500" />
                <span>Vendor Comparison Board</span>
              </NavLink>

              <NavLink
                to="/admin/audit-logs"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <History className="w-4 h-4 text-amber-500" />
                <span>Audit Logs Timeline</span>
              </NavLink>

              <button
                onClick={() => setShowStatutorySidebar(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all text-left"
              >
                <Fingerprint className="w-4 h-4 text-blue-600" />
                <span>Statutory Proofs (Aadhaar, GST, PAN)</span>
              </button>
            </nav>
          </div>
        )}

      </div>

      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>BidNexus AI v1.0</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500 font-normal">
          AI Procurement Compliance Verification Platform.
        </p>
      </div>

      <StatutoryDocumentSidebar
        isOpen={showStatutorySidebar}
        onClose={() => setShowStatutorySidebar(false)}
      />
    </aside>
  );
};

export default Sidebar;
