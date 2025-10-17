import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: authService.getProfile,
    enabled: !!token, // 只有在有 token 時才執行查詢
    retry: false, // 不重試，避免無限循環
  });

  // 如果沒有 token，重定向到登錄頁面
  React.useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  // 如果有錯誤，顯示錯誤信息
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">載入用戶資料時發生錯誤</div>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            重新登錄
          </button>
        </div>
      </div>
    );
  }

  // 使用 AuthContext 中的用戶資料作為備用
  const displayUser = userData || user;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">儀表板</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">帳戶餘額</h2>
            <p className="text-2xl font-bold text-blue-600">
              ${typeof displayUser?.balance === 'number' ? displayUser.balance.toFixed(2) : '0.00'}
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-green-800 mb-2">用戶資訊</h2>
            <p className="text-gray-600">
              {displayUser?.username || '用戶'}
            </p>
            <p className="text-sm text-gray-500">
              {displayUser?.email}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">快速導航</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a 
              href="/slots" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-colors"
            >
              老虎機遊戲
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;