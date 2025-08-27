'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  X, 
  Target,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface Position {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
  amount: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
  stopLossPrice?: number;
  takeProfitPrice?: number;
  tradingMode: 'LIVE' | 'PAPER';
  createdAt: string;
  updatedAt: string;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions');
      if (response.ok) {
        const data = await response.json();
        setPositions(data);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    } finally {
      setLoading(false);
    }
  };

  const closePosition = async (positionId: string) => {
    try {
      const response = await fetch(`/api/positions/${positionId}/close`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchPositions();
      }
    } catch (error) {
      console.error('Error closing position:', error);
    }
  };

  const updateStopLoss = async (positionId: string, stopLossPrice: number) => {
    try {
      const response = await fetch(`/api/positions/${positionId}/stop-loss`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stopLossPrice }),
      });

      if (response.ok) {
        fetchPositions();
      }
    } catch (error) {
      console.error('Error updating stop loss:', error);
    }
  };

  const filteredPositions = positions.filter(position => {
    switch (filter) {
      case 'profitable':
        return position.unrealizedPnl > 0;
      case 'losing':
        return position.unrealizedPnl < 0;
      case 'live':
        return position.tradingMode === 'LIVE';
      case 'paper':
        return position.tradingMode === 'PAPER';
      default:
        return true;
    }
  });

  const totalUnrealizedPnl = positions.reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
  const totalRealizedPnl = positions.reduce((sum, pos) => sum + pos.realizedPnl, 0);
  const profitablePositions = positions.filter(pos => pos.unrealizedPnl > 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/50 to-blue-900/50 rounded-xl border border-emerald-800/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Open Positions</h1>
            <p className="text-emerald-300 mt-2">
              Monitor and manage your current trading positions
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-300 text-sm">Total Positions</p>
            <p className="text-3xl font-bold text-white">{positions.length}</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Wallet className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Positions</p>
              <p className="text-white text-xl font-bold">{positions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Profitable</p>
              <p className="text-white text-xl font-bold">{profitablePositions}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Unrealized P&L</p>
              <p className={`text-xl font-bold ${
                totalUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Realized P&L</p>
              <p className={`text-xl font-bold ${
                totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {totalRealizedPnl >= 0 ? '+' : ''}${totalRealizedPnl.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center space-x-4">
          <span className="text-white font-medium">Filter:</span>
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Positions' },
              { key: 'profitable', label: 'Profitable' },
              { key: 'losing', label: 'Losing' },
              { key: 'live', label: 'Live Trading' },
              { key: 'paper', label: 'Paper Trading' }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  filter === filterOption.key
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Positions List */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        {filteredPositions.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No positions match your current filter</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPositions.map((position) => {
              const pnlPercentage = ((position.currentPrice - position.averagePrice) / position.averagePrice) * 100;
              const isProfit = position.unrealizedPnl >= 0;
              
              return (
                <div key={position.id} className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {position.tokenSymbol?.slice(0, 3) || 'UNK'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white text-lg font-semibold">{position.tokenSymbol}</h4>
                        <p className="text-gray-400">{position.tokenName}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            position.tradingMode === 'LIVE' 
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {position.tradingMode}
                          </span>
                          <span className="text-gray-500 text-xs">
                            Opened {new Date(position.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          {isProfit ? (
                            <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-400" />
                          )}
                          <span className={`text-lg font-bold ${
                            isProfit ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {isProfit ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          isProfit ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%
                        </p>
                      </div>
                      
                      <button
                        onClick={() => closePosition(position.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        title="Close Position"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Position Details */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Amount</p>
                      <p className="text-white font-medium">{position.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Avg Price</p>
                      <p className="text-white font-medium">${position.averagePrice.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Current Price</p>
                      <p className="text-white font-medium">${position.currentPrice.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Stop Loss</p>
                      <p className="text-white font-medium">
                        {position.stopLossPrice ? `$${position.stopLossPrice.toFixed(4)}` : 'Not Set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Take Profit</p>
                      <p className="text-white font-medium">
                        {position.takeProfitPrice ? `$${position.takeProfitPrice.toFixed(4)}` : 'Not Set'}
                      </p>
                    </div>
                  </div>

                  {/* Risk Management Controls */}
                  <div className="flex items-center space-x-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                      <label className="text-gray-400 text-sm">Stop Loss:</label>
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="Price"
                        className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm w-24"
                        onBlur={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value > 0) {
                            updateStopLoss(position.id, value);
                          }
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-gray-400 text-sm">Take Profit:</label>
                      <input
                        type="number"
                        step="0.0001"
                        placeholder="Price"
                        className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm w-24"
                      />
                    </div>
                    
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                      Update
                    </button>
                  </div>

                  {/* Token Address */}
                  <div className="mt-3 p-2 bg-gray-700 rounded">
                    <p className="text-gray-400 text-xs">Contract:</p>
                    <p className="text-gray-300 text-xs font-mono break-all">
                      {position.tokenAddress}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
