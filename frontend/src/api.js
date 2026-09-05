import axios from 'axios';

const getJavaApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://bidnexus-ai-backend.onrender.com/api';
  }
  return '/api';
};

export const API_BASE_URL = getJavaApiBase();

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
  createTender: async (tenderData) => {
    const res = await api.post('/tenders', tenderData);
    return res.data;
  },

  // Vendor Endpoints
  submitBid: async (bidData) => {
    const res = await api.post('/bids', bidData);
    return res.data;
  },

  // AI Evaluation Trigger (Calls Python Microservice via Java Backend Orchestration)
  evaluateBid: async (bidId) => {
    const res = await api.post(`/bids/${bidId}/evaluate`);
    return res.data;
  },

  // Evaluator Endpoints
  getBidDetail: async (bidId) => {
    const res = await api.get(`/bids/${bidId}`);
    return res.data;
  },
  submitDecision: async (bidId, status, remarks) => {
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
