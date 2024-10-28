import React, { useState } from 'react';
import { Play, AlertTriangle, CheckCircle } from 'lucide-react';

interface SimulationResult {
  success: boolean;
  gasUsed: number;
  errors?: string[];
  warnings?: string[];
}

export const ContractSimulator: React.FC = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [functionName, setFunctionName] = useState('');
  const [parameters, setParameters] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      // Implement contract simulation
      // This should call your backend service that handles the actual simulation
      const simulationResult: SimulationResult = {
        success: true,
        gasUsed: 150000,
        warnings: ['High gas usage detected']
      };
      setResult(simulationResult);
    } catch (error) {
      setResult({
        success: false,
        gasUsed: 0,
        errors: [error.message]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Contract Address
        </label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="0x..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Function Name
        </label>
        <input
          type="text"
          value={functionName}
          onChange={(e) => setFunctionName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="transfer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Parameters (JSON)
        </label>
        <textarea
          value={parameters}
          onChange={(e) => setParameters(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          placeholder='{"to": "0x...", "amount": "1000000000000000000"}'
        />
      </div>

      <button
        onClick={handleSimulate}
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? (
          'Simulating...'
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Simulate Transaction
          </>
        )}
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded-lg ${
          result.success ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex items-center mb-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className="font-medium">
              {result.success ? 'Simulation Successful' : 'Simulation Failed'}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Gas Used:</span>
              <span className="ml-2 font-medium">{result.gasUsed.toLocaleString()}</span>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="text-red-600">
                {result.errors.map((error, index) => (
                  <div key={index} className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {error}
                  </div>
                ))}
              </div>
            )}

            {result.warnings && result.warnings.length > 0 && (
              <div className="text-yellow-600">
                {result.warnings.map((warning, index) => (
                  <div key={index} className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {warning}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};