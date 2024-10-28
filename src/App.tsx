import React, { useState } from 'react';
import { BotController } from './components/BotController';
import { TokenList } from './components/TokenList';
import { WalletManager } from './components/WalletManager';
import { ActiveBots } from './components/ActiveBots';
import { Portfolio } from './components/Portfolio';

function App() {
  const [activeBots, setActiveBots] = useState<any[]>([]);

  const handleStartBot = (config: any) => {
    const newBot = {
      id: Date.now(),
      config,
      status: 'running'
    };
    setActiveBots(prev => [...prev, newBot]);
  };

  const handleStopBot = () => {
    setActiveBots(prev => prev.map(bot => ({
      ...bot,
      status: 'stopped'
    })));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-blue-600 flex items-center">
            <span className="mr-2">⚡</span>
            Multi-Chain Trading Bot
          </h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TokenList />
            <div className="mt-6">
              <ActiveBots />
            </div>
          </div>
          <div>
            <WalletManager />
            <div className="mt-6">
              <BotController onStart={handleStartBot} onStop={handleStopBot} />
            </div>
            <div className="mt-6">
              <Portfolio />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;