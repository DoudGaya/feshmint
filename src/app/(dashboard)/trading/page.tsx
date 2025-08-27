'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Play, 
  Pause, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Shield,
  Zap
} from 'lucide-react';

interface TradingSettings {
  isActive: boolean;
  tradingMode: 'LIVE' | 'PAPER';
  maxPositionSize: number;
  portfolioCap: number;
  dailyDrawdownLimit: number;
  winRateThreshold: number;
  minLiquidity: number;
  minBuyerConfirmation: number;
  maxDevWalletControl: number;
  maxPriceDump: number;
  trailingStopLoss: number;
}

export default function TradingPage() {
  const [settings, setSettings] = useState<TradingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTradingSettings();
  }, []);

  const fetchTradingSettings = async () => {
    try {
      const response = await fetch('/api/trading/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching trading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrading = async () => {
    if (!settings) return;
    
    setUpdating(true);
    try {
      const response = await fetch('/api/trading/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !settings.isActive }),
      });

      if (response.ok) {
        setSettings({ ...settings, isActive: !settings.isActive });
      }
    } catch (error) {
      console.error('Error toggling trading:', error);
    } finally {
      setUpdating(false);
    }
  };

  const updateSetting = (key: keyof TradingSettings, value: string | number | boolean) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    
    setUpdating(true);
    try {
      const response = await fetch('/api/trading/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        // Show success message
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load trading settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/50 to-blue-900/50 rounded-xl border border-emerald-800/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Control</h1>
            <p className="text-emerald-300 mt-2">
              Manage your automated trading settings and monitor performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${
              settings.isActive ? 'text-emerald-400' : 'text-gray-400'
            }`}>
              {settings.isActive ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Pause className="h-5 w-5" />
              )}
              <span className="font-medium">
                {settings.isActive ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Controls */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Trading Controls</h2>
          
          <div className="space-y-6">
            {/* Start/Stop Trading */}
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  settings.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'
                }`}></div>
                <div>
                  <h3 className="text-white font-medium">Automated Trading</h3>
                  <p className="text-gray-400 text-sm">
                    {settings.isActive ? 'Bot is actively trading' : 'Trading is paused'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTrading}
                disabled={updating}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  settings.isActive
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                } disabled:opacity-50`}
              >
                {settings.isActive ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Stop Trading</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Start Trading</span>
                  </>
                )}
              </button>
            </div>

            {/* Trading Mode */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-white font-medium mb-3">Trading Mode</h3>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={settings.tradingMode === 'PAPER'}
                    onChange={() => updateSetting('tradingMode', 'PAPER')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-300">Paper Trading</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={settings.tradingMode === 'LIVE'}
                    onChange={() => updateSetting('tradingMode', 'LIVE')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-300">Live Trading</span>
                </label>
              </div>
              {settings.tradingMode === 'LIVE' && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">
                      Live trading uses real funds. Ensure all settings are correct.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Position Sizing */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-white font-medium mb-3">Position Sizing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Max Position Size ($)
                  </label>
                  <input
                    type="number"
                    value={settings.maxPositionSize}
                    onChange={(e) => updateSetting('maxPositionSize', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Portfolio Cap ($)
                  </label>
                  <input
                    type="number"
                    value={settings.portfolioCap}
                    onChange={(e) => updateSetting('portfolioCap', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Risk Management */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-white font-medium mb-3">Risk Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Daily Drawdown Limit (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.dailyDrawdownLimit}
                    onChange={(e) => updateSetting('dailyDrawdownLimit', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Win Rate Threshold (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.winRateThreshold}
                    onChange={(e) => updateSetting('winRateThreshold', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Trailing Stop Loss (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.trailingStopLoss}
                    onChange={(e) => updateSetting('trailingStopLoss', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={saveSettings}
              disabled={updating}
              className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Status Panel */}
        <div className="space-y-6">
          {/* Trading Status */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Trading Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300">Risk Management</span>
                </div>
                <span className="text-emerald-400 text-sm">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-gray-300">MEV Protection</span>
                </div>
                <span className="text-emerald-400 text-sm">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">Signal Sources</span>
                </div>
                <span className="text-emerald-400 text-sm">3 Active</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Today</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Trades Executed</span>
                <span className="text-white font-medium">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Win Rate</span>
                <span className="text-emerald-400 font-medium">75%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">P&L</span>
                <span className="text-emerald-400 font-medium">+$247.50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Max Drawdown</span>
                <span className="text-yellow-400 font-medium">-2.3%</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                View Live Trades
              </button>
              <button className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                Check Signals
              </button>
              <button className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                Risk Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
