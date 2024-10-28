import React, { useState } from 'react';
import { Settings } from 'lucide-react';

interface Bot {
  id: string;
  name: string;
  wallet: string;
  network: string;
  status: 'running' | 'stopped';
  strategy: string;
  profit: number;
  config: any;
  autoDetect: boolean;
}

interface BotSettingsModalProps {
  bot: Bot;
  onClose: () => void;
  onSave: (botId: string, config: any) => void;
}

export const BotSettingsModal: React.FC<BotSettingsModalProps> = ({
  bot,
  onClose,
  onSave
}) => {
  const [settings, setSettings] = useState({
    ...bot.config,
    strategy: bot.strategy,
    autoDetect: bot.autoDetect,
    trading: {
      minProfit: bot.config.minProfit || 2.0,
      maxLoss: bot.config.maxLoss || 1.2,
      takeProfit: bot.config.takeProfit || 3.0,
      stopLoss: bot.config.stopLoss || 1.8,
      trailingStop: bot.config.trailingStop || 1.2,
      maxPositions: bot.config.maxPositions || 5,
      buyAmount: bot.config.buyAmount || 0.1,
      slippage: bot.config.slippage || 1.0
    },
    security: {
      minLiquidity: bot.config.minLiquidity || 7500,
      maxPriceImpact: bot.config.maxPriceImpact || 0.8,
      honeypotCheck: true,
      rugPullCheck: true,
      mevProtection: true
    },
    advanced: {
      gasMultiplier: bot.config.gasMultiplier || 1.3,
      maxGasPrice: bot.config.maxGasPrice || 150,
      checkInterval: bot.config.checkInterval || 4000
    }
  });

  const handleSave = () => {
    onSave(bot.id, settings);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Bot Settings - {bot.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        <div className="space-y-6">
          {/* Trading Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4">Trading Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Buy Amount</label>
                <input
                  type="number"
                  value={settings.trading.buyAmount}
                  onChange={(e) => setSettings({
                    ...settings,
                    trading: { ...settings.trading, buyAmount: parseFloat(e.target.value) }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Take Profit %</label>
                <input
                  type="number"
                  value={settings.trading.takeProfit}
                  onChange={(e) => setSettings({
                    ...settings,
                    trading: { ...settings.trading, takeProfit: parseFloat(e.target.value) }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stop Loss %</label>
                <input
                  type="number"
                  value={settings.trading.stopLoss}
                  onChange={(e) => setSettings({
                    ...settings,
                    trading: { ...settings.trading, stopLoss: parseFloat(e.target.value) }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Loss %</label>
                <input
                  type="number"
                  value={settings.trading.maxLoss}
                  onChange={(e) => setSettings({
                    ...settings,
                    trading: { ...settings.trading, maxLoss: parseFloat(e.target.value) }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Honeypot Check</label>
                  <p className="text-sm text-gray-500">Detect potential honeypot contracts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.honeypotCheck}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, honeypotCheck: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Rug Pull Check</label>
                  <p className="text-sm text-gray-500">Detect potential rug pull risks</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.rugPullCheck}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, rugPullCheck: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">MEV Protection</label>
                  <p className="text-sm text-gray-500">Protect trades from MEV attacks</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.mevProtection}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: { ...settings.security, mevProtection: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4">Advanced Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Gas Multiplier</label>
                <input
                  type="number"
                  value={settings.advanced.gasMultiplier}
                  onChange={(e) => setSettings({
                    ...settings,
                    advanced: { ...settings.advanced, gasMultiplier: parseFloat(e.target.value) }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Gas Price (Gwei)</label>
                <input
                  type="number"
                  value={settings.advanced.maxGasPrice}
                  onChange={(e) => setSettings({
                    ...settings,
                    advanced: { ...settings.advanced, maxGasPrice: parseInt(e.target.value) }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};