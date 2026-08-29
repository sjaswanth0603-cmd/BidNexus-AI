import axios from 'axios';
import type { User, Bid, Requirement, Vendor, Submission, AuditLog } from '../types';

const API_BASE = '/api/v1';

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
    const res = await api.get(`/bids/${id}`);
    return res.data as Bid & { requirements: Requirement[] };
  },
  createBid: async (data: any) => {
    const res = await api.post('/bids', data);
    return res.data as Bid;
  },
  uploadBidDocument: async (bidId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/bids/${bidId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  extractRequirements: async (bidId: string) => {
    const res = await api.post(`/bids/${bidId}/extract-requirements`);
    return res.data as Requirement[];
  },
  listRequirements: async (bidId: string) => {
    const res = await api.get(`/bids/${bidId}/requirements`);
    return res.data as Requirement[];
  },
  addRequirement: async (bidId: string, reqData: any) => {
    const res = await api.post(`/bids/${bidId}/requirements`, reqData);
    return res.data as Requirement;
  },
  updateRequirement: async (bidId: string, reqId: string, reqData: any) => {
    const res = await api.put(`/bids/${bidId}/requirements/${reqId}`, reqData);
    return res.data as Requirement;
  },
  deleteRequirement: async (bidId: string, reqId: string) => {
    const res = await api.delete(`/bids/${bidId}/requirements/${reqId}`);
    return res.data;
  },
};

export const vendorService = {
  listVendors: async () => {
    const res = await api.get('/vendors');
    return res.data as Vendor[];
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

export const complianceService = {
  runVerification: async (bidId: string, vendorId: string) => {
    const res = await api.post(`/compliance/${bidId}/${vendorId}/verify`);
    return res.data;
  },
  getResults: async (bidId: string, vendorId: string) => {
    const res = await api.get(`/compliance/${bidId}/${vendorId}`);
    return res.data as Submission;
  },
  compareVendors: async (bidId: string) => {
    const res = await api.get(`/compliance/${bidId}/compare`);
    return res.data;
  },
  overrideResult: async (reviewData: { result_id: string; final_status: string; reason: string }) => {
    const res = await api.post('/reviews', reviewData);
    return res.data;
  },
  submitToEvaluator: async (submissionId: string) => {
    const res = await api.post(`/compliance/submissions/${submissionId}/submit`);
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
