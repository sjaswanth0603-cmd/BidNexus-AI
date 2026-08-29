import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Zap,
  ExternalLink,
  SlidersHorizontal,
  Calendar
} from 'lucide-react';
import { Navbar } from '../components/Navbar';

// GeM Bids Dataset
const gemBids = [
  {
    id: 'GEM/2026/B/7857517',
    numericId: '7857517',
    title: 'Inversion Table for Back pain relief & Medical Fitness Equipment',
    items: 'Inversion Table for Back pain ...',
    quantity: '28',
    department: 'Ministry of Home Affairs\nCentral Armed Police Forces',
    startDate: '30-07-2026 7:47 PM',
    endDate: '29-08-2026 8:00 PM',
    category: 'Product Bid/RAs',
    bidType: 'Product Bid/RAs',
    estimatedValue: '₹ 14,50,000',
    emdRequired: '₹ 29,000',
    status: 'ACTIVE'
  },
  {
    id: 'GEM/2026/B/7888564',
    numericId: '7888564',
    title: 'CUTLERY SET FOR CANTEEN & MESS INFRASTRUCTURE',
    items: 'CUTLERY SET FOR CANTEEN',
    quantity: '1',
    department: 'Ministry of Defence\nDepartment of Defence Production',
    startDate: '07-08-2026 11:31 AM',
    endDate: '29-08-2026 8:00 PM',
    category: 'Product Bid/RAs',
    bidType: 'Product Bid/RAs',
    estimatedValue: '₹ 8,20,000',
    emdRequired: '₹ 16,400',
    status: 'ACTIVE'
  },
  {
    id: 'GEM/2026/B/7893415',
    numericId: '7893415',
    title: 'DESKTOP PC SPECIFICATION AS PER DEFENCE COMPUTING STANDARDS',
    items: 'DESKTOP PC SPECIFICATION AS PE...',
    quantity: '29',
    department: 'Ministry of Defence\nDepartment of Defence Production',
    startDate: '08-08-2026 10:53 AM',
    endDate: '29-08-2026 8:00 PM',
    category: 'BOQ Bids',
    bidType: 'BOQ Bids',
    estimatedValue: '₹ 24,65,000',
    emdRequired: '₹ 49,300',
    status: 'ACTIVE'
  },
  {
    id: 'GEM/2026/B/7823411',
    numericId: '7823411',
    title: 'Plastic Chairs For General Purpose Administrative Canteen & Event Seating',
    items: 'Plastic Chairs For General Pur...',
    quantity: '800',
    department: 'Ministry of Defence\nDepartment of Military Affairs',
    startDate: '08-08-2026 7:18 PM',
    endDate: '29-08-2026 8:00 PM',
    category: 'Product Bid/RAs',
    bidType: 'Product Bid/RAs',
    estimatedValue: '₹ 6,40,000',
    emdRequired: '₹ 12,800',
    status: 'ACTIVE'
  },
  {
    id: 'GEM/2026/B/7895388',
    numericId: '983373',
    title: 'Supply, Installation & Maintenance of High-Performance Enterprise Compute Nodes & SAN Storage Arrays',
    items: 'Enterprise Compute Nodes (32 GB DDR5 RAM, Dual Xeon 32-Core, ISO 9001, OEM MAF)',
    quantity: '32',
    department: 'National Informatics Centre (NIC)\nMinistry of Electronics & IT',
    startDate: '10-08-2026 10:00 AM',
    endDate: '29-08-2026 8:00 PM',
    category: 'Product Custom Bid/RAs',
    bidType: 'Product Custom Bid/RAs',
    estimatedValue: '₹ 1,20,00,000',
    emdRequired: '₹ 2,40,000',
    status: 'ACTIVE'
  }
];

export const GemPortalPage: React.FC = () => {
  const [selectedBidType, setSelectedBidType] = useState<string>('All Bid/RAs');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [searchContains, setSearchContains] = useState<string>('Contains');
  const [sortBy, setSortBy] = useState<string>('Bid End Date: Oldest First');
  const [ongoingOnly, setOngoingOnly] = useState<boolean>(true);

  const navigate = useNavigate();

  const handleVerifyTender = (e: React.MouseEvent, numericId: string) => {
    e.preventDefault();
    navigate(`/test-page?tenderId=${numericId}`);
  };

  const filteredBids = gemBids.filter((bid) => {
    const matchesType = selectedBidType === 'All Bid/RAs' || bid.bidType === selectedBidType;
    const matchesSearch =
      bid.id.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      bid.items.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      bid.department.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased">
      
      {/* Navbar Header */}
      <Navbar />

      {/* Page Title & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Bid Listing</h1>
            <a href="#advance" className="text-xs text-slate-600 hover:text-slate-900 font-medium underline flex items-center gap-0.5">
              <span>Advance Search</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
              <select
                value={searchContains}
                onChange={(e) => setSearchContains(e.target.value)}
                className="bg-slate-50 px-3 py-2 text-xs text-slate-700 font-medium border-r border-slate-300 focus:outline-none"
              >
                <option value="Contains">Contains</option>
                <option value="Exact">Exact Match</option>
              </select>

              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Enter Keyword"
                className="px-3.5 py-2 text-xs text-slate-900 focus:outline-none w-48 sm:w-64"
              />

              <button
                type="button"
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 font-medium flex items-center justify-center transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Notice Alert Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 font-normal">
          Notice: Newly published bids or modifications take up to 15 minutes to reflect in search results.
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Filters Sidebar */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                Filters
              </span>
              <button
                onClick={() => {
                  setSelectedBidType('All Bid/RAs');
                  setSearchKeyword('');
                  setOngoingOnly(true);
                }}
                className="text-xs text-slate-600 hover:text-slate-900 font-medium underline"
              >
                Reset
              </button>
            </div>

            <div className="space-y-2 text-xs border-b border-slate-200 pb-3">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={ongoingOnly}
                  onChange={(e) => setOngoingOnly(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span>Ongoing Bids/RA</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-normal">
                <input type="checkbox" className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                <span>Bid/RA Status</span>
              </label>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="font-semibold text-slate-700 block mb-1 uppercase tracking-wider text-[10px]">
                By Bid Type:
              </span>

              {[
                'All Bid/RAs',
                'Product Bid/RAs',
                'Service Bid/RAs',
                'Bid To RAs',
                'Product Custom Bid/RAs',
                'BOQ Bids',
                'Rate Contract Bids',
                'Global Tender',
                'Limited Tender',
                'Single Tender'
              ].map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-2 cursor-pointer text-xs transition-colors py-0.5 ${
                    selectedBidType === type ? 'font-semibold text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="bidType"
                    checked={selectedBidType === type}
                    onChange={() => setSelectedBidType(type)}
                    className="border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>

            <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
              <div>
                <label className="block text-slate-800 font-medium mb-1">Bid End Date (From):</label>
                <div className="flex items-center bg-slate-50 border border-slate-300 rounded p-1.5">
                  <input type="text" placeholder="DD/MM/YYYY" className="w-full bg-transparent text-xs focus:outline-none" />
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              </div>
              <div>
                <label className="block text-slate-800 font-medium mb-1">Bid End Date (To):</label>
                <div className="flex items-center bg-slate-50 border border-slate-300 rounded p-1.5">
                  <input type="text" placeholder="DD/MM/YYYY" className="w-full bg-transparent text-xs focus:outline-none" />
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* Right Main Content Feed */}
        <section className="lg:col-span-9 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-white p-3 border border-slate-200 rounded-xl">
            <span className="font-semibold text-slate-800">
              Showing 1 - {filteredBids.length} records of 42853 records
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-normal">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs font-medium text-slate-900 focus:outline-none"
              >
                <option value="Bid End Date: Oldest First">Bid End Date: Oldest First</option>
                <option value="Bid End Date: Newest First">Bid End Date: Newest First</option>
                <option value="Value: High to Low">Value: High to Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredBids.map((bid) => (
              <div
                key={bid.id}
                className="bg-white border border-slate-200 border-t-2 border-t-amber-500 rounded-xl p-5 space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <span className="font-bold text-slate-900 text-sm">
                    BID NO: <span className="font-mono text-slate-800">{bid.id}</span>
                  </span>

                  <a href="#corrigendum" className="text-xs text-slate-600 hover:text-slate-900 font-medium underline">
                    View Corrigendum / Representation
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                  <div className="md:col-span-4 space-y-1">
                    <span className="text-slate-500 font-medium block">Items: <span className="font-semibold text-slate-900">{bid.items}</span></span>
                    <span className="text-slate-500 font-medium block">Quantity: <span className="font-semibold text-slate-900">{bid.quantity}</span></span>
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <span className="text-slate-500 font-medium block">Department Name And Address:</span>
                    <p className="font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                      {bid.department}
                    </p>
                  </div>

                  <div className="md:col-span-4 space-y-1 text-right md:border-l border-slate-100 md:pl-4">
                    <div>
                      <span className="text-slate-500 font-medium text-xs">Start Date: </span>
                      <strong className="text-slate-900 font-semibold text-xs">{bid.startDate}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium text-xs">End Date: </span>
                      <strong className="text-slate-900 font-semibold text-xs">{bid.endDate}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 font-medium">
                    <span className="text-slate-600">
                      Est. Value: <strong className="text-slate-900 font-bold">{bid.estimatedValue}</strong>
                    </span>
                    <span className="text-slate-600">
                      EMD: <strong className="text-slate-900 font-semibold">{bid.emdRequired}</strong>
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleVerifyTender(e, bid.numericId)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Verify with BidNexus AI</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </section>

      </main>

    </div>
  );
};

export default GemPortalPage;
