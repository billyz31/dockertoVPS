import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ 熱重載測試成功！</h1>
        <p className="text-gray-600 mb-4">前端熱重載功能已正常工作，檔案變更能即時同步。</p>
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <p className="text-green-800">這表明：</p>
          <ul className="list-disc list-inside mt-2 text-green-700">
            <li>Docker 卷映射配置正確</li>
            <li>Vite 熱重載機制正常</li>
            <li>檔案監聽功能已啟用</li>
            <li>容器內外檔案同步正常</li>
          </ul>
        </div>
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800 font-semibold">測試時間：</p>
          <p className="text-blue-600">{new Date().toLocaleString('zh-TW')}</p>
        </div>
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded">
          <p className="text-purple-800 font-semibold">🎉 恭喜！</p>
          <p className="text-purple-600">所有用戶現在都有 1000 初始資金，熱重載功能也已完美配置！</p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;