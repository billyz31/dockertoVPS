import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  role: 'user' | 'admin';
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authAPI.setToken(token);
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      
      // 確保balance是數字類型
      const processedUser = {
        ...userData.user,
        balance: typeof userData.user.balance === 'string' ? parseFloat(userData.user.balance) : userData.user.balance
      };
      
      setUser(processedUser);
    } catch (error) {
      console.error('獲取用戶信息失敗:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: newToken, user: userData } = response;
      
      // 確保balance是數字類型
      const processedUser = {
        ...userData,
        balance: typeof userData.balance === 'string' ? parseFloat(userData.balance) : userData.balance
      };
      
      setToken(newToken);
      setUser(processedUser);
      localStorage.setItem('token', newToken);
      authAPI.setToken(newToken);
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authAPI.register({ username, email, password });
      console.log('註冊響應:', response);
      
      // 檢查響應結構
      if (!response.token || !response.user) {
        throw new Error('註冊響應格式錯誤');
      }
      
      const { token: newToken, user: userData } = response;
      
      // 確保balance是數字類型
      const processedUser = {
        ...userData,
        balance: typeof userData.balance === 'string' ? parseFloat(userData.balance) : userData.balance
      };
      
      setToken(newToken);
      setUser(processedUser);
      localStorage.setItem('token', newToken);
      authAPI.setToken(newToken);
    } catch (error) {
      console.error('AuthContext register error:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    authAPI.setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};