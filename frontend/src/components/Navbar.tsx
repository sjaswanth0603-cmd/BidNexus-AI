import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, LogOut, Bot, Building2, Zap, ShoppingBag,
  Menu, X, LayoutDashboard, GitCompare, Users, History, FileCheck2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onToggleAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleAssistant }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleConsoleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (user) {
      navigate('/test-page');
    } else {
      navigate('/login');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/90 shadow-2xs font-sans">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        
        {/* Brand Logo & Platform Title */}
        <div className="flex items-center gap-3">
          <Link
            to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'}
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="p-1.5 sm:p-2 rounded-xl bg-slate-900 text-white shadow-xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-xl tracking-tight text-slate-900">BidNexus AI</span>
                <span className="bg-slate-100 text-slate-700 text-[9px] sm:text-[10px] font-mono font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-200 uppercase">
                  SIH26100
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-normal hidden xs:block">
                AI Integrated GeM Procurement
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/gem-portal"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100/80 text-slate-700 text-xs font-medium hover:bg-slate-200/80 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
            <span>GeM Portal</span>
          </Link>

          <Link
            to="/ap-portal"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100/80 text-slate-700 text-xs font-medium hover:bg-slate-200/80 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>eGP AP Portal</span>
          </Link>

          <button
            onClick={handleConsoleClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>AI Verification Console</span>
          </button>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {onToggleAssistant && (
                <button
                  onClick={onToggleAssistant}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all"
                  title="AI Copilot"
                >
                  <Bot className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">AI Copilot</span>
                </button>
              )}

              <div className="text-right hidden md:block max-w-[140px] truncate">
                <div className="text-xs font-semibold text-slate-900 truncate">{user.full_name}</div>
                <div className="text-[10px] text-slate-500 font-normal truncate">{user.organization}</div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider ${
                user.role === 'admin'
                  ? 'bg-slate-900 text-white'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
              }`}>
                {user.role === 'admin' ? 'Evaluator' : 'Bidder'}
              </span>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors hidden sm:block"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/login"
                className="text-xs font-medium text-slate-700 hover:text-slate-900 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-xs transition-all"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          
          {user && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">{user.full_name}</div>
                <div className="text-[11px] text-slate-500">{user.organization}</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-900 text-white">
                {user.role === 'admin' ? 'Evaluator' : 'Bidder'}
              </span>
            </div>
          )}

          <nav className="space-y-1 text-xs font-medium text-slate-700">
            {user ? (
              <>
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500" />
                  <span>{isAdmin ? 'Evaluator Dashboard' : 'Bidder Dashboard'}</span>
                </Link>

                {isAdmin && (
                  <>
                    <Link
                      to="/admin/create-bid"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <FileCheck2 className="w-4 h-4 text-slate-500" />
                      <span>Create Tender Bid</span>
                    </Link>

                    <Link
                      to="/admin/vendors"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <Users className="w-4 h-4 text-slate-500" />
                      <span>Vendor Submissions</span>
                    </Link>

                    <Link
                      to="/admin/comparison"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <GitCompare className="w-4 h-4 text-slate-500" />
                      <span>Vendor Comparison Board</span>
                    </Link>

                    <Link
                      to="/admin/audit-logs"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <History className="w-4 h-4 text-amber-500" />
                      <span>Audit Logs Timeline</span>
                    </Link>
                  </>
                )}
              </>
            ) : null}

            <Link
              to="/gem-portal"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span>GeM Portal</span>
            </Link>

            <Link
              to="/ap-portal"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Building2 className="w-4 h-4 text-blue-500" />
              <span>eGP AP Portal</span>
            </Link>

            <button
              onClick={handleConsoleClick}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-900 text-white font-semibold transition-colors mt-2"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>AI Verification Console</span>
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors pt-2 border-t border-slate-100 mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;

