import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Bot, Building2, Zap, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onToggleAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleAssistant }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleConsoleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      navigate('/test-page');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/90 shadow-2xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo & Platform Title */}
        <div className="flex items-center gap-6">
          <Link to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-slate-900 text-white shadow-xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight text-slate-900">BidNexus AI</span>
                <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border border-slate-200 uppercase">
                  SIH26100
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">AI Integrated GeM Procurement Verification</p>
            </div>
          </Link>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-3">
          
          <Link
            to="/gem-portal"
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100/80 text-slate-700 text-xs font-medium hover:bg-slate-200/80 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
            <span>GeM Portal</span>
          </Link>

          <Link
            to="/ap-portal"
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100/80 text-slate-700 text-xs font-medium hover:bg-slate-200/80 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>eGP AP Portal</span>
          </Link>

          <button
            onClick={handleConsoleClick}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>AI Verification Console</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200/80">
              {onToggleAssistant && (
                <button
                  onClick={onToggleAssistant}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-all"
                >
                  <Bot className="w-3.5 h-3.5 text-slate-600" />
                  <span>AI Copilot</span>
                </button>
              )}

              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-900">{user.full_name}</div>
                <div className="text-[10px] text-slate-500 font-normal">{user.organization}</div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                user.role === 'admin'
                  ? 'bg-slate-900 text-white'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
              }`}>
                {user.role === 'admin' ? 'Evaluator' : 'Bidder'}
              </span>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl shadow-xs transition-all"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
