import React, { useState } from 'react';
import { Bell, Settings, Plus, Trash2 } from 'lucide-react';

interface Alert {
  id: string;
  tokenAddress: string;
  type: 'price' | 'volume' | 'liquidity';
  condition: 'above' | 'below';
  value: number;
  enabled: boolean;
}

export const AlertSettings: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [newAlert, setNewAlert] = useState<Omit<Alert, 'id'>>({
    tokenAddress: '',
    type: 'price',
    condition: 'above',
    value: 0,
    enabled: true
  });

  const addAlert = () => {
    const alert: Alert = {
      id: Date.now().toString(),
      ...newAlert
    };
    setAlerts([...alerts, alert]);
    setNewAlert({
      tokenAddress: '',
      type: 'price',
      condition: 'above',
      value: 0,
      enabled: true
    });
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Alert Settings</h2>
        <Bell className="text-blue-500" />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Add New Alert</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Token Address</label>
            <input
              type="text"
              value={newAlert.tokenAddress}
              onChange={(e) => setNewAlert({ ...newAlert, tokenAddress: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0x..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={newAlert.type}
                onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as Alert['type'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="price">Price</option>
                <option value="volume">Volume</option>
                <option value="liquidity">Liquidity</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Condition</label>
              <select
                value={newAlert.condition}
                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as Alert['condition'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Value</label>
            <input
              type="number"
              value={newAlert.value}
              onChange={(e) => setNewAlert({ ...newAlert, value: parseFloat(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.0"
              step="0.000001"
            />
          </div>

          <button
            onClick={addAlert}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Alert
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Active Alerts</h3>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium">{alert.tokenAddress}</div>
                <div className="text-sm text-gray-500">
                  {alert.type} {alert.condition} {alert.value}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`p-2 rounded-md ${
                    alert.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="p-2 rounded-md bg-red-100 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No alerts configured
            </div>
          )}
        </div>
      </div>
    </div>
  );
};