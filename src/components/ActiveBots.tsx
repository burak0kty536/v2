import React, { useState, useEffect } from 'react';
import { Play, Pause, Settings, AlertTriangle } from 'lucide-react';
import { BotSettingsModal } from './BotSettingsModal';
import { TransactionHistory } from './TransactionHistory';

interface Bot {
  id: string;
  name: string;
  wallet: string;
  network: string;
  status: 'running' | 'stopped';
  strategy: string;
  profit: number;
  config: any;
}

interface Transaction {
  id: string;
  botId: string;
  tokenAddress: string;
  tokenSymbol: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  profit?: number;
  status: 'completed' | 'pending' | 'failed';
}

export const ActiveBots: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleBotAdded = (event: CustomEvent) => {
      setBots(prev => [...prev, event.detail]);
    };

    const handleBotRemoved = (event: CustomEvent) => {
      setBots(prev => prev.filter(bot => bot.id !== event.detail.id));
    };

    const handleBotUpdated = (event: CustomEvent) => {
      setBots(prev => prev.map(bot => 
        bot.id === event.detail.id ? { ...bot, ...event.detail } : bot
      ));
    };

    const handleTransaction = (event: CustomEvent) => {
      setTransactions(prev => [event.detail, ...prev]);
    };

    window.addEventListener('botAdded', handleBotAdded as EventListener);
    window.addEventListener('botRemoved', handleBotRemoved as EventListener);
    window.addEventListener('botUpdated', handleBotUpdated as EventListener);
    window.addEventListener('transaction', handleTransaction as EventListener);

    return () => {
      window.removeEventListener('botAdded', handleBotAdded as EventListener);
      window.removeEventListener('botRemoved', handleBotRemoved as EventListener);
      window.removeEventListener('botUpdated', handleBotUpdated as EventListener);
      window.removeEventListener('transaction', handleTransaction as EventListener);
    };
  }, []);

  const toggleBot = (bot: Bot) => {
    const updatedBot = {
      ...bot,
      status: bot.status === 'running' ? 'stopped' : 'running'
    };

    setBots(prev => prev.map(b => 
      b.id === bot.id ? updatedBot : b
    ));

    window.dispatchEvent(new CustomEvent('botUpdated', { detail: updatedBot }));
  };

  const openSettings = (bot: Bot) => {
    setSelectedBot(bot);
    setShowSettings(true);
  };

  const handleSaveSettings = (botId: string, config: any) => {
    setBots(prev => prev.map(bot => 
      bot.id === botId ? { ...bot, config } : bot
    ));
    setShowSettings(false);
    setSelectedBot(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Active Bots</h2>

        {bots.length > 0 ? (
          <div className="space-y-4">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium">{bot.name}</div>
                  <div className="text-sm text-gray-500">
                    {bot.network} - {bot.strategy}
                  </div>
                  <div className="text-sm text-gray-500">
                    Profit: {bot.profit >= 0 ? '+' : ''}{bot.profit}%
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openSettings(bot)}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleBot(bot)}
                    className={`p-2 rounded-md ${
                      bot.status === 'running'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {bot.status === 'running' ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No active bots. Add a bot to get started.
          </div>
        )}
      </div>

      {transactions.length > 0 && (
        <TransactionHistory transactions={transactions} />
      )}

      {showSettings && selectedBot && (
        <BotSettingsModal
          bot={selectedBot}
          onClose={() => {
            setShowSettings(false);
            setSelectedBot(null);
          }}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
};