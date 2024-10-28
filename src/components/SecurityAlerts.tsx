import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { SecurityChecker } from '../security/SecurityChecker';

interface SecurityAlertsProps {
  tokenAddress: string;
  networks: string[];
}

export const SecurityAlerts: React.FC<SecurityAlertsProps> = ({ tokenAddress, networks }) => {
  const [alerts, setAlerts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenAddress) {
      analyzeToken();
    }
  }, [tokenAddress]);

  const analyzeToken = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        networks.map(async (network) => {
          const checker = new SecurityChecker(network);
          const analysis = await checker.analyzeToken(tokenAddress);
          return [network, analysis];
        })
      );

      setAlerts(Object.fromEntries(results));
    } catch (error) {
      console.error('Security analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertSeverity = (score: number) => {
    if (score >= 80) return 'low';
    if (score >= 50) return 'medium';
    return 'high';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Security Analysis</h2>
        <Shield className="text-blue-500" />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {networks.map((network) => (
            <div key={network} className="h-24 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {networks.map((network) => {
            const analysis = alerts[network];
            if (!analysis) return null;

            const severity = getAlertSeverity(analysis.score);

            return (
              <div
                key={network}
                className={`rounded-lg p-4 ${
                  severity === 'high'
                    ? 'bg-red-50'
                    : severity === 'medium'
                    ? 'bg-yellow-50'
                    : 'bg-green-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">{network}</h3>
                  <div className={`flex items-center ${
                    severity === 'high'
                      ? 'text-red-600'
                      : severity === 'medium'
                      ? 'text-yellow-600'
                      : 'text-green-600'
                  }`}>
                    {severity === 'high' ? (
                      <AlertTriangle className="w-5 h-5 mr-1" />
                    ) : severity === 'medium' ? (
                      <AlertTriangle className="w-5 h-5 mr-1" />
                    ) : (
                      <CheckCircle className="w-5 h-5 mr-1" />
                    )}
                    Security Score: {analysis.score}/100
                  </div>
                </div>

                <div className="space-y-2">
                  {analysis.risks.map((risk: string, index: number) => (
                    <div key={index} className="flex items-center text-sm">
                      <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                      {risk}
                    </div>
                  ))}
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="text-sm">
                      <span className="text-gray-500">Contract Verified:</span>
                      <span className={`ml-2 ${
                        analysis.contractVerified ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {analysis.contractVerified ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Liquidity Score:</span>
                      <span className={`ml-2 ${
                        analysis.liquidityScore >= 70 ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {analysis.liquidityScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};