'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Edit3,
  Trash2
} from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  isActive: boolean;
  createdAt: string;
  config: Record<string, unknown>;
}

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await fetch('/api/strategies');
      if (response.ok) {
        const data = await response.json();
        setStrategies(data);
      }
    } catch (error) {
      console.error('Error fetching strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStrategy = async (strategyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/strategies/${strategyId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        fetchStrategies();
      }
    } catch (error) {
      console.error('Error toggling strategy:', error);
    }
  };

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
            <h1 className="text-3xl font-bold text-white">Trading Strategies</h1>
            <p className="text-emerald-300 mt-2">
              Create, manage, and optimize your trading strategies
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Strategy</span>
          </button>
        </div>
      </div>

      {/* Strategy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Strategies</p>
              <p className="text-white text-xl font-bold">{strategies.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Play className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-white text-xl font-bold">
                {strategies.filter(s => s.isActive).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg Win Rate</p>
              <p className="text-white text-xl font-bold">
                {strategies.length > 0 
                  ? (strategies.reduce((sum, s) => sum + s.winRate, 0) / strategies.length).toFixed(1)
                  : '0.0'
                }%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total P&L</p>
              <p className="text-white text-xl font-bold">
                ${strategies.reduce((sum, s) => sum + s.totalPnl, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategies List */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Your Strategies</h3>
        
        {strategies.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No strategies created yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              Create Your First Strategy
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      strategy.isActive ? 'bg-emerald-500/20' : 'bg-gray-600/20'
                    }`}>
                      <BarChart3 className={`h-6 w-6 ${
                        strategy.isActive ? 'text-emerald-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="text-white text-lg font-semibold">{strategy.name}</h4>
                      <p className="text-gray-400 text-sm">{strategy.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          strategy.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                          strategy.status === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {strategy.status}
                        </span>
                        <span className="text-gray-500 text-xs">
                          Created {new Date(strategy.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleStrategy(strategy.id, !strategy.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        strategy.isActive
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {strategy.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                      <Settings className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm">Total Trades</p>
                    <p className="text-white text-lg font-medium">{strategy.totalTrades}</p>
                  </div>
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm">Win Rate</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-white text-lg font-medium">{strategy.winRate.toFixed(1)}%</p>
                      {strategy.winRate >= 50 ? (
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm">Total P&L</p>
                    <p className={`text-lg font-medium ${
                      strategy.totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {strategy.totalPnl >= 0 ? '+' : ''}${strategy.totalPnl.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <p className="text-gray-400 text-sm">Status</p>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        strategy.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'
                      }`}></div>
                      <p className="text-white text-sm">
                        {strategy.isActive ? 'Running' : 'Stopped'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strategy Templates */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Strategy Templates</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
            <h4 className="text-white font-medium mb-2">Momentum Trading</h4>
            <p className="text-gray-400 text-sm mb-4">
              Buy tokens showing strong upward momentum with high volume
            </p>
            <button className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm transition-colors">
              Use Template
            </button>
          </div>
          
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
            <h4 className="text-white font-medium mb-2">Scalping</h4>
            <p className="text-gray-400 text-sm mb-4">
              Quick trades to capture small price movements with tight stops
            </p>
            <button className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm transition-colors">
              Use Template
            </button>
          </div>
          
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
            <h4 className="text-white font-medium mb-2">Mean Reversion</h4>
            <p className="text-gray-400 text-sm mb-4">
              Buy oversold tokens and sell overbought ones
            </p>
            <button className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm transition-colors">
              Use Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
