import { EventEmitter } from 'events';
import { WebSocketManager, RealTimeSignal, PortfolioUpdate } from './websocket-manager';
import { RealTimeTradeExecutor, TradeRequest } from './real-time-trade-executor';
import { EnhancedRiskManager } from './trading/risk-manager';
import { prisma } from '@/lib/prisma';

interface TradingPosition {
  id?: string;
  tokenAddress: string;
  symbol: string;
  amount: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  stopLoss: number;
  takeProfit: number;
}

export interface TradingBotConfig {
  userId: string;
  isActive: boolean;
  tradingMode: 'LIVE' | 'PAPER';
  maxPositionSize: number;
  portfolioCap: number;
  dailyDrawdownLimit: number;
  winRateThreshold: number;
  minLiquidity: number;
  minBuyerConfirmation: number;
  maxDevWalletControl: number;
  maxPriceDump: number;
  trailingStopLoss: number;
  autoTradingEnabled: boolean;
  signalSources: string[];
  minConfidenceThreshold: number;
}

export interface TradingStats {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  totalPnL: number;
  dailyPnL: number;
  winRate: number;
  activePositions: number;
  portfolioValue: number;
  lastUpdated: number;
}

export class AutonomousTradingBot extends EventEmitter {
  private wsManager: WebSocketManager;
  private tradeExecutor: RealTimeTradeExecutor;
  private riskManager: EnhancedRiskManager;
  private prisma = prisma;
  private config: TradingBotConfig;
  private isRunning = false;
  private stats: TradingStats;
  private signalQueue: RealTimeSignal[] = [];
  private activePositions = new Map<string, TradingPosition>();
  private processingSignal = false;

  constructor(config: TradingBotConfig) {
    super();
    this.config = config;
    this.wsManager = new WebSocketManager();
    this.tradeExecutor = new RealTimeTradeExecutor();
    this.riskManager = new EnhancedRiskManager();
  // Reuse shared prisma
    
    this.stats = {
      totalTrades: 0,
      successfulTrades: 0,
      failedTrades: 0,
      totalPnL: 0,
      dailyPnL: 0,
      winRate: 0,
      activePositions: 0,
      portfolioValue: 0,
      lastUpdated: Date.now()
    };

    this.initializeEventHandlers();
  }

  private initializeEventHandlers() {
    // Handle incoming signals
    this.wsManager.on('signal', (signal: RealTimeSignal) => {
      this.handleIncomingSignal(signal);
    });

    // Handle trade updates
    this.tradeExecutor.on('tradeCompleted', (tradeUpdate: unknown) => {
      this.handleTradeCompleted(tradeUpdate);
    });

    this.tradeExecutor.on('tradeFailed', (tradeUpdate: unknown) => {
      this.handleTradeFailed(tradeUpdate);
    });

    // Handle WebSocket disconnections
    this.wsManager.on('error', (error: unknown) => {
      console.error('WebSocket error:', error);
      this.emit('connectionError', error);
    });
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Trading bot is already running');
      return;
    }

    console.log('🚀 Starting Autonomous Trading Bot...');
    
    try {
      // Validate configuration
      await this.validateConfiguration();
      
      // Initialize trading wallet
      if (!this.tradeExecutor.isReady()) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Trading executor not ready - continuing in development mode with simulated trades');
        } else {
          throw new Error('Trading executor not ready - check wallet configuration');
        }
      }

      // Load existing positions
      await this.loadActivePositions();
      
      // Start signal processing
      this.isRunning = true;
      this.startSignalProcessing();
      
      // Start periodic updates
      this.startPeriodicUpdates();
      
      console.log('✅ Autonomous Trading Bot started successfully');
      this.emit('botStarted', {
        timestamp: Date.now(),
        config: this.config,
        walletAddress: this.tradeExecutor.getWalletAddress()
      });

    } catch (error) {
      console.error('❌ Failed to start trading bot:', error);
      this.emit('botError', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  public async stop(): Promise<void> {
    console.log('🛑 Stopping Autonomous Trading Bot...');
    
    this.isRunning = false;
    this.wsManager.disconnect();
    
    console.log('✅ Trading Bot stopped');
    this.emit('botStopped', { timestamp: Date.now() });
  }

  private async validateConfiguration(): Promise<void> {
    if (!this.config.isActive) {
      throw new Error('Trading bot is not active');
    }

    if (this.config.maxPositionSize <= 0) {
      throw new Error('Maximum position size must be greater than 0');
    }

    if (this.config.portfolioCap <= 0) {
      throw new Error('Portfolio cap must be greater than 0');
    }

    // Validate risk parameters
    if (this.config.dailyDrawdownLimit < 0 || this.config.dailyDrawdownLimit > 1) {
      throw new Error('Daily drawdown limit must be between 0-100%');
    }
  }

  private async loadActivePositions(): Promise<void> {
    try {
      // Load positions from database
      const positions = await this.prisma.position.findMany({
        where: {
          tradingMode: this.config.tradingMode,
          amount: { gt: 0 }
        }
      });

      positions.forEach(position => {
        this.activePositions.set(position.tokenAddress, {
          id: position.id,
          tokenAddress: position.tokenAddress,
          symbol: position.tokenSymbol || 'UNKNOWN',
          amount: position.amount,
          averagePrice: position.averagePrice,
          currentPrice: position.currentPrice || 0,
          unrealizedPnL: position.unrealizedPnl,
          stopLoss: position.stopLossPrice || 0,
          takeProfit: position.takeProfitPrice || 0
        });
      });

      this.stats.activePositions = this.activePositions.size;
      console.log(`📊 Loaded ${this.activePositions.size} active positions`);

    } catch (error) {
      console.error('Failed to load active positions:', error);
    }
  }

  private startSignalProcessing(): void {
    // Process signals every 100ms
    setInterval(() => {
      if (this.isRunning && !this.processingSignal && this.signalQueue.length > 0) {
        this.processNextSignal();
      }
    }, 100);
  }

  private startPeriodicUpdates(): void {
    // Update portfolio stats every 10 seconds
    setInterval(() => {
      if (this.isRunning) {
        this.updatePortfolioStats();
      }
    }, 10000);

    // Update position prices every 30 seconds
    setInterval(() => {
      if (this.isRunning) {
        this.updatePositionPrices();
      }
    }, 30000);

    // Check stop-loss and take-profit every 5 seconds
    setInterval(() => {
      if (this.isRunning) {
        this.checkExitConditions();
      }
    }, 5000);
  }

  private async handleIncomingSignal(signal: RealTimeSignal): Promise<void> {
    console.log(`📡 Received signal: ${signal.symbol} (${signal.action}) - Confidence: ${signal.confidence}`);

    // Filter signals based on configuration
    if (!this.shouldProcessSignal(signal)) {
      return;
    }

    // Add to processing queue
    this.signalQueue.push(signal);
    
    this.emit('signalReceived', signal);
  }

  private shouldProcessSignal(signal: RealTimeSignal): boolean {
    // Check if signal source is enabled
    if (!this.config.signalSources.includes(signal.source)) {
      return false;
    }

    // Check confidence threshold
    if (signal.confidence < this.config.minConfidenceThreshold) {
      console.log(`🔍 Signal filtered: confidence ${signal.confidence} below threshold ${this.config.minConfidenceThreshold}`);
      return false;
    }

    // Check liquidity requirements
    if (signal.metadata?.liquidity && signal.metadata.liquidity < this.config.minLiquidity) {
      console.log(`🔍 Signal filtered: liquidity ${signal.metadata.liquidity} below minimum ${this.config.minLiquidity}`);
      return false;
    }

    // Check rug risk
    if (signal.metadata?.rugRisk && signal.metadata.rugRisk > 0.5) {
      console.log(`🔍 Signal filtered: high rug risk ${signal.metadata.rugRisk}`);
      return false;
    }

    return true;
  }

  private async processNextSignal(): Promise<void> {
    if (this.signalQueue.length === 0) return;

    this.processingSignal = true;
    const signal = this.signalQueue.shift()!;

    try {
      console.log(`⚡ Processing signal: ${signal.symbol} (${signal.action})`);

      // Assess risk
      const riskAssessment = await this.riskManager.assessTradeRisk({
        userId: this.config.userId,
        tokenAddress: signal.tokenAddress,
        tradeType: signal.action,
        amount: this.calculatePositionSize(signal),
        currentPrice: signal.price,
        signal: {
          confidence: signal.confidence,
          source: signal.source,
          metadata: signal.metadata
        }
      });

      if (!riskAssessment.approved) {
        console.log(`🚫 Trade rejected by risk manager`);
        this.emit('tradeRejected', { signal, riskScore: riskAssessment.riskScore });
        return;
      }

      // Execute trade if approved
      if (this.config.autoTradingEnabled) {
        await this.executeTrade(signal, riskAssessment.adjustedPositionSize || this.calculatePositionSize(signal));
      } else {
        // Emit signal for manual review
        this.emit('signalForReview', { signal, riskAssessment });
      }

    } catch (error) {
      console.error('Error processing signal:', error);
      this.emit('signalProcessingError', { signal, error });
    } finally {
      this.processingSignal = false;
    }
  }

  private calculatePositionSize(signal: RealTimeSignal): number {
    // Base position size from configuration
    let positionSize = this.config.maxPositionSize;

    // Adjust based on confidence
    positionSize *= signal.confidence;

    // Adjust based on current portfolio utilization
    const portfolioUtilization = this.stats.portfolioValue / this.config.portfolioCap;
    if (portfolioUtilization > 0.8) {
      positionSize *= 0.5; // Reduce position size when portfolio is near cap
    }

    // Adjust based on recent performance
    if (this.stats.winRate < this.config.winRateThreshold) {
      positionSize *= 0.7; // Reduce position size when win rate is low
    }

    return Math.max(positionSize, 10); // Minimum $10 position
  }

  private async executeTrade(signal: RealTimeSignal, amount: number): Promise<void> {
    try {
      const tradeRequest: TradeRequest = {
        tokenAddress: signal.tokenAddress,
        action: signal.action,
        amount: amount,
        maxSlippage: 2, // 2% max slippage
        priority: signal.confidence > 0.8 ? 'HIGH' : 'MEDIUM'
      };

      console.log(`💼 Executing ${signal.action} trade: ${amount} SOL for ${signal.symbol}`);

      if (this.config.tradingMode === 'PAPER') {
        // Simulate trade execution
        this.simulateTrade(signal, amount);
      } else {
        // Execute real trade
        const result = await this.tradeExecutor.executeTrade(tradeRequest);
        
        if (result.success) {
          console.log(`✅ Trade executed successfully: ${result.txHash}`);
          await this.recordTrade(signal, amount, result);
        } else {
          console.log(`❌ Trade failed: ${result.error}`);
          this.emit('tradeFailed', { signal, error: result.error });
        }
      }

    } catch (error) {
      console.error('Trade execution error:', error);
      this.emit('tradeExecutionError', { signal, error });
    }
  }

  private simulateTrade(signal: RealTimeSignal, amount: number): void {
    // Simulate trade with random success/failure
    const success = Math.random() > 0.1; // 90% success rate in paper trading
    
    if (success) {
      const simulatedResult = {
        success: true,
        txHash: `simulated-${Date.now()}`,
        actualAmount: amount,
        executionPrice: signal.price,
        fees: amount * 0.003, // 0.3% fees
        slippage: Math.random() * 0.5, // Random slippage up to 0.5%
        gasUsed: 5000,
        processingTime: Math.random() * 1000 + 500
      };

      this.handleTradeCompleted({
        id: `sim-${Date.now()}`,
        ...simulatedResult,
        timestamp: Date.now()
      });
    } else {
      this.handleTradeFailed({
        id: `sim-${Date.now()}`,
        error: 'Simulated trade failure',
        timestamp: Date.now()
      });
    }
  }

  private async recordTrade(signal: RealTimeSignal, amount: number, result: unknown): Promise<void> {
    try {
      // Cast result to TradeResult type for safe access
      const tradeResult = result as { 
        actualAmount?: number; 
        executionPrice?: number; 
        fees?: number; 
        slippage?: number; 
        txHash?: string; 
      };

      // Record trade in database
      await this.prisma.trade.create({
        data: {
          userId: 'trading-bot', // This should come from actual user context
          portfolioId: 'default', // This should come from actual portfolio
          type: signal.action,
          tokenAddress: signal.tokenAddress,
          tokenSymbol: signal.symbol,
          amount: tradeResult.actualAmount || amount,
          price: tradeResult.executionPrice || signal.price,
          fees: tradeResult.fees || 0,
          slippage: tradeResult.slippage || 0,
          txHash: tradeResult.txHash,
          status: 'EXECUTED',
          tradingMode: this.config.tradingMode,
          metadata: {
            signalId: signal.id,
            signalSource: signal.source,
            signalConfidence: signal.confidence,
            txHash: tradeResult.txHash || '',
            fees: tradeResult.fees || 0,
            slippage: tradeResult.slippage || 0
          }
        }
      });

      // Update position if it's a buy order
      if (signal.action === 'BUY') {
        await this.updatePosition(signal, tradeResult.actualAmount || amount, tradeResult.executionPrice || signal.price);
      }

    } catch (error) {
      console.error('Failed to record trade:', error);
    }
  }

  private async updatePosition(signal: RealTimeSignal, amount: number, price: number): Promise<void> {
    const existingPosition = this.activePositions.get(signal.tokenAddress);

    if (existingPosition) {
      // Update existing position
      const newAmount = existingPosition.amount + amount;
      const newAvgPrice = ((existingPosition.averagePrice * existingPosition.amount) + (price * amount)) / newAmount;
      
      existingPosition.amount = newAmount;
      existingPosition.averagePrice = newAvgPrice;
    } else {
      // Create new position
      this.activePositions.set(signal.tokenAddress, {
        tokenAddress: signal.tokenAddress,
        symbol: signal.symbol,
        amount: amount,
        averagePrice: price,
        currentPrice: price,
        unrealizedPnL: 0,
        stopLoss: price * (1 - this.config.trailingStopLoss),
        takeProfit: price * 1.5 // 50% take profit
      });
    }

    this.stats.activePositions = this.activePositions.size;
  }

  private async handleTradeCompleted(tradeUpdate: unknown): Promise<void> {
    this.stats.totalTrades++;
    this.stats.successfulTrades++;
    this.stats.winRate = this.stats.successfulTrades / this.stats.totalTrades;
    
    const update = tradeUpdate as { txHash?: string };
    console.log(`✅ Trade completed: ${update.txHash || 'unknown'}`);
    this.emit('tradeUpdate', tradeUpdate);
  }

  private async handleTradeFailed(tradeUpdate: unknown): Promise<void> {
    this.stats.totalTrades++;
    this.stats.failedTrades++;
    this.stats.winRate = this.stats.successfulTrades / this.stats.totalTrades;
    
    const update = tradeUpdate as { error?: string };
    console.log(`❌ Trade failed: ${update.error || 'unknown error'}`);
    this.emit('tradeUpdate', tradeUpdate);
  }

  private async updatePortfolioStats(): Promise<void> {
    try {
      const walletBalance = await this.tradeExecutor.getWalletBalance();
      let totalPositionValue = 0;

      // Calculate total position value
      for (const [tokenAddress, position] of this.activePositions) {
        totalPositionValue += position.amount * position.currentPrice;
      }

      this.stats.portfolioValue = walletBalance + totalPositionValue;
      this.stats.lastUpdated = Date.now();

      // Emit portfolio update
      this.emit('portfolioUpdate', {
        totalValue: this.stats.portfolioValue,
        dailyPnL: this.stats.dailyPnL,
        totalPnL: this.stats.totalPnL,
        activePositions: this.stats.activePositions,
        tradesToday: this.stats.totalTrades,
        winRate: this.stats.winRate,
        timestamp: Date.now()
      } as PortfolioUpdate);

    } catch (error) {
      console.error('Failed to update portfolio stats:', error);
    }
  }

  private async updatePositionPrices(): Promise<void> {
    // Update current prices for all positions
    for (const [tokenAddress, position] of this.activePositions) {
      try {
        const response = await fetch(`https://price.jup.ag/v4/price?ids=${tokenAddress}`);
        const data = await response.json();
        const currentPrice = data.data[tokenAddress]?.price || position.currentPrice;
        
        position.currentPrice = currentPrice;
        position.unrealizedPnL = (currentPrice - position.averagePrice) * position.amount;
        
      } catch (error) {
        console.error(`Failed to update price for ${position.symbol}:`, error);
      }
    }
  }

  private async checkExitConditions(): Promise<void> {
    for (const [tokenAddress, position] of this.activePositions) {
      // Check stop-loss
      if (position.currentPrice <= position.stopLoss) {
        console.log(`🛑 Stop-loss triggered for ${position.symbol}`);
        await this.executeSellOrder(position, 'STOP_LOSS');
      }
      
      // Check take-profit
      if (position.currentPrice >= position.takeProfit) {
        console.log(`🎯 Take-profit triggered for ${position.symbol}`);
        await this.executeSellOrder(position, 'TAKE_PROFIT');
      }
    }
  }

  private async executeSellOrder(position: TradingPosition, reason: string): Promise<void> {
    try {
      const tradeRequest: TradeRequest = {
        tokenAddress: position.tokenAddress,
        action: 'SELL',
        amount: position.amount,
        maxSlippage: 3, // Higher slippage for exit orders
        priority: 'HIGH'
      };

      console.log(`📤 Executing ${reason} sell order for ${position.symbol}`);
      
      if (this.config.tradingMode === 'LIVE') {
        const result = await this.tradeExecutor.executeTrade(tradeRequest);
        
        if (result.success) {
          this.activePositions.delete(position.tokenAddress);
          this.stats.activePositions = this.activePositions.size;
          
          // Calculate realized PnL
          const realizedPnL = (result.executionPrice! - position.averagePrice) * position.amount;
          this.stats.totalPnL += realizedPnL;
          this.stats.dailyPnL += realizedPnL;
          
          console.log(`✅ Exit order executed: ${reason} - PnL: ${realizedPnL.toFixed(2)}`);
        }
      } else {
        // Simulate exit in paper trading
        this.activePositions.delete(position.tokenAddress);
        this.stats.activePositions = this.activePositions.size;
      }
      
    } catch (error) {
      console.error(`Failed to execute ${reason} order:`, error);
    }
  }

  public updateConfig(newConfig: Partial<TradingBotConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('📝 Trading bot configuration updated');
    this.emit('configUpdated', this.config);
  }

  public getStats(): TradingStats {
    return { ...this.stats };
  }

  public getActivePositions(): TradingPosition[] {
    return Array.from(this.activePositions.values());
  }

  public isActive(): boolean {
    return this.isRunning;
  }
}
