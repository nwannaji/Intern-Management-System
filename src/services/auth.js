import { authAPI } from './api';

// Authentication helpers
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

// Temporary fix: Set admin token manually for testing
export const setAdminToken = () => {
  const adminToken = '40616400cd52bc5254933afefcf51582ce187873';
  const adminUser = {
    id: 1,
    username: 'admin',
    email: 'admin@internship.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    phone_number: null,
    date_of_birth: null,
    address: null,
    profile: null,
    created_at: '2026-01-20T14:27:55.054693Z'
  };
  
  setToken(adminToken);
  setUser(adminUser);
  console.log('Admin token set for testing');
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const removeUser = () => localStorage.removeItem('user');

// Authentication helpers
export const isAuthenticated = () => !!getToken();
export const isAdmin = () => {
  const user = getUser();
  return user && user.role === 'admin';
};

// Auth context actions
export const login = async (credentials) => {
  try {
    console.log('Auth login credentials:', credentials);
    
    // Use axios instead of fetch
    const response = await authAPI.login(credentials);
    const { user, token } = response.data;
    
    setToken(token);
    setUser(user);
    
    return { success: true, user, token };
  } catch (error) {
    console.error('Login Error Details:', error);
    console.error('Error Response:', error.response);
    console.error('Error Data:', error.response?.data);
    
    const errorMessage = error.response?.data?.non_field_errors?.[0] || 
                        error.response?.data?.email?.[0] || 
                        error.response?.data?.password?.[0] ||
                        error.response?.data?.detail ||
                        'Login failed. Please try again.';
    return { success: false, error: errorMessage };
  }
};

export const register = async (userData) => {
  try {
    const response = await authAPI.register(userData);
    const { user, token } = response.data;
    
    setToken(token);
    setUser(user);
    
    return { success: true, user, token };
  } catch (error) {
    const errors = error.response?.data || {};
    const errorMessages = Object.keys(errors).map(key => 
      Array.isArray(errors[key]) ? errors[key][0] : errors[key]
    );
    return { success: false, error: errorMessages.join(', ') || 'Registration failed. Please try again.' };
  }
};

export const logout = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeToken();
    removeUser();
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await authAPI.updateProfile(userData);
    const updatedUser = response.data;
    setUser(updatedUser);
    return { success: true, user: updatedUser };
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 'Profile update failed';
    return { success: false, error: errorMessage };
  }
};

export const changePassword = async (passwordData) => {
  try {
    await authAPI.changePassword(passwordData);
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.old_password?.[0] || 
                        error.response?.data?.new_password?.[0] ||
                        error.response?.data?.detail ||
                        'Password change failed';
    return { success: false, error: errorMessage };
  }
};
