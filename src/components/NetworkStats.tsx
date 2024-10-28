import React from 'react';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface NetworkStatsProps {
  networks: string[];
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({ networks }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {networks.map((network) => (
        <div key={network} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">{network}</h3>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="text-green-600">Connected</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Gas Price</span>
              <span>25 Gwei</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Block Height</span>
              <span>18245631</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};