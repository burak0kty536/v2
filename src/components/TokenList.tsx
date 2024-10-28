import React from 'react';
import { Search } from 'lucide-react';

export const TokenList: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Token List</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search tokens..."
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="text-center text-gray-500 py-8">
        No tokens found. Add a wallet to see tokens.
      </div>
    </div>
  );
};