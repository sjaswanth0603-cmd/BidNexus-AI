import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck2, Upload, ChevronRight, AlertCircle, FileText } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { bidService } from '../../services/api';

export const CreateBidPage: React.FC = () => {
  const [bidNumber, setBidNumber] = useState(`GEM/2026/B/${Math.floor(100000 + Math.random() * 900000)}`);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Ministry of Electronics & IT (MeitY)');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('2026-10-31');
  const [bidFile, setBidFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !bidNumber) {
      setError('Please provide bid number and tender title.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const createdBid = await bidService.createBid({
        bid_number: bidNumber,
        title,
        department,
        description,
        deadline,
      });

      if (bidFile) {
        await bidService.uploadBidDocument(createdBid.id, bidFile);
        await bidService.extractRequirements(createdBid.id);
      }

      navigate(`/new-check?bid=${createdBid.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create procurement bid tender.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
          
          <div className="apple-card p-6 rounded-3xl space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Create Official GeM Tender Bid</h1>
                <p className="text-xs text-slate-600 font-medium">Initialize procurement tender and upload official document</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="apple-card p-8 rounded-3xl space-y-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Bid Number / Tender ID <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={bidNumber}
                    onChange={(e) => setBidNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-emerald-700 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Department / Ministry <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Tender Title <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Procurement of High Performance Cloud Servers & Storage"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700">Submission Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Tender Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief procurement scope and specifications..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="block font-bold text-slate-700">Upload Official Tender PDF/DOCX</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-50/50 space-y-3 transition-colors">
                  {!bidFile ? (
                    <label className="cursor-pointer space-y-2 block">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <span className="text-xs font-bold text-indigo-600 hover:underline block">Select Tender Document</span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={(e) => e.target.files && setBidFile(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-slate-800">{bidFile.name}</span>
                      </div>
                      <button type="button" onClick={() => setBidFile(null)} className="text-rose-600 font-bold text-xs">Remove</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
                >
                  <span>{loading ? 'Creating & Extracting...' : 'Create Bid & AI Extract Requirements'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          </div>

        </main>
      </div>
    </div>
  );
};
