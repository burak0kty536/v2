import React, { useState } from 'react';
import { Activity, AlertTriangle, TrendingUp } from 'lucide-react';
import { NetworkStats } from './NetworkStats';

interface CrossChainMonitorProps {
  networks?: string[];
}

export const CrossChainMonitor: React.FC<CrossChainMonitorProps> = ({ 
  networks = ['ETH', 'BSC', 'SOLANA']
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Network Status</h2>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>

        <NetworkStats networks={networks} />

        {/* Arbitrage Opportunities */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Arbitrage Opportunities</h3>
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium">ETH → BSC</span>
                </div>
                <span className="text-green-600 font-medium">+2.5% Potential</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Price difference: $0.05 USDT
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Network Alerts</h3>
          <div className="space-y-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <div>
                  <p className="font-medium text-yellow-800">High Gas Prices on ETH</p>
                  <p className="text-sm text-yellow-700">
                    Current gas price is above 100 Gwei
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};