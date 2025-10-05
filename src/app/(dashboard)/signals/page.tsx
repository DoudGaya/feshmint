'use client';

import { useState, useEffect } from 'react';
import { useRealTimeTrading } from '@/contexts/real-time-trading-context';
import { generateMockSignal, startMockSignalGeneration, stopMockSignalGeneration } from '@/lib/mock-data-generator';

interface Signal {
  id: string;
  symbol: string;
  tokenAddress: string;
  action: 'BUY' | 'SELL';
  confidence: number;
  price: number;
  volume: number;
  timestamp: number;
  source: string;
  passedFilters: boolean;
  isProcessed: boolean;
  metadata?: {
    marketCap?: number;
    liquidity?: number;
    holderCount?: number;
    priceChange24h?: number;
    rugRisk?: number;
  };
}

export default function SignalsPage() {
  const { state } = useRealTimeTrading();
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'passed'>('all');
  const [signals, setSignals] = useState<Signal[]>([]);
  const [mockSignals, setMockSignals] = useState<Signal[]>([]);

  useEffect(() => {
    // Initialize mock data for development
    if (process.env.NODE_ENV === 'development') {
      const initialSignals = Array.from({ length: 8 }, () => generateMockSignal());
      setMockSignals(initialSignals);

      startMockSignalGeneration((newSignal) => {
        setMockSignals(prev => [newSignal, ...prev].slice(0, 30));
      });

      return () => {
        stopMockSignalGeneration();
      };
    }
  }, []);

  useEffect(() => {
    // Fetch signals from API
    fetchSignals();
    const interval = setInterval(fetchSignals, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Merge context signals with API signals
    const contextSignals = Array.isArray(state.currentSignals) ? state.currentSignals : [];
    if (contextSignals.length > 0) {
      setSignals(prev => {
        // Transform context signals to match our interface
        const transformedContextSignals = contextSignals.map((signal: unknown) => {
          const s = signal as Record<string, unknown>;
          return {
            id: (s.id as string) || Math.random().toString(),
            symbol: (s.symbol as string) || 'UNKNOWN',
            tokenAddress: (s.tokenAddress as string) || '',
            action: (s.action as 'BUY' | 'SELL') || (Math.random() > 0.5 ? 'BUY' : 'SELL'),
            confidence: (s.confidence as number) || 0.5,
            price: (s.price as number) || Math.random() * 10,
            volume: (s.volume as number) || Math.random() * 1000000,
            timestamp: (s.timestamp as number) || Date.now(),
            source: (s.source as string) || 'LIVE',
            passedFilters: (s.passedFilters as boolean) || false,
            isProcessed: (s.isProcessed as boolean) || true,
            metadata: (s.metadata as Record<string, unknown>) || {}
          };
        });

        const mergedSignals = [...transformedContextSignals, ...prev];
        // Remove duplicates and sort by timestamp
        const uniqueSignals = mergedSignals.filter((signal, index, self) => 
          index === self.findIndex(s => s.id === signal.id)
        );
        return uniqueSignals.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
      });
    }
  }, [state.currentSignals]);

  const fetchSignals = async () => {
    try {
      const response = await fetch('/api/signals');
      if (response.ok) {
        const data = await response.json();
        const apiSignals = Array.isArray(data) ? data : Array.isArray(data.signals) ? data.signals : [];
        
        // Transform API signals to match our interface
        const transformedSignals = apiSignals.map((signal: unknown) => {
          const s = signal as Record<string, unknown>;
          return {
            id: (s.id as string) || Math.random().toString(),
            symbol: (s.tokenSymbol as string) || 'UNKNOWN',
            tokenAddress: (s.tokenAddress as string) || '',
            action: (Math.random() > 0.5 ? 'BUY' : 'SELL') as 'BUY' | 'SELL',
            confidence: (s.confidence as number) || 0.5,
            price: Math.random() * 10,
            volume: Math.random() * 1000000,
            timestamp: s.createdAt ? new Date(s.createdAt as string).getTime() : Date.now(),
            source: (s.source as string) || 'API',
            passedFilters: (s.passedFilters as boolean) || false,
            isProcessed: (s.isProcessed as boolean) || false,
            metadata: {
              liquidity: s.liquidity as number,
              holderCount: s.buyerCount as number,
              priceChange24h: s.priceChange as number
            }
          };
        });
        
        setSignals(prev => {
          const mergedSignals = [...transformedSignals, ...prev];
          const uniqueSignals = mergedSignals.filter((signal, index, self) => 
            index === self.findIndex(s => s.id === signal.id)
          );
          return uniqueSignals.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
        });
      }
    } catch (error) {
      console.error('Error fetching signals:', error);
    }
  };

  // Combine context signals, API signals, and mock signals for development
  const allSignals = [
    ...state.currentSignals,
    ...signals,
    ...(process.env.NODE_ENV === 'development' ? mockSignals : [])
  ];

  // Remove duplicates and sort by timestamp
  const uniqueSignals = allSignals.filter((signal, index, self) => 
    index === self.findIndex(s => s.id === signal.id)
  ).sort((a, b) => b.timestamp - a.timestamp);

  const filteredSignals = uniqueSignals.filter(signal => {
    const s = signal as Signal;
    if (filter === 'all') return true;
    if (filter === 'buy') return s.action === 'BUY';
    if (filter === 'sell') return s.action === 'SELL';
    if (filter === 'passed') return s.passedFilters;
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold">Live Trading Signals</h1>
              <div className={`px-3 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${
                state.tradingActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  state.tradingActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                }`} />
                <span>{state.tradingActive ? 'Live' : 'Stopped'}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              {['all', 'buy', 'sell', 'passed'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption as 'all' | 'buy' | 'sell' | 'passed')}
                  className={`px-4 py-2 rounded-lg capitalize transition-all ${
                    filter === filterOption
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {filterOption}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Signals Feed */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid gap-4">
          {filteredSignals.length > 0 ? (
            filteredSignals.map((signal) => {
              const s = signal as Signal;
              return (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold">{s.symbol}</div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      s.action === 'BUY' 
                        ? 'bg-green-900/50 text-green-300 border border-green-600' 
                        : 'bg-red-900/50 text-red-300 border border-red-600'
                    }`}>
                      {s.action}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Confidence:</span>
                      <span className="font-semibold text-blue-400">
                        {Math.round(s.confidence * 100)}%
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      s.passedFilters 
                        ? 'bg-green-900/30 text-green-400' 
                        : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {s.passedFilters ? 'Passed Filters' : 'Filtered'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold">${s.price.toFixed(6)}</div>
                    <div className="text-gray-400 text-sm">
                      {new Date(s.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                {s.metadata && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {s.metadata.liquidity && (
                      <div className="bg-gray-800 p-3 rounded">
                        <div className="text-gray-400">Liquidity</div>
                        <div className="font-semibold">
                          ${(s.metadata.liquidity / 1000000).toFixed(2)}M
                        </div>
                      </div>
                    )}
                    {s.metadata.holderCount && (
                      <div className="bg-gray-800 p-3 rounded">
                        <div className="text-gray-400">Holders</div>
                        <div className="font-semibold">
                          {s.metadata.holderCount.toLocaleString()}
                        </div>
                      </div>
                    )}
                    {s.volume && (
                      <div className="bg-gray-800 p-3 rounded">
                        <div className="text-gray-400">Volume</div>
                        <div className="font-semibold">
                          ${(s.volume / 1000000).toFixed(2)}M
                        </div>
                      </div>
                    )}
                    {s.metadata.priceChange24h !== undefined && (
                      <div className="bg-gray-800 p-3 rounded">
                        <div className="text-gray-400">24h Change</div>
                        <div className={`font-semibold ${
                          s.metadata.priceChange24h > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {s.metadata.priceChange24h > 0 ? '+' : ''}
                          {s.metadata.priceChange24h.toFixed(2)}%
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <div>Source: {s.source}</div>
                  <div>Token: {s.tokenAddress.slice(0, 8)}...{s.tokenAddress.slice(-8)}</div>
                </div>
              </div>
              );
            })
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
              <div className="text-gray-400 text-lg mb-4">
                {state.tradingActive ? 'Waiting for signals...' : 'Start trading to see live signals'}
              </div>
              <div className="text-gray-500 text-sm">
                Signals will appear here as the trading bot discovers opportunities
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}