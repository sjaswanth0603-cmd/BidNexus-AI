import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus2, ArrowRight } from 'lucide-react';
import { javaApiService } from '../api';

export const VendorPage: React.FC = () => {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState<any[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>('983373');
  const [vendorName, setVendorName] = useState<string>('TechCorp Solutions AP Pvt Ltd');

  // Multiple File Inputs
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    gst: null,
    pan: null,
    udyam: null,
    turnover: null,
    experience: null,
    other: null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTenders();
  }, []);

  const loadTenders = async () => {
    try {
      const data = await javaApiService.getTenders();
      setTenders(data);
      if (data.length > 0) {
        setSelectedTenderId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load tenders:', err);
    }
  };

  const handleFileChange = (key: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName) return;

    try {
      setLoading(true);

      const docsList: any[] = [];
      const docCategories: { [key: string]: string } = {
        gst: 'GST Certificate',
        pan: 'PAN Card Certificate',
        udyam: 'Udyam MSME Certificate',
        turnover: 'Financial Turnover CA Certificate',
        experience: 'Technical Datasheet & Experience',
        other: 'Supporting Evidence File',
      };

      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          docsList.push({
            docType: docCategories[key] || 'Evidence File',
            filePath: file.name,
            extractedText: `Vendor ${vendorName} uploaded file ${file.name} for ${docCategories[key]}. Extracted proof: GST37AAACT9876F1Z8, Turnover ₹14.5 Crore, 32 GB DDR5 RAM, ISO 9001:2015 valid, 3 Years Warranty.`,
          });
        }
      });

      if (docsList.length === 0) {
        docsList.push({
          docType: 'Combined Compliance Package',
          filePath: 'TechCorp_Evidence_Package.pdf',
          extractedText: `${vendorName} evidence: GSTIN 37AAACT9876F1Z8 active. Annual Turnover ₹14.5 Crore. 32 GB DDR5 RAM per node. ISO 9001:2015 Certificate Valid. OEM MAF attached. 3 Years Warranty.`,
        });
      }

      const bid = await javaApiService.submitBid({
        tenderId: selectedTenderId,
        vendorName,
        documents: docsList,
      });

      navigate(`/processing/${bid.id}`);
    } catch (err: any) {
      console.error('Failed to submit bid:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-3.5 sm:py-4 px-3 sm:px-6 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-600 text-white shrink-0">
            <FilePlus2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-black text-slate-900 truncate">Vendor Submission Portal</h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-semibold truncate">Select open tender and upload compliance evidence files</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/evaluator/983373')}
          className="px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span className="hidden xs:inline">Evaluator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      <main className="max-w-4xl mx-auto w-full p-3 sm:p-6 space-y-4 sm:space-y-6 flex-1">
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          
          {/* Select Open Tender Dropdown Card */}
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-sm">
            <h2 className="text-xs sm:text-sm font-extrabold text-emerald-800 uppercase tracking-wider">
              1. Select Open Government Tender
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs font-bold">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-700">Open Tenders Dropdown</label>
                <select
                  value={selectedTenderId}
                  onChange={(e) => setSelectedTenderId(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold"
                >
                  {tenders.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.refNo} — {t.title} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-700">Vendor / Bidder Company Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Multiple Document Upload Inputs */}
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-sm">
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-emerald-800 uppercase tracking-wider">
                2. Upload Required Document Packages
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Upload GST, PAN, Udyam, Financial Statements, Technical Datasheets</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs font-bold">
              
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="block text-slate-800">1. GST Registration Certificate</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.jpg"
                  onChange={(e) => handleFileChange('gst', e.target.files ? e.target.files[0] : null)}
                  className="block w-full text-xs text-slate-500 file:mr-2 sm:file:mr-3 file:py-1.5 sm:file:py-2 file:px-2.5 sm:file:px-3 file:rounded-xl file:border-0 file:text-[11px] sm:file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="block text-slate-800">2. PAN Card Certificate</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.jpg"
                  onChange={(e) => handleFileChange('pan', e.target.files ? e.target.files[0] : null)}
                  className="block w-full text-xs text-slate-500 file:mr-2 sm:file:mr-3 file:py-1.5 sm:file:py-2 file:px-2.5 sm:file:px-3 file:rounded-xl file:border-0 file:text-[11px] sm:file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="block text-slate-800">3. Udyam / MSME Certificate</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.jpg"
                  onChange={(e) => handleFileChange('udyam', e.target.files ? e.target.files[0] : null)}
                  className="block w-full text-xs text-slate-500 file:mr-2 sm:file:mr-3 file:py-1.5 sm:file:py-2 file:px-2.5 sm:file:px-3 file:rounded-xl file:border-0 file:text-[11px] sm:file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="block text-slate-800">4. Financial Turnover CA Certificate</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.jpg"
                  onChange={(e) => handleFileChange('turnover', e.target.files ? e.target.files[0] : null)}
                  className="block w-full text-xs text-slate-500 file:mr-2 sm:file:mr-3 file:py-1.5 sm:file:py-2 file:px-2.5 sm:file:px-3 file:rounded-xl file:border-0 file:text-[11px] sm:file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="block text-slate-800">5. Technical Datasheet & Experience</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.jpg"
                  onChange={(e) => handleFileChange('experience', e.target.files ? e.target.files[0] : null)}
                  className="block w-full text-xs text-slate-500 file:mr-2 sm:file:mr-3 file:py-1.5 sm:file:py-2 file:px-2.5 sm:file:px-3 file:rounded-xl file:border-0 file:text-[11px] sm:file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="block text-slate-800">6. Other Supporting Certificates</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.jpg"
                  onChange={(e) => handleFileChange('other', e.target.files ? e.target.files[0] : null)}
                  className="block w-full text-xs text-slate-500 file:mr-2 sm:file:mr-3 file:py-1.5 sm:file:py-2 file:px-2.5 sm:file:px-3 file:rounded-xl file:border-0 file:text-[11px] sm:file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !vendorName}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Submitting Package...' : 'Submit Bid & Run AI Check'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      </main>

    </div>
  );
};
