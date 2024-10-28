import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ExternalLink, AlertTriangle, Loader } from 'lucide-react';
import { WalletService } from '../services/WalletService';
import { formatAddress } from '../utils/format';
import { logger } from '../utils/logger';

interface WalletInfo {
  id: string;
  network: string;
  address: string;
  balance: string;
  privateKey: string;
}

export const WalletManager: React.FC = () => {
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [network, setNetwork] = useState('ETH');
  const [privateKey, setPrivateKey] = useState('');
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingBalances, setUpdatingBalances] = useState(false);

  const walletService = new WalletService();

  useEffect(() => {
    const updateBalances = async () => {
      if (wallets.length === 0 || updatingBalances) return;
      
      setUpdatingBalances(true);
      try {
        const updatedWallets = await Promise.all(
          wallets.map(async (wallet) => {
            try {
              const balance = await walletService.getBalance(wallet.network, wallet.address);
              return { ...wallet, balance };
            } catch (error) {
              logger.error(`Failed to update balance for ${wallet.network} wallet:`, error);
              return wallet;
            }
          })
        );
        setWallets(updatedWallets);
      } catch (error) {
        logger.error('Failed to update wallet balances:', error);
      } finally {
        setUpdatingBalances(false);
      }
    };

    updateBalances();
    const interval = setInterval(updateBalances, 30000);
    return () => clearInterval(interval);
  }, [wallets]);

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check for duplicate wallets
      const existingWallet = wallets.find(w => 
        w.network === network && w.privateKey === privateKey
      );
      
      if (existingWallet) {
        throw new Error('Wallet already added');
      }

      const walletInfo = await walletService.connectWallet(network, privateKey);
      
      const newWallet: WalletInfo = {
        id: `${network}-${walletInfo.address}`,
        network,
        address: walletInfo.address,
        balance: walletInfo.balance,
        privateKey
      };

      setWallets(prev => [...prev, newWallet]);
      setShowAddWallet(false);
      setPrivateKey('');
      setNetwork('ETH');
    } catch (error) {
      setError(error.message || 'Failed to add wallet');
    } finally {
      setLoading(false);
    }
  };

  const removeWallet = (id: string) => {
    setWallets(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Wallet className="w-6 h-6 text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold">Wallet Manager</h2>
        </div>
        <button
          onClick={() => setShowAddWallet(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Wallet
        </button>
      </div>

      {showAddWallet && (
        <form onSubmit={handleAddWallet} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Network
              </label>
              <select
                value={network}
                onChange={(e) => {
                  setNetwork(e.target.value);
                  setError('');
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="ETH">Ethereum</option>
                <option value="BSC">BSC</option>
                <option value="SOLANA">Solana</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Private Key
              </label>
              <input
                type="password"
                value={privateKey}
                onChange={(e) => {
                  setPrivateKey(e.target.value);
                  setError('');
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder={`Enter ${network} private key`}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-center text-sm text-red-600 bg-red-50 p-2 rounded">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading || !privateKey.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </span>
                ) : (
                  'Add Wallet'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddWallet(false);
                  setError('');
                  setPrivateKey('');
                  setNetwork('ETH');
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="p-4 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-600">
                  {wallet.network}
                </span>
                <span className="text-sm text-gray-500">
                  {formatAddress(wallet.address)}
                </span>
                <a
                  href={walletService.getExplorerUrl(wallet.network, wallet.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Balance: {parseFloat(wallet.balance).toFixed(4)} {walletService.getNetworkSymbol(wallet.network)}
              </div>
            </div>
            <button
              onClick={() => removeWallet(wallet.id)}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            >
              Remove
            </button>
          </div>
        ))}

        {wallets.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No wallets added yet
          </div>
        )}
      </div>
    </div>
  );
};