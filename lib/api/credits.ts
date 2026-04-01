import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

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
  const response = await api.get('/credits/balance');
  return response.data;
}

export async function getTransactions(
  limit: number = 20,
  offset: number = 0
): Promise<CreditHistoryResponse> {
  const response = await api.get('/credits/transactions', {
    params: { limit, offset },
  });
  return response.data;
}

export async function getCreditCosts(): Promise<CreditCostsResponse> {
  const response = await api.get('/credits/costs');
  return response.data;
}

export const DEFAULT_CREDIT_COSTS: Record<string, number> = {
  'veo3.1-fast-components': 0.26,
  'veo_3_1-fast-components': 0.26,
  'veo_3_1-fast': 0.52,
  'veo_3_1-fast-4K': 0.78,
  'veo3.1-fast': 0.52,
  'veo3-fast': 0.52,
  'veo3.1': 1.04,
  'veo_3_1': 1.04,
  'veo3.1-components': 0.78,
  'veo_3_1-components': 0.78,
  'veo3': 1.04,
  'veo_3_1-4K': 1.56,
  'veo_3_1-components-4K': 1.56,
  'veo_3_1-fast-components-4K': 1.04,
  'veo3.1-4k': 1.56,
  'veo3.1-components-4k': 1.56,
  'veo3-fast-frames': 2.08,
  'veo3-frames': 2.60,
  'veo3-pro-frames': 3.64,
  'veo3.1-pro': 5.20,
  'veo3.1-pro-4k': 7.80,
};
