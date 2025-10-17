import { authAPI } from './api';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      if (response.token) {
        localStorage.setItem('token', response.token);
        authAPI.setToken(response.token);
      }
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '登入失敗');
    }
  },

  register: async (username: string, email: string, password: string) => {
    try {
      const response = await authAPI.register({ username, email, password });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '註冊失敗');
    }
  },

  getProfile: async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const user = response.user;
      
      // 確保balance是數字類型
      return {
        ...user,
        balance: typeof user.balance === 'string' ? parseFloat(user.balance) : user.balance
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '獲取用戶資料失敗');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    authAPI.setToken(null);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};