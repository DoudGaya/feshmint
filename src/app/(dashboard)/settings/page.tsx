'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Settings as SettingsIcon,
  DollarSign,
  TrendingUp,
  Zap,
  Bell
} from 'lucide-react';

interface UserSettings {
  emailNotifications: boolean;
  telegramNotifications: boolean;
  discordNotifications: boolean;
  dashboardTheme: 'dark' | 'light';
  timezone: string;
  hasSolanaRpcUrl: boolean;
  hasJitoApiKey: boolean;
  hasTradingWalletPrivateKey: boolean;
  hasTelegramBotToken: boolean;
  hasDiscordWebhookUrl: boolean;
}

interface TradingSettings {
  maxDailyRisk: number;
  maxPositionSize: number;
  stopLoss: number;
  takeProfit: number;
  tradeEnabled: boolean;
  slippageTolerance: number;
  minProfitThreshold: number;
  maxPositions: number;
}

interface FormData {
  solanaRpcUrl: string;
  jitoApiKey: string;
  tradingWalletPrivateKey: string;
  telegramBotToken: string;
  discordWebhookUrl: string;
  emailNotifications: boolean;
  telegramNotifications: boolean;
  discordNotifications: boolean;
  dashboardTheme: 'dark' | 'light';
  timezone: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [tradingSettings, setTradingSettings] = useState<TradingSettings>({
    maxDailyRisk: 5,
    maxPositionSize: 10,
    stopLoss: 5,
    takeProfit: 10,
    tradeEnabled: false,
    slippageTolerance: 1,
    minProfitThreshold: 2,
    maxPositions: 5
  });
  const [formData, setFormData] = useState<FormData>({
    solanaRpcUrl: '',
    jitoApiKey: '',
    tradingWalletPrivateKey: '',
    telegramBotToken: '',
    discordWebhookUrl: '',
    emailNotifications: true,
    telegramNotifications: false,
    discordNotifications: false,
    dashboardTheme: 'dark',
    timezone: 'UTC',
  });
  
  const [showSecrets, setShowSecrets] = useState({
    solanaRpcUrl: false,
    jitoApiKey: false,
    tradingWalletPrivateKey: false,
    telegramBotToken: false,
    discordWebhookUrl: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingTrading, setSavingTrading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchTradingSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setFormData(prev => ({
          ...prev,
          emailNotifications: data.emailNotifications,
          telegramNotifications: data.telegramNotifications,
          discordNotifications: data.discordNotifications,
          dashboardTheme: data.dashboardTheme,
          timezone: data.timezone,
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTradingSettings = async () => {
    try {
      const response = await fetch('/api/trading/settings');
      if (response.ok) {
        const data = await response.json();
        setTradingSettings(data);
      }
    } catch (error) {
      console.error('Error fetching trading settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        fetchSettings();
        setFormData(prev => ({
          ...prev,
          solanaRpcUrl: '',
          jitoApiKey: '',
          tradingWalletPrivateKey: '',
          telegramBotToken: '',
          discordWebhookUrl: '',
        }));
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleTradingSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTrading(true);

    try {
      const response = await fetch('/api/trading/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradingSettings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Trading settings updated successfully!' });
        fetchTradingSettings();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save trading settings' });
      }
    } catch (error) {
      console.error('Error saving trading settings:', error);
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setSavingTrading(false);
    }
  };

  const toggleSecret = (field: keyof typeof showSecrets) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTradingChange = (field: keyof TradingSettings, value: string | number | boolean) => {
    setTradingSettings(prev => ({
      ...prev,
      [field]: value,
    }));
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
        <div className="flex items-center space-x-3">
          <SettingsIcon className="h-8 w-8 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-emerald-300">Configure your trading bot settings and API keys</p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`rounded-xl p-4 ${
          message.type === 'success' 
            ? 'bg-green-900/30 border border-green-700/50' 
            : 'bg-red-900/30 border border-red-700/50'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400" />
            )}
            <span className={`font-medium ${
              message.type === 'success' ? 'text-green-300' : 'text-red-300'
            }`}>
              {message.text}
            </span>
          </div>
        </div>
      )}

      {/* Trading Settings */}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="h-6 w-6 text-emerald-400" />
          <h2 className="text-xl font-semibold text-white">Trading Settings</h2>
        </div>

        <form onSubmit={handleTradingSettingsSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                Max Daily Risk (%)
              </label>
              <input
                type="number"
                value={tradingSettings.maxDailyRisk}
                onChange={(e) => handleTradingChange('maxDailyRisk', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800/70 border border-emerald-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                Max Position Size (%)
              </label>
              <input
                type="number"
                value={tradingSettings.maxPositionSize}
                onChange={(e) => handleTradingChange('maxPositionSize', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800/70 border border-emerald-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                Stop Loss (%)
              </label>
              <input
                type="number"
                value={tradingSettings.stopLoss}
                onChange={(e) => handleTradingChange('stopLoss', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800/70 border border-emerald-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                Take Profit (%)
              </label>
              <input
                type="number"
                value={tradingSettings.takeProfit}
                onChange={(e) => handleTradingChange('takeProfit', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800/70 border border-emerald-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="0"
                max="1000"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                Slippage Tolerance (%)
              </label>
              <input
                type="number"
                value={tradingSettings.slippageTolerance}
                onChange={(e) => handleTradingChange('slippageTolerance', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800/70 border border-emerald-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="0"
                max="10"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                Max Positions
              </label>
              <input
                type="number"
                value={tradingSettings.maxPositions}
                onChange={(e) => handleTradingChange('maxPositions', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-800/70 border border-emerald-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                min="1"
                max="20"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="tradeEnabled"
                checked={tradingSettings.tradeEnabled}
                onChange={(e) => handleTradingChange('tradeEnabled', e.target.checked)}
                className="rounded bg-gray-800 border-emerald-700 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="tradeEnabled" className="ml-2 text-sm text-emerald-300">
                Enable Trading
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingTrading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
          >
            {savingTrading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{savingTrading ? 'Saving...' : 'Save Trading Settings'}</span>
          </button>
        </form>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* API Keys Section */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Key className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">API Keys & Credentials</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Solana RPC URL */}
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                Solana RPC URL
                <span className="text-xs text-gray-400 ml-2">
                  {settings?.hasSolanaRpcUrl ? '(Currently set)' : '(Not set)'}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showSecrets.solanaRpcUrl ? 'text' : 'password'}
                  value={formData.solanaRpcUrl}
                  onChange={(e) => handleInputChange('solanaRpcUrl', e.target.value)}
                  placeholder="https://api.mainnet-beta.solana.com"
                  className="w-full px-4 py-3 bg-gray-800/70 border border-emerald-700/50 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('solanaRpcUrl')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-emerald-400"
                >
                  {showSecrets.solanaRpcUrl ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Jito API Key */}
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                Jito API Key
                <span className="text-xs text-gray-400 ml-2">
                  {settings?.hasJitoApiKey ? '(Currently set)' : '(Not set)'}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showSecrets.jitoApiKey ? 'text' : 'password'}
                  value={formData.jitoApiKey}
                  onChange={(e) => handleInputChange('jitoApiKey', e.target.value)}
                  placeholder="Enter your Jito API key"
                  className="w-full px-4 py-3 bg-gray-800/70 border border-emerald-700/50 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('jitoApiKey')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-emerald-400"
                >
                  {showSecrets.jitoApiKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Trading Wallet Private Key */}
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                Trading Wallet Private Key
                <span className="text-xs text-gray-400 ml-2">
                  {settings?.hasTradingWalletPrivateKey ? '(Currently set)' : '(Not set)'}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showSecrets.tradingWalletPrivateKey ? 'text' : 'password'}
                  value={formData.tradingWalletPrivateKey}
                  onChange={(e) => handleInputChange('tradingWalletPrivateKey', e.target.value)}
                  placeholder="64-character hex private key"
                  className="w-full px-4 py-3 bg-gray-800/70 border border-emerald-700/50 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('tradingWalletPrivateKey')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-emerald-400"
                >
                  {showSecrets.tradingWalletPrivateKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-red-400 mt-1">
                ⚠️ Never share your private key. It&apos;s encrypted and stored securely.
              </p>
            </div>

            {/* Telegram Bot Token */}
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                Telegram Bot Token
                <span className="text-xs text-gray-400 ml-2">
                  {settings?.hasTelegramBotToken ? '(Currently set)' : '(Not set)'}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showSecrets.telegramBotToken ? 'text' : 'password'}
                  value={formData.telegramBotToken}
                  onChange={(e) => handleInputChange('telegramBotToken', e.target.value)}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  className="w-full px-4 py-3 bg-gray-800/70 border border-emerald-700/50 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('telegramBotToken')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-emerald-400"
                >
                  {showSecrets.telegramBotToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Discord Webhook URL */}
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                Discord Webhook URL
                <span className="text-xs text-gray-400 ml-2">
                  {settings?.hasDiscordWebhookUrl ? '(Currently set)' : '(Not set)'}
                </span>
              </label>
              <div className="relative">
                <input
                  type={showSecrets.discordWebhookUrl ? 'text' : 'password'}
                  value={formData.discordWebhookUrl}
                  onChange={(e) => handleInputChange('discordWebhookUrl', e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full px-4 py-3 bg-gray-800/70 border border-emerald-700/50 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('discordWebhookUrl')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-emerald-400"
                >
                  {showSecrets.discordWebhookUrl ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Bell className="h-6 w-6 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Email Notifications</h3>
                <p className="text-gray-400 text-sm">Receive trade alerts and updates via email</p>
              </div>
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                className="rounded bg-gray-800 border-emerald-700 text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Telegram Notifications</h3>
                <p className="text-gray-400 text-sm">Receive real-time alerts on Telegram</p>
              </div>
              <input
                type="checkbox"
                checked={formData.telegramNotifications}
                onChange={(e) => handleInputChange('telegramNotifications', e.target.checked)}
                className="rounded bg-gray-800 border-emerald-700 text-emerald-600 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Discord Notifications</h3>
                <p className="text-gray-400 text-sm">Get notified on your Discord server</p>
              </div>
              <input
                type="checkbox"
                checked={formData.discordNotifications}
                onChange={(e) => handleInputChange('discordNotifications', e.target.checked)}
                className="rounded bg-gray-800 border-emerald-700 text-emerald-600 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">General Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                Dashboard Theme
              </label>
              <select
                value={formData.dashboardTheme}
                onChange={(e) => handleInputChange('dashboardTheme', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/70 border border-emerald-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-300 mb-2">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/70 border border-emerald-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London Time</option>
                <option value="Europe/Paris">Paris Time</option>
                <option value="Asia/Tokyo">Tokyo Time</option>
                <option value="Asia/Shanghai">Shanghai Time</option>
                <option value="Asia/Kolkata">India Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
