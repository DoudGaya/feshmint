'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Shield, 
  Zap,
  BarChart3,
  Users,
  Clock,
  AlertTriangle
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (status === 'loading' || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  // Mock data for dashboard
  const stats = [
    {
      title: 'Portfolio Value',
      value: '$2,847.50',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'emerald'
    },
    {
      title: 'Active Positions',
      value: '7',
      change: '+2',
      trend: 'up',
      icon: Activity,
      color: 'blue'
    },
    {
      title: 'Win Rate',
      value: '78.4%',
      change: '+5.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Daily P&L',
      value: '+$284.50',
      change: '+18.2%',
      trend: 'up',
      icon: BarChart3,
      color: 'purple'
    }
  ];

  const recentTrades = [
    { symbol: 'SOL/USDT', type: 'BUY', amount: '15.5 SOL', price: '$124.50', profit: '+$45.20', time: '2 mins ago' },
    { symbol: 'RAY/USDT', type: 'SELL', amount: '250 RAY', price: '$3.85', profit: '+$28.40', time: '5 mins ago' },
    { symbol: 'ORCA/USDT', type: 'BUY', amount: '100 ORCA', price: '$2.15', profit: '+$12.50', time: '12 mins ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session?.user?.name || "Trader"}! 👋
        </h1>
        <p className="text-emerald-100">
          Your trading bot is actively monitoring the markets. Here&apos;s your portfolio overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend === 'up' ? '↗' : '↘'} {stat.change}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-emerald-100">
                  <Icon className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trading Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Trading Status</h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Risk Management</span>
              </div>
              <span className="text-green-600 font-medium">Active</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">MEV Protection</span>
              </div>
              <span className="text-blue-600 font-medium">Enabled</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">Signal Sources</span>
              </div>
              <span className="text-purple-600 font-medium">3 Active</span>
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Trades</h2>
          
          <div className="space-y-3">
            {recentTrades.map((trade, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    trade.type === 'BUY' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{trade.symbol}</p>
                    <p className="text-sm text-gray-600">{trade.amount} @ {trade.price}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{trade.profit}</p>
                  <p className="text-xs text-gray-500">{trade.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors">
            View All Trades
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <span className="font-medium text-emerald-700">Start Trading</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <span className="font-medium text-red-700">Stop Trading</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-700">View History</span>
          </button>
        </div>
      </div>

      {/* Risk Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">Portfolio approaching daily limit</p>
            <p className="text-sm text-yellow-600">
              You&apos;ve used 85% of your daily trading allocation. Consider adjusting position sizes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}