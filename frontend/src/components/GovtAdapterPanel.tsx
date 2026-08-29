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
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Government API Integration Layer</h3>
            <p className="text-xs text-slate-500 font-semibold">Live status of G2G & Verification Gateway Adapters</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            <button
              onClick={() => setIsSandbox(true)}
              className={`px-3 py-1 rounded-lg transition-all ${
                isSandbox ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200 font-extrabold' : 'text-slate-500'
              }`}
            >
              Sandbox Mocker Mode
            </button>
            <button
              onClick={() => setIsSandbox(false)}
              className={`px-3 py-1 rounded-lg transition-all ${
                !isSandbox ? 'bg-blue-600 text-white shadow-xs font-extrabold' : 'text-slate-500'
              }`}
            >
              Live G2G Gateway
            </button>
          </div>

          <button
            onClick={fetchStatus}
            title="Refresh Adapter Status"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data?.adapters?.map((adapter: any) => (
          <div
            key={adapter.code}
            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between space-y-1 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900">{adapter.name}</span>
                <span className="bg-emerald-100 text-emerald-800 font-mono text-[9px] font-black px-1.5 py-0.5 rounded">
                  {adapter.status}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono truncate max-w-[180px]">{adapter.endpoint}</p>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600">
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-600" />
                  {adapter.latency_ms} ms
                </span>
                <span>•</span>
                <span>{adapter.verified_records} records verified</span>
              </div>
            </div>

            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
