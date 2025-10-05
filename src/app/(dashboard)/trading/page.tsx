'use client';

import { useState, useEffect, useRef } from 'react';
import { useRealTimeTrading } from '@/contexts/real-time-trading-context';

interface TokenChart {
  symbol: string;
  address: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

export default function TradingPage() {
  const { state, actions } = useRealTimeTrading();
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [viewMode, setViewMode] = useState<'chart' | 'signals' | 'trades'>('chart');
  const startupRef = useRef(false);

  // Initialize real-time data connections
  useEffect(() => {
    if (!startupRef.current) {
      startupRef.current = true;
      // Start trading connection to ensure we get real-time data
      actions.startTrading().catch(console.error);
    }
    
    return () => {
      // Clean up connections on unmount
      if (startupRef.current) {
        actions.stopTrading().catch(console.error);
      }
    };
  }, []); // No dependencies needed with ref pattern

  // Use real-time data from context
  const signals = state.currentSignals;
  const recentTrades = state.recentTrades;
  const isActive = state.tradingActive;
  const stats = state.portfolioStats;
  const isLoading = state.connectionStatus === 'connecting';

  // Get recent signals for token selection
  const recentSignals = Array.isArray(signals) ? signals.slice(0, 20) : [];
  const recentTradesArray = Array.isArray(recentTrades) ? recentTrades : [];

  // Popular tokens for chart display
  const popularTokens: TokenChart[] = [
    { 
      symbol: 'SOL', 
      address: 'So11111111111111111111111111111111111111112', 
      price: 98.45, 
      change24h: 5.23, 
      volume24h: 2500000,
      marketCap: 45000000000
    },
    { 
      symbol: 'BONK', 
      address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', 
      price: 0.000012, 
      change24h: -2.14, 
      volume24h: 850000,
      marketCap: 750000000
    },
    { 
      symbol: 'WIF', 
      address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', 
      price: 2.87, 
      change24h: 8.91, 
      volume24h: 1200000,
      marketCap: 2800000000
    },
    { 
      symbol: 'PEPE', 
      address: '6GCL6pT1j1JoC4k4rH9PV9nF1F8F5VJ9L2kV8N3mH8eM', 
      price: 0.0000087, 
      change24h: 12.45, 
      volume24h: 950000,
      marketCap: 3600000000
    },
  ];

  const currentToken = selectedToken || popularTokens[0].address;
  const currentTokenData = popularTokens.find(t => t.address === currentToken) || popularTokens[0];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold text-white">Fresh Mint</h1>
              <div className="flex space-x-1">
                {['chart', 'signals', 'trades'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as 'chart' | 'signals' | 'trades')}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-all text-sm ${
                      viewMode === mode
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Trading Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-xs font-medium">
                  {isActive ? 'Live Trading' : 'Trading Stopped'}
                </span>
              </div>
              
              {/* Stats */}
              {stats && (
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex flex-col items-center">
                    <span className="text-gray-400">P&L</span>
                    <span className={`font-semibold ${
                      (typeof stats === 'object' && stats && 'totalPnL' in stats ? (stats.totalPnL as number || 0) : 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ${typeof stats === 'object' && stats && 'totalPnL' in stats ? (stats.totalPnL as number || 0).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gray-400">Trades</span>
                    <span className="font-semibold">{typeof stats === 'object' && stats && 'totalTrades' in stats ? (stats.totalTrades as number || 0) : 0}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="font-semibold text-blue-400">
                      {typeof stats === 'object' && stats && 'winRate' in stats ? (stats.winRate as number || 0).toFixed(1) : '0'}%
                    </span>
                  </div>
                </div>
              )}
              
              {/* Trading Control */}
              <button
                onClick={isActive ? actions.stopTrading : actions.startTrading}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 text-sm ${
                  isActive
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isLoading ? 'Loading...' : isActive ? 'Stop Trading' : 'Start Trading'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Token Selector Sidebar */}
        <div className="w-72 bg-gray-900 border-r border-gray-800 p-4">
          <div className="mb-4">
            <h3 className="text-base font-semibold mb-3">Markets</h3>
            <div className="space-y-1">
              {popularTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => setSelectedToken(token.address)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    currentToken === token.address
                      ? 'bg-blue-600/20 border border-blue-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm">{token.symbol}</div>
                    <div className={`text-xs font-medium ${
                      token.change24h > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="text-gray-300">${token.price.toFixed(6)}</div>
                    <div className="text-gray-400">
                      Vol: ${(token.volume24h / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    MCap: ${(token.marketCap / 1000000000).toFixed(1)}B
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Recent Signals */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center">
              Recent Signals
              <div className={`ml-2 w-2 h-2 rounded-full ${
                recentSignals.length > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
              }`} />
            </h4>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {recentSignals.length > 0 ? recentSignals.map((signal) => (
                <div
                  key={signal.id}
                  className="p-2 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-all"
                  onClick={() => setSelectedToken(signal.tokenAddress)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{signal.symbol}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      signal.action === 'BUY' 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {signal.action}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{Math.round(signal.confidence * 100)}% confidence</span>
                    <span>{new Date(signal.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              )) : (
                <div className="text-gray-400 text-xs text-center py-4">
                  No signals yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-black">
          {viewMode === 'chart' && (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-2xl font-bold">{currentTokenData.symbol}</h3>
                    <div className="text-lg font-semibold">${currentTokenData.price.toFixed(6)}</div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentTokenData.change24h > 0 
                        ? 'bg-green-900/50 text-green-400' 
                        : 'bg-red-900/50 text-red-400'
                    }`}>
                      {currentTokenData.change24h > 0 ? '+' : ''}{currentTokenData.change24h.toFixed(2)}%
                    </div>
                  </div>
                  <div className="flex space-x-4 text-sm text-gray-400">
                    <div>Vol: ${(currentTokenData.volume24h / 1000000).toFixed(1)}M</div>
                    <div>MCap: ${(currentTokenData.marketCap / 1000000000).toFixed(1)}B</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-6">
                <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://dexscreener.com/solana/${currentToken}?embed=1&theme=dark&trades=0&info=0`}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                    title="Token Chart"
                  />
                </div>
              </div>
            </div>
          )}

          {viewMode === 'signals' && (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-gray-800">
                <h3 className="text-2xl font-bold">Live Trading Signals</h3>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {recentSignals.length > 0 ? recentSignals.map((signal) => (
                    <div key={signal.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl font-bold">{signal.symbol}</span>
                          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                            signal.action === 'BUY' 
                              ? 'bg-green-900/50 text-green-300 border border-green-600' 
                              : 'bg-red-900/50 text-red-300 border border-red-600'
                          }`}>
                            {signal.action}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="text-gray-400">Confidence:</div>
                            <div className="font-semibold text-blue-400">
                              {Math.round(signal.confidence * 100)}%
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-semibold">${signal.price.toFixed(6)}</div>
                          <div className="text-gray-400 text-sm">
                            {new Date(signal.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      {signal.metadata && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {signal.metadata.marketCap && (
                            <div className="bg-gray-800 p-3 rounded">
                              <div className="text-gray-400">Market Cap</div>
                              <div className="font-semibold">
                                ${(signal.metadata.marketCap / 1000000).toFixed(2)}M
                              </div>
                            </div>
                          )}
                          {signal.metadata.liquidity && (
                            <div className="bg-gray-800 p-3 rounded">
                              <div className="text-gray-400">Liquidity</div>
                              <div className="font-semibold">
                                ${(signal.metadata.liquidity / 1000000).toFixed(2)}M
                              </div>
                            </div>
                          )}
                          {signal.metadata.holderCount && (
                            <div className="bg-gray-800 p-3 rounded">
                              <div className="text-gray-400">Holders</div>
                              <div className="font-semibold">
                                {signal.metadata.holderCount.toLocaleString()}
                              </div>
                            </div>
                          )}
                          {signal.metadata.priceChange24h !== undefined && (
                            <div className="bg-gray-800 p-3 rounded">
                              <div className="text-gray-400">24h Change</div>
                              <div className={`font-semibold ${
                                signal.metadata.priceChange24h > 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {signal.metadata.priceChange24h > 0 ? '+' : ''}
                                {signal.metadata.priceChange24h.toFixed(2)}%
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                      <div className="text-gray-400 text-lg">
                        {isActive ? 'Waiting for signals...' : 'Start trading to see live signals'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'trades' && (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-gray-800">
                <h3 className="text-2xl font-bold">Trading History</h3>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {recentTradesArray.length > 0 ? (
                    recentTradesArray.map((trade) => (
                      <div key={trade.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-xl font-bold">{typeof trade === 'object' && trade && 'symbol' in trade ? String(trade.symbol) : 'Unknown'}</span>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                              (typeof trade === 'object' && trade && 'action' in trade && trade.action === 'BUY') 
                                ? 'bg-green-900/50 text-green-300 border border-green-600' 
                                : 'bg-red-900/50 text-red-300 border border-red-600'
                            }`}>
                              {typeof trade === 'object' && trade && 'action' in trade ? String(trade.action) : 'UNKNOWN'}
                            </span>
                            <div className="text-gray-400">
                              Amount: ${typeof trade === 'object' && trade && 'amount' in trade ? (trade.amount as number || 0).toFixed(2) : '0.00'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xl font-semibold ${
                              (typeof trade === 'object' && trade && 'pnl' in trade && typeof trade.pnl === 'number' && trade.pnl > 0) ? 'text-green-400' : 
                              (typeof trade === 'object' && trade && 'pnl' in trade && typeof trade.pnl === 'number' && trade.pnl < 0) ? 'text-red-400' : 'text-gray-400'
                            }`}>
                              {typeof trade === 'object' && trade && 'pnl' in trade && typeof trade.pnl === 'number' ? `$${trade.pnl.toFixed(2)}` : 'Pending'}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {typeof trade === 'object' && trade && 'timestamp' in trade ? 
                                new Date(typeof trade.timestamp === 'string' ? trade.timestamp : Number(trade.timestamp)).toLocaleTimeString() : 
                                'Unknown'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                      <div className="text-gray-400 text-lg">
                        No trades yet. Start trading to see activity.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
