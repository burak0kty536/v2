import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { PriceService } from '../services/PriceService';

interface TokenBalance {
  symbol: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
}

export const Portfolio: React.FC = () => {
  const [totalValue, setTotalValue] = useState<number>(0);
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updatePortfolio = async () => {
      try {
        // This would be replaced with actual wallet data
        const mockTokens: TokenBalance[] = [
          {
            symbol: 'ETH',
            balance: 1.5,
            price: 2000,
            value: 3000,
            change24h: 2.5
          },
          {
            symbol: 'USDT',
            balance: 1000,
            price: 1,
            value: 1000,
            change24h: 0
          }
        ];

        setTokens(mockTokens);
        setTotalValue(mockTokens.reduce((sum, token) => sum + token.value, 0));
        setLoading(false);
      } catch (error) {
        console.error('Failed to update portfolio:', error);
        setLoading(false);
      }
    };

    updatePortfolio();
    const interval = setInterval(updatePortfolio, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Portfolio</h2>
        <Wallet className="text-blue-500" />
      </div>

      <div className="mb-6">
        <div className="text-sm text-gray-500">Total Value</div>
        <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
      </div>

      <div className="space-y-4">
        {tokens.map((token) => (
          <div
            key={token.symbol}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <div className="font-medium">{token.symbol}</div>
              <div className="text-sm text-gray-500">
                {token.balance.toFixed(4)} tokens
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">
                ${token.value.toLocaleString()}
              </div>
              <div className={`text-sm flex items-center ${
                token.change24h >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {token.change24h >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(token.change24h)}%
              </div>
            </div>
          </div>
        ))}

        {tokens.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No tokens in portfolio
          </div>
        )}
      </div>
    </div>
  );
};