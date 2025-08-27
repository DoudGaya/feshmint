'use client';

import { useState, useEffect } from 'react';
import { 
  Radio, 
  Filter, 
  Search, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  MessageSquare,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';

interface Signal {
  id: string;
  source: string;
  sourceId?: string;
  tokenAddress: string;
  tokenSymbol?: string;
  tokenName?: string;
  rawMessage?: string;
  confidence: number;
  score: number;
  liquidity?: number;
  buyerCount?: number;
  devWalletShare?: number;
  priceChange?: number;
  isProcessed: boolean;
  passedFilters: boolean;
  filtersResult?: Record<string, unknown>;
  createdAt: string;
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showRawMessages, setShowRawMessages] = useState(false);

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSignals = async () => {
    try {
      const response = await fetch('/api/signals');
      if (response.ok) {
        const data = await response.json();
        setSignals(data);
      }
    } catch (error) {
      console.error('Error fetching signals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSignals = signals.filter(signal => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'passed' && signal.passedFilters) ||
      (filter === 'filtered' && !signal.passedFilters) ||
      (filter === 'pending' && !signal.isProcessed);
    
    const matchesSearch = 
      !search ||
      signal.tokenSymbol?.toLowerCase().includes(search.toLowerCase()) ||
      signal.tokenName?.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'telegram':
        return <MessageSquare className="h-4 w-4" />;
      case 'discord':
        return <Users className="h-4 w-4" />;
      default:
        return <Radio className="h-4 w-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'telegram':
        return 'text-blue-400 bg-blue-500/20';
      case 'discord':
        return 'text-purple-400 bg-purple-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
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
            <h1 className="text-3xl font-bold text-white">Trading Signals</h1>
            <p className="text-emerald-300 mt-2">
              Monitor real-time signals from Telegram, Discord, and other sources
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-emerald-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live</span>
            </div>
            <button
              onClick={fetchSignals}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Radio className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Signals</p>
              <p className="text-white text-xl font-bold">{signals.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Passed Filters</p>
              <p className="text-white text-xl font-bold">
                {signals.filter(s => s.passedFilters).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Filtered Out</p>
              <p className="text-white text-xl font-bold">
                {signals.filter(s => !s.passedFilters && s.isProcessed).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-white text-xl font-bold">
                {signals.filter(s => !s.isProcessed).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Signals</option>
              <option value="passed">Passed Filters</option>
              <option value="filtered">Filtered Out</option>
              <option value="pending">Pending Processing</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <button
              onClick={() => setShowRawMessages(!showRawMessages)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                showRawMessages
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {showRawMessages ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>Raw Messages</span>
            </button>
          </div>
        </div>
      </div>

      {/* Signals List */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="space-y-4">
          {filteredSignals.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No signals match your current filters</p>
            </div>
          ) : (
            filteredSignals.map((signal) => (
              <div key={signal.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getSourceColor(signal.source)}`}>
                      {getSourceIcon(signal.source)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-white font-medium">
                          {signal.tokenSymbol || 'Unknown Token'}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          signal.passedFilters ? 'bg-emerald-500/20 text-emerald-400' :
                          signal.isProcessed ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {signal.passedFilters ? 'Passed' : signal.isProcessed ? 'Filtered' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{signal.tokenName}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="text-white font-medium">{signal.confidence.toFixed(0)}%</span>
                    </div>
                    <p className="text-gray-400 text-xs">
                      {new Date(signal.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Signal Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-gray-400">Source</p>
                    <p className="text-white capitalize">{signal.source}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Score</p>
                    <p className="text-white">{signal.score.toFixed(1)}</p>
                  </div>
                  {signal.liquidity && (
                    <div>
                      <p className="text-gray-400">Liquidity</p>
                      <p className="text-white">${signal.liquidity.toLocaleString()}</p>
                    </div>
                  )}
                  {signal.buyerCount && (
                    <div>
                      <p className="text-gray-400">Buyers</p>
                      <p className="text-white">{signal.buyerCount}</p>
                    </div>
                  )}
                </div>

                {/* Raw Message */}
                {showRawMessages && signal.rawMessage && (
                  <div className="mt-3 p-3 bg-gray-700 rounded border border-gray-600">
                    <p className="text-gray-300 text-sm">
                      {signal.rawMessage.length > 200 
                        ? `${signal.rawMessage.substring(0, 200)}...` 
                        : signal.rawMessage
                      }
                    </p>
                  </div>
                )}

                {/* Token Address */}
                <div className="mt-3 p-2 bg-gray-700 rounded">
                  <p className="text-gray-400 text-xs">Token Address:</p>
                  <p className="text-gray-300 text-sm font-mono break-all">
                    {signal.tokenAddress}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
