import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
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
  aspectRatio?: string;
  resolution?: string;
  quality?: string;
  style?: string;
  referenceImages?: string[];
}

export interface ImageTaskResponse {
  id: string;
  userId: number;
  model: string;
  prompt: string;
  aspectRatio?: string;
  resolution?: string;
  quality?: string;
  style?: string;
  status: 'pending' | 'queued' | 'generating' | 'completed' | 'failed';
  resultUrl?: string;
  localPath?: string;
  creditCost?: number;
  metadata?: any;
  errorMsg?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageGenerationResult {
  success: boolean;
  model: string;
  imageUrl: string;
  creditCost: number;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function createImageTask(data: CreateImageRequest): Promise<{ taskId: string }> {
  const response = await api.post('/api/images/generate', data);
  return response.data;
}

export async function pollImageTask(taskId: string): Promise<ImageTaskResponse> {
  const response = await api.get(`/api/images/tasks/${taskId}`);
  return response.data;
}

export async function generateImageWithPolling(
  data: CreateImageRequest,
  onProgress?: (task: ImageTaskResponse) => void,
  pollIntervalMs: number = 10000,
): Promise<ImageGenerationResult> {
  const { taskId } = await createImageTask(data);

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const task = await pollImageTask(taskId);

        if (onProgress) {
          onProgress(task);
        }

        if (task.status === 'completed') {
          resolve({
            success: true,
            model: task.model,
            imageUrl: task.resultUrl || '',
            creditCost: task.creditCost || 0,
          });
        } else if (task.status === 'failed') {
          reject(new Error(task.errorMsg || 'Image generation failed'));
        } else {
          setTimeout(poll, pollIntervalMs);
        }
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}

export interface ImageModelConfig {
  id: string;
  name: string;
  cost: number;
  supportedResolutions: { value: string; label: string }[];
  supportedAspectRatios: { value: string; label: string; icon: string }[];
}

export const IMAGE_MODELS: ImageModelConfig[] = [
  {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash',
    cost: 0.05,
    supportedResolutions: [
      { value: '1K', label: '1K (Standard)' },
    ],
    supportedAspectRatios: [
      { value: '1:1', label: 'Square', icon: '▢' },
      { value: '16:9', label: 'Wide', icon: '▬' },
      { value: '9:16', label: 'Tall', icon: '▮' },
    ],
  },
  {
    id: 'gemini-2.5-flash-image-preview',
    name: 'Gemini 2.5 Flash Preview',
    cost: 0.05,
    supportedResolutions: [
      { value: '1K', label: '1K (Standard)' },
    ],
    supportedAspectRatios: [
      { value: '1:1', label: 'Square', icon: '▢' },
      { value: '16:9', label: 'Wide', icon: '▬' },
      { value: '9:16', label: 'Tall', icon: '▮' },
    ],
  },
  {
    id: 'gemini-3.1-flash-image-preview',
    name: 'Gemini 3.1 Flash Preview',
    cost: 0.08,
    supportedResolutions: [
      { value: '1K', label: '1K (Standard)' },
      { value: '2K', label: '2K (HD)' },
    ],
    supportedAspectRatios: [
      { value: '1:1', label: 'Square', icon: '▢' },
      { value: '16:9', label: 'Wide', icon: '▬' },
      { value: '9:16', label: 'Tall', icon: '▮' },
    ],
  },
  {
    id: 'gemini-3-pro-image-preview',
    name: 'Gemini 3 Pro Preview',
    cost: 0.15,
    supportedResolutions: [
      { value: '1K', label: '1K (Standard)' },
      { value: '2K', label: '2K (HD)' },
    ],
    supportedAspectRatios: [
      { value: '1:1', label: 'Square', icon: '▢' },
      { value: '16:9', label: 'Wide', icon: '▬' },
      { value: '9:16', label: 'Tall', icon: '▮' },
    ],
  },
];



export const IMAGE_QUALITIES = [
  { value: 'standard', label: 'Standard' },
  { value: 'hd', label: 'HD (Higher Quality)' },
];

export const IMAGE_STYLES = [
  { value: 'vivid', label: 'Vivid (More Creative)' },
  { value: 'natural', label: 'Natural (More Realistic)' },
];
