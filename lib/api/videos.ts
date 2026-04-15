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

export interface CreateVideoTaskRequest {
  type: 'text-to-video' | 'image-to-video' | 'video-to-video';
  model: string;
  prompt: string;
  imageUrl?: string;
  videoUrl?: string;
  duration?: number;
  aspectRatio?: string;
  resolution?: string;
  negativePrompt?: string;
  seed?: number;
  enhancePrompt?: boolean;
  generateAudio?: boolean;
}

export interface VideoTask {
  id: string;
  userId: number;
  type: string;
  model: string;
  prompt: string;
  imageUrl?: string;
  videoUrl?: string;
  status: 'pending' | 'queued' | 'generating' | 'completed' | 'failed';
  resultUrl?: string;
  localPath?: string;
  duration?: number;
  errorMsg?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoTaskListResponse {
  tasks: VideoTask[];
  total: number;
  limit: number;
  offset: number;
}

export async function createVideoTask(data: CreateVideoTaskRequest): Promise<VideoTask> {
  const response = await api.post('/api/videos/generate', data);
  return response.data;
}

export async function pollTaskStatus(taskId: string): Promise<VideoTask> {
  const response = await api.post(`/api/videos/tasks/${taskId}/poll`);
  return response.data;
}

export async function getTaskById(taskId: string): Promise<VideoTask> {
  const response = await api.get(`/api/videos/tasks/${taskId}`);
  return response.data;
}

export async function getTasks(limit: number = 20, offset: number = 0): Promise<VideoTaskListResponse> {
  const response = await api.get('/api/videos/tasks', {
    params: { limit, offset },
  });
  return response.data;
}

export async function deleteTask(taskId: string): Promise<{ success: boolean }> {
  const response = await api.delete(`/api/videos/tasks/${taskId}`);
  return response.data;
}
