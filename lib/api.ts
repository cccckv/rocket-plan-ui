import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (account: string, password: string) =>
    apiClient.post('/api/auth/login', { account, password }),
  
  register: (name: string, email: string, otp: string, password: string) =>
    apiClient.post('/api/auth/register', { name, email, otp, password }),
  
  sendEmailOtp: (email: string, purpose?: 'register' | 'reset') =>
    apiClient.post('/api/auth/send-email-otp', { email, purpose }),
  
  sendPhoneOtp: (phone: string, purpose?: 'login' | 'register' | 'reset') =>
    apiClient.post('/api/auth/send-otp', { phone, purpose }),
  
  registerWithPhone: (phone: string, otp: string, email?: string, password?: string) =>
    apiClient.post('/api/auth/register-phone', { phone, otp, email, password }),
  
  resetPasswordWithEmail: (email: string, otp: string, newPassword: string) =>
    apiClient.post('/api/auth/reset-password-email', { email, otp, newPassword }),
  
  resetPasswordWithPhone: (phone: string, otp: string, newPassword: string) =>
    apiClient.post('/api/auth/reset-password', { phone, otp, newPassword }),
  
  getCurrentUser: () =>
    apiClient.get('/api/auth/me'),
  
  logout: () =>
    apiClient.post('/api/auth/logout'),
  
  refreshToken: (refreshToken: string) =>
    apiClient.post('/api/auth/refresh', { refreshToken }),

  updateProfile: (name: string) =>
    apiClient.patch('/api/auth/profile', { name }),

  bindEmail: (email: string, otp: string) =>
    apiClient.post('/api/auth/bind-email', { email, otp }),

  bindPhone: (phone: string, otp: string) =>
    apiClient.post('/api/auth/bind-phone', { phone, otp }),
};

export const storageApi = {
  uploadFile: (folder: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/api/storage/upload/${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getSignedUrl: (key: string) =>
    apiClient.get(`/api/storage/signed-url/${key}`),
  
  deleteFile: (key: string) =>
    apiClient.delete(`/api/storage/${key}`),
};
