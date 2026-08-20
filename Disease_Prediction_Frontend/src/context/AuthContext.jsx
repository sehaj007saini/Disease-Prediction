import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('jwt_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('jwt_token') || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt_token', token);
    } else {
      localStorage.removeItem('jwt_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('jwt_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('jwt_user');
    }
  }, [user]);

  const login = async (usernameOrEmail, password) => {
    setLoading(true);
    try {
      const res = await api.login({ usernameOrEmail, password });
      if (res && res.token) {
        setToken(res.token);
        const userInfo = {
          id: res.id,
          username: res.username,
          email: res.email,
          fullName: res.fullName || res.username,
          role: res.role || 'ROLE_DOCTOR',
        };
        setUser(userInfo);
        setIsAuthModalOpen(false);
        return { success: true, user: userInfo };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Login failed. Please check credentials.' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.register(userData);
      if (res && res.token) {
        setToken(res.token);
        const userInfo = {
          id: res.id,
          username: res.username,
          email: res.email,
          fullName: res.fullName || res.username,
          role: res.role || 'ROLE_DOCTOR',
        };
        setUser(userInfo);
        setIsAuthModalOpen(false);
        return { success: true, user: userInfo };
      }
      return { success: false, error: 'Failed to create account' };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: err.message || 'Registration failed.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_user');
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      loading,
      login,
      register,
      logout,
      isAuthModalOpen,
      authMode,
      setAuthMode,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
