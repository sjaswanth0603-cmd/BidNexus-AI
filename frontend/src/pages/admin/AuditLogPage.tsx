import React, { useState, useEffect } from 'react';
import { History, Clock } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { auditService } from '../../services/api';
import type { AuditLog } from '../../types';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await auditService.getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-7xl">
          
          <div className="apple-card p-6 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Audit Logs Timeline</h1>
                <p className="text-xs text-slate-600 font-medium">Complete, tamper-evident audit history of all system events and evaluator overrides</p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-xs">
              Audit-Ready Logging Active
            </span>
          </div>

          <div className="apple-card p-7 rounded-3xl space-y-4">
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-700">{log.action}</span>
                      <span className="text-xs text-slate-500 font-medium">• {log.entity_type} ({log.entity_id || 'Global'})</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">{log.details}</p>
                  </div>

                  <div className="text-right text-[11px] text-slate-500 font-mono font-semibold shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};
