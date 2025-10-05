'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign,
  CheckCircle,
  Timer,
  Target,
  Shield,
  Zap
} from 'lucide-react';

interface RealTimePosition {
  id: string;
  tokenSymbol: string;
  tokenAddress: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  stopLoss: number;
  takeProfits: {
    tp1: { price: number; hit: boolean; percentage: number };
    tp2: { price: number; hit: boolean; percentage: number };
    tp3: { price: number; hit: boolean; percentage: number; trailing: boolean };
  };
  trailingStopLoss: {
    enabled: boolean;
    currentStop: number;
    armPrice: number;
    armed: boolean;
  };
  confidence: number;
  riskScore: number;
  timeInPosition: number;
  lastUpdate: number;
}

interface RealTimeTrade {
  id: string;
  tokenSymbol: string;
  action: 'BUY' | 'SELL';
  amount: number;
  price: number;
  status: 'PENDING' | 'FILLED' | 'FAILED';
  timestamp: number;
  executionTime?: number;
  slippage?: number;
  mevProtected: boolean;
  confidence: number;
}

interface PortfolioMetrics {
  totalValue: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  totalPnL: number;
  totalPnLPercent: number;
  winRate: number;
  avgHoldTime: number;
  sharpeRatio: number;
  maxDrawdown: number;
  portfolioHeat: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
}

interface SignalQuality {
  totalSignals: number;
  processedSignals: number;
  rejectedSignals: number;
  avgConfidence: number;
  avgLatency: number;
  sources: {
    company: { count: number; accuracy: number };
    external: { count: number; accuracy: number };
  };
}

export default function RealTimeMonitoringDashboard() {
  const [positions, setPositions] = useState<RealTimePosition[]>([]);
  const [recentTrades, setRecentTrades] = useState<RealTimeTrade[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics>({
    totalValue: 5000,
    dailyPnL: 127.50,
    dailyPnLPercent: 2.55,
    totalPnL: 324.75,
    totalPnLPercent: 6.95,
    winRate: 72.5,
    avgHoldTime: 2.3,
    sharpeRatio: 1.85,
    maxDrawdown: 12.4,
    portfolioHeat: 0.35,
    riskLevel: 'MEDIUM'
  });
  
  const [signalQuality, setSignalQuality] = useState<SignalQuality>({
    totalSignals: 1247,
    processedSignals: 892,
    rejectedSignals: 355,
    avgConfidence: 0.74,
    avgLatency: 0.23,
    sources: {
      company: { count: 523, accuracy: 0.78 },
      external: { count: 369, accuracy: 0.69 }
    }
  });

  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate price updates
      setPositions(prev => prev.map(pos => ({
        ...pos,
        currentPrice: pos.currentPrice * (1 + (Math.random() - 0.5) * 0.02),
        lastUpdate: Date.now()
      })));
      
      setLastUpdate(Date.now());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Sample data
  useEffect(() => {
    setPositions([
      {
        id: '1',
        tokenSymbol: 'BONK',
        tokenAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        amount: 50000,
        entryPrice: 0.000012,
        currentPrice: 0.000014,
        unrealizedPnL: 8.33,
        unrealizedPnLPercent: 16.67,
        stopLoss: 0.000011,
        takeProfits: {
          tp1: { price: 0.000014, hit: true, percentage: 33 },
          tp2: { price: 0.000016, hit: false, percentage: 33 },
          tp3: { price: 0.000020, hit: false, percentage: 34, trailing: true }
        },
        trailingStopLoss: {
          enabled: true,
          currentStop: 0.000012,
          armPrice: 0.0000126,
          armed: true
        },
        confidence: 0.82,
        riskScore: 0.25,
        timeInPosition: 45,
        lastUpdate: Date.now()
      },
      {
        id: '2',
        tokenSymbol: 'WIF',
        tokenAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        amount: 100,
        entryPrice: 2.45,
        currentPrice: 2.38,
        unrealizedPnL: -7.00,
        unrealizedPnLPercent: -2.86,
        stopLoss: 2.20,
        takeProfits: {
          tp1: { price: 2.82, hit: false, percentage: 33 },
          tp2: { price: 3.19, hit: false, percentage: 33 },
          tp3: { price: 3.92, hit: false, percentage: 34, trailing: true }
        },
        trailingStopLoss: {
          enabled: true,
          currentStop: 2.20,
          armPrice: 2.57,
          armed: false
        },
        confidence: 0.69,
        riskScore: 0.42,
        timeInPosition: 12,
        lastUpdate: Date.now()
      }
    ]);

    setRecentTrades([
      {
        id: '1',
        tokenSymbol: 'BONK',
        action: 'BUY',
        amount: 50000,
        price: 0.000012,
        status: 'FILLED',
        timestamp: Date.now() - 2700000,
        executionTime: 1.2,
        slippage: 0.15,
        mevProtected: true,
        confidence: 0.82
      },
      {
        id: '2',
        tokenSymbol: 'WIF',
        action: 'BUY',
        amount: 100,
        price: 2.45,
        status: 'FILLED',
        timestamp: Date.now() - 720000,
        executionTime: 0.8,
        slippage: 0.08,
        mevProtected: true,
        confidence: 0.69
      }
    ]);
  }, []);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className={`p-4 rounded-lg border ${isConnected ? 'border-green-500/30 bg-green-900/20' : 'border-red-500/30 bg-red-900/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-white font-medium">
              {isConnected ? 'Live Trading Active' : 'Connection Lost'}
            </span>
          </div>
          <span className="text-gray-400 text-sm">
            Last update: {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Portfolio Value</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(portfolioMetrics.totalValue)}
              </p>
              <p className={`text-sm flex items-center ${
                portfolioMetrics.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {portfolioMetrics.dailyPnL >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {formatCurrency(portfolioMetrics.dailyPnL)} ({portfolioMetrics.dailyPnLPercent.toFixed(2)}%)
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Win Rate</p>
              <p className="text-2xl font-bold text-white">{portfolioMetrics.winRate}%</p>
              <p className="text-sm text-emerald-400">
                Sharpe: {portfolioMetrics.sharpeRatio}
              </p>
            </div>
            <Target className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Portfolio Heat</p>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-700 rounded-full">
                  <div 
                    className={`h-2 rounded-full ${
                      portfolioMetrics.portfolioHeat < 0.3 ? 'bg-green-400' :
                      portfolioMetrics.portfolioHeat < 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${portfolioMetrics.portfolioHeat * 100}%` }}
                  />
                </div>
                <span className="text-white text-sm">{(portfolioMetrics.portfolioHeat * 100).toFixed(1)}%</span>
              </div>
              <p className={`text-sm ${
                portfolioMetrics.riskLevel === 'LOW' ? 'text-green-400' :
                portfolioMetrics.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {portfolioMetrics.riskLevel} Risk
              </p>
            </div>
            <Shield className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Positions</p>
              <p className="text-2xl font-bold text-white">{positions.length}</p>
              <p className="text-sm text-purple-400">
                Avg Hold: {formatTime(portfolioMetrics.avgHoldTime * 60)}
              </p>
            </div>
            <Activity className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Active Positions */}
      <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Active Positions
        </h2>
        <div className="space-y-4">
          {positions.map(position => (
            <div key={position.id} className="bg-gray-800/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-white font-semibold">{position.tokenSymbol}</div>
                  <div className="text-gray-400 text-sm">{position.amount.toLocaleString()} tokens</div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    position.confidence > 0.7 ? 'bg-green-900/50 text-green-300' : 
                    position.confidence > 0.5 ? 'bg-yellow-900/50 text-yellow-300' : 'bg-red-900/50 text-red-300'
                  }`}>
                    {Math.round(position.confidence * 100)}% Confidence
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${
                    position.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(position.unrealizedPnL)}
                  </div>
                  <div className={`text-sm ${
                    position.unrealizedPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {position.unrealizedPnLPercent >= 0 ? '+' : ''}{position.unrealizedPnLPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Entry Price</p>
                  <p className="text-white">${position.entryPrice.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Current Price</p>
                  <p className="text-white">${position.currentPrice.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Stop Loss</p>
                  <p className="text-red-400">${position.stopLoss.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Time in Position</p>
                  <p className="text-white">{formatTime(position.timeInPosition)}</p>
                </div>
              </div>

              {/* Take Profit Levels */}
              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">Take Profit Levels</p>
                <div className="flex space-x-4">
                  {Object.entries(position.takeProfits).map(([key, tp]) => (
                    <div key={key} className={`flex items-center space-x-2 px-3 py-1 rounded ${
                      tp.hit ? 'bg-green-900/50 border border-green-500/30' : 'bg-gray-700/50'
                    }`}>
                      {tp.hit ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <Timer className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-white text-sm">
                        {key.toUpperCase()}: ${tp.price.toFixed(6)}
                      </span>
                    {tp.percentage && (
                      <>
                        {('trailing' in tp && (tp as { trailing?: boolean }).trailing) && (
                          <Zap className="h-3 w-3 text-yellow-400" />
                        )}
                      </>
                    )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Trailing Stop Loss */}
              {position.trailingStopLoss.enabled && (
                <div className="mt-3 flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    position.trailingStopLoss.armed ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm text-gray-400">
                    Trailing Stop: ${position.trailingStopLoss.currentStop.toFixed(6)}
                    {position.trailingStopLoss.armed ? ' (Armed)' : ' (Waiting)'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Trades</h2>
          <div className="space-y-3">
            {recentTrades.map(trade => (
              <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    trade.action === 'BUY' ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <div>
                    <p className="text-white font-medium">{trade.tokenSymbol}</p>
                    <p className="text-gray-400 text-sm">
                      {trade.action} {trade.amount.toLocaleString()} @ ${trade.price.toFixed(6)}
                    </p>
                  </div>
                  {trade.mevProtected && (
                    <Shield className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                <div className="text-right">
                  <div className={`text-sm px-2 py-1 rounded ${
                    trade.status === 'FILLED' ? 'bg-green-900/50 text-green-300' :
                    trade.status === 'PENDING' ? 'bg-yellow-900/50 text-yellow-300' :
                    'bg-red-900/50 text-red-300'
                  }`}>
                    {trade.status}
                  </div>
                  {trade.executionTime && (
                    <p className="text-gray-400 text-xs mt-1">
                      {trade.executionTime}s • {trade.slippage}% slip
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signal Quality Metrics */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-emerald-800/30 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Signal Quality</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Signals Processed</span>
              <span className="text-white font-semibold">
                {signalQuality.processedSignals}/{signalQuality.totalSignals}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Avg Confidence</span>
              <span className="text-emerald-400 font-semibold">
                {(signalQuality.avgConfidence * 100).toFixed(1)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Avg Latency</span>
              <span className="text-blue-400 font-semibold">
                {signalQuality.avgLatency}s
              </span>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-white font-medium mb-3">Signal Sources</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Company Signals</span>
                  <div className="text-right">
                    <div className="text-white font-semibold">{signalQuality.sources.company.count}</div>
                    <div className="text-emerald-400 text-sm">
                      {(signalQuality.sources.company.accuracy * 100).toFixed(1)}% accuracy
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">External Signals</span>
                  <div className="text-right">
                    <div className="text-white font-semibold">{signalQuality.sources.external.count}</div>
                    <div className="text-blue-400 text-sm">
                      {(signalQuality.sources.external.accuracy * 100).toFixed(1)}% accuracy
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
