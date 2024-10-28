import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';

interface Transaction {
  id: string;
  sourceChain: string;
  targetChain: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
}

export const CrossChainTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial transactions
    fetchTransactions();

    // Set up real-time updates
    const interval = setInterval(fetchTransactions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchTransactions = async () => {
    try {
      // Implement transaction fetching
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div
          key={tx.id}
          className={`p-4 rounded-lg ${
            tx.status === 'completed'
              ? 'bg-green-50'
              : tx.status === 'failed'
              ? 'bg-red-50'
              : 'bg-yellow-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{tx.sourceChain}</span>
              <ArrowRight className="w-4 h-4" />
              <span className="font-medium">{tx.targetChain}</span>
            </div>
            <span className={`text-sm font-medium ${
              tx.status === 'completed'
                ? 'text-green-600'
                : tx.status === 'failed'
                ? 'text-red-600'
                : 'text-yellow-600'
            }`}>
              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Amount: ${tx.amount.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {new Date(tx.timestamp).toLocaleString()}
          </div>
        </div>
      ))}

      {transactions.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          No cross-chain transactions found
        </div>
      )}
    </div>
  );
};