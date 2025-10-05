import { EventEmitter } from 'events';
import { getMockSignalGenerator } from './mock-signal-generator';

export interface RealTimeSignal {
  id: string;
  symbol: string;
  tokenAddress: string;
  action: 'BUY' | 'SELL';
  confidence: number;
  price: number;
  volume: number;
  timestamp: number;
  source: 'BIRDEYE' | 'DEXSCREENER' | 'SOLANA_TRACKER' | 'JUPITER' | 'COMPANY';
  metadata: {
    marketCap?: number;
    liquidity?: number;
    holderCount?: number;
    priceChange24h?: number;
    rugRisk?: number;
    devWalletPercent?: number;
  };
}

export interface LiveTradeUpdate {
  id: string;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  tokenSymbol: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price?: number;
  txHash?: string;
  timestamp: number;
  error?: string;
}

export interface PortfolioUpdate {
  totalValue: number;
  dailyPnL: number;
  totalPnL: number;
  activePositions: number;
  tradesToday: number;
  winRate: number;
  timestamp: number;
}

export class WebSocketManager extends EventEmitter {
  private birdeyeWs?: WebSocket;
  private dexScreenerWs?: WebSocket;
  private internalWs?: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnected = false;

  constructor() {
    super();
    
    // Initialize real connections first, with fallback to mock data
    this.initializeConnections();
  }

  private initializeMockSignals() {
    console.log('🎯 Fallback: Using mock signal generator for demo purposes...');
    
    const mockGenerator = getMockSignalGenerator();
    
    mockGenerator.on('signal', (signal: RealTimeSignal) => {
      this.emit('signal', signal);
    });
    
    mockGenerator.start();
  }

  private initializeConnections() {
    console.log('🔌 Initializing real-time data connections...');
    
    // Try to connect to real data sources
    this.connectToBirdeye();
    this.connectToDexScreener();
    this.connectToInternalWs();
    
    // Set up fallback timer - if no real data received in 10 seconds, use mock data
    setTimeout(() => {
      if (!this.isConnected) {
        console.log('⚠️ No real data connections established, using mock data as fallback');
        this.initializeMockSignals();
      }
    }, 10000);
  }

  private connectToBirdeye() {
    try {
      // Birdeye WebSocket for real-time price data
      const birdeyeUrl = 'wss://public-api.birdeye.so/socket';
      this.birdeyeWs = new WebSocket(birdeyeUrl);

      this.birdeyeWs.onopen = () => {
        console.log('✅ Connected to Birdeye WebSocket');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Subscribe to trending tokens
        this.birdeyeWs?.send(JSON.stringify({
          type: 'subscribe',
          channel: 'trending_tokens',
          params: {
            chain: 'solana',
            limit: 50
          }
        }));
      };

      this.birdeyeWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'trending_update') {
            const signal = this.transformBirdeyeData(data);
            this.emit('signal', signal);
          }
        } catch (error) {
          console.error('Error parsing Birdeye data:', error);
        }
      };

      this.birdeyeWs.onclose = () => {
        console.log('🔌 Birdeye WebSocket disconnected');
        this.isConnected = false;
        this.handleReconnect('birdeye');
      };

    } catch (error) {
      console.error('Failed to connect to Birdeye:', error);
    }
  }

  private connectToDexScreener() {
    try {
      // DexScreener WebSocket for new token discovery
      const dexScreenerUrl = 'wss://ws.dexscreener.com/socket';
      this.dexScreenerWs = new WebSocket(dexScreenerUrl);

      this.dexScreenerWs.onopen = () => {
        console.log('✅ Connected to DexScreener WebSocket');
        
        // Subscribe to Solana new pairs
        this.dexScreenerWs?.send(JSON.stringify({
          type: 'subscribe',
          channel: 'new_pairs',
          params: {
            chain: 'solana'
          }
        }));
      };

      this.dexScreenerWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_pair') {
            const signal = this.transformDexScreenerData(data);
            this.emit('signal', signal);
          }
        } catch (error) {
          console.error('Error parsing DexScreener data:', error);
        }
      };

      this.dexScreenerWs.onclose = () => {
        console.log('🔌 DexScreener WebSocket disconnected');
        this.handleReconnect('dexscreener');
      };

    } catch (error) {
      console.error('Failed to connect to DexScreener:', error);
    }
  }

  private connectToInternalWs() {
    try {
      // Internal WebSocket for real-time updates from our backend
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws`;
      
      this.internalWs = new WebSocket(wsUrl);

      this.internalWs.onopen = () => {
        console.log('✅ Connected to internal WebSocket');
      };

      this.internalWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'trade_update':
              this.emit('tradeUpdate', data.payload as LiveTradeUpdate);
              break;
            case 'portfolio_update':
              this.emit('portfolioUpdate', data.payload as PortfolioUpdate);
              break;
            case 'signal_update':
              this.emit('signal', data.payload as RealTimeSignal);
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing internal WebSocket data:', error);
        }
      };

      this.internalWs.onclose = () => {
        console.log('🔌 Internal WebSocket disconnected');
        this.handleReconnect('internal');
      };

    } catch (error) {
      console.error('Failed to connect to internal WebSocket:', error);
    }
  }

  private handleReconnect(source: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect to ${source} (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        switch (source) {
          case 'birdeye':
            this.connectToBirdeye();
            break;
          case 'dexscreener':
            this.connectToDexScreener();
            break;
          case 'internal':
            this.connectToInternalWs();
            break;
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private transformBirdeyeData(data: unknown): RealTimeSignal {
    const birdeyeData = data as {
      address: string;
      symbol?: string;
      priceChange24h: number;
      volume24h: number;
      price: number;
      marketCap?: number;
      liquidity?: number;
    };
    
    return {
      id: `birdeye-${birdeyeData.address}-${Date.now()}`,
      symbol: birdeyeData.symbol || 'UNKNOWN',
      tokenAddress: birdeyeData.address,
      action: birdeyeData.priceChange24h > 0 ? 'BUY' : 'SELL',
      confidence: Math.min(birdeyeData.volume24h / 100000, 1), // Volume-based confidence
      price: birdeyeData.price,
      volume: birdeyeData.volume24h,
      timestamp: Date.now(),
      source: 'BIRDEYE',
      metadata: {
        marketCap: birdeyeData.marketCap,
        liquidity: birdeyeData.liquidity,
        priceChange24h: birdeyeData.priceChange24h,
        rugRisk: this.calculateRugRisk(birdeyeData)
      }
    };
  }

  private transformDexScreenerData(data: unknown): RealTimeSignal {
    const dexData = data as {
      pairAddress: string;
      baseToken?: { symbol?: string; address: string };
      priceUsd?: string;
      volume?: { h24?: number };
      priceChange?: { h24?: number };
      liquidity?: { usd?: number };
    };
    
    return {
      id: `dexscreener-${dexData.pairAddress}-${Date.now()}`,
      symbol: dexData.baseToken?.symbol || 'UNKNOWN',
      tokenAddress: dexData.baseToken?.address || '',
      action: 'BUY', // New pairs default to BUY signal
      confidence: 0.7, // Medium confidence for new pairs
      price: parseFloat(dexData.priceUsd || '0'),
      volume: dexData.volume?.h24 || 0,
      timestamp: Date.now(),
      source: 'DEXSCREENER',
      metadata: {
        liquidity: dexData.liquidity?.usd,
        priceChange24h: dexData.priceChange?.h24
      }
    };
  }

  private calculateRugRisk(data: unknown): number {
    const tokenData = data as {
      top10HolderPercent?: number;
      liquidity?: number;
      volume24h?: number;
      verified?: boolean;
    };
    
    let riskScore = 0;
    
    // Check for rug pull indicators
    if (tokenData.top10HolderPercent && tokenData.top10HolderPercent > 50) riskScore += 0.3;
    if (tokenData.liquidity && tokenData.liquidity < 10000) riskScore += 0.2;
    if (tokenData.volume24h && tokenData.volume24h < 1000) riskScore += 0.2;
    if (!tokenData.verified) riskScore += 0.1;
    
    return Math.min(riskScore, 1);
  }

  public sendTradeRequest(signal: RealTimeSignal, amount: number) {
    if (this.internalWs && this.internalWs.readyState === WebSocket.OPEN) {
      this.internalWs.send(JSON.stringify({
        type: 'execute_trade',
        payload: {
          signal,
          amount,
          timestamp: Date.now()
        }
      }));
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public disconnect() {
    this.birdeyeWs?.close();
    this.dexScreenerWs?.close();
    this.internalWs?.close();
  }
}
