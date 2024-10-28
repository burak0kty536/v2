import React, { useState } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';

interface StrategyConfig {
  name: string;
  enabled: boolean;
  parameters: {
    [key: string]: number | string | boolean;
  };
}

interface StrategyConfiguratorProps {
  onSave: (config: StrategyConfig) => void;
}

export const StrategyConfigurator: React.FC<StrategyConfiguratorProps> = ({ onSave }) => {
  const [activeStrategy, setActiveStrategy] = useState<StrategyConfig>({
    name: 'pingpong',
    enabled: false,
    parameters: {
      buyThreshold: 0.5,
      sellThreshold: 1.5,
      maxTrades: 10,
      interval: 1000,
      useAntiMEV: true
    }
  });

  const handleParameterChange = (key: string, value: any) => {
    setActiveStrategy(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(activeStrategy);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Strategy Configuration</h2>
        <Settings className="text-blue-500" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Strategy Type</label>
          <select
            value={activeStrategy.name}
            onChange={(e) => setActiveStrategy(prev => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="pingpong">PingPong Trading</option>
            <option value="arbitrage">Cross-Chain Arbitrage</option>
            <option value="sniper">Token Sniper</option>
          </select>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Buy Threshold (%)</label>
            <input
              type="number"
              value={activeStrategy.parameters.buyThreshold}
              onChange={(e) => handleParameterChange('buyThreshold', parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sell Threshold (%)</label>
            <input
              type="number"
              value={activeStrategy.parameters.sellThreshold}
              onChange={(e) => handleParameterChange('sellThreshold', parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Max Trades</label>
            <input
              type="number"
              value={activeStrategy.parameters.maxTrades}
              onChange={(e) => handleParameterChange('maxTrades', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Check Interval (ms)</label>
            <input
              type="number"
              value={activeStrategy.parameters.interval}
              onChange={(e) => handleParameterChange('interval', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="100"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="antiMEV"
              checked={activeStrategy.parameters.useAntiMEV as boolean}
              onChange={(e) => handleParameterChange('useAntiMEV', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="antiMEV" className="text-sm font-medium text-gray-700">
              Enable Anti-MEV Protection
            </label>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Strategy
          </button>
          <button
            type="button"
            onClick={() => setActiveStrategy({
              name: 'pingpong',
              enabled: false,
              parameters: {
                buyThreshold: 0.5,
                sellThreshold: 1.5,
                maxTrades: 10,
                interval: 1000,
                useAntiMEV: true
              }
            })}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};