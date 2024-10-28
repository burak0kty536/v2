import React, { useState } from 'react';
import { ArrowDownUp, AlertTriangle } from 'lucide-react';

interface TradeExecutorProps {
  onExecuteTrade: (params: TradeParams) => Promise<void>;
}

interface TradeParams {
  tokenAddress: string;
  amount: number;
  type: 'buy' | 'sell';
  slippage: number;
}

export const TradeExecutor: React.FC<TradeExecutorProps> = ({ onExecuteTrade }) => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onExecuteTrade({
        tokenAddress,
        amount: parseFloat(amount),
        type: tradeType,
        slippage: parseFloat(slippage)
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Trade Executor</h2>
        <ArrowDownUp className="text-blue-500" />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Token Address</label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0x..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.0"
              step="0.000001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Slippage (%)</label>
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.5"
              step="0.1"
              min="0.1"
              max="100"
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setTradeType('buy')}
              className={`flex-1 py-2 px-4 rounded-md ${
                tradeType === 'buy'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setTradeType('sell')}
              className={`flex-1 py-2 px-4 rounded-md ${
                tradeType === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Sell
            </button>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Execute Trade'}
          </button>
        </div>
      </form>
    </div>
  );
};