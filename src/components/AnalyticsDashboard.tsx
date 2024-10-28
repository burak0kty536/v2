import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Activity, DollarSign } from 'lucide-react';
import { AdvancedChart } from './charts/AdvancedChart';
import { TechnicalIndicators } from './charts/TechnicalIndicators';
import { CrossChainTransactions } from './monitoring/CrossChainTransactions';
import { ContractSimulator } from './security/ContractSimulator';

export const AnalyticsDashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [metrics, setMetrics] = useState({
    totalVolume: 0,
    activePositions: 0,
    profitLoss: 0,
    successRate: 0
  });

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Volume</p>
              <h3 className="text-2xl font-bold">${metrics.totalVolume.toLocaleString()}</h3>
            </div>
            <DollarSign className="text-blue-500 h-8 w-8" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Positions</p>
              <h3 className="text-2xl font-bold">{metrics.activePositions}</h3>
            </div>
            <Activity className="text-green-500 h-8 w-8" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Profit/Loss</p>
              <h3 className={`text-2xl font-bold ${metrics.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.profitLoss >= 0 ? '+' : ''}{metrics.profitLoss}%
              </h3>
            </div>
            <TrendingUp className={`h-8 w-8 ${metrics.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Success Rate</p>
              <h3 className="text-2xl font-bold">{metrics.successRate}%</h3>
            </div>
            <BarChart2 className="text-purple-500 h-8 w-8" />
          </div>
        </div>
      </div>

      {/* Advanced Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Market Analysis</h2>
          <div className="flex space-x-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="1h">1 Hour</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
          </div>
        </div>
        <AdvancedChart timeframe={selectedTimeframe} />
        <TechnicalIndicators />
      </div>

      {/* Cross-Chain Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Cross-Chain Transactions</h2>
          <CrossChainTransactions />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Contract Simulation</h2>
          <ContractSimulator />
        </div>
      </div>
    </div>
  );
};