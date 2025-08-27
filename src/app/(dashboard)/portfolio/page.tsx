'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  PieChart, 
  DollarSign,
  Target,
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface Portfolio {
  id: string;
  currentEquity: number;
  totalPnl: number;
  dailyPnl: number;
  totalTrades: number;
  winningTrades: number;
  winRate: number;
  tradingMode: string;
}

interface Position {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  amount: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  tradingMode: string;
}

interface Trade {
  id: string;
  type: string;
  tokenSymbol: string;
  amount: number;
  price: number;
  pnl: number;
  pnlPercentage: number;
  status: string;
  createdAt: string;
  executedAt: string;
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    fetchPortfolioData();
  }, [timeframe]);

  const fetchPortfolioData = async () => {
    try {
      const [portfolioRes, positionsRes, tradesRes] = await Promise.all([
        fetch('/api/portfolio'),
        fetch('/api/portfolio/positions'),
        fetch(`/api/portfolio/trades?timeframe=${timeframe}`)
      ]);

      if (portfolioRes.ok) {
        const portfolioData = await portfolioRes.json();
        setPortfolio(portfolioData);
      }

      if (positionsRes.ok) {
        const positionsData = await positionsRes.json();
        setPositions(positionsData);
      }

      if (tradesRes.ok) {
        const tradesData = await tradesRes.json();
        setTrades(tradesData);
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Equity',
      value: `$${portfolio?.currentEquity.toFixed(2) || '0.00'}`,
      change: portfolio?.dailyPnl || 0,
      icon: DollarSign,
      color: 'emerald'
    },
    {
      title: 'Total P&L',
      value: `$${portfolio?.totalPnl.toFixed(2) || '0.00'}`,
      change: ((portfolio?.totalPnl || 0) / (portfolio?.currentEquity || 1)) * 100,
      icon: TrendingUp,
      color: 'blue'
    },
    {
      title: 'Win Rate',
      value: `${portfolio?.winRate.toFixed(1) || '0.0'}%`,
      change: `${portfolio?.winningTrades || 0}/${portfolio?.totalTrades || 0}`,
      icon: Target,
      color: 'purple'
    },
    {
      title: 'Active Positions',
      value: positions.length.toString(),
      change: positions.filter(p => p.unrealizedPnl > 0).length,
      icon: PieChart,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/50 to-blue-900/50 rounded-xl border border-emerald-800/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Portfolio Overview</h1>
            <p className="text-emerald-300 mt-2">
              Track your trading performance and manage positions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="1d">1 Day</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = typeof stat.change === 'number' ? stat.change >= 0 : true;
          
          return (
            <div key={index} className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-white text-2xl font-bold mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {typeof stat.change === 'number' && (
                      <>
                        {isPositive ? (
                          <ArrowUpRight className="h-4 w-4 text-emerald-400 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-400 mr-1" />
                        )}
                        <span className={`text-sm ${
                          isPositive ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {isPositive ? '+' : ''}{typeof stat.change === 'number' ? stat.change.toFixed(2) : stat.change}
                          {typeof stat.change === 'number' && stat.title !== 'Total Equity' ? '%' : ''}
                        </span>
                      </>
                    )}
                    {typeof stat.change === 'string' && (
                      <span className="text-sm text-gray-400">{stat.change}</span>
                    )}
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg ${
                  stat.color === 'emerald' ? 'bg-emerald-500/20' :
                  stat.color === 'blue' ? 'bg-blue-500/20' :
                  stat.color === 'purple' ? 'bg-purple-500/20' :
                  'bg-orange-500/20'
                } flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${
                    stat.color === 'emerald' ? 'text-emerald-400' :
                    stat.color === 'blue' ? 'text-blue-400' :
                    stat.color === 'purple' ? 'text-purple-400' :
                    'text-orange-400'
                  }`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Positions */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Current Positions</h3>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm">
                <option>All Positions</option>
                <option>Profitable</option>
                <option>Losing</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {positions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No open positions</p>
            ) : (
              positions.map((position) => (
                <div key={position.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {position.tokenSymbol?.slice(0, 2) || 'UN'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{position.tokenSymbol}</h4>
                        <p className="text-gray-400 text-sm">{position.tokenName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        position.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {position.unrealizedPnl >= 0 ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {((position.unrealizedPnl / (position.averagePrice * position.amount)) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Amount</p>
                      <p className="text-white">{position.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Avg Price</p>
                      <p className="text-white">${position.averagePrice.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Current Price</p>
                      <p className="text-white">${position.currentPrice?.toFixed(4) || '0.0000'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Trade History */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Trade History</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {trades.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No trades in selected timeframe</p>
            ) : (
              trades.map((trade) => (
                <div key={trade.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        trade.status === 'EXECUTED' ? 'bg-emerald-500' : 
                        trade.status === 'FAILED' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="text-white font-medium">
                          {trade.type} {trade.tokenSymbol}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(trade.createdAt).toLocaleDateString()} at {new Date(trade.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {trade.pnlPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Amount</p>
                      <p className="text-white">{trade.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Price</p>
                      <p className="text-white">${trade.price?.toFixed(4) || '0.0000'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Portfolio Performance</h3>
        <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Performance chart will be implemented here</p>
        </div>
      </div>
    </div>
  );
}
