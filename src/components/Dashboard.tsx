import React from 'react';
import { Activity, AlertTriangle, BarChart2, Lock, Settings } from 'lucide-react';
import { TokenList } from './TokenList';
import { TradeHistory } from './TradeHistory';
import { SecurityPanel } from './SecurityPanel';
import { WalletManager } from './WalletManager';
import { NetworkStats } from './NetworkStats';

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Network Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Network Status</h2>
              <Activity className="text-green-500" />
            </div>
            <NetworkStats />
          </div>

          {/* Security Alerts */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Security Alerts</h2>
              <AlertTriangle className="text-yellow-500" />
            </div>
            <SecurityPanel />
          </div>

          {/* Trading Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Performance</h2>
              <BarChart2 className="text-blue-500" />
            </div>
            <TradeHistory />
          </div>
        </div>

        {/* Token List and Trading Interface */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TokenList />
          </div>
          <div>
            <WalletManager />
          </div>
        </div>
      </div>
    </div>
  );
};