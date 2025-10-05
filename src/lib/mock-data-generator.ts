// Mock data generator for development
export const generateMockSignal = () => {
  const tokens = ['SOL', 'BONK', 'WIF', 'PEPE', 'ORCA', 'RAY', 'USDC'];
  const addresses = [
    'So11111111111111111111111111111111111111112',
    'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    '6GCL6pT1j1JoC4k4rH9PV9nF1F8F5VJ9L2kV8N3mH8eM',
    'AKMJRRRfDbj7kJ3GhJBvKaJr9cYzZzHhvJdh7sdJhg8V',
    'AKMJRRRfDbj7kJ3GhJBvKaJr9cYzZzHhvJdh7sdJhg9V',
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  ];
  
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  const address = addresses[Math.floor(Math.random() * addresses.length)];
  const action = Math.random() > 0.5 ? 'BUY' : 'SELL' as 'BUY' | 'SELL';
  
  return {
    id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    symbol: token,
    tokenAddress: address,
    action,
    confidence: 0.6 + Math.random() * 0.4, // 60-100%
    price: Math.random() * 100,
    volume: 500000 + Math.random() * 2000000,
    timestamp: Date.now(),
    source: ['BIRDEYE', 'DEXSCREENER', 'LIVE_FEED'][Math.floor(Math.random() * 3)],
    passedFilters: Math.random() > 0.3, // 70% pass filters
    isProcessed: true,
    metadata: {
      marketCap: 1000000 + Math.random() * 50000000,
      liquidity: 100000 + Math.random() * 5000000,
      holderCount: Math.floor(1000 + Math.random() * 50000),
      priceChange24h: -20 + Math.random() * 40, // -20% to +20%
      rugRisk: Math.random() * 0.3 // 0-30% rug risk
    }
  };
};

export const generateMockTrade = () => {
  const tokens = ['SOL', 'BONK', 'WIF', 'PEPE', 'ORCA', 'RAY'];
  const token = tokens[Math.floor(Math.random() * tokens.length)];
  const action = Math.random() > 0.5 ? 'BUY' : 'SELL' as 'BUY' | 'SELL';
  
  return {
    id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    symbol: token,
    action,
    amount: 50 + Math.random() * 1000,
    price: Math.random() * 100,
    timestamp: Date.now(),
    pnl: Math.random() > 0.6 ? (Math.random() - 0.5) * 200 : undefined, // Some trades are pending
    status: Math.random() > 0.3 ? 'EXECUTED' : 'PENDING'
  };
};

// Development-only signal generator
let signalInterval: NodeJS.Timeout | null = null;

export const startMockSignalGeneration = (callback: (signal: ReturnType<typeof generateMockSignal>) => void) => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    signalInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        callback(generateMockSignal());
      }
    }, 3000); // Every 3 seconds
  }
};

export const stopMockSignalGeneration = () => {
  if (signalInterval) {
    clearInterval(signalInterval);
    signalInterval = null;
  }
};

export const generateMockStats = () => ({
  totalPnl: -100 + Math.random() * 500, // -$100 to +$400
  totalTrades: Math.floor(10 + Math.random() * 50),
  winRate: 40 + Math.random() * 40, // 40-80%
  activeTrades: Math.floor(Math.random() * 5)
});
