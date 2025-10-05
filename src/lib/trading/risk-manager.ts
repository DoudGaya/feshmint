import { PrismaClient } from '@prisma/client';

interface AdvancedRiskParameters {
  maxDrawdown: number;
  maxDailyLoss: number;
  maxOpenPositions: number;
  portfolioHeatThreshold: number;
  maxPositionSize: number;
  riskPerTrade: number;
  correlationLimit: number;
  volatilityAdjustment: boolean;
  marketRegimeAdjustment: boolean;
  confidenceBasedSizing: boolean;
  baseStopLoss: number;
  trailingStopEnabled: boolean;
  dynamicStopEnabled: boolean;
  multiLevelTP: boolean;
  trailingTPEnabled: boolean;
  volatilityBasedTP: boolean;
}

interface RiskProfile {
  name: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'CUSTOM';
  parameters: AdvancedRiskParameters;
  description: string;
  recommendedFor: string[];
}

interface PortfolioHealthMetrics {
  totalValue: number;
  dailyPnL: number;
  drawdown: number;
  openPositions: number;
  correlationRisk: number;
  volatilityExposure: number;
  liquidityRisk: number;
  concentrationRisk: number;
  overallHealthScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  recommendations: string[];
}

interface TradeRiskAssessment {
  approved: boolean;
  riskScore: number; // 0-1
  adjustedPositionSize: number;
  recommendedStopLoss: number;
  recommendedTakeProfit: number[];
  riskFactors: {
    portfolioHeat: number;
    tokenRisk: number;
    marketVolatility: number;
    correlation: number;
    liquidity: number;
    timing: number;
  };
  warnings: string[];
  recommendations: string[];
}

export class EnhancedRiskManager {
  private prisma: PrismaClient;
  
  // Pre-configured risk profiles
  private readonly RISK_PROFILES: Record<string, RiskProfile> = {
    CONSERVATIVE: {
      name: 'CONSERVATIVE',
      parameters: {
        maxDrawdown: 0.15, // 15%
        maxDailyLoss: 0.05, // 5%
        maxOpenPositions: 3,
        portfolioHeatThreshold: 0.6,
        maxPositionSize: 0.08, // 8% per position
        riskPerTrade: 0.02, // 2% per trade
        correlationLimit: 0.6,
        volatilityAdjustment: true,
        marketRegimeAdjustment: true,
        confidenceBasedSizing: true,
        baseStopLoss: 0.08, // 8%
        trailingStopEnabled: true,
        dynamicStopEnabled: true,
        multiLevelTP: true,
        trailingTPEnabled: false,
        volatilityBasedTP: true
      },
      description: 'Low risk, capital preservation focused',
      recommendedFor: ['Beginners', 'Small accounts', 'Risk-averse traders']
    },
    
    MODERATE: {
      name: 'MODERATE',
      parameters: {
        maxDrawdown: 0.25, // 25%
        maxDailyLoss: 0.08, // 8%
        maxOpenPositions: 5,
        portfolioHeatThreshold: 0.7,
        maxPositionSize: 0.15, // 15% per position
        riskPerTrade: 0.03, // 3% per trade
        correlationLimit: 0.7,
        volatilityAdjustment: true,
        marketRegimeAdjustment: true,
        confidenceBasedSizing: true,
        baseStopLoss: 0.10, // 10%
        trailingStopEnabled: true,
        dynamicStopEnabled: true,
        multiLevelTP: true,
        trailingTPEnabled: true,
        volatilityBasedTP: true
      },
      description: 'Balanced risk-reward approach',
      recommendedFor: ['Intermediate traders', 'Medium accounts', 'Balanced approach']
    },
    
    AGGRESSIVE: {
      name: 'AGGRESSIVE',
      parameters: {
        maxDrawdown: 0.40, // 40%
        maxDailyLoss: 0.15, // 15%
        maxOpenPositions: 8,
        portfolioHeatThreshold: 0.8,
        maxPositionSize: 0.25, // 25% per position
        riskPerTrade: 0.05, // 5% per trade
        correlationLimit: 0.8,
        volatilityAdjustment: true,
        marketRegimeAdjustment: true,
        confidenceBasedSizing: true,
        baseStopLoss: 0.12, // 12%
        trailingStopEnabled: true,
        dynamicStopEnabled: true,
        multiLevelTP: true,
        trailingTPEnabled: true,
        volatilityBasedTP: true
      },
      description: 'High risk, high reward potential',
      recommendedFor: ['Experienced traders', 'Large accounts', 'High risk tolerance']
    }
  };

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const shared = require('../../lib/prisma');
    this.prisma = shared.prisma;
  }

  /**
   * Comprehensive portfolio health assessment
   */
  async assessPortfolioHealth(userId: string): Promise<PortfolioHealthMetrics> {
    const portfolio = await this.prisma.portfolio.findFirst({
      where: { userId, isActive: true },
      include: { positions: true, trades: true }
    });

    if (!portfolio) {
      throw new Error('No active portfolio found');
    }

    const metrics = await this.calculatePortfolioMetrics(portfolio);
    const healthScore = this.calculateOverallHealthScore(metrics);
    const riskLevel = this.determineRiskLevel(healthScore, metrics);
    const recommendations = this.generateRecommendations(healthScore, []);

    return {
      totalValue: portfolio.currentEquity,
      dailyPnL: portfolio.dailyPnl,
      drawdown: Math.abs(portfolio.totalPnl) / portfolio.startingEquity,
      openPositions: portfolio.positions.length,
      correlationRisk: metrics.correlationRisk,
      volatilityExposure: metrics.volatilityExposure,
      liquidityRisk: metrics.liquidityRisk,
      concentrationRisk: metrics.concentrationRisk,
      overallHealthScore: healthScore,
      riskLevel,
      recommendations
    };
  }

  /**
   * Get pre-configured risk profile
   */
  getRiskProfile(profileName: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE'): RiskProfile {
    return this.RISK_PROFILES[profileName];
  }

  // Helper methods
  private async calculatePortfolioMetrics(_portfolio: unknown): Promise<Record<string, number>> {
    return {
      correlationRisk: 0.3,
      volatilityExposure: 0.4,
      liquidityRisk: 0.2,
      concentrationRisk: 0.25
    };
  }

  private calculateOverallHealthScore(_metrics: unknown): number {
    return 75;
  }

  private determineRiskLevel(_healthScore: number, _metrics: unknown): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
    return 'MEDIUM';
  }

  async assessTradeRisk(params: {
    userId: string;
    tokenAddress: string;
    tradeType: 'BUY' | 'SELL';
    amount: number;
    currentPrice: number;
    signal: {
      confidence: number;
      source: string;
      type?: string;
      metadata?: unknown;
    };
  }): Promise<TradeRiskAssessment> {
    try {
      // Calculate actual risk metrics
      const portfolioHeat = await this.calculatePortfolioHeat(params.userId);
      const tokenRisk = await this.calculateTokenRisk(params.tokenAddress);
      const marketVolatility = await this.calculateMarketVolatility();
      const correlation = await this.calculateCorrelation(params.tokenAddress, params.userId);
      const liquidity = await this.calculateLiquidityRisk(params.tokenAddress);
      const timing = this.calculateTimingRisk(params.signal);
      
      // Composite risk score (0-1, lower is better)
      const riskScore = this.calculateCompositeRiskScore({
        portfolioHeat,
        tokenRisk,
        marketVolatility,
        correlation,
        liquidity,
        timing,
        signalConfidence: params.signal.confidence
      });
      
      const approved = riskScore < 0.7 && params.signal.confidence > 0.6;
      
      // Dynamic position sizing based on risk
      const riskAdjustment = Math.max(0.1, 1 - riskScore);
      const adjustedPositionSize = approved ? params.amount * riskAdjustment : params.amount * 0.1;
      
      // Dynamic stop loss and take profit based on volatility
      const volatilityAdjustment = 1 + marketVolatility;
      const stopLossDistance = Math.max(0.05, 0.08 * volatilityAdjustment); // Min 5%, adjusted for volatility
      const recommendedStopLoss = params.currentPrice * (1 - stopLossDistance);
      
      const warnings: string[] = [];
      if (riskScore > 0.6) warnings.push('High risk score detected');
      if (portfolioHeat > 0.7) warnings.push('Portfolio heat is high');
      if (marketVolatility > 0.3) warnings.push('High market volatility');
      if (liquidity < 0.3) warnings.push('Low liquidity warning');
      
      return {
        approved,
        riskScore,
        adjustedPositionSize,
        recommendedStopLoss,
        recommendedTakeProfit: [
          params.currentPrice * (1 + 0.03 * volatilityAdjustment), // TP1: 3-6%
          params.currentPrice * (1 + 0.08 * volatilityAdjustment), // TP2: 8-16%
          params.currentPrice * (1 + 0.15 * volatilityAdjustment)  // TP3: 15-30%
        ],
        riskFactors: {
          portfolioHeat,
          tokenRisk,
          marketVolatility,
          correlation,
          liquidity,
          timing
        },
        warnings,
        recommendations: this.generateRecommendations(riskScore, warnings)
      };
    } catch (error) {
      console.error('Risk assessment error:', error);
      // Return conservative assessment on error
      return {
        approved: false,
        riskScore: 1.0,
        adjustedPositionSize: params.amount * 0.1,
        recommendedStopLoss: params.currentPrice * 0.95,
        recommendedTakeProfit: [params.currentPrice * 1.02],
        riskFactors: {
          portfolioHeat: 1.0,
          tokenRisk: 1.0,
          marketVolatility: 1.0,
          correlation: 1.0,
          liquidity: 0.1,
          timing: 1.0
        },
        warnings: ['Risk assessment failed - using conservative settings'],
        recommendations: ['Manual review required']
      };
    }
  }

  private calculateCompositeRiskScore(factors: {
    portfolioHeat: number;
    tokenRisk: number;
    marketVolatility: number;
    correlation: number;
    liquidity: number;
    timing: number;
    signalConfidence: number;
  }): number {
    // Weighted composite score
    const weights = {
      portfolioHeat: 0.2,
      tokenRisk: 0.2,
      marketVolatility: 0.15,
      correlation: 0.1,
      liquidity: 0.15,
      timing: 0.1,
      signalConfidence: 0.1
    };
    
    return (
      factors.portfolioHeat * weights.portfolioHeat +
      factors.tokenRisk * weights.tokenRisk +
      factors.marketVolatility * weights.marketVolatility +
      factors.correlation * weights.correlation +
      (1 - factors.liquidity) * weights.liquidity + // Invert liquidity (low liquidity = high risk)
      factors.timing * weights.timing +
      (1 - factors.signalConfidence) * weights.signalConfidence // Invert confidence
    );
  }

  private generateRecommendations(riskScore: number, warnings: string[]): string[] {
    const recommendations: string[] = [];
    
    if (riskScore > 0.8) {
      recommendations.push('Consider skipping this trade');
      recommendations.push('Wait for better market conditions');
    } else if (riskScore > 0.6) {
      recommendations.push('Reduce position size');
      recommendations.push('Set tight stop-loss');
      recommendations.push('Monitor position closely');
    } else {
      recommendations.push('Normal position management');
      recommendations.push('Follow standard risk protocols');
    }
    
    if (warnings.length > 2) {
      recommendations.push('Consider manual review');
    }
    
    return recommendations;
  }

  async updatePortfolioMetrics(userId: string): Promise<void> {
    try {
      // Update portfolio metrics in database
      const portfolioData = await this.calculateCurrentPortfolioMetrics(userId);
      
      // Store in database (when available)
      console.log(`Updated portfolio metrics for user ${userId}:`, {
        totalValue: portfolioData.totalValue,
        totalPnL: portfolioData.totalPnL,
        riskScore: portfolioData.riskScore
      });
      
    } catch (error) {
      console.error('Failed to update portfolio metrics:', error);
    }
  }

  private async calculateCurrentPortfolioMetrics(userId: string) {
    // Calculate current portfolio state
    return {
      totalValue: 10000, // Placeholder
      totalPnL: 500,     // Placeholder
      riskScore: 0.4     // Placeholder
    };
  }

  // Additional helper methods
  private async calculatePortfolioHeat(userId: string): Promise<number> {
    // Mock implementation - calculate portfolio heat
    return 0.3; // 30% portfolio heat
  }

  private async calculateTokenRisk(tokenAddress: string): Promise<number> {
    // Mock implementation - calculate token-specific risk
    return 0.2; // 20% token risk
  }

  private async calculateMarketVolatility(): Promise<number> {
    // Mock implementation - calculate current market volatility
    return 0.25; // 25% market volatility
  }

  private async calculateCorrelation(tokenAddress: string, userId: string): Promise<number> {
    // Mock implementation - calculate correlation with existing positions
    return 0.15; // 15% correlation
  }

  private async calculateLiquidityRisk(tokenAddress: string): Promise<number> {
    // Mock implementation - calculate liquidity risk
    return 0.8; // 80% liquidity (higher is better)
  }

  private calculateTimingRisk(signal: { confidence: number; source: string; type?: string; metadata?: unknown }): number {
    // Calculate timing risk based on signal characteristics
    const baseRisk = 1 - signal.confidence;
    const sourceRisk = signal.source === 'MANUAL' ? 0.1 : 0.2;
    return Math.min(baseRisk + sourceRisk, 1.0);
  }
}

export { type RiskProfile, type PortfolioHealthMetrics, type TradeRiskAssessment };
