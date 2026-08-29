import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileSearch,
  CheckSquare,
  FileCheck,
  Zap,
  Sparkles,
  ChevronRight,
  Building2,
  Lock
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      navigate('/new-check');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0B1228] flex flex-col font-sans selection:bg-[#009F6B] selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 border-b border-[#E7ECF2] bg-[#F3F7FF]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#ECFFF8] border border-[#009F6B]/30 text-[#009F6B] text-xs font-black shadow-xs">
            <Sparkles className="w-4 h-4 text-[#009F6B]" />
            <span>BidNexusAI — Government e-Marketplace (GeM) AI Portal</span>
          </div>

          {/* Main Heading & Subtitle */}
          <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="hero-title max-w-4xl mx-auto">
              AI-Powered Integrated Bid Compliance Verification
            </h1>
            <p className="text-xl sm:text-2xl text-[#31506F] font-semibold leading-relaxed max-w-3xl mx-auto">
              Verify every procurement requirement against bidder evidence before a decision is made.
            </p>
          </div>

          {/* 4 CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 max-w-4xl mx-auto">
            <button
              onClick={handleExploreClick}
              className="px-7 py-4 rounded-2xl bg-[#009F6B] hover:bg-[#00875a] text-white font-extrabold text-base shadow-lg shadow-[#009F6B]/20 transition-all flex items-center gap-2.5"
            >
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>Explore Platform</span>
            </button>

            <Link
              to="/ap-portal"
              className="px-6 py-4 rounded-2xl bg-[#174EE8] hover:bg-blue-700 text-white font-extrabold text-base shadow-md shadow-[#174EE8]/20 transition-all flex items-center gap-2"
            >
              <Building2 className="w-5 h-5 text-white" />
              <span>View eGP Portal Reference UI</span>
            </Link>

            <Link
              to="/register"
              className="px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-[#0B1228] border-2 border-[#E7ECF2] font-extrabold text-base shadow-xs transition-all flex items-center gap-2"
            >
              <span>Create Account</span>
              <ChevronRight className="w-4 h-4 text-[#31506F]" />
            </Link>

            <Link
              to="/login"
              className="px-6 py-4 rounded-2xl bg-[#5545FF] hover:bg-indigo-700 text-white font-extrabold text-base transition-all flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-white" />
              <span>Login to Portal</span>
            </Link>
          </div>

          {/* 3 Feature Cards (Immediately Below Hero) */}
          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
            
            {/* Card 1 */}
            <div className="light-card p-8 space-y-4">
              <div className="p-4 w-fit rounded-2xl bg-[#ECFFF8] text-[#009F6B] border border-[#009F6B]/20">
                <FileSearch className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-[#0B1228]">1. AI Requirement Extraction</h3>
              <p className="text-sm text-[#31506F] leading-relaxed font-semibold">
                Automatically parses unstructured GeM tender text into structured, categorized compliance rules with source page citations.
              </p>
            </div>

            {/* Card 2 */}
            <div className="light-card p-8 space-y-4">
              <div className="p-4 w-fit rounded-2xl bg-[#F3F7FF] text-[#174EE8] border border-blue-200">
                <CheckSquare className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-[#0B1228]">2. Evidence-Based Verification</h3>
              <p className="text-sm text-[#31506F] leading-relaxed font-semibold">
                RAG/vector search extracts vendor evidence, executing numerical checks, missing document detection and contradiction checks.
              </p>
            </div>

            {/* Card 3 */}
            <div className="light-card p-8 space-y-4">
              <div className="p-4 w-fit rounded-2xl bg-indigo-50 text-[#5545FF] border border-indigo-200">
                <FileCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-[#0B1228]">3. Explainable Audit Reports</h3>
              <p className="text-sm text-[#31506F] leading-relaxed font-semibold">
                Generates audit-ready PDF reports with exact document page citations and human evaluator review overrides.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Secondary Information Banner */}
      <section className="py-16 bg-white border-b border-[#E7ECF2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black text-[#009F6B] uppercase tracking-wider bg-[#ECFFF8] px-3.5 py-1 rounded-full border border-[#009F6B]/30">
              Government Procurement Trust & Explainability
            </span>
            <h2 className="text-3xl font-extrabold text-[#0B1228]">
              Automated Evidence Extraction & Audit-Ready Decision Matrix
            </h2>
            <p className="text-base text-[#31506F] font-medium leading-relaxed">
              Designed specifically for GeM (Government e-Marketplace) and State e-Procurement evaluations with zero black-box AI outputs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-4">
            <div className="p-6 rounded-2xl bg-[#F3F7FF] border border-blue-100 text-center space-y-1">
              <span className="text-3xl font-black text-[#174EE8]">100%</span>
              <p className="text-xs font-extrabold text-[#0B1228]">Page Citation Accuracy</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#ECFFF8] border border-emerald-100 text-center space-y-1">
              <span className="text-3xl font-black text-[#009F6B]">Hybrid</span>
              <p className="text-xs font-extrabold text-[#0B1228]">Rules + Semantic RAG</p>
            </div>
            <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 text-center space-y-1">
              <span className="text-3xl font-black text-[#5545FF]">PDF</span>
              <p className="text-xs font-extrabold text-[#0B1228]">Downloadable Reports</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-3xl font-black text-[#0B1228]">Audit</span>
              <p className="text-xs font-extrabold text-[#0B1228]">Human Evaluator Logs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-[#E7ECF2] text-center text-xs text-[#31506F] font-semibold">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#009F6B]" />
            <span className="font-extrabold text-[#0B1228]">BidNexusAI (SIH26100)</span>
            <span>— AI Procurement Verification Engine</span>
          </div>
          <p>© 2026 Government e-Marketplace Procurement Compliance System.</p>
        </div>
      </footer>
    </div>
  );
};
