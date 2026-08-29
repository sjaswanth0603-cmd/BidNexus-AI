import React, { useState, useEffect } from 'react';
import { Users, Plus, Building } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { vendorService } from '../../services/api';
import type { Vendor } from '../../types';

export const VendorManagementPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const data = await vendorService.listVendors();
      setVendors(data);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    }
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vendorService.createVendor({
        company_name: companyName,
        reg_number: regNumber,
        contact_email: contactEmail,
        phone,
      });
      setShowAddModal(false);
      setCompanyName('');
      setRegNumber('');
      setContactEmail('');
      setPhone('');
      fetchVendors();
    } catch (err) {
      console.error('Failed to add vendor:', err);
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
              <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Vendor Submission Management</h1>
                <p className="text-xs text-slate-600 font-medium">Registered vendor profiles & submitted procurement packages</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register Vendor Profile</span>
            </button>
          </div>

          <div className="apple-card p-7 rounded-3xl space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 uppercase text-[10px] tracking-wider font-bold">
                    <th className="p-3">Vendor / Company Name</th>
                    <th className="p-3">GST / Registration No</th>
                    <th className="p-3">Contact Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 font-medium">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <Building className="w-4 h-4 text-sky-600" />
                        <span>{v.company_name}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-700">{v.reg_number}</td>
                      <td className="p-3 text-slate-700 font-medium">{v.contact_email}</td>
                      <td className="p-3 text-slate-600 font-medium">{v.phone || 'N/A'}</td>
                      <td className="p-3 text-slate-500 font-mono">
                        {new Date(v.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="apple-card p-7 rounded-3xl w-full max-w-md space-y-4 shadow-2xl">
                <h3 className="text-base font-bold text-slate-900">Register Vendor Profile</h3>
                <form onSubmit={handleAddVendor} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="TechCorp Solutions"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Registration / GST Number</label>
                    <input
                      type="text"
                      required
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      placeholder="GST33AAACT1234F1Z1"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="contact@vendor.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold"
                    >
                      Save Vendor Profile
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};
