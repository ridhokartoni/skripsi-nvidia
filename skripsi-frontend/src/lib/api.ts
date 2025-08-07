import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // Only logout if we're not already on the login page and the error message indicates token issue
      const errorMessage = error.response?.data?.message || '';
      const isTokenError = errorMessage.includes('token') || errorMessage.includes('Token') || 
                           errorMessage.includes('expired') || errorMessage.includes('Expired');
      
      if (isTokenError) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('login')) {
          toast.error('Session expired. Please login again.');
          window.location.href = '/login';
        }
      } else {
        // For other 401 errors, just show the message without logging out
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        }
      }
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  adminLogin: (credentials: { email: string; password: string }) =>
    api.post('/auth/admin/login', credentials),
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refreshToken', { refreshToken }),
};

// User API calls
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  getAllUsers: () => api.get('/users'),
  updateUser: (id: number, data: any) => api.patch(`/users/${id}`, data),
  updateProfile: (data: any) => api.put('/users/profile', data),
  updateProfileById: (id: number, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
};

// Container API calls
export const containerApi = {
  createContainer: (data: any) =>
    api.post('/docker/createContainer', data),
  
  getMyContainers: () =>
    api.get('/docker/mycontainer'),
  
  getAllContainers: () =>
    api.get('/docker/allcontainer'),
  
  getContainer: (name: string) =>
    api.get(`/docker/container/${name}`),
  
  getContainerStats: (name: string) =>
    api.get(`/docker/container/${name}/stats`),
  
  getContainerLogs: (name: string) =>
    api.get(`/docker/container/${name}/log`),
  
  resetContainer: (name: string) =>
    api.post(`/docker/container/${name}/reset`),
  
  restartContainer: (name: string) =>
    api.post(`/docker/container/${name}/restart`),
  
  stopContainer: (name: string) =>
    api.post(`/docker/container/${name}/stop`),
  
  startContainer: (name: string) =>
    api.post(`/docker/container/${name}/start`),
  
  deleteContainer: (name: string) =>
    api.delete(`/docker/container/${name}`),
  
  changePassword: (name: string, password: string) =>
    api.post(`/docker/container/${name}/changePassword`, { password }),
  
  getJupyterLink: (name: string) =>
    api.get(`/docker/container/${name}/jupyterlink`),
  
  searchImages: (imageName: string) =>
    api.get(`/docker/search/${imageName}`),
};

// Payment API calls
export const paymentApi = {
  createPayment: (data: any) =>
    api.post('/payment', data),
  
  getMyPayments: () =>
    api.get('/payment/mypayments'),
  
  getAllPayments: () =>
    api.get('/payment'),
  
  updatePaymentStatus: (id: number, status: number) =>
    api.patch(`/payment/${id}`, { status }),
  
  confirmPayment: (id: number) =>
    api.patch(`/payment/${id}`, { status: 1 }),
  
  rejectPayment: (id: number, rejectionReason?: string) =>
    api.patch(`/payment/${id}`, { 
      status: 2, 
      rejectionReason: rejectionReason || 'Payment verification failed' 
    }),
  
  deletePayment: (id: number) =>
    api.delete(`/payment/${id}`),
};

// Paket API calls
export const paketApi = {
  getAllPakets: () =>
    api.get('/paket'),
  
  createPaket: (data: any) =>
    api.post('/paket', data),
  
  updatePaket: (id: number, data: any) =>
    api.patch(`/paket/${id}`, data),
  
  deletePaket: (id: number) =>
    api.delete(`/paket/${id}`),
  
  generatePrice: (id: number) =>
    api.get(`/paket/generate-harga/${id}`),
};

// Ticket API calls
export const ticketApi = {
  createTicket: (containerName: string, data: { deskripsi: string }) =>
    api.post(`/tiket/${containerName}`, data),
  
  getMyTickets: () =>
    api.get('/tiket'),
  
  getAllTickets: (status?: string) =>
    api.get('/tiket/all', status ? { params: { status } } : undefined),
  
  updateTicketStatus: (id: number, status: string) =>
    api.patch(`/tiket/${id}`, { status }),
  
  deleteTicket: (id: number) =>
    api.delete(`/tiket/${id}`),
};

// Legacy tiket API (for backward compatibility)
export const tiketApi = ticketApi;

// GPU API calls
export const gpuApi = {
  getAllGPUs: () =>
    api.get('/gpu'),
  
  createGPU: (data: any) =>
    api.post('/gpu', data),
  
  updateGPU: (id: number, data: any) =>
    api.patch(`/gpu/${id}`, data),
  
  deleteGPU: (id: number) =>
    api.delete(`/gpu/${id}`),
};
