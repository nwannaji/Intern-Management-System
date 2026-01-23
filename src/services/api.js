import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Temporarily disable error handling
    return Promise.reject(error);
  }
);

// Auth services
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (userData) => api.put('/auth/profile/', userData),
  changePassword: (passwordData) => api.post('/auth/change-password/', passwordData),
};

// Programs services
export const programsAPI = {
  getPrograms: () => api.get('/programs/'),
  getProgram: (id) => api.get(`/programs/${id}/`),
};

// Applications services
export const applicationsAPI = {
  getApplications: () => api.get('/applications/'),
  getApplication: (id) => api.get(`/applications/${id}/`),
  createApplication: (applicationData) => api.post('/applications/', applicationData),
  updateApplication: (id, applicationData) => api.put(`/applications/${id}/`, applicationData),
  getMyApplications: () => api.get('/applications/my_applications/'),
  approveApplication: (id) => api.post(`/applications/${id}/approve/`),
  rejectApplication: (id) => api.post(`/applications/${id}/reject/`),
};

// Documents services
export const documentsAPI = {
  getDocumentTypes: () => api.get('/document-types/'),  // Use working endpoint
  getDocuments: () => api.get('/documents/'),
  getDocument: (id) => api.get(`/documents/${id}/`),
  getApplicationDocuments: (applicationId) => {
    return api.get(`/documents/?application=${applicationId}`).then(response => {
      // Extract results array from paginated response
      if (response.data && response.data.results) {
        return { ...response, data: response.data.results };
      }
      return response;
    });
  },
  uploadDocument: (documentData) => api.post('/documents/', documentData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  verifyDocument: (id) => api.post(`/documents/${id}/verify/`),
  unverifyDocument: (id) => api.post(`/documents/${id}/unverify/`),
};

export default api;
