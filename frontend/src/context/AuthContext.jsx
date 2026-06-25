import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/_/backend/api';
  }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults when token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on startup
  useEffect(() => {
    const loadUser = () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Decode simple payload from JWT to get user details without calling backend
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          // Check expiration
          if (payload.exp * 1000 < Date.now()) {
            console.warn('JWT token expired');
            setToken(null);
            setUser(null);
          } else {
            setUser({
              id: payload.id,
              username: payload.username,
              email: payload.email
            });
          }
        } catch (e) {
          console.error('Failed to parse stored JWT:', e);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // Register user
  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password
      });

      if (response.data.success) {
        const { token: userToken, ...userDetails } = response.data.data;
        setToken(userToken);
        setUser(userDetails);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };

  // Login user
  const login = async (emailOrUsername, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        emailOrUsername,
        password
      });

      if (response.data.success) {
        const { token: userToken, ...userDetails } = response.data.data;
        setToken(userToken);
        setUser(userDetails);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid email or password.'
      };
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
