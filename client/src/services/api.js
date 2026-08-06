import axios from 'axios';

// Dynamically resolve API base URL for Local, Render, Vercel, Netlify, Railway hosting
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location) {
    const { hostname, port, origin } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      if (port === '5173' || port === '3000') {
        return 'http://localhost:5000/api';
      }
    }
    return `${origin}/api`;
  }
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Real-time synchronization helper across tabs and components
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('auracare_data_sync') : null;

export const notifyDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auracare_data_updated'));
  }
  if (syncChannel) {
    try {
      syncChannel.postMessage('auracare_data_updated');
    } catch (e) {
      // ignore channel post error
    }
  }
};

if (syncChannel) {
  syncChannel.onmessage = (event) => {
    if (event.data === 'auracare_data_updated' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auracare_data_updated'));
    }
  };
}

// Attach JWT token to outgoing requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('arogya_token');
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 unauthorized & automatic sync triggers
API.interceptors.response.use(
  (response) => {
    const method = response.config?.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method) && response.status >= 200 && response.status < 300) {
      notifyDataChanged();
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('arogya_token');
        localStorage.removeItem('arogya_user');
      }
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
    const fullUrl = `${API_BASE_URL}${cleanUrl}?token=${encodeURIComponent(token)}`;
    window.open(fullUrl, '_blank');
    return false;
  }
};
