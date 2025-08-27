'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingDown, DollarSign, BarChart3, RefreshCw } from 'lucide-react';

interface RiskMetrics {
  dailyRisk: number;
  maxDailyRisk: number;
  portfolioValue: number;
  totalExposure: number;
  riskLevel: 'low' | 'medium' | 'high';
  var95: number; // Value at Risk 95%
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  avgPositionSize: number;
}

interface RiskRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  threshold: number;
  currentValue: number;
  status: 'ok' | 'warning' | 'danger';
}

export default function RiskPage() {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    dailyRisk: 2.3,
    maxDailyRisk: 5.0,
    portfolioValue: 50000,
    totalExposure: 35000,
    riskLevel: 'low',
    var95: 2500,
    sharpeRatio: 1.42,
    maxDrawdown: 8.7,
    winRate: 65.5,
    avgPositionSize: 8.2
  });

  const [riskRules, setRiskRules] = useState<RiskRule[]>([
    {
      id: '1',
      name: 'Daily Loss Limit',
      description: 'Maximum daily loss percentage',
      enabled: true,
      threshold: 5.0,
      currentValue: 2.3,
      status: 'ok'
    },
    {
      id: '2',
      name: 'Position Size Limit',
      description: 'Maximum position size as % of portfolio',
      enabled: true,
      threshold: 10.0,
      currentValue: 8.2,
      status: 'ok'
    },
    {
      id: '3',
      name: 'Total Exposure Limit',
      description: 'Maximum total exposure percentage',
      enabled: true,
      threshold: 80.0,
      currentValue: 70.0,
      status: 'ok'
    },
    {
      id: '4',
      name: 'Consecutive Losses',
      description: 'Maximum consecutive losing trades',
      enabled: true,
      threshold: 5,
      currentValue: 2,
      status: 'ok'
    },
    {
      id: '5',
      name: 'Drawdown Limit',
      description: 'Maximum portfolio drawdown percentage',
      enabled: true,
      threshold: 15.0,
      currentValue: 8.7,
      status: 'warning'
    }
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update risk rule statuses based on current values
      const updatedRules = riskRules.map(rule => {
        const percentage = (rule.currentValue / rule.threshold) * 100;
        let status: 'ok' | 'warning' | 'danger' = 'ok';
        
        if (percentage > 90) status = 'danger';
        else if (percentage > 70) status = 'warning';
        
        return { ...rule, status };
      });
      
      setRiskRules(updatedRules);
    } catch (error) {
      console.error('Error fetching risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-400 bg-green-900/20 border-green-700/50';
      case 'warning': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/50';
      case 'danger': return 'text-red-400 bg-red-900/20 border-red-700/50';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-700/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-xl border border-red-800/30 p-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-red-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Risk Management</h1>
            <p className="text-red-300">Monitor and control trading risks</p>
          </div>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Daily Risk</p>
              <p className="text-2xl font-bold text-white">
                {riskMetrics.dailyRisk.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">
                of {riskMetrics.maxDailyRisk}% limit
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-400" />
          </div>
          <div className="mt-4 bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full transition-all"
              style={{ width: `${(riskMetrics.dailyRisk / riskMetrics.maxDailyRisk) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Portfolio Exposure</p>
              <p className="text-2xl font-bold text-white">
                {((riskMetrics.totalExposure / riskMetrics.portfolioValue) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">
                ${riskMetrics.totalExposure.toLocaleString()}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Value at Risk (95%)</p>
              <p className="text-2xl font-bold text-white">
                ${riskMetrics.var95.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {((riskMetrics.var95 / riskMetrics.portfolioValue) * 100).toFixed(1)}% of portfolio
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Risk Level</p>
              <p className={`text-2xl font-bold capitalize ${getRiskLevelColor(riskMetrics.riskLevel)}`}>
                {riskMetrics.riskLevel}
              </p>
              <p className="text-xs text-gray-500">
                Current assessment
              </p>
            </div>
            <Shield className={`h-8 w-8 ${getRiskLevelColor(riskMetrics.riskLevel)}`} />
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Performance Metrics</h2>
          <button
            onClick={fetchRiskData}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Sharpe Ratio</p>
            <p className="text-3xl font-bold text-emerald-400">{riskMetrics.sharpeRatio}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Max Drawdown</p>
            <p className="text-3xl font-bold text-red-400">{riskMetrics.maxDrawdown}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Win Rate</p>
            <p className="text-3xl font-bold text-blue-400">{riskMetrics.winRate}%</p>
          </div>
        </div>
      </div>

      {/* Risk Rules */}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Risk Rules & Limits</h2>
        
        <div className="space-y-4">
          {riskRules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-lg border ${getStatusColor(rule.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-white">{rule.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rule.status === 'ok' ? 'bg-green-900/50 text-green-300' :
                      rule.status === 'warning' ? 'bg-yellow-900/50 text-yellow-300' :
                      'bg-red-900/50 text-red-300'
                    }`}>
                      {rule.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{rule.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-300">
                      Current: <strong>{rule.currentValue}</strong>
                    </span>
                    <span className="text-sm text-gray-300">
                      Limit: <strong>{rule.threshold}</strong>
                    </span>
                    <span className="text-sm text-gray-300">
                      Usage: <strong>{((rule.currentValue / rule.threshold) * 100).toFixed(1)}%</strong>
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => {
                      setRiskRules(rules => 
                        rules.map(r => 
                          r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                        )
                      );
                    }}
                    className="rounded bg-gray-800 border-emerald-700 text-emerald-600 focus:ring-emerald-500"
                  />
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    rule.status === 'ok' ? 'bg-green-500' :
                    rule.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((rule.currentValue / rule.threshold) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
