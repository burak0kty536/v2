import React, { useState, useEffect } from 'react';
import { Play, Settings, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface BotControllerProps {
  onStart?: (config: BotConfig) => void;
  onStop?: () => void;
}

interface BotConfig {
  id: string;
  name: string;
  wallet: string;
  network: string;
  strategy: string;
  minProfit: number;
  maxLoss: number;
  tradeAmount: number;
  slippage: number;
  autoDetect: boolean;
}

interface Wallet {
  id: string;
  network: string;
  address: string;
  enabled: boolean;
}

export const BotController: React.FC<BotControllerProps> = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [config, setConfig] = useState<BotConfig>({
    id: uuidv4(),
    name: 'New Bot',
    wallet: '',
    network: '',
    strategy: 'sniper',
    minProfit: 2.0,
    maxLoss: 1.0,
    tradeAmount: 0.1,
    slippage: 1.0,
    autoDetect: true
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleWalletAdded = (event: CustomEvent) => {
      setWallets(prev => [...prev, event.detail]);
    };

    const handleWalletRemoved = (event: CustomEvent) => {
      setWallets(prev => prev.filter(wallet => wallet.id !== event.detail.id));
    };

    window.addEventListener('walletAdded', handleWalletAdded as EventListener);
    window.addEventListener('walletRemoved', handleWalletRemoved as EventListener);

    return () => {
      window.removeEventListener('walletAdded', handleWalletAdded as EventListener);
      window.removeEventListener('walletRemoved', handleWalletRemoved as EventListener);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (['minProfit', 'maxLoss', 'tradeAmount', 'slippage'].includes(name)) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) return;
      setConfig(prev => ({ ...prev, [name]: numValue }));
    } else {
      setConfig(prev => ({ ...prev, [name]: value }));
    }

    // Update network when wallet changes
    if (name === 'wallet') {
      const selectedWallet = wallets.find(w => w.id === value);
      if (selectedWallet) {
        setConfig(prev => ({ ...prev, network: selectedWallet.network }));
      }
    }
  };

  const handleCreateBot = () => {
    try {
      if (!config.wallet) {
        throw new Error('Please select a wallet');
      }

      const selectedWallet = wallets.find(w => w.id === config.wallet);
      if (!selectedWallet) {
        throw new Error('Selected wallet not found');
      }

      const botConfig = {
        ...config,
        network: selectedWallet.network
      };

      // Dispatch bot creation event
      window.dispatchEvent(new CustomEvent('botAdded', { detail: botConfig }));

      // Reset form
      setConfig({
        id: uuidv4(),
        name: 'New Bot',
        wallet: '',
        network: '',
        strategy: 'sniper',
        minProfit: 2.0,
        maxLoss: 1.0,
        tradeAmount: 0.1,
        slippage: 1.0,
        autoDetect: true
      });

      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Bot Controller</h2>
        <Settings className="text-blue-500" />
      </div>

      {wallets.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          Add a wallet first to create a bot.
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Bot Name</label>
            <input
              type="text"
              name="name"
              value={config.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Select Wallet</label>
            <select
              name="wallet"
              value={config.wallet}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a wallet</option>
              {wallets.filter(w => w.enabled).map(wallet => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.network} - {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Strategy</label>
            <select
              name="strategy"
              value={config.strategy}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="sniper">Token Sniper</option>
              <option value="arbitrage">Arbitrage</option>
              <option value="pingpong">Ping Pong</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Profit (%)</label>
              <input
                type="number"
                name="minProfit"
                value={config.minProfit}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Max Loss (%)</label>
              <input
                type="number"
                name="maxLoss"
                value={config.maxLoss}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Trade Amount</label>
              <input
                type="number"
                name="tradeAmount"
                value={config.tradeAmount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Slippage (%)</label>
              <input
                type="number"
                name="slippage"
                value={config.slippage}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoDetect"
              name="autoDetect"
              checked={config.autoDetect}
              onChange={(e) => setConfig(prev => ({ ...prev, autoDetect: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoDetect" className="text-sm font-medium text-gray-700">
              Auto-detect new tokens
            </label>
          </div>

          {error && (
            <div className="flex items-center text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <button
            onClick={handleCreateBot}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Play className="w-4 h-4 mr-2" />
            Create Bot
          </button>
        </div>
      )}
    </div>
  );
};