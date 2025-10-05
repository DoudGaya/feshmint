'use client';

import { useState, useEffect } from 'react';
import { useRealTimeTrading } from '@/contexts/real-time-trading-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const LiveTradingWidget = () => {
  const { state } = useRealTimeTrading();
  const [latestTrade, setLatestTrade] = useState<typeof state.recentTrades[0] | null>(null);
  const [sessionPnL, setSessionPnL] = useState(0);
  const [tradingStreak, setTradingStreak] = useState(0);

  useEffect(() => {
    if (state.recentTrades.length > 0) {
      const latest = state.recentTrades[0];
      setLatestTrade(latest);
      
      // Calculate session PnL (simulated)
      const completedTrades = state.recentTrades.filter(t => t.status === 'COMPLETED');
      const failedTrades = state.recentTrades.filter(t => t.status === 'FAILED');
      const pnl = (completedTrades.length * 50) - (failedTrades.length * 25);
      setSessionPnL(pnl);
      
      // Calculate winning streak
      let streak = 0;
      for (const trade of state.recentTrades) {
        if (trade.status === 'COMPLETED') {
          streak++;
        } else {
          break;
        }
      }
      setTradingStreak(streak);
    }
  }, [state.recentTrades]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
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
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPnLColor = (amount: number) => {
    if (amount > 0) return 'text-green-500';
    if (amount < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Live Trade Status */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Live Trade Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestTrade ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{latestTrade.tokenSymbol}</span>
                <Badge variant={latestTrade.type === 'BUY' ? 'default' : 'destructive'}>
                  {latestTrade.type}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(latestTrade.status)}
                  <span className="text-sm">{latestTrade.status}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Amount</span>
                <span className="text-sm font-medium">{latestTrade.amount?.toFixed(4) || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Price</span>
                <span className="text-sm font-medium">
                  {latestTrade.price ? formatCurrency(latestTrade.price) : 'N/A'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No trades yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session P&L */}
      <Card className={`border-l-4 ${sessionPnL >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Session P&L</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className={`text-2xl font-bold ${getPnLColor(sessionPnL)}`}>
              {formatCurrency(sessionPnL)}
            </div>
            <div className="flex items-center space-x-2">
              {sessionPnL >= 0 ? 
                <TrendingUp className="w-4 h-4 text-green-500" /> : 
                <TrendingDown className="w-4 h-4 text-red-500" />
              }
              <span className={`text-sm ${getPnLColor(sessionPnL)}`}>
                {sessionPnL >= 0 ? '+' : ''}{((sessionPnL / 1000) * 100).toFixed(2)}%
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Today&apos;s session
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Performance */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Win Streak</span>
              <span className="text-lg font-bold text-purple-600">{tradingStreak}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Trades</span>
              <span className="text-sm font-medium">{state.recentTrades.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Win Rate</span>
              <span className="text-sm font-medium text-green-600">
                {state.recentTrades.length > 0 
                  ? ((state.recentTrades.filter(t => t.status === 'COMPLETED').length / state.recentTrades.length) * 100).toFixed(1)
                  : '0'
                }%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <Badge variant={state.tradingActive ? 'default' : 'secondary'}>
                {state.tradingActive ? 'ACTIVE' : 'IDLE'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveTradingWidget;
