'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface DashboardData {
  portfolio: {
    totalValue: number;
    dailyChange: number;
    dailyChangePercent: number;
    totalProfit: number;
    totalProfitPercent: number;
  };
  stats: {
    activeTrades: number;
    signalsToday: number;
    winRate: number;
    avgProfit: number;
  };
  recentTrades: Array<{
    id: string;
    symbol: string;
    side: 'buy' | 'sell';
    amount: number;
    price: number;
    profit: number;
    profitPercent: number;
    timestamp: string;
  }>;
  positions: Array<{
    id: string;
    symbol: string;
    amount: number;
    entryPrice: number;
    currentPrice: number;
    profit: number;
    profitPercent: number;
  }>;
  recentSignals: Array<{
    id: string;
    symbol: string;
    type: 'buy' | 'sell';
    confidence: number;
    price: number;
    timestamp: string;
  }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 503 && errorData.type === 'CONNECTION_ERROR') {
          setError('Database connection issue. Using demo data.');
          // Set fallback/demo data
          setData({
            portfolio: {
              totalValue: 0,
              dailyPnl: 0,
              totalPnl: 0,
              winRate: 0,
            },
            recentTrades: [],
            activePositions: [],
            recentSignals: [],
          });
          return;
        }
        
        throw new Error(errorData.message || 'Failed to fetch dashboard data');
      }
      const dashboardData = await response.json();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      
      // Set fallback data when there's an error
      setData({
        portfolio: {
          totalValue: 0,
          dailyPnl: 0,
          totalPnl: 0,
          winRate: 0,
        },
        recentTrades: [],
        activePositions: [],
        recentSignals: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/50 to-blue-900/50 rounded-xl border border-emerald-800/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-emerald-300">Welcome back, {session?.user?.name || 'Trader'}</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Portfolio Value</p>
              <p className="text-2xl font-bold text-white">
                ${(data?.portfolio?.totalValue || 0).toLocaleString()}
              </p>
              <p className={`text-sm flex items-center ${
                (data?.portfolio?.dailyChange || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(data?.portfolio?.dailyChange || 0) >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                ${Math.abs(data?.portfolio?.dailyChange || 0).toLocaleString()} ({Math.abs(data?.portfolio?.dailyChangePercent || 0).toFixed(2)}%)
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Profit</p>
              <p className={`text-2xl font-bold ${
                (data?.portfolio?.totalProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${(data?.portfolio?.totalProfit || 0).toLocaleString()}
              </p>
              <p className={`text-sm ${
                (data?.portfolio?.totalProfitPercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(data?.portfolio?.totalProfitPercent || 0).toFixed(2)}% all time
              </p>
            </div>
            <TrendingUp className={`h-8 w-8 ${
              (data?.portfolio.totalProfit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`} />
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Trades</p>
              <p className="text-2xl font-bold text-white">{data?.stats?.activeTrades || 0}</p>
              <p className="text-sm text-emerald-400">
                {data?.stats?.winRate || 0}% win rate
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Signals Today</p>
              <p className="text-2xl font-bold text-white">{data?.stats?.signalsToday || 0}</p>
              <p className="text-sm text-purple-400">
                Avg: ${(data?.stats?.avgProfit || 0).toFixed(2)}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trades */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Trades</h2>
          <div className="space-y-3">
            {data?.recentTrades?.length ? (
              data.recentTrades.slice(0, 5).map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      trade.side === 'buy' ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                    <div>
                      <p className="text-white font-medium">{trade.symbol}</p>
                      <p className="text-gray-400 text-sm">
                        {trade.side.toUpperCase()} {trade.amount} @ ${trade.price}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      (trade.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ${(trade.profit || 0).toLocaleString()}
                    </p>
                    <p className={`text-sm ${
                      (trade.profitPercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(trade.profitPercent || 0) >= 0 ? '+' : ''}{(trade.profitPercent || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No recent trades</p>
            )}
          </div>
        </div>

        {/* Current Positions */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Current Positions</h2>
          <div className="space-y-3">
            {data?.positions?.length ? (
              data.positions.slice(0, 5).map((position) => (
                <div key={position.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{position.symbol}</p>
                    <p className="text-gray-400 text-sm">
                      {position.amount} @ ${position.entryPrice}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      (position.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ${(position.profit || 0).toLocaleString()}
                    </p>
                    <p className={`text-sm ${
                      (position.profitPercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(position.profitPercent || 0) >= 0 ? '+' : ''}{(position.profitPercent || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No current positions</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Signals */}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Signals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.recentSignals?.length ? (
            data.recentSignals.slice(0, 6).map((signal) => (
              <div key={signal.id} className="p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{signal.symbol}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    signal.type === 'buy' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                  }`}>
                    {signal.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Confidence</p>
                    <p className="text-emerald-400 font-semibold">{signal.confidence || 0}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Price</p>
                    <p className="text-white font-semibold">${signal.price || 0}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <p className="text-gray-400 text-center py-4">No recent signals</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
