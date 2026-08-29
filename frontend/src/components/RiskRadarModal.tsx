import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { vendorService } from '../services/api';

interface RiskRadarModalProps {
  vendorId: string;
  onClose: () => void;
}

export const RiskRadarModal: React.FC<RiskRadarModalProps> = ({ vendorId, onClose }) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadRiskRadar();
  }, [vendorId]);

  const loadRiskRadar = async () => {
    try {
      setLoading(true);
      const res = await vendorService.getVendorRiskRadar(vendorId);
      setData(res);
    } catch (err) {
      console.error('Failed to load vendor risk radar:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Bidder Compliance Risk Radar</h2>
              <p className="text-xs text-slate-500 font-semibold">Multi-dimensional risk breakdown & anomaly detection</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-medium space-y-2">
            <Activity className="w-6 h-6 text-amber-600 animate-spin mx-auto" />
            <p>Computing risk radar dimensions...</p>
          </div>
        ) : (
          data && (
            <div className="space-y-6 text-xs">
              
              {/* Summary Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Company Name</span>
                  <h3 className="text-base font-black text-slate-900">{data.company_name}</h3>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Entity Match Ratio</span>
                    <span className="font-mono font-black text-slate-800 text-sm">{Math.round(data.entity_match_ratio * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Overall Risk</span>
                    <span className={`font-black text-xs px-3 py-1 rounded-full uppercase ${
                      data.overall_risk === 'LOW'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : data.overall_risk === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {data.overall_risk} RISK
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Dimensions Progress Bars */}
              <div className="space-y-3">
                <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px] block">
                  Risk Dimension Metric Breakdown
                </span>

                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Financial Shortfall Risk</span>
                      <span className="font-mono">{data.dimensions.financial_risk}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="bg-amber-500 h-full transition-all"
                        style={{ width: `${data.dimensions.financial_risk}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Technical Specification Risk</span>
                      <span className="font-mono">{data.dimensions.technical_risk}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="bg-blue-600 h-full transition-all"
                        style={{ width: `${data.dimensions.technical_risk}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Document Expiry / Missing File Risk</span>
                      <span className="font-mono">{data.dimensions.document_expiry_risk}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="bg-rose-600 h-full transition-all"
                        style={{ width: `${data.dimensions.document_expiry_risk}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Cross-Document Contradiction Risk</span>
                      <span className="font-mono">{data.dimensions.contradiction_risk}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="bg-indigo-600 h-full transition-all"
                        style={{ width: `${data.dimensions.contradiction_risk}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected Anomalies */}
              <div className="space-y-2">
                <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px] block">
                  AI Detected Compliance Anomalies
                </span>

                {data.anomalies_detected.length === 0 ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No critical compliance anomalies or document inconsistencies detected.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data.anomalies_detected.map((anomaly: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-bold flex items-start gap-2.5"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{anomaly}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Close Risk Radar
          </button>
        </div>

      </div>
    </div>
  );
};
