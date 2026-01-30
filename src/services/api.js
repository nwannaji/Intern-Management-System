import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://intern-management-backend-gi46.onrender.com/api';

// Create axios instance with better configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token and logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Log request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with comprehensive error handling
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Comprehensive error logging
    console.error('API Response Error:', {
      message: error.message,
      code: error.code,
      config: error.config,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      } : 'No response'
    });

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - insufficient permissions
          console.error('Access forbidden: Insufficient permissions');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 429:
          // Rate limited
          console.error('Too many requests - rate limited');
          break;
        case 500:
          // Server error
          console.error('Internal server error');
          break;
        default:
          console.error(`HTTP Error ${error.response.status}`);
      }
    } else if (error.request) {
      // Network error - no response received
      console.error('Network error - no response received');
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API responses consistently
const handleResponse = (response) => {
  // Handle paginated responses
  if (response.data && typeof response.data === 'object') {
    if (response.data.results && Array.isArray(response.data.results)) {
      return {
        ...response,
        data: response.data.results,
        pagination: {
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        }
      };
    }
  }
  
  // Handle array responses
  if (Array.isArray(response.data)) {
    return response;
  }
  
  // Handle object responses
  return response;
};

// Auth services with better error handling
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData).then(handleResponse),
  login: (credentials) => api.post('/auth/login/', credentials).then(handleResponse),
  logout: () => api.post('/auth/logout/').then(handleResponse),
  getProfile: () => api.get('/auth/profile/').then(handleResponse),
  updateProfile: (userData) => api.put('/auth/profile/', userData).then(handleResponse),
  changePassword: (passwordData) => api.post('/auth/change-password/', passwordData).then(handleResponse),
};

// Programs services
export const programsAPI = {
  getPrograms: () => api.get('/programs/').then(handleResponse),
  getProgram: (id) => api.get(`/programs/${id}/`).then(handleResponse),
  createProgram: (programData) => api.post('/programs/', programData).then(handleResponse),
  updateProgram: (id, programData) => api.put(`/programs/${id}/`, programData).then(handleResponse),
  deleteProgram: (id) => api.delete(`/programs/${id}/`).then(handleResponse),
};

// Applications services
export const applicationsAPI = {
  getApplications: () => api.get('/applications/').then(handleResponse),
  getApplication: (id) => api.get(`/applications/${id}/`).then(handleResponse),
  createApplication: (applicationData) => api.post('/applications/', applicationData).then(handleResponse),
  updateApplication: (id, applicationData) => api.put(`/applications/${id}/`, applicationData).then(handleResponse),
  deleteApplication: (id) => api.delete(`/applications/${id}/`).then(handleResponse),
  getMyApplications: () => api.get('/applications/my_applications/').then(handleResponse),
  approveApplication: (id) => api.post(`/applications/${id}/approve/`).then(handleResponse),
  rejectApplication: (id) => api.post(`/applications/${id}/reject/`).then(handleResponse),
};

// Documents services with enhanced file handling
export const documentsAPI = {
  getDocumentTypes: () => api.get('/document-types/').then(handleResponse),
  getDocuments: () => api.get('/documents/').then(handleResponse),
  getDocument: (id) => api.get(`/documents/${id}/`).then(handleResponse),
  getApplicationDocuments: (applicationId) => {
    return api.get(`/documents/?application=${applicationId}`).then(handleResponse);
  },
  uploadDocument: (documentData) => {
    // Create a separate instance for file uploads
    const uploadApi = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000, // 60 second timeout for uploads
    });
    
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      uploadApi.defaults.headers.Authorization = `Token ${token}`;
    }
    
    return uploadApi.post('/documents/', documentData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload progress: ${progress}%`);
      },
    }).then(handleResponse);
  },
  verifyDocument: (id) => api.post(`/documents/${id}/verify/`).then(handleResponse),
  unverifyDocument: (id) => api.post(`/documents/${id}/unverify/`).then(handleResponse),
};

// Utility functions for common operations
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error, defaultMessage = 'An error occurred') => {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    } else if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.message) {
      return error.message;
    }
    return defaultMessage;
  },
  
  // Check if response is successful
  isSuccess: (response) => response.status >= 200 && response.status < 300,
  
  // Extract error messages from response
  extractErrors: (error) => {
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'object') {
        return Object.keys(data).reduce((acc, key) => {
          const value = data[key];
          if (Array.isArray(value)) {
            acc[key] = value.join(', ');
          } else {
            acc[key] = value;
          }
          return acc;
        }, {});
      }
    }
    return {};
  },
  
  // Format file size for display
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default api;
