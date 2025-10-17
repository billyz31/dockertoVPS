import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface SlotResult {
  reels: string[];
  betAmount: number;
  payout: number;
  winAmount: number;
  balance: number;
  message: string;
}

const SlotMachine: React.FC = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SlotResult | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // 初始化當前餘額
  useEffect(() => {
    if (user?.balance) {
      setCurrentBalance(user.balance);
    }
  }, [user]);

  const { data: gameHistory } = useQuery({
    queryKey: ['gameHistory'],
    queryFn: () => gameAPI.getGameHistory(1, 10),
  });

  const playMutation = useMutation({
    mutationFn: (amount: number) => gameAPI.playSlotMachine(amount),
    onSuccess: (data) => {
      setLastResult(data);
      setCurrentBalance(data.balance); // 立即更新當前餘額
      queryClient.invalidateQueries({ queryKey: ['gameHistory'] });
      // 更新用戶餘額
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onSettled: () => {
      setSpinning(false);
    }
  });

  const handlePlay = async () => {
    if (spinning) return;
    
    // 檢查餘額是否足夠
    if (currentBalance < betAmount) {
      alert('餘額不足，請降低投注金額！');
      return;
    }
    
    setSpinning(true);
    playMutation.mutate(betAmount);
  };

  const getReelClass = (index: number) => {
    if (!spinning) return '';
    // 調整動畫速度：從1000ms改為2000ms，延遲從300ms改為500ms
    return `animate-spin duration-2000 delay-${index * 500}`;
  };

  const displayReels = spinning 
    ? ['🎰', '🎰', '🎰'] 
    : lastResult?.reels || ['🍒', '🍋', '🍊'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* 遊戲標題和餘額顯示 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">拉霸機</h1>
          <p className="text-gray-600 mb-4">轉動幸運輪盤，贏取豐厚獎金！</p>
          
          {/* 當前餘額顯示 */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4 inline-block">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-sm opacity-90">當前餘額</p>
                <p className="text-2xl font-bold">${currentBalance.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 遊戲區域 */}
        <div className="bg-gradient-to-b from-blue-900 to-purple-900 rounded-2xl p-8 mb-8">
          {/* 拉霸機顯示器 */}
          <div className="bg-black rounded-lg p-6 mb-6">
            <div className="flex justify-center space-x-4 mb-6">
              {displayReels.map((symbol, index) => (
                <div
                  key={index}
                  className={`w-24 h-24 bg-white rounded-lg flex items-center justify-center text-4xl ${getReelClass(index)}`}
                >
                  {symbol}
                </div>
              ))}
            </div>

            {/* 結果顯示 */}
            {lastResult && (
              <div className="text-center">
                <div className={`text-2xl font-bold ${lastResult.payout > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {lastResult.message}
                </div>
                {lastResult.payout > 0 && (
                  <div className="text-yellow-300 text-3xl font-bold mt-2">
                    +{lastResult.payout} 💰
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 控制面板 */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 投注控制 */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  投注金額
                </label>
                <div className="flex space-x-2">
                  {[1, 5, 10, 25, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      disabled={amount > currentBalance}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        betAmount === amount
                          ? 'bg-blue-500 text-white'
                          : amount > currentBalance
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                <div className="mt-2">
                  <input
                    type="range"
                    min="1"
                    max={Math.min(100, currentBalance)}
                    value={Math.min(betAmount, currentBalance)}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="text-white text-sm mt-1">
                  投注金額: ${betAmount}
                </div>
              </div>

              {/* 操作按鈕 */}
              <div className="flex items-end">
                <button
                  onClick={handlePlay}
                  disabled={spinning || betAmount > currentBalance}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-xl transition-all transform hover:scale-105"
                >
                  {spinning ? '轉動中...' : betAmount > currentBalance ? '餘額不足' : `開始遊戲 (${betAmount}💰)`}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 遊戲歷史 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">最近遊戲記錄</h3>
          </div>
          <div className="p-6">
            {gameHistory?.transactions?.length > 0 ? (
              <div className="space-y-3">
                {gameHistory.transactions.slice(0, 5).map((transaction: any) => (
                  <div
                    key={transaction._id}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {transaction.type === 'win' ? '🎉' : '🎰'}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      transaction.type === 'win' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'win' ? '+' : '-'}{transaction.amount}💰
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">暫無遊戲記錄</p>
            )}
          </div>
        </div>

        {/* 賠率表 */}
        <div className="mt-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg p-6">
          <h3 className="text-white text-lg font-bold mb-4 text-center">賠率表</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-2xl">7️⃣7️⃣7️⃣</div>
              <div className="text-yellow-300 font-bold">100倍</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-2xl">💎💎💎</div>
              <div className="text-yellow-300 font-bold">50倍</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-2xl">🔔🔔🔔</div>
              <div className="text-yellow-300 font-bold">20倍</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-2xl">🍇🍇🍇</div>
              <div className="text-yellow-300 font-bold">10倍</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;