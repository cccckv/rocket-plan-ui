import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface CreditBalance {
  credits: number;
  tier: string;
}

export interface CreditTransaction {
  id: number;
  userId: number;
  amount: number;
  type: string;
  videoId?: number | null;
  createdAt: string;
}

export interface CreditHistoryResponse {
  transactions: CreditTransaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreditCost {
  model: string;
  cost: number;
}

export interface CreditCostsResponse {
  costs: CreditCost[];
}

export async function getBalance(): Promise<CreditBalance> {
  const response = await api.get('/api/credits/balance');
  return response.data;
}

export async function getTransactions(
  limit: number = 20,
  offset: number = 0
): Promise<CreditHistoryResponse> {
  const response = await api.get('/api/credits/transactions', {
    params: { limit, offset },
  });
  return response.data;
}

export async function getCreditCosts(): Promise<CreditCostsResponse> {
  const response = await api.get('/api/credits/costs');
  return response.data;
}

export const DEFAULT_CREDIT_COSTS: Record<string, number> = {
  // Models with both start and end frame control (首尾帧)
  'veo3.1': 0.70,
  'veo3.1-fast': 0.70,
  'veo3.1-pro': 3.50,
  'veo3.1-pro-4k': 3.50,
  
  // Models with start frame only (首帧)
  'veo3.1-components-4k': 1.00,
  'veo3-pro-frames': 4.00,
  'veo3-fast-frames': 0.90,
  'veo3-frames': 0.90,
  
  // Models without frame control
  'veo3.1-4k': 1.00,
  'veo3.1-components': 0.70,
  'veo3.1-fast-components': 0.26,
  'veo3': 0.90,
  'veo3-fast': 0.90,
  'veo3-pro': 4.00,
};
