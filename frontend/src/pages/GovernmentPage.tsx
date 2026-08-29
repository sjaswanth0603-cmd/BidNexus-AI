import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Trash2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { javaApiService } from '../api';

export const GovernmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [refNo, setRefNo] = useState(`GEM/2026/B/${Math.floor(100000 + Math.random() * 900000)}`);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('IT Hardware & Infrastructure');
  const [department, setDepartment] = useState('Ministry of Electronics & IT (MeitY)');
  const [deadline, setDeadline] = useState('2026-10-31');

  // Dynamic Repeatable Requirement Rows
  const [requirements, setRequirements] = useState([
    { name: 'Financial Turnover', type: 'Financial', details: 'Minimum Average Annual Financial Turnover >= ₹5.0 Crore' },
    { name: 'System Memory RAM', type: 'Technical', details: 'Minimum 32 GB Installed DDR5 System Memory per Server Node' },
    { name: 'ISO Quality Certificate', type: 'Certification', details: 'Valid ISO 9001:2015 Quality Management System Certificate' },
  ]);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAddRequirementRow = () => {
    setRequirements([
      ...requirements,
      { name: '', type: 'Technical', details: '' },
    ]);
  };

  const handleRemoveRequirementRow = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleReqChange = (index: number, field: string, value: string) => {
    const updated = [...requirements];
    (updated[index] as any)[field] = value;
    setRequirements(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      setLoading(true);
      const created = await javaApiService.createTender({
        refNo,
        title,
        category,
        department,
        deadline,
        requirements,
      });

      setSuccessMsg(`Tender ${created.refNo} created successfully with ${requirements.length} compliance rules!`);
      setTimeout(() => {
        navigate('/vendor');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create tender:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">Government Portal — Tender Publisher</h1>
            <p className="text-xs text-slate-500 font-semibold">Define e-Procurement specifications & compliance rules</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/vendor')}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
        >
          <span>Vendor Portal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      <main className="max-w-4xl mx-auto w-full p-6 space-y-6 flex-1">
        
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Tender Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-extrabold text-indigo-700 uppercase tracking-wider">
              1. Tender Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
              <div className="space-y-1">
                <label className="text-slate-700">Tender Reference No</label>
                <input
                  type="text"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-indigo-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                >
                  <option value="IT Hardware & Infrastructure">IT Hardware & Infrastructure</option>
                  <option value="Electrical & Smart City">Electrical & Smart City</option>
                  <option value="Civil Works & Construction">Civil Works & Construction</option>
                  <option value="Medical Equipment">Medical Equipment</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-700">Tender Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Procurement of High-Performance Enterprise Compute Nodes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700">Department / Ministry</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700">Submission Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Repeatable Requirement Rows */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-indigo-700 uppercase tracking-wider">
                  2. Dynamic Compliance Requirements
                </h2>
                <p className="text-xs text-slate-500 font-medium">Add requirement clauses for AI document evaluation</p>
              </div>

              <button
                type="button"
                onClick={handleAddRequirementRow}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Clause</span>
              </button>
            </div>

            <div className="space-y-3">
              {requirements.map((req, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-extrabold text-indigo-700">Rule #{idx + 1}</span>
                    {requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirementRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Requirement Name (e.g. Financial Turnover)"
                      value={req.name}
                      onChange={(e) => handleReqChange(idx, 'name', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold"
                    />

                    <select
                      value={req.type}
                      onChange={(e) => handleReqChange(idx, 'type', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold"
                    >
                      <option value="Financial">Financial</option>
                      <option value="Technical">Technical</option>
                      <option value="Certification">Certification</option>
                      <option value="Eligibility">Eligibility</option>
                      <option value="Warranty">Warranty</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Details (e.g. Min turnover >= ₹5.0 Cr)"
                      value={req.details}
                      onChange={(e) => handleReqChange(idx, 'details', e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-semibold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !title}
              className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Publishing Tender...' : 'Publish Tender & Requirements'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      </main>

    </div>
  );
};
