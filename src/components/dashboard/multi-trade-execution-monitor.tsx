'use client';

import { useState, useEffect } from 'react';
import { useRealTimeTrading } from '@/contexts/real-time-trading-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Play,
  ExternalLink,
  Activity
} from 'lucide-react';

interface TradeExecutionStatus {
  id: string;
  tokenSymbol: string;
  type: 'BUY' | 'SELL';
  amount: number;
  targetPrice: number;
  currentPrice: number;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  progress: number;
  startTime: number;
  estimatedCompletion?: number;
  txHash?: string;
  pnl?: number;
}

const MultiTradeExecutionMonitor = () => {
  const { state } = useRealTimeTrading();
  const [executingTrades, setExecutingTrades] = useState<TradeExecutionStatus[]>([]);

  useEffect(() => {
    // Convert recent trades to execution status format
    const tradeStatuses: TradeExecutionStatus[] = state.recentTrades.map(trade => ({
      id: trade.id,
      tokenSymbol: trade.tokenSymbol,
      type: trade.type,
      amount: trade.amount,
      targetPrice: trade.price || 0,
      currentPrice: trade.price || 0,
      status: trade.status,
      progress: trade.status === 'COMPLETED' ? 100 : trade.status === 'EXECUTING' ? 75 : trade.status === 'FAILED' ? 0 : 25,
      startTime: trade.timestamp,
      txHash: trade.txHash,
      pnl: trade.status === 'COMPLETED' ? 50 : trade.status === 'FAILED' ? -25 : undefined
    }));

    setExecutingTrades(tradeStatuses.slice(0, 6)); // Show max 6 concurrent trades
  }, [state.recentTrades]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'FAILED':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'EXECUTING':
        return <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'FAILED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'EXECUTING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'FAILED':
        return 'bg-red-500';
      case 'EXECUTING':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const calculateElapsedTime = (startTime: number) => {
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed < 60) return `${elapsed.toFixed(0)}s`;
    if (elapsed < 3600) return `${(elapsed / 60).toFixed(1)}m`;
    return `${(elapsed / 3600).toFixed(1)}h`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-purple-500" />
          <span>Multi-Trade Execution Monitor</span>
          <Badge variant="outline" className="ml-auto">
            {executingTrades.filter(t => t.status === 'EXECUTING').length} Executing
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {executingTrades.map((trade) => (
            <div 
              key={trade.id} 
              className={`p-4 rounded-lg border ${getStatusColor(trade.status)}`}
            >
              {/* Trade Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(trade.status)}
                  <div>
                    <div className="font-medium flex items-center space-x-2">
                      <span>{trade.tokenSymbol}</span>
                      <Badge 
                        variant={trade.type === 'BUY' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {trade.type}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      {trade.amount.toFixed(4)} tokens • {calculateElapsedTime(trade.startTime)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(trade.targetPrice)}</div>
                  <div className="text-xs text-gray-600">{trade.status}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Execution Progress</span>
                  <span>{trade.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(trade.status)}`}
                    style={{ width: `${trade.progress}%` }}
                  />
                </div>
              </div>

              {/* Trade Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-600">Current Price:</span>
                  <div className="font-medium">{formatCurrency(trade.currentPrice)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Price Change:</span>
                  <div className={`font-medium flex items-center ${
                    trade.currentPrice >= trade.targetPrice ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trade.currentPrice >= trade.targetPrice ? 
                      <TrendingUp className="w-3 h-3 mr-1" /> : 
                      <TrendingDown className="w-3 h-3 mr-1" />
                    }
                    {((trade.currentPrice - trade.targetPrice) / trade.targetPrice * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* P&L and Actions */}
              {trade.status === 'COMPLETED' && trade.pnl && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-600">Realized P&L:</span>
                    <div className={`font-medium ${trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(trade.pnl)}
                    </div>
                  </div>
                  {trade.txHash && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => window.open(`https://solscan.io/tx/${trade.txHash}`, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Tx
                    </Button>
                  )}
                </div>
              )}

              {trade.status === 'EXECUTING' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      Estimated completion: {trade.estimatedCompletion ? 
                        new Date(trade.estimatedCompletion).toLocaleTimeString() : 
                        'Calculating...'
                      }
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <Play className="w-3 h-3 animate-pulse" />
                      <span className="text-xs font-medium">LIVE</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {executingTrades.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No active trades</p>
              <p className="text-xs text-gray-400 mt-1">
                Trades will appear here when the bot starts executing
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiTradeExecutionMonitor;
