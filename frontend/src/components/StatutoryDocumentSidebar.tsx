import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Upload,
  CheckCircle2,
  X,
  CreditCard,
  Building2,
  Award,
  Lock,
  Fingerprint,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface StatutoryDocItem {
  id: string;
  name: string;
  code: string;
  icon: React.ElementType;
  description: string;
  status: 'VERIFIED' | 'PENDING' | 'MISSING' | 'REJECTED';
  fileName?: string;
  verificationSource: string;
  issueDate?: string;
  expiryDate?: string;
}

const initialStatutoryDocs: StatutoryDocItem[] = [
  {
    id: 'doc-aadhaar',
    name: 'Aadhaar Verification (Authorized Signatory)',
    code: 'AADHAAR',
    icon: Fingerprint,
    description: 'UIDAI e-Aadhaar identity verification of primary bidder authorized signatory.',
    status: 'VERIFIED',
    fileName: 'Authorized_Signatory_Aadhaar_Verified.pdf',
    verificationSource: 'DigiLocker / UIDAI Vault',
    issueDate: '2022-04-12',
    expiryDate: 'Lifetime'
  },
  {
    id: 'doc-gst',
    name: 'GST Registration & GSTR-3B Return Filing',
    code: 'GSTN',
    icon: Building2,
    description: 'AP GSTIN Certificate & last 12 months GSTR-3B monthly return filing receipt.',
    status: 'VERIFIED',
    fileName: 'AP_GSTIN_37AAACT9876F1Z8_GSTR3B.pdf',
    verificationSource: 'GSTN API Gateway',
    issueDate: '2017-07-01',
    expiryDate: 'Active (Filing Regular)'
  },
  {
    id: 'doc-pan',
    name: 'PAN Card & Income Tax Compliance',
    code: 'PAN_INCOMETAX',
    icon: CreditCard,
    description: 'Permanent Account Number (PAN) & Audited ITR-V filing acknowledgements for last 3 years.',
    status: 'VERIFIED',
    fileName: 'Corporate_PAN_ITR_Returns_3Years.pdf',
    verificationSource: 'Income Tax e-Filing Portal',
    issueDate: '2015-02-18',
    expiryDate: 'Active'
  },
  {
    id: 'doc-udyam',
    name: 'Udyam / MSME Registration Certificate',
    code: 'UDYAM',
    icon: Award,
    description: 'Ministry of MSME Udyam Registration Certificate for EMD waiver & tender fee exemption.',
    status: 'VERIFIED',
    fileName: 'Udyam_MSME_Registration_AP.pdf',
    verificationSource: 'Udyam Portal API',
    issueDate: '2021-08-10',
    expiryDate: 'Valid'
  },
  {
    id: 'doc-mii',
    name: 'Make in India (MII) Local Content Declaration',
    code: 'MAKE_IN_INDIA',
    icon: ShieldCheck,
    description: 'Class-I Local Content Declaration (>=50% Local Content) signed by Statutory Auditor.',
    status: 'VERIFIED',
    fileName: 'Make_In_India_Class1_Auditor_Certificate.pdf',
    verificationSource: 'DPIIT Self-Declaration',
    issueDate: '2026-01-15',
    expiryDate: '2026-12-31'
  },
  {
    id: 'doc-epfo',
    name: 'EPFO & ESIC Statutory Compliance Certificate',
    code: 'EPFO_ESIC',
    icon: FileText,
    description: 'EPF Establishment Code registration & monthly ECR contribution payment receipts.',
    status: 'VERIFIED',
    fileName: 'EPFO_ESIC_ECR_Challan_Receipts.pdf',
    verificationSource: 'EPFO Gateway',
    issueDate: '2026-02-01',
    expiryDate: 'Monthly Validated'
  },
  {
    id: 'doc-oem',
    name: 'OEM Manufacturer Authorization Form (MAF)',
    code: 'OEM_MAF',
    icon: Lock,
    description: 'Original OEM Authorization Letter directly from server & SCADA equipment manufacturer.',
    status: 'VERIFIED',
    fileName: 'OEM_MAF_Server_SCADA_Authorization.pdf',
    verificationSource: 'OEM Direct Gateway',
    issueDate: '2026-02-10',
    expiryDate: 'Tender Specific'
  },
  {
    id: 'doc-digilocker',
    name: 'DigiLocker Verified Vault Certificates',
    code: 'DIGILOCKER',
    icon: ExternalLink,
    description: 'Cryptographically signed DigiLocker certificates with SHA-256 tamper-proof hash.',
    status: 'VERIFIED',
    fileName: 'DigiLocker_Verified_Document_Vault.pdf',
    verificationSource: 'DigiLocker National Vault',
    issueDate: '2026-02-15',
    expiryDate: 'Cryptographically Signed'
  }
];

interface StatutoryDocumentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatutoryDocumentSidebar: React.FC<StatutoryDocumentSidebarProps> = ({ isOpen, onClose }) => {
  const [docs, setDocs] = useState<StatutoryDocItem[]>(initialStatutoryDocs);
  const [selectedDoc, setSelectedDoc] = useState<StatutoryDocItem | null>(initialStatutoryDocs[0]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatedUpload = (docId: string, file: File) => {
    setIsUploading(true);
    setTimeout(() => {
      setDocs((prev) =>
        prev.map((item) =>
          item.id === docId
            ? { ...item, status: 'VERIFIED', fileName: file.name }
            : item
        )
      );
      setIsUploading(false);
      setUploadSuccess(`Successfully uploaded and verified ${file.name}`);
      setTimeout(() => setUploadSuccess(null), 3000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 border-l border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Statutory & Verification Documents</h2>
              <p className="text-xs text-slate-300 font-normal">Aadhaar, GSTN, PAN, Udyam, MII & EPFO Verification Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Success Alert */}
        {uploadSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3 px-5 text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* Content Split Pane */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Document Type Selector List (Left 5 cols) */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">
              Required Statutory Proofs ({docs.length})
            </span>

            {docs.map((doc) => {
              const IconComp = doc.icon;
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-white border-slate-900 shadow-sm ring-1 ring-slate-900'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate block text-[11px]">
                        {doc.code}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                        {doc.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1 font-normal">
                      {doc.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Document Details & Upload Panel (Right 7 cols) */}
          <div className="md:col-span-7 overflow-y-auto p-5 space-y-5 bg-white">
            {selectedDoc ? (
              <div className="space-y-5 text-xs">
                
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <span className="bg-slate-100 text-slate-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-slate-200">
                      DOCUMENT CODE: {selectedDoc.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{selectedDoc.name}</h3>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-extrabold shrink-0">
                    VERIFIED ACTIVE
                  </span>
                </div>

                <p className="text-slate-600 font-normal leading-relaxed text-xs">
                  {selectedDoc.description}
                </p>

                {/* Metadata Summary */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Verification Gateway:</span>
                    <span className="font-bold text-slate-900">{selectedDoc.verificationSource}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Current File Name:</span>
                    <span className="font-mono text-slate-800 truncate max-w-[180px] font-semibold">{selectedDoc.fileName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Issue / Filing Date:</span>
                    <span className="font-semibold text-slate-900">{selectedDoc.issueDate}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Validity / Expiry:</span>
                    <span className="font-bold text-emerald-700">{selectedDoc.expiryDate}</span>
                  </div>
                </div>

                {/* Upload & Re-Verify Action Area */}
                <div className="space-y-3 pt-2">
                  <span className="font-bold text-slate-900 block text-xs">
                    Update / Upload New {selectedDoc.code} Certificate
                  </span>

                  <label className="border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-xl p-5 text-center cursor-pointer transition-colors block bg-slate-50 hover:bg-white">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleSimulatedUpload(selectedDoc.id, e.target.files[0]);
                        }
                      }}
                    />
                    <div className="space-y-2">
                      <div className="mx-auto w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                        {isUploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          {isUploading ? 'Verifying with Government Portal...' : 'Click to Upload PDF or Image'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal block">
                          PDF, PNG or JPG up to 10 MB (DigiLocker / GSTN signed)
                        </span>
                      </div>
                    </div>
                  </label>
                </div>

              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">Select a statutory document from the left list.</div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-normal">
            8 of 8 Statutory Registrations Verified & Compliant
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
};
