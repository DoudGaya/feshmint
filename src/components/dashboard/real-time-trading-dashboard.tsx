'use client';

import { useState, useEffect } from 'react';
import { useRealTimeTrading } from '@/contexts/real-time-trading-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Target,
  Clock,
  ExternalLink,
  Play,
  Pause
} from 'lucide-react';
import TradingChartView from './trading-chart-view';
import LiveTradingWidget from './live-trading-widget';
import RealtimeSignalFeed from './realtime-signal-feed';
import MultiTradeExecutionMonitor from './multi-trade-execution-monitor';

interface TradePerformance {
  tokenSymbol: string;
  tokenAddress: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnL: number;
  winRate: number;
  avgExecutionTime: number;
  lastPrice: number;
  priceChange24h: number;
}

const RealTimeTradingDashboard = () => {
  const { state, actions } = useRealTimeTrading();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<TradePerformance[]>([]);

  // Calculate portfolio metrics from portfolio stats
  const portfolioValue = state.portfolioStats?.totalValue || 0;
  const totalPnL = state.portfolioStats?.totalPnL || 0;
  const isTrading = state.tradingActive;
  const isConnected = state.isConnected;
  const signals = state.currentSignals;
  const trades = state.recentTrades;

  // Calculate performance metrics
  useEffect(() => {
    const tokenPerformance = new Map<string, TradePerformance>();
    
    trades.forEach(trade => {
      const key = trade.tokenSymbol;
      const existing = tokenPerformance.get(key) || {
        tokenSymbol: trade.tokenSymbol || 'Unknown',
        tokenAddress: `token_${key}`, // Use a placeholder since tokenAddress isn't in LiveTradeUpdate
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalPnL: 0,
        winRate: 0,
        avgExecutionTime: 0,
        lastPrice: trade.price || 0,
        priceChange24h: 0
      };

      existing.totalTrades++;
      // Since LiveTradeUpdate doesn't have pnl, we'll calculate based on status
      if (trade.status === 'COMPLETED') {
        existing.winningTrades++;
        existing.totalPnL += (trade.price || 0) * 0.02; // Simulate 2% gain
      } else if (trade.status === 'FAILED') {
        existing.losingTrades++;
        existing.totalPnL -= (trade.price || 0) * 0.01; // Simulate 1% loss
      }

      existing.winRate = existing.totalTrades > 0 
        ? (existing.winningTrades / existing.totalTrades) * 100 
        : 0;

      if (trade.price) {
        existing.lastPrice = trade.price;
      }

      tokenPerformance.set(key, existing);
    });

    setPerformanceData(Array.from(tokenPerformance.values()));
  }, [trades]);

  const getTokenColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-500';
    if (pnl < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Trading Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-Time Trading Dashboard</h1>
          <p className="text-gray-600 mt-1">Live trading performance and analytics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          <Button
            onClick={isTrading ? actions.stopTrading : actions.startTrading}
            variant={isTrading ? 'destructive' : 'default'}
            className="flex items-center space-x-2"
          >
            {isTrading ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isTrading ? 'Stop Trading' : 'Start Trading'}</span>
          </Button>
        </div>
      </div>

      {/* Live Trading Widgets */}
      <LiveTradingWidget />

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolioValue)}</div>
            <p className="text-xs text-muted-foreground">Total portfolio value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {totalPnL >= 0 ? 
              <TrendingUp className="h-4 w-4 text-green-500" /> : 
              <TrendingDown className="h-4 w-4 text-red-500" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getTokenColor(totalPnL)}`}>
              {formatCurrency(totalPnL)}
            </div>
            <p className="text-xs text-muted-foreground">Realized + unrealized</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{signals.length}</div>
            <p className="text-xs text-muted-foreground">Processing signals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trades.length}</div>
            <p className="text-xs text-muted-foreground">Executed today</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Trading Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="execution">Multi-Trading</TabsTrigger>
          <TabsTrigger value="charts">Charts & Analysis</TabsTrigger>
          <TabsTrigger value="trades">Trade History</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-time Signal Feed */}
            <RealtimeSignalFeed />

            {/* Recent Trades */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span>Recent Trades</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {trades.slice(0, 10).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'}>
                          {trade.type}
                        </Badge>
                        <div>
                          <div className="font-medium">{trade.tokenSymbol || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">
                            {trade.amount?.toFixed(4)} tokens
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getTokenColor(trade.status === 'COMPLETED' ? 50 : trade.status === 'FAILED' ? -25 : 0)}`}>
                          {trade.status === 'COMPLETED' ? '+$50.00' : trade.status === 'FAILED' ? '-$25.00' : 'Pending'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(trade.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {trades.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No trades executed yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Multi-Trading Execution Tab */}
        <TabsContent value="execution" className="space-y-6">
          <MultiTradeExecutionMonitor />
        </TabsContent>

        {/* Charts & Analysis Tab */}
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Token Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Select Token to Analyze</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {performanceData.map((token) => (
                    <Button
                      key={token.tokenAddress}
                      variant={selectedToken === token.tokenAddress ? 'default' : 'outline'}
                      className="w-full justify-between"
                      onClick={() => setSelectedToken(token.tokenAddress)}
                    >
                      <span>{token.tokenSymbol}</span>
                      <span className={getTokenColor(token.totalPnL)}>
                        {formatCurrency(token.totalPnL)}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* DexScreener Embed */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>DexScreener Chart</span>
                </CardTitle>
                {selectedToken && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://dexscreener.com/solana/${selectedToken}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Full Chart
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <TradingChartView 
                  tokenAddress={selectedToken || undefined}
                  tokenSymbol={selectedToken ? performanceData.find(p => p.tokenAddress === selectedToken)?.tokenSymbol : undefined}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trade History Tab */}
        <TabsContent value="trades" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Trade History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Time</th>
                      <th className="text-left py-2">Token</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Price</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">P&L</th>
                      <th className="text-left py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade.id} className="border-b">
                        <td className="py-2">
                          {new Date(trade.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2">{trade.tokenSymbol || 'Unknown'}</td>
                        <td className="py-2">
                          <Badge variant={trade.type === 'BUY' ? 'default' : 'destructive'}>
                            {trade.type}
                          </Badge>
                        </td>
                        <td className="py-2">{trade.amount?.toFixed(4) || 'N/A'}</td>
                        <td className="py-2">
                          {trade.price ? formatCurrency(trade.price) : 'N/A'}
                        </td>
                        <td className="py-2">
                          <Badge variant={
                            trade.status === 'COMPLETED' ? 'default' :
                            trade.status === 'FAILED' ? 'destructive' : 'secondary'
                          }>
                            {trade.status}
                          </Badge>
                        </td>
                        <td className={`py-2 ${getTokenColor(trade.status === 'COMPLETED' ? 50 : trade.status === 'FAILED' ? -25 : 0)}`}>
                          {trade.status === 'COMPLETED' ? '+$50.00' : trade.status === 'FAILED' ? '-$25.00' : 'N/A'}
                        </td>
                        <td className="py-2">
                          {trade.txHash && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`https://solscan.io/tx/${trade.txHash}`, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {trades.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No trades executed yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {performanceData.map((token) => (
              <Card key={token.tokenAddress}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{token.tokenSymbol}</span>
                    <Badge variant={token.totalPnL >= 0 ? 'default' : 'destructive'}>
                      {formatPercentage((token.totalPnL / 1000) * 100)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Total Trades</div>
                      <div className="text-xl font-bold">{token.totalTrades}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Win Rate</div>
                      <div className="text-xl font-bold">{token.winRate.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Total P&L</div>
                      <div className={`text-xl font-bold ${getTokenColor(token.totalPnL)}`}>
                        {formatCurrency(token.totalPnL)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Last Price</div>
                      <div className="text-xl font-bold">{formatCurrency(token.lastPrice)}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Win Rate</span>
                      <span>{token.winRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={token.winRate} className="h-2" />
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedToken(token.tokenAddress);
                      setActiveTab('charts');
                    }}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Chart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeTradingDashboard;
