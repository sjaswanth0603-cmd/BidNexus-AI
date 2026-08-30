import axios from 'axios';
import type { User, Bid, Requirement, Vendor, Submission, AuditLog } from '../types';

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    const base = import.meta.env.VITE_API_URL.replace(/\/$/, '');
    return base.endsWith('/api/v1') ? base : `${base}/api/v1`;
  }
  return '/api/v1';
};

const API_BASE = getApiBase();

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 405 || error.response.status === 404)) {
      console.warn(`[API] Intercepted HTTP ${error.response.status} on ${error.config?.url}. Suppressing error.`);
      return Promise.resolve({ data: [] });
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData: any) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (data: any) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data as User;
  },
};

export const bidService = {
  listBids: async () => {
    const res = await api.get('/bids');
    return res.data as Bid[];
  },
  getBidDetail: async (id: string) => {
    const bId = cleanParam(id);
    const res = await api.get(`/bids/${bId}`);
    return res.data as Bid & { requirements: Requirement[] };
  },
  createBid: async (data: any) => {
    const res = await api.post('/bids', data);
    return res.data as Bid;
  },
  uploadBidDocument: async (bidId: string, file: File) => {
    const bId = cleanParam(bidId);
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/bids/${bId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  extractRequirements: async (bidId: string) => {
    const bId = cleanParam(bidId);
    const res = await api.post(`/bids/${bId}/extract-requirements`);
    return Array.isArray(res.data) ? (res.data as Requirement[]) : [];
  },
  listRequirements: async (bidId: string) => {
    const bId = cleanParam(bidId);
    const res = await api.get(`/bids/${bId}/requirements`);
    return Array.isArray(res.data) ? (res.data as Requirement[]) : [];
  },
  addRequirement: async (bidId: string, reqData: any) => {
    const bId = cleanParam(bidId);
    const res = await api.post(`/bids/${bId}/requirements`, reqData);
    return res.data as Requirement;
  },
  updateRequirement: async (bidId: string, reqId: string, reqData: any) => {
    const bId = cleanParam(bidId);
    const rId = encodeURIComponent(reqId);
    const res = await api.put(`/bids/${bId}/requirements/${rId}`, reqData);
    return res.data as Requirement;
  },
  deleteRequirement: async (bidId: string, reqId: string) => {
    const bId = cleanParam(bidId);
    const rId = encodeURIComponent(reqId);
    const res = await api.delete(`/bids/${bId}/requirements/${rId}`);
    return res.data;
  },
};

export const vendorService = {
  listVendors: async () => {
    const res = await api.get('/vendors');
    if (Array.isArray(res.data)) return res.data as Vendor[];
    if (res.data && Array.isArray(res.data.vendors)) return res.data.vendors as Vendor[];
    return [] as Vendor[];
  },
  createVendor: async (data: any) => {
    const res = await api.post('/vendors', data);
    return res.data as Vendor;
  },
  uploadVendorDocuments: async (vendorId: string, bidId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await api.post(`/vendors/${vendorId}/submissions/${bidId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getBlacklist: async () => {
    const res = await api.get('/vendors/blacklist/all');
    return res.data;
  },
  blacklistVendor: async (vendorId: string, reason: string) => {
    const res = await api.post(`/vendors/${vendorId}/blacklist?reason=${encodeURIComponent(reason)}`);
    return res.data;
  },
  removeFromBlacklist: async (vendorId: string) => {
    const res = await api.delete(`/vendors/${vendorId}/blacklist`);
    return res.data;
  },
  getSubmissionDetail: async (submissionId: string) => {
    const res = await api.get(`/vendors/submissions/${submissionId}`);
    return res.data as Submission;
  },
  getGovtAdapterStatus: async () => {
    const res = await api.get('/vendors/govt-adapters/status');
    return res.data;
  },
  getVendorRiskRadar: async (vendorId: string) => {
    const res = await api.get(`/vendors/${vendorId}/risk-radar`);
    return res.data;
  },
};

const cleanParam = (p: string) => encodeURIComponent(p.replace(/^(APEP[\/-]2026[\/-]WRD[\/-]|GEM[\/-]2026[\/-]B[\/-])/i, '').trim());

export const complianceService = {
  runVerification: async (bidId: string, vendorId: string) => {
    const bId = cleanParam(bidId);
    const vId = encodeURIComponent(vendorId);
    const res = await api.post(`/compliance/${bId}/${vId}/verify`);
    return res.data;
  },
  getResults: async (bidId: string, vendorId: string) => {
    const bId = cleanParam(bidId);
    const vId = encodeURIComponent(vendorId);
    const res = await api.get(`/compliance/${bId}/${vId}`);
    return res.data as Submission;
  },
  compareVendors: async (bidId: string) => {
    const bId = cleanParam(bidId);
    const res = await api.get(`/compliance/${bId}/compare`);
    return res.data;
  },
  overrideResult: async (reviewData: { result_id: string; final_status: string; reason: string }) => {
    const res = await api.post('/reviews', reviewData);
    return res.data;
  },
  submitToEvaluator: async (submissionId: string) => {
    const sId = encodeURIComponent(submissionId);
    const res = await api.post(`/compliance/submissions/${sId}/submit`);
    return res.data;
  },
};

export const assistantService = {
  queryAssistant: async (queryData: { bid_id: string; vendor_id?: string; question: string }) => {
    const res = await api.post('/assistant/query', queryData);
    return res.data;
  },
  getAiStatus: async () => {
    const res = await api.get('/assistant/status');
    return res.data;
  },
  configureApiKey: async (openai_api_key: string) => {
    const res = await api.post('/assistant/config-key', { openai_api_key });
    return res.data;
  },
};

export const auditService = {
  getAuditLogs: async () => {
    const res = await api.get('/audit-logs');
    return res.data as AuditLog[];
  },
};

export default api;
