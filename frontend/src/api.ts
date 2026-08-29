import axios from 'axios';

// Java Backend REST API Base URL
export const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const javaApiService = {
  // Government Endpoints
  getTenders: async () => {
    const res = await api.get('/tenders');
    return res.data;
  },
  createTender: async (tenderData: any) => {
    const res = await api.post('/tenders', tenderData);
    return res.data;
  },

  // Vendor Endpoints
  submitBid: async (bidData: any) => {
    const res = await api.post('/bids', bidData);
    return res.data;
  },

  // AI Evaluation Trigger (Calls Python Microservice via Java Backend Orchestration)
  evaluateBid: async (bidId: string) => {
    const res = await api.post(`/bids/${bidId}/evaluate`);
    return res.data;
  },

  // Evaluator Endpoints
  getBidDetail: async (bidId: string) => {
    const res = await api.get(`/bids/${bidId}`);
    return res.data;
  },
  submitDecision: async (bidId: string, status: string, remarks: string) => {
    const res = await api.post(`/bids/${bidId}/decision`, { status, remarks });
    return res.data;
  },

  // Mock Government Verification Data Lookup
  getGovtRecords: async () => {
    const res = await api.get('/govt-records');
    return res.data;
  },
};

export default api;
