'use client';

import { useState, useEffect } from 'react';
import { useRealTimeTrading } from '@/contexts/real-time-trading-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Radio,
  Clock,
  ExternalLink,
  Zap
} from 'lucide-react';

const RealtimeSignalFeed = () => {
  const { state } = useRealTimeTrading();
  const [animatingSignals, setAnimatingSignals] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Animate new signals
    if (state.currentSignals.length > 0) {
      const latest = state.currentSignals[0];
      setAnimatingSignals(prev => new Set([...prev, latest.id]));
      
      // Remove animation after 3 seconds
      setTimeout(() => {
        setAnimatingSignals(prev => {
          const newSet = new Set(prev);
          newSet.delete(latest.id);
          return newSet;
        });
      }, 3000);
    }
  }, [state.currentSignals]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(amount);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'BIRDEYE':
        return '👁️';
      case 'DEXSCREENER':
        return '📊';
      case 'COMPANY':
        return '🏢';
      case 'JUPITER':
        return '🪐';
      default:
        return '📡';
    }
  };

  return (
    <Card className="h-96">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Radio className="w-5 h-5 text-blue-500" />
          <span>Real-Time Signal Feed</span>
          <Badge variant="outline" className="ml-auto">
            {state.currentSignals.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2 max-h-80 overflow-y-auto px-6 pb-6">
          {state.currentSignals.map((signal) => (
            <div 
              key={signal.id} 
              className={`p-3 rounded-lg border transition-all duration-500 ${
                animatingSignals.has(signal.id) 
                  ? 'bg-blue-50 border-blue-200 shadow-md transform scale-[1.02]' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getSourceIcon(signal.source)}</span>
                  <div>
                    <div className="font-medium flex items-center space-x-2">
                      <span>{signal.symbol}</span>
                      <Badge 
                        variant={signal.action === 'BUY' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {signal.action}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">{signal.source}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(signal.price)}</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(signal.timestamp)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(signal.confidence)}`}>
                  {(signal.confidence * 100).toFixed(1)}% Confidence
                </div>
                <div className="text-xs text-gray-600">
                  Vol: {signal.volume.toLocaleString()}
                </div>
              </div>

              {signal.metadata && (
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                  {signal.metadata.marketCap && (
                    <div>Cap: ${(signal.metadata.marketCap / 1000000).toFixed(1)}M</div>
                  )}
                  {signal.metadata.liquidity && (
                    <div>Liq: ${(signal.metadata.liquidity / 1000000).toFixed(1)}M</div>
                  )}
                  {signal.metadata.priceChange24h && (
                    <div className={signal.metadata.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                      24h: {signal.metadata.priceChange24h >= 0 ? '+' : ''}{signal.metadata.priceChange24h.toFixed(1)}%
                    </div>
                  )}
                  {signal.metadata.rugRisk && (
                    <div className={signal.metadata.rugRisk > 0.5 ? 'text-red-600' : 'text-green-600'}>
                      Risk: {(signal.metadata.rugRisk * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => window.open(`https://dexscreener.com/solana/${signal.tokenAddress}`, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Chart
                </Button>
                
                {animatingSignals.has(signal.id) && (
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-medium">NEW</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {state.currentSignals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Radio className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Waiting for trading signals...</p>
              <p className="text-xs text-gray-400 mt-1">
                {state.tradingActive ? 'Bot is active and monitoring' : 'Start trading to see signals'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeSignalFeed;
