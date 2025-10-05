'use client';

import { useState } from 'react';
import { 
  Zap, 
  Globe, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Star,
  TrendingUp,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';

interface SignalSource {
  id: string;
  name: string;
  type: 'COMPANY' | 'EXTERNAL';
  description: string;
  features: string[];
  metrics: {
    confidence: number;
    speed: 'ULTRA_FAST' | 'FAST' | 'MEDIUM' | 'SLOW';
    accuracy: number;
    latency: number; // milliseconds
    cost: number; // per month
  };
  status: 'ACTIVE' | 'INACTIVE' | 'TRIAL';
  websocketUrl?: string;
  apiKey?: string;
  enabled: boolean;
  premium: boolean;
  recommended: boolean;
}

export default function SignalSourceConfiguration() {
  const [selectedSources, setSelectedSources] = useState<string[]>(['fresh-mint-alpha']);
  const [showApiConfig, setShowApiConfig] = useState(false);

  const signalSources: SignalSource[] = [
    {
      id: 'fresh-mint-alpha',
      name: 'Fresh Mint Alpha Signals',
      type: 'COMPANY',
      description: 'Premium signals from our advanced AI system with MEV protection and institutional-grade analysis',
      features: [
        'Ultra-fast signal detection (<200ms)',
        'Advanced on-chain analysis',
        'MEV protection included',
        'Multi-factor confidence scoring',
        'Real-time risk assessment',
        'Telegram & Discord integration'
      ],
      metrics: {
        confidence: 0.85,
        speed: 'ULTRA_FAST',
        accuracy: 0.78,
        latency: 180,
        cost: 0
      },
      status: 'ACTIVE',
      enabled: true,
      premium: false,
      recommended: true
    },
    {
      id: 'solana-tracker',
      name: 'Solana Token Tracker',
      type: 'EXTERNAL',
      description: 'Real-time token discovery and analysis with liquidity monitoring',
      features: [
        'New token discovery',
        'Liquidity analysis',
        'Volume tracking',
        'Developer wallet monitoring',
        'Rug pull detection'
      ],
      metrics: {
        confidence: 0.72,
        speed: 'FAST',
        accuracy: 0.71,
        latency: 350,
        cost: 49
      },
      status: 'ACTIVE',
      websocketUrl: 'wss://api.solanatracker.io/ws',
      enabled: true,
      premium: true,
      recommended: true
    },
    {
      id: 'birdeye',
      name: 'Birdeye Real-time API',
      type: 'EXTERNAL',
      description: 'Comprehensive DeFi data with price feeds and market analysis',
      features: [
        'Real-time price feeds',
        'Market cap tracking',
        'Volume analysis',
        'Token metadata',
        'Historical data'
      ],
      metrics: {
        confidence: 0.69,
        speed: 'FAST',
        accuracy: 0.69,
        latency: 420,
        cost: 79
      },
      status: 'ACTIVE',
      websocketUrl: 'wss://public-api.birdeye.so/socket',
      enabled: false,
      premium: true,
      recommended: false
    },
    {
      id: 'dexscreener',
      name: 'DexScreener Live',
      type: 'EXTERNAL',
      description: 'Live DEX data aggregation with trending token discovery',
      features: [
        'Live DEX monitoring',
        'Trending tokens',
        'Price alerts',
        'Volume spike detection',
        'Multi-chain support'
      ],
      metrics: {
        confidence: 0.65,
        speed: 'MEDIUM',
        accuracy: 0.65,
        latency: 580,
        cost: 29
      },
      status: 'TRIAL',
      websocketUrl: 'wss://io.dexscreener.com/dex/screener/pairs/h24/1',
      enabled: false,
      premium: true,
      recommended: false
    },
    {
      id: 'jupiter-api',
      name: 'Jupiter Aggregator',
      type: 'EXTERNAL',
      description: 'Best price discovery and routing across Solana DEXs',
      features: [
        'Best price routing',
        'Liquidity aggregation',
        'Slippage optimization',
        'Gas estimation',
        'Multi-hop routing'
      ],
      metrics: {
        confidence: 0.82,
        speed: 'FAST',
        accuracy: 0.88,
        latency: 290,
        cost: 0
      },
      status: 'ACTIVE',
      enabled: true,
      premium: false,
      recommended: true
    },
    {
      id: 'photon-api',
      name: 'Photon Trading Signals',
      type: 'EXTERNAL',
      description: 'Advanced trading signals with sentiment analysis',
      features: [
        'Sentiment analysis',
        'Social media monitoring',
        'Whale tracking',
        'Smart money flows',
        'Risk scoring'
      ],
      metrics: {
        confidence: 0.76,
        speed: 'FAST',
        accuracy: 0.73,
        latency: 320,
        cost: 149
      },
      status: 'INACTIVE',
      enabled: false,
      premium: true,
      recommended: false
    }
  ];

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'ULTRA_FAST': return 'text-green-400';
      case 'FAST': return 'text-blue-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'SLOW': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-400';
      case 'INACTIVE': return 'text-red-400';
      case 'TRIAL': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const totalMonthlyCost = signalSources
    .filter(source => selectedSources.includes(source.id))
    .reduce((sum, source) => sum + source.metrics.cost, 0);

  const avgConfidence = signalSources
    .filter(source => selectedSources.includes(source.id))
    .reduce((sum, source) => sum + source.metrics.confidence, 0) / 
    selectedSources.length || 0;

  const avgLatency = signalSources
    .filter(source => selectedSources.includes(source.id))
    .reduce((sum, source) => sum + source.metrics.latency, 0) / 
    selectedSources.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900/50 to-blue-900/50 rounded-xl border border-emerald-800/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Zap className="h-6 w-6 mr-2" />
              Signal Sources
            </h1>
            <p className="text-emerald-300">Configure your trading signal sources for optimal performance</p>
          </div>
          <div className="text-right">
            <div className="text-emerald-400 text-2xl font-bold">{selectedSources.length}</div>
            <div className="text-gray-400 text-sm">Active Sources</div>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Monthly Cost</p>
              <p className="text-2xl font-bold text-white">${totalMonthlyCost}</p>
              <p className="text-sm text-emerald-400">Per month</p>
            </div>
            <BarChart3 className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Confidence</p>
              <p className="text-2xl font-bold text-white">{(avgConfidence * 100).toFixed(1)}%</p>
              <p className="text-sm text-blue-400">Signal quality</p>
            </div>
            <Target className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Latency</p>
              <p className="text-2xl font-bold text-white">{avgLatency.toFixed(0)}ms</p>
              <p className="text-sm text-purple-400">Response time</p>
            </div>
            <Clock className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Coverage</p>
              <p className="text-2xl font-bold text-white">
                {Math.round((selectedSources.length / signalSources.length) * 100)}%
              </p>
              <p className="text-sm text-orange-400">Market coverage</p>
            </div>
            <Globe className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Signal Sources */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Available Signal Sources</h2>
          <button
            onClick={() => setShowApiConfig(!showApiConfig)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>API Configuration</span>
          </button>
        </div>

        {signalSources.map(source => (
          <div key={source.id} className={`bg-gray-900/60 backdrop-blur-sm rounded-xl border p-6 transition-all ${
            selectedSources.includes(source.id) 
              ? 'border-emerald-500/50 bg-emerald-900/20' 
              : 'border-gray-700/30'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{source.name}</h3>
                  
                  {source.type === 'COMPANY' && (
                    <div className="bg-emerald-900/50 text-emerald-300 px-2 py-1 rounded text-xs font-medium">
                      Company
                    </div>
                  )}
                  
                  {source.recommended && (
                    <div className="bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded text-xs font-medium flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Recommended
                    </div>
                  )}
                  
                  {source.premium && (
                    <div className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded text-xs font-medium">
                      Premium
                    </div>
                  )}
                </div>
                
                <p className="text-gray-400 mb-3">{source.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-500 text-xs">Confidence</p>
                    <p className="text-white font-semibold">{(source.metrics.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Speed</p>
                    <p className={`font-semibold ${getSpeedColor(source.metrics.speed)}`}>
                      {source.metrics.speed.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Accuracy</p>
                    <p className="text-white font-semibold">{(source.metrics.accuracy * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Latency</p>
                    <p className="text-white font-semibold">{source.metrics.latency}ms</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {source.features.map((feature, index) => (
                    <span key={index} className="bg-gray-800/50 text-gray-300 px-2 py-1 rounded text-xs">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    source.status === 'ACTIVE' ? 'bg-green-400' :
                    source.status === 'TRIAL' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <span className={`text-sm ${getStatusColor(source.status)}`}>
                    {source.status}
                  </span>
                </div>

                {source.metrics.cost > 0 && (
                  <div className="text-right">
                    <div className="text-white font-semibold">${source.metrics.cost}</div>
                    <div className="text-gray-400 text-sm">per month</div>
                  </div>
                )}

                <button
                  onClick={() => handleSourceToggle(source.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedSources.includes(source.id)
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {selectedSources.includes(source.id) ? 'Enabled' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* API Configuration Panel */}
      {showApiConfig && (
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/30 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            API Configuration
          </h3>
          
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Company-Provided APIs</span>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                The following APIs are automatically configured and maintained by Fresh Mint:
              </p>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>• Solana RPC Endpoints (Helius, QuickNode)</li>
                <li>• Fresh Mint Alpha Signals</li>
                <li>• Jupiter Aggregator API</li>
              </ul>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-400" />
                <span className="text-blue-400 font-medium">External API Keys (Optional)</span>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                You can optionally add your own API keys for additional sources:
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Birdeye API Key</label>
                  <input 
                    type="password" 
                    placeholder="Enter your Birdeye API key (optional)"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Get your free API key at birdeye.so/developers
                  </p>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">DexScreener Pro API</label>
                  <input 
                    type="password" 
                    placeholder="Enter your DexScreener Pro key (optional)"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Upgrade to Pro at dexscreener.com/pricing
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
                Cancel
              </button>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Configuration */}
      <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl border border-yellow-800/30 p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Star className="h-5 w-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Recommended Configuration</h3>
        </div>
        <p className="text-gray-300 mb-4">
          For optimal performance, we recommend enabling Fresh Mint Alpha Signals + Solana Token Tracker. 
          This combination provides excellent coverage with minimal latency and cost.
        </p>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm">83% Avg Confidence</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-blue-400 text-sm">265ms Avg Latency</span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-purple-400" />
            <span className="text-purple-400 text-sm">$49/month</span>
          </div>
        </div>
      </div>
    </div>
  );
}
