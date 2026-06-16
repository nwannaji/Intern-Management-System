import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://intern-management-backend-gi46.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
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
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API responses consistently
const handleResponse = (response) => {
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
  return response;
};

// Auth services
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData).then(handleResponse),
  login: (credentials) => api.post('/auth/login/', credentials).then(handleResponse),
  logout: () => api.post('/auth/logout/').then(handleResponse),
  getProfile: () => api.get('/auth/profile/').then(handleResponse),
  updateProfile: (userData) => api.put('/auth/profile/', userData).then(handleResponse),
  changePassword: (passwordData) => api.post('/auth/change-password/', passwordData).then(handleResponse),
  getProfileDetails: () => api.get('/auth/profile/details/').then(handleResponse),
  updateProfileDetails: (data) => api.put('/auth/profile/details/', data).then(handleResponse),
};

// Accounts services for password reset and user management
export const accountsAPI = {
  requestPasswordReset: (emailData) => api.post('/auth/password-reset/', emailData).then(handleResponse),
  confirmPasswordReset: (resetData) => api.post('/auth/password-reset/confirm/', resetData).then(handleResponse),
  validateResetToken: (token) => api.get(`/auth/password-reset/validate/${token}/`).then(handleResponse),
  listUsers: () => api.get('/auth/users/').then(handleResponse),
  updateUserRole: (userId, data) => api.put(`/auth/users/${userId}/role/`, data).then(handleResponse),
  deactivateUser: (userId) => api.post(`/auth/users/${userId}/deactivate/`).then(handleResponse),
  getSupervisorAssignments: () => api.get('/auth/supervisor-assignments/').then(handleResponse),
  createSupervisorAssignment: (data) => api.post('/auth/supervisor-assignments/', data).then(handleResponse),
  getMySupervisorInterns: () => api.get('/auth/my-supervisor-interns/').then(handleResponse),
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

// Documents services
export const documentsAPI = {
  getDocumentTypes: () => api.get('/documenttypes/').then(handleResponse),
  getDocuments: () => api.get('/documents/').then(handleResponse),
  getDocument: (id) => api.get(`/documents/${id}/`).then(handleResponse),
  getApplicationDocuments: (applicationId) => {
    return api.get(`/documents/?application=${applicationId}`).then(handleResponse);
  },
  uploadDocument: (documentData) => {
    const uploadApi = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
    });
    const token = localStorage.getItem('token');
    if (token) {
      uploadApi.defaults.headers.Authorization = `Token ${token}`;
    }
    return uploadApi.post('/documents/', documentData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(handleResponse);
  },
  verifyDocument: (id) => api.post(`/documents/${id}/verify/`).then(handleResponse),
  unverifyDocument: (id) => api.post(`/documents/${id}/unverify/`).then(handleResponse),
};

// Notifications services
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications/').then(handleResponse),
  markRead: (ids) => api.post('/notifications/mark_read/', { ids }).then(handleResponse),
  markAllRead: () => api.post('/notifications/mark_all_read/').then(handleResponse),
  getUnreadCount: () => api.get('/notifications/unread_count/').then(handleResponse),
};

// Attendance services
export const attendanceAPI = {
  getRecords: () => api.get('/attendance/').then(handleResponse),
  checkIn: () => api.post('/attendance/check_in/').then(handleResponse),
  checkOut: () => api.post('/attendance/check_out/').then(handleResponse),
  getDailySummary: (date) => api.get(`/attendance/daily_summary/?date=${date}`).then(handleResponse),
  getWeeklySummary: () => api.get('/attendance/weekly_summary/').then(handleResponse),
  getTodayStatus: () => api.get('/attendance/today_status/').then(handleResponse),
  generateQR: (period = 'AM') => api.post('/attendance/generate_qr/', { period }).then(handleResponse),
  qrScan: (token) => api.post('/attendance/qr_scan/', { token }).then(handleResponse),
  getActiveQR: () => api.get('/attendance/active_qr/').then(handleResponse),
  deactivateQR: () => api.post('/attendance/deactivate_qr/').then(handleResponse),
};

// Leave services
export const leaveAPI = {
  getLeaveTypes: () => api.get('/leave-types/').then(handleResponse),
  getLeaveRequests: () => api.get('/leave-requests/').then(handleResponse),
  getMyLeaveRequests: () => api.get('/leave-requests/my_leave_requests/').then(handleResponse),
  createLeaveRequest: (data) => api.post('/leave-requests/', data).then(handleResponse),
  approveLeave: (id, data) => api.post(`/leave-requests/${id}/approve/`, data).then(handleResponse),
  rejectLeave: (id, data) => api.post(`/leave-requests/${id}/reject/`, data).then(handleResponse),
  supervisorApproveLeave: (id, data) => api.post(`/leave-requests/${id}/supervisor_approve/`, data).then(handleResponse),
  supervisorRejectLeave: (id, data) => api.post(`/leave-requests/${id}/supervisor_reject/`, data).then(handleResponse),
  supervisorCommentLeave: (id, data) => api.post(`/leave-requests/${id}/supervisor_comment/`, data).then(handleResponse),
  getLeaveBalance: () => api.get('/leave-requests/leave_balance/').then(handleResponse),
};

// Tasks services
export const tasksAPI = {
  getTasks: () => api.get('/tasks/').then(handleResponse),
  getTask: (id) => api.get(`/tasks/${id}/`).then(handleResponse),
  createTask: (data) => api.post('/tasks/', data).then(handleResponse),
  updateTask: (id, data) => api.patch(`/tasks/${id}/`, data).then(handleResponse),
  updateTaskStatus: (id, status) => api.post(`/tasks/${id}/update_status/`, { status }).then(handleResponse),
  addComment: (id, comment) => api.post(`/tasks/${id}/add_comment/`, { comment }).then(handleResponse),
  getComments: (id) => api.get(`/tasks/${id}/list_comments/`).then(handleResponse),
  markOverdue: () => api.post('/tasks/mark_overdue/').then(handleResponse),
};

// Reviews services
export const reviewsAPI = {
  getReviews: () => api.get('/reviews/').then(handleResponse),
  getReview: (id) => api.get(`/reviews/${id}/`).then(handleResponse),
  createReview: (data) => api.post('/reviews/', data).then(handleResponse),
  updateReview: (id, data) => api.patch(`/reviews/${id}/`, data).then(handleResponse),
  submitReview: (id) => api.post(`/reviews/${id}/submit/`).then(handleResponse),
  acknowledgeReview: (id) => api.post(`/reviews/${id}/acknowledge/`).then(handleResponse),
};

// Onboarding services
export const onboardingAPI = {
  getOnboardingTasks: () => api.get('/onboarding-tasks/').then(handleResponse),
  getProgress: (applicationId) => api.get(`/onboarding-progress/by_application/?application_id=${applicationId}`).then(handleResponse),
  markComplete: (progressId, notes) => api.post(`/onboarding-progress/${progressId}/mark_complete/`, { notes }).then(handleResponse),
  initializeForApplication: (applicationId) => api.post('/onboarding-progress/initialize_for_application/', { application_id: applicationId }).then(handleResponse),
};

// Dashboard/Reports services
export const dashboardAPI = {
  getInternDashboard: () => api.get('/dashboard/intern/').then(handleResponse),
  getSupervisorDashboard: () => api.get('/dashboard/supervisor/').then(handleResponse),
  getAdminReports: () => api.get('/reports/').then(handleResponse),
};

// Utility functions
export const apiUtils = {
  handleError: (error, defaultMessage = 'An error occurred') => {
    if (error.response?.data?.detail) return error.response.data.detail;
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.error) return error.response.data.error;
    if (error.message) return error.message;
    return defaultMessage;
  },
  isSuccess: (response) => response.status >= 200 && response.status < 300,
  extractErrors: (error) => {
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'object') {
        return Object.keys(data).reduce((acc, key) => {
          const value = data[key];
          acc[key] = Array.isArray(value) ? value.join(', ') : value;
          return acc;
        }, {});
      }
    }
    return {};
  },
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default api;