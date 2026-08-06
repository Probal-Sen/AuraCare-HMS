import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('arogya_user');
    return saved && saved !== 'undefined' ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('arogya_token');
    if (savedToken && savedToken !== 'undefined' && savedToken !== 'null') {
      API.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      return savedToken;
    }
    return '';
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && token !== 'undefined' && token !== 'null') {
      localStorage.setItem('arogya_token', token);
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('arogya_token');
      delete API.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('arogya_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('arogya_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        const authToken = res.data.token;
        const authUser = res.data.user;
        localStorage.setItem('arogya_token', authToken);
        localStorage.setItem('arogya_user', JSON.stringify(authUser));
        API.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        setToken(authToken);
        setUser(authUser);
        return { success: true, user: authUser };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', userData);
      if (res.data.success) {
        const authToken = res.data.token;
        const authUser = res.data.user;
        localStorage.setItem('arogya_token', authToken);
        localStorage.setItem('arogya_user', JSON.stringify(authUser));
        API.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        setToken(authToken);
        setUser(authUser);
        return { success: true, user: authUser };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('arogya_token');
    localStorage.removeItem('arogya_user');
    delete API.defaults.headers.common['Authorization'];
    setUser(null);
    setToken('');
  };

  const updateUserProfile = async (updatedFields) => {
    try {
      const res = await API.put('/auth/profile', updatedFields);
      if (res.data.success && res.data.user) {
        setUser((prev) => ({ ...prev, ...res.data.user }));
        return { success: true, user: res.data.user };
      }
      setUser((prev) => ({ ...prev, ...updatedFields }));
      return { success: true };
    } catch (err) {
      setUser((prev) => ({ ...prev, ...updatedFields }));
      return { success: false, message: err.response?.data?.message || 'Profile update error' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

