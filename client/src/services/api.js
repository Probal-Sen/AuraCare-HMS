import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to outgoing requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('arogya_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 unauth
      localStorage.removeItem('arogya_token');
      localStorage.removeItem('arogya_user');
    }
    return Promise.reject(error);
  }
);

export default API;

export const downloadPdfBlob = async (endpointUrl, filename = 'document.pdf') => {
  try {
    const response = await API.get(endpointUrl, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('PDF download error:', error);
    const token = localStorage.getItem('arogya_token') || '';
    const cleanUrl = endpointUrl.startsWith('/') ? endpointUrl : `/${endpointUrl}`;
    const fullUrl = `/api${cleanUrl}?token=${encodeURIComponent(token)}`;
    window.open(fullUrl, '_blank');
    return false;
  }
};
