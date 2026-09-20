import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service.js';
import { setToken, removeToken, getToken } from '../services/apiClient.js';

const STORAGE_KEY = 'roomstay_auth_user';
const REMEMBER_KEY = 'roomstay_remember';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    const hasToken = !!getToken();

    if (storedUser && hasToken) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch {
        clearAuth();
      }
    } else {
      clearAuth();
    }
    setLoading(false);
  }, []);

  const saveUserToStorage = useCallback((userData, remember = false) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }, []);

  const clearAuth = () => {
    removeToken();
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = useCallback(async (email, password, remember = false) => {
    try {
      const result = await authService.login(email, password);
      const { user: userData, token } = result.data;

      setToken(token, remember);
      saveUserToStorage(userData, remember);

      if (remember) {
        localStorage.setItem(REMEMBER_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error al iniciar sesión';
      const errors = error.response?.data?.errors || null;
      return { success: false, message, errors };
    }
  }, [saveUserToStorage]);

  const register = useCallback(async (userInfo) => {
    try {
      const result = await authService.register(userInfo);
      const { user: userData, token } = result.data;

      setToken(token, false);
      saveUserToStorage(userData, false);
      localStorage.removeItem(REMEMBER_KEY);

      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error al registrar usuario';
      const errors = error.response?.data?.errors || null;
      return { success: false, message, errors };
    }
  }, [saveUserToStorage]);

  const recoverPassword = useCallback(async (email) => {
    try {
      const result = await authService.recoverPassword(email);
      return { success: true, message: result.message, data: result.data };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Error al solicitar recuperación';
      const errors = error.response?.data?.errors || null;
      return { success: false, message, errors };
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, []);

  const getRememberedEmail = () => {
    return localStorage.getItem(REMEMBER_KEY) || '';
  };

  const refreshUser = useCallback(async () => {
    if (!getToken()) return;
    try {
      const result = await authService.getMe();
      const userData = result.data?.user || result.data;
      if (!userData?.id) return;
      const storage = localStorage.getItem(STORAGE_KEY) ? localStorage : sessionStorage;
      storage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch {
      // silencioso
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    recoverPassword,
    getRememberedEmail,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  }
  return ctx;
};
