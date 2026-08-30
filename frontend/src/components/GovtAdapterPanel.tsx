import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, RefreshCw, Activity } from 'lucide-react';
import { vendorService } from '../services/api';

export const GovtAdapterPanel: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSandbox, setIsSandbox] = useState<boolean>(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const statusData = await vendorService.getGovtAdapterStatus();
      setData(statusData);
    } catch (err) {
      console.error('Failed to load govt adapter status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-3.5 sm:pb-4">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">Government API Integration Layer</h3>
            <p className="text-[10px] sm:text-xs text-slate-500 font-semibold truncate">Live status of G2G & Verification Gateway Adapters</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => setIsSandbox(true)}
              className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all text-[10px] sm:text-xs shrink-0 ${
                isSandbox ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200 font-extrabold' : 'text-slate-500'
              }`}
            >
              Sandbox
            </button>
            <button
              onClick={() => setIsSandbox(false)}
              className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all text-[10px] sm:text-xs shrink-0 ${
                !isSandbox ? 'bg-blue-600 text-white shadow-xs font-extrabold' : 'text-slate-500'
              }`}
            >
              Live G2G
            </button>
          </div>

          <button
            onClick={fetchStatus}
            title="Refresh Adapter Status"
            className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {data?.adapters?.map((adapter: any) => (
          <div
            key={adapter.code}
            className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 truncate">{adapter.name}</span>
                <span className="bg-emerald-100 text-emerald-800 font-mono text-[9px] font-black px-1.5 py-0.5 rounded shrink-0">
                  {adapter.status}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate max-w-[170px] sm:max-w-[200px]">{adapter.endpoint}</p>
              <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-bold text-slate-600">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-600 shrink-0" />
                  {adapter.latency_ms} ms
                </span>
                <span>•</span>
                <span className="truncate">{adapter.verified_records} records</span>
              </div>
            </div>

            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
