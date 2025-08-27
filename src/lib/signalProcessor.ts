import { Connection, PublicKey } from '@solana/web3.js';
import { PrismaClient } from '@prisma/client';
import { hasSubscriptionAccess } from './subscription';

interface SignalData {
  tokenAddress: string;
  tokenSymbol?: string;
  tokenName?: string;
  action: 'BUY' | 'SELL';
  price: number;
  confidence: number;
  source: 'TELEGRAM' | 'DISCORD' | 'SOLANA_INDEXER' | 'MANUAL';
  metadata?: Record<string, unknown>;
}

interface ProcessedSignal {
  id: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  token: string;
  amount: number;
  price: number;
  confidence: number;
  riskScore: number;
  mevProtection: boolean;
  stopLoss?: number;
  takeProfit?: number;
  reasoning: string[];
}

class SignalProcessor {
  private prisma: PrismaClient;
  private connection: Connection;

  constructor() {
    this.prisma = new PrismaClient();
    this.connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
  }

  async processSignal(userId: string, signalData: SignalData): Promise<ProcessedSignal | null> {
    try {
      // Check subscription access
      const hasAccess = await hasSubscriptionAccess(userId, 'SIGNAL_PROCESSING');
      if (!hasAccess) {
        throw new Error('Subscription tier does not include signal processing');
      }

      // Get user settings and trading preferences
      const userSettings = await this.getUserSettings(userId);
      if (!userSettings) {
        throw new Error('User settings not configured');
      }

      const tradingSettings = await this.getTradingSettings(userId);
      if (!tradingSettings) {
        throw new Error('Trading settings not configured');
      }

      // Validate signal quality
      const isValidSignal = await this.validateSignal(signalData);
      if (!isValidSignal) {
        return null;
      }

      // Apply risk management filters
      const riskAssessment = await this.assessRisk(signalData, tradingSettings);
      if (riskAssessment.shouldReject) {
        await this.logRejectedSignal(userId, signalData, riskAssessment.reason || 'Unknown risk');
        return null;
      }

      // Calculate position size based on risk management
      const positionSize = this.calculatePositionSize(
        signalData,
        tradingSettings,
        riskAssessment.riskScore
      );

      // Apply MEV protection if enabled
      const mevProtection = tradingSettings.isActive && riskAssessment.riskScore > 0.3;

      // Calculate stop loss and take profit
      const { stopLoss, takeProfit } = this.calculateExitPoints(
        signalData,
        tradingSettings
      );

      // Create processed signal
      const processedSignal: ProcessedSignal = {
        id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action: this.determineAction(signalData, riskAssessment),
        token: signalData.tokenAddress,
        amount: positionSize,
        price: signalData.price,
        confidence: signalData.confidence,
        riskScore: riskAssessment.riskScore,
        mevProtection,
        stopLoss,
        takeProfit,
        reasoning: riskAssessment.reasoning
      };

      // Save signal to database
      await this.saveProcessedSignal(userId, processedSignal, signalData);

      // Execute trade if auto-trading is enabled
      if (tradingSettings.isActive && processedSignal.action !== 'HOLD') {
        await this.executeTrade(userId, processedSignal);
      }

      return processedSignal;

    } catch (error) {
      console.error('Error processing signal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logError(userId, signalData, errorMessage);
      return null;
    }
  }

  private async getUserSettings(userId: string) {
    return await this.prisma.userSettings.findUnique({
      where: { userId }
    });
  }

  private async getTradingSettings(userId: string) {
    return await this.prisma.tradingSettings.findUnique({
      where: { userId }
    });
  }

  private async validateSignal(signal: SignalData): Promise<boolean> {
    // Check signal completeness
    if (!signal.tokenAddress || !signal.action || !signal.price || signal.confidence === undefined) {
      return false;
    }

    // Check confidence threshold
    if (signal.confidence < 0.1 || signal.confidence > 1.0) {
      return false;
    }

    // Check price validity
    if (signal.price <= 0) {
      return false;
    }

    // Validate token address format (basic check)
    try {
      new PublicKey(signal.tokenAddress);
      return true;
    } catch {
      return false;
    }
  }

  private async assessRisk(
    signal: SignalData, 
    settings: {
      userId: string;
      maxRiskPerTrade?: number;
      maxDailyTrades?: number;
      defaultTradeAmount?: number;
      stopLossPercent?: number;
      takeProfitPercent?: number;
    }
  ): Promise<{
    shouldReject: boolean;
    riskScore: number;
    reason?: string;
    reasoning: string[];
  }> {
    const reasoning: string[] = [];
    let riskScore = 0;

    // Base risk from confidence
    const confidenceRisk = 1 - signal.confidence;
    riskScore += confidenceRisk * 0.3;
    reasoning.push(`Confidence risk: ${(confidenceRisk * 100).toFixed(1)}%`);

    // Check if we're already holding this token - simplified check
    // This would need to be implemented based on actual schema structure
    const existingPosition = null; // await this.prisma.position.findFirst(...)

    if (existingPosition && signal.action === 'BUY') {
      riskScore += 0.2;
      reasoning.push('Already holding position in this token');
    }

    // Check recent trading volume
    const recentTrades = await this.prisma.trade.count({
      where: {
        userId: settings.userId,
        tokenAddress: signal.tokenAddress,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    if (recentTrades > 5) {
      riskScore += 0.3;
      reasoning.push('High frequency trading detected for this token');
    }

    // Check maximum risk per trade
    const maxRiskPerTrade = settings.maxRiskPerTrade || 0.05;
    if (riskScore > maxRiskPerTrade) {
      return {
        shouldReject: true,
        riskScore,
        reason: `Risk score ${riskScore.toFixed(2)} exceeds maximum allowed ${maxRiskPerTrade}`,
        reasoning
      };
    }

    // Check if we've hit daily trade limit
    const todayTrades = await this.prisma.trade.count({
      where: {
        userId: settings.userId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    const maxDailyTrades = settings.maxDailyTrades || 50;
    if (todayTrades >= maxDailyTrades) {
      return {
        shouldReject: true,
        riskScore,
        reason: 'Daily trade limit reached',
        reasoning
      };
    }

    return {
      shouldReject: false,
      riskScore: Math.min(riskScore, 1.0),
      reasoning
    };
  }

  private calculatePositionSize(
    signal: SignalData,
    settings: {
      userId: string;
      maxRiskPerTrade?: number;
      maxDailyTrades?: number;
      defaultTradeAmount?: number;
      stopLossPercent?: number;
      takeProfitPercent?: number;
    },
    riskScore: number
  ): number {
    const baseAmount = settings.defaultTradeAmount || 0.01; // SOL
    const riskAdjustment = 1 - riskScore;
    const confidenceAdjustment = signal.confidence;
    
    return baseAmount * riskAdjustment * confidenceAdjustment;
  }

  private determineAction(
    signal: SignalData,
    riskAssessment: {
      shouldReject: boolean;
      riskScore: number;
      reason?: string;
      reasoning: string[];
    }
  ): 'BUY' | 'SELL' | 'HOLD' {
    // If risk is too high but not rejected, hold
    if (riskAssessment.riskScore > 0.7) {
      return 'HOLD';
    }

    // If confidence is too low, hold
    if (signal.confidence < 0.3) {
      return 'HOLD';
    }

    return signal.action;
  }

  private calculateExitPoints(
    signal: SignalData,
    settings: {
      userId: string;
      maxRiskPerTrade?: number;
      maxDailyTrades?: number;
      defaultTradeAmount?: number;
      stopLossPercent?: number;
      takeProfitPercent?: number;
    }
  ): { stopLoss?: number; takeProfit?: number } {
    const stopLossPercent = settings.stopLossPercent || 0.05; // 5%
    const takeProfitPercent = settings.takeProfitPercent || 0.15; // 15%

    if (signal.action === 'BUY') {
      return {
        stopLoss: signal.price * (1 - stopLossPercent),
        takeProfit: signal.price * (1 + takeProfitPercent)
      };
    } else if (signal.action === 'SELL') {
      return {
        stopLoss: signal.price * (1 + stopLossPercent),
        takeProfit: signal.price * (1 - takeProfitPercent)
      };
    }

    return {};
  }

  private async saveProcessedSignal(
    userId: string,
    processedSignal: ProcessedSignal,
    originalSignal: SignalData
  ) {
    await this.prisma.signal.create({
      data: {
        tokenAddress: processedSignal.token,
        tokenSymbol: originalSignal.tokenSymbol,
        tokenName: originalSignal.tokenName,
        source: originalSignal.source,
        confidence: processedSignal.confidence,
        rawMessage: JSON.stringify(originalSignal),
        filtersResult: JSON.parse(JSON.stringify({
          ...originalSignal.metadata,
          processedSignal,
          riskScore: processedSignal.riskScore,
          reasoning: processedSignal.reasoning
        })),
        isProcessed: true,
        passedFilters: true
      }
    });
  }

  private async executeTrade(userId: string, signal: ProcessedSignal) {
    try {
      // This would integrate with actual trading execution
      // For now, we'll create a paper trade
      await this.prisma.trade.create({
        data: {
          userId,
          portfolioId: '', // This should be retrieved from user's active portfolio
          tokenAddress: signal.token,
          tokenSymbol: signal.token.substring(0, 10), // Placeholder
          type: signal.action as 'BUY' | 'SELL',
          amount: signal.amount,
          estimatedPrice: signal.price,
          status: 'EXECUTED',
          tradingMode: 'PAPER',
          metadata: JSON.parse(JSON.stringify({
            signalId: signal.id,
            confidence: signal.confidence,
            riskScore: signal.riskScore,
            mevProtection: signal.mevProtection,
            stopLoss: signal.stopLoss,
            takeProfit: signal.takeProfit
          }))
        }
      });

      // Update portfolio
      await this.updatePortfolio(userId, signal);

    } catch (error) {
      console.error('Error executing trade:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Log the error - signal update would require proper schema structure
      console.log(`Failed to execute trade for user ${userId}: ${errorMessage}`);
    }
  }

  private async updatePortfolio(userId: string, signal: ProcessedSignal) {
    // Portfolio update functionality would go here
    // This requires the actual Prisma schema structure to be implemented correctly
    console.log(`Portfolio update for user ${userId}, signal ${signal.id}`);
  }

  private async logRejectedSignal(userId: string, signal: SignalData, reason: string) {
    await this.prisma.signal.create({
      data: {
        tokenAddress: signal.tokenAddress,
        tokenSymbol: signal.tokenSymbol,
        tokenName: signal.tokenName,
        source: signal.source,
        confidence: signal.confidence,
        rawMessage: JSON.stringify(signal),
        isProcessed: true,
        passedFilters: false,
        filtersResult: JSON.parse(JSON.stringify({
          rejectionReason: reason,
          originalSignal: signal
        }))
      }
    });
  }

  private async logError(userId: string, signal: SignalData, error: string) {
    console.error('Signal processing error:', { userId, signal, error });
    // Could integrate with error tracking service here
  }

  async getSignalHistory(_userId: string, limit = 50) {
    // Note: Signal model doesn't have direct user relationship in current schema
    // This would need to be implemented via trade relationships or signal source filtering
    return await this.prisma.signal.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async getSignalStats(_userId: string) {
    // Note: Signal model doesn't have direct user relationship in current schema
    // This would need to be implemented via trade relationships
    const [total, successful, failed, pending] = await Promise.all([
      this.prisma.signal.count({}),
      this.prisma.signal.count({ where: { passedFilters: true } }),
      this.prisma.signal.count({ where: { passedFilters: false } }),
      this.prisma.signal.count({ where: { isProcessed: false } })
    ]);

    return {
      total,
      successful,
      failed,
      pending,
      successRate: total > 0 ? (successful / total) * 100 : 0
    };
  }
}

export { SignalProcessor, type SignalData, type ProcessedSignal };
