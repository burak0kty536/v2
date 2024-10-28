import React, { useState } from 'react';
import { Settings, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

interface AdvancedStrategyConfigProps {
  onSave: (config: any) => void;
  onTest: (config: any) => Promise<any>;
}

export const AdvancedStrategyConfig: React.FC<AdvancedStrategyConfigProps> = ({
  onSave,
  onTest
}) => {
  const [config, setConfig] = useState({
    strategy: {
      type: 'pingpong',
      maxConcurrent: 3,
      timeWindow: 3600,
      profitThreshold: 1.5
    },
    mev: {
      enabled: true,
      maxGasPrice: 150,
      priorityFee: 2,
      useFlashbots: true
    },
    security: {
      simulateTransactions: true,
      checkLiquidity: true,
      minLiquidity: 10000,
      maxSlippage: 2
    }
  });

  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const handleTest = async () => {
    setTesting(true);
    try {
      const results = await onTest(config);
      setTestResults(results);
    } catch (error) {
      setTestResults({ error: error.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Advanced Strategy Configuration</h2>
        <Settings className="text-blue-500" />
      </div>

      <div className="space-y-6">
        {/* Strategy Settings */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Strategy Settings
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Strategy Type
              </label>
              <select
                value={config.strategy.type}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    strategy: { ...config.strategy, type: e.target.value }
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="pingpong">PingPong</option>
                <option value="arbitrage">Arbitrage</option>
                <option value="sniper">Sniper</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Concurrent Trades
              </label>
              <input
                type="number"
                value={config.strategy.maxConcurrent}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    strategy: {
                      ...config.strategy,
                      maxConcurrent: parseInt(e.target.value)
                    }
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* MEV Protection */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            MEV Protection
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="mevEnabled"
                checked={config.mev.enabled}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    mev: { ...config.mev, enabled: e.target.checked }
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="mevEnabled"
                className="ml-2 block text-sm text-gray-900"
              >
                Enable MEV Protection
              </label>
            </div>
            {config.mev.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Gas Price (gwei)
                  </label>
                  <input
                    type="number"
                    value={config.mev.maxGasPrice}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        mev: {
                          ...config.mev,
                          maxGasPrice: parseInt(e.target.value)
                        }
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Priority Fee (gwei)
                  </label>
                  <input
                    type="number"
                    value={config.mev.priorityFee}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        mev: {
                          ...config.mev,
                          priorityFee: parseInt(e.target.value)
                        }
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="mt-4 p-4 rounded-md bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Test Results
            </h4>
            {testResults.error ? (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {testResults.error}
              </div>
            ) : (
              <pre className="text-sm text-gray-600">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => onSave(config)}
            className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Configuration
          </button>
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {testing ? 'Testing...' : 'Test Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};