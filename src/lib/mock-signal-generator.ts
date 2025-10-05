import { EventEmitter } from 'events';
import { RealTimeSignal } from './websocket-manager';

export class MockSignalGenerator extends EventEmitter {
  private isRunning = false;
  private interval?: NodeJS.Timeout;
  private signalCount = 0;

  private mockTokens = [
    { symbol: 'PEPE', address: '6GCL6pT1j1JoC4k4rH9PV9nF1F8F5VJ9L2kV8N3mH8eM', name: 'Pepe Coin' },
    { symbol: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', name: 'Bonk' },
    { symbol: 'WIF', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', name: 'Dogwifhat' },
    { symbol: 'SAMO', address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', name: 'Samoyedcoin' },
    { symbol: 'COPE', address: '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh', name: 'Cope' }
  ];

  private signalSources = ['BIRDEYE', 'DEXSCREENER', 'COMPANY', 'SOLANA_TRACKER'];

  constructor() {
    super();
  }

  start(): void {
    if (this.isRunning) {
      console.log('⚠️ Mock signal generator is already running');
      return;
    }

    console.log('🎯 Starting mock signal generator...');
    this.isRunning = true;

    // Generate signals every 3-8 seconds
    const generateSignal = () => {
      if (this.isRunning) {
        this.generateRandomSignal();
        
        // Schedule next signal with random interval
        const nextInterval = Math.random() * 5000 + 3000; // 3-8 seconds
        this.interval = setTimeout(generateSignal, nextInterval);
      }
    };

    generateSignal();
  }

  stop(): void {
    console.log('🛑 Stopping mock signal generator...');
    this.isRunning = false;
    
    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = undefined;
    }
  }

  private generateRandomSignal(): void {
    const token = this.mockTokens[Math.floor(Math.random() * this.mockTokens.length)];
    const source = this.signalSources[Math.floor(Math.random() * this.signalSources.length)];
    const action = Math.random() > 0.6 ? 'BUY' : 'SELL'; // 60% buy signals
    
    // Generate realistic price based on token
    const basePrice = this.getBasePriceForToken(token.symbol);
    const priceVariation = (Math.random() - 0.5) * 0.2; // ±20% variation
    const price = basePrice * (1 + priceVariation);
    
    // Generate confidence based on action and randomness
    const confidence = action === 'BUY' 
      ? Math.random() * 0.4 + 0.5  // 0.5-0.9 for buy
      : Math.random() * 0.6 + 0.2; // 0.2-0.8 for sell
    
    // Generate unique ID with timestamp, counter, and random component
    const uniqueId = `mock-${++this.signalCount}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const signal: RealTimeSignal = {
      id: uniqueId,
      symbol: token.symbol,
      tokenAddress: token.address,
      action,
      confidence,
      price,
      volume: Math.random() * 1000000 + 50000, // $50K - $1M volume
      timestamp: Date.now(),
      source: source as 'BIRDEYE' | 'DEXSCREENER' | 'COMPANY' | 'SOLANA_TRACKER',
      metadata: {
        marketCap: Math.random() * 100000000 + 1000000, // $1M - $100M
        liquidity: Math.random() * 5000000 + 100000, // $100K - $5M
        holderCount: Math.floor(Math.random() * 10000 + 500),
        priceChange24h: (Math.random() - 0.5) * 60, // ±30%
        rugRisk: Math.random() * 0.3, // 0-30% rug risk
        devWalletPercent: Math.random() * 15 // 0-15% dev wallet
      }
    };

    console.log(`📡 Generated mock signal: ${signal.symbol} ${signal.action} - Confidence: ${(signal.confidence * 100).toFixed(0)}%`);
    this.emit('signal', signal);
  }

  private getBasePriceForToken(symbol: string): number {
    // Mock base prices for different tokens
    const basePrices: Record<string, number> = {
      'PEPE': 0.000012,
      'BONK': 0.000019,
      'WIF': 2.45,
      'SAMO': 0.028,
      'COPE': 0.15
    };
    
    return basePrices[symbol] || Math.random() * 10 + 0.001;
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

// Singleton instance
let mockGenerator: MockSignalGenerator | null = null;

export function getMockSignalGenerator(): MockSignalGenerator {
  if (!mockGenerator) {
    mockGenerator = new MockSignalGenerator();
  }
  return mockGenerator;
}
