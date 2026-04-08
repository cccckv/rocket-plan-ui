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

export interface CreateImageRequest {
  model: string;
  prompt: string;
  n?: number;
  size?: string;
  quality?: string;
  style?: string;
  referenceImages?: string[];
}

export interface ImageGenerationResult {
  success: boolean;
  model: string;
  imageBase64: string;
  creditCost: number;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function generateImage(data: CreateImageRequest): Promise<ImageGenerationResult> {
  const response = await api.post('/api/images/generate', data);
  return response.data;
}

export const IMAGE_MODELS = {
  GEMINI: [
    { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash', cost: 0.05 },
    { id: 'gemini-2.5-flash-image-preview', name: 'Gemini 2.5 Flash Preview', cost: 0.05 },
    { id: 'gemini-3.1-flash-image-preview', name: 'Gemini 3.1 Flash Preview', cost: 0.08 },
    { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro Preview', cost: 0.15 },
  ],
  FLUX: [
    { id: 'flux-schnell', name: 'Flux Schnell (Fast)', cost: 0.03 },
    { id: 'flux-dev', name: 'Flux Dev', cost: 0.10 },
    { id: 'flux-pro', name: 'Flux Pro', cost: 0.25 },
    { id: 'flux-1.1-pro', name: 'Flux 1.1 Pro', cost: 0.30 },
    { id: 'flux-2-pro', name: 'Flux 2 Pro', cost: 0.40 },
    { id: 'flux-pro-max', name: 'Flux Pro Max', cost: 0.50 },
  ],
};

export const IMAGE_SIZES = [
  { value: '256x256', label: '256x256 (Square)' },
  { value: '512x512', label: '512x512 (Square)' },
  { value: '1024x1024', label: '1024x1024 (Square)' },
  { value: '1792x1024', label: '1792x1024 (Landscape)' },
  { value: '1024x1792', label: '1024x1792 (Portrait)' },
];

export const IMAGE_QUALITIES = [
  { value: 'standard', label: 'Standard' },
  { value: 'hd', label: 'HD (Higher Quality)' },
];

export const IMAGE_STYLES = [
  { value: 'vivid', label: 'Vivid (More Creative)' },
  { value: 'natural', label: 'Natural (More Realistic)' },
];
