import { PrismaClient } from '@prisma/client';
import { SignalData } from './signalProcessor';

interface RiskParameters {
  maxPositionSize: number; // Maximum position size as percentage of portfolio
  maxDailyLoss: number; // Maximum daily loss percentage
  maxDrawdown: number; // Maximum portfolio drawdown percentage
  stopLossPercent: number; // Stop loss percentage
  takeProfitPercent: number; // Take profit percentage
  maxOpenPositions: number; // Maximum number of open positions
  riskPerTrade: number; // Risk per trade as percentage of portfolio
  correlationLimit: number; // Maximum correlation between positions
  volatilityThreshold: number; // Maximum volatility threshold
  liquidityThreshold: number; // Minimum liquidity threshold
}

interface RiskAssessment {
  approved: boolean;
  riskScore: number; // 0-1 scale
  reasons: string[];
  adjustedPositionSize?: number;
  recommendedStopLoss?: number;
  recommendedTakeProfit?: number;
}

interface PortfolioRisk {
  totalValue: number;
  totalRisk: number;
  dailyPnL: number;
  drawdown: number;
  correlation: number;
  openPositions: number;
  riskUtilization: number; // How much of risk budget is used
}

class RiskManager {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async assessTradeRisk(
    userId: string,
    signal: SignalData,
    riskParams: RiskParameters
  ): Promise<RiskAssessment> {
    try {
      const portfolio = await this.getPortfolioRisk(userId);
      const assessment: RiskAssessment = {
        approved: true,
        riskScore: 0,
        reasons: []
      };

      // Check portfolio drawdown
      if (portfolio.drawdown > riskParams.maxDrawdown) {
        assessment.approved = false;
        assessment.riskScore += 0.3;
        assessment.reasons.push(`Portfolio drawdown (${(portfolio.drawdown * 100).toFixed(2)}%) exceeds limit (${(riskParams.maxDrawdown * 100).toFixed(2)}%)`);
      }

      // Check daily loss limit
      if (portfolio.dailyPnL < -riskParams.maxDailyLoss * portfolio.totalValue) {
        assessment.approved = false;
        assessment.riskScore += 0.4;
        assessment.reasons.push(`Daily loss limit exceeded`);
      }

      // Check maximum open positions
      if (portfolio.openPositions >= riskParams.maxOpenPositions) {
        assessment.approved = false;
        assessment.riskScore += 0.2;
        assessment.reasons.push(`Maximum open positions (${riskParams.maxOpenPositions}) reached`);
      }

      // Check correlation risk
      const correlationRisk = await this.assessCorrelationRisk(userId, signal.tokenAddress);
      if (correlationRisk > riskParams.correlationLimit) {
        assessment.riskScore += 0.3;
        assessment.reasons.push(`High correlation risk (${(correlationRisk * 100).toFixed(1)}%)`);
      }

      // Check token-specific risks
      const tokenRisk = await this.assessTokenRisk(signal.tokenAddress);
      assessment.riskScore += tokenRisk.score;
      if (tokenRisk.score > 0.5) {
        assessment.reasons.push(...tokenRisk.reasons);
      }

      // Calculate position size based on risk
      const recommendedSize = this.calculatePositionSize(
        portfolio.totalValue,
        riskParams.riskPerTrade,
        assessment.riskScore,
        signal.confidence
      );

      assessment.adjustedPositionSize = recommendedSize;
      assessment.recommendedStopLoss = signal.price * (1 - riskParams.stopLossPercent);
      assessment.recommendedTakeProfit = signal.price * (1 + riskParams.takeProfitPercent);

      // Final approval check
      if (assessment.riskScore > 0.8) {
        assessment.approved = false;
        assessment.reasons.push('Overall risk score too high');
      }

      return assessment;

    } catch (error) {
      console.error('Risk assessment failed:', error);
      return {
        approved: false,
        riskScore: 1.0,
        reasons: ['Risk assessment system error']
      };
    }
  }

  private async getPortfolioRisk(userId: string): Promise<PortfolioRisk> {
    try {
      // Get current portfolio positions
      const portfolio = await this.prisma.portfolio.findFirst({
        where: { userId },
        include: {
          positions: true
        }
      });

      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      // Get today's trades for P&L calculation
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayTrades = await this.prisma.trade.findMany({
        where: {
          userId,
          createdAt: { gte: todayStart }
        }
      });

      // Calculate portfolio metrics
      const totalValue = portfolio.positions.reduce((sum, pos) => sum + (pos.amount * (pos.currentPrice || pos.averagePrice)), 0);
      const openPositions = portfolio.positions.filter(pos => pos.amount > 0).length;
      
      // Calculate daily P&L
      let dailyPnL = 0;
      todayTrades.forEach(trade => {
        if (trade.type === 'BUY') {
          dailyPnL -= trade.amount * (trade.price || trade.estimatedPrice || 0);
        } else {
          dailyPnL += trade.amount * (trade.price || trade.estimatedPrice || 0);
        }
      });

      // Get historical portfolio value for drawdown calculation
      const drawdown = await this.calculateDrawdown(userId);
      
      // Calculate portfolio correlation (simplified)
      const correlation = await this.calculatePortfolioCorrelation(portfolio.positions);

      return {
        totalValue,
        totalRisk: this.calculatePortfolioRisk(portfolio.positions),
        dailyPnL,
        drawdown,
        correlation,
        openPositions,
        riskUtilization: this.calculateRiskUtilization(portfolio.positions)
      };

    } catch (error) {
      console.error('Failed to get portfolio risk:', error);
      return {
        totalValue: 0,
        totalRisk: 1.0,
        dailyPnL: 0,
        drawdown: 0,
        correlation: 0,
        openPositions: 0,
        riskUtilization: 1.0
      };
    }
  }

  private calculatePositionSize(
    portfolioValue: number,
    riskPerTrade: number,
    riskScore: number,
    confidence: number
  ): number {
    const baseRiskAmount = portfolioValue * riskPerTrade;
    const riskAdjustment = 1 - riskScore;
    const confidenceAdjustment = confidence;
    
    return baseRiskAmount * riskAdjustment * confidenceAdjustment;
  }

  private async assessCorrelationRisk(userId: string, tokenAddress: string): Promise<number> {
    try {
      // Get current positions
      const portfolio = await this.prisma.portfolio.findFirst({
        where: { userId },
        include: {
          positions: {
            where: {
              amount: { gt: 0 }
            }
          }
        }
      });

      if (!portfolio || portfolio.positions.length === 0) return 0;

      // Simplified correlation calculation
      // In production, this would use actual price correlation data
      const similarTokens = portfolio.positions.filter(pos => 
        pos.tokenAddress.substring(0, 3) === tokenAddress.substring(0, 3)
      );

      return similarTokens.length / Math.max(portfolio.positions.length, 1);

    } catch (error) {
      console.error('Correlation assessment failed:', error);
      return 0.5; // Default moderate correlation
    }
  }

  private async assessTokenRisk(tokenAddress: string): Promise<{ score: number; reasons: string[] }> {
    const reasons: string[] = [];
    let riskScore = 0;

    try {
      // Check if token has enough trading history
      const recentTrades = await this.prisma.trade.count({
        where: {
          tokenAddress,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      });

      if (recentTrades < 10) {
        riskScore += 0.2;
        reasons.push('Limited trading history');
      }

      // Check volatility (simplified - would use actual price data)
      const volatilityScore = Math.random() * 0.5; // Placeholder
      if (volatilityScore > 0.3) {
        riskScore += volatilityScore;
        reasons.push(`High volatility detected (${(volatilityScore * 100).toFixed(1)}%)`);
      }

      // Check liquidity (simplified)
      const liquidityScore = Math.random() * 0.3; // Placeholder
      if (liquidityScore > 0.2) {
        riskScore += liquidityScore;
        reasons.push('Low liquidity warning');
      }

      return { score: Math.min(riskScore, 1.0), reasons };

    } catch (error) {
      console.error('Token risk assessment failed:', error);
      return { score: 0.5, reasons: ['Token risk assessment unavailable'] };
    }
  }

  private calculatePortfolioRisk(positions: Array<{
    amount: number;
    currentPrice: number | null;
  }>): number {
    if (positions.length === 0) return 0;

    // Simplified portfolio risk calculation
    const totalValue = positions.reduce((sum, pos) => sum + (pos.amount * (pos.currentPrice || 0)), 0);
    const riskWeights = positions.map(pos => (pos.amount * (pos.currentPrice || 0)) / totalValue);
    
    // Calculate weighted average risk (simplified)
    return riskWeights.reduce((sum, weight) => sum + weight * 0.5, 0);
  }

  private async calculateDrawdown(userId: string): Promise<number> {
    try {
      // Get portfolio history to calculate max drawdown
      // This is simplified - in production would use actual portfolio snapshots
      const trades = await this.prisma.trade.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      if (trades.length === 0) return 0;

      let runningBalance = 10000; // Starting balance assumption
      let maxBalance = runningBalance;
      let maxDrawdown = 0;

      trades.reverse().forEach(trade => {
        if (trade.type === 'BUY') {
          runningBalance -= trade.amount * (trade.price || trade.estimatedPrice || 0);
        } else {
          runningBalance += trade.amount * (trade.price || trade.estimatedPrice || 0);
        }

        maxBalance = Math.max(maxBalance, runningBalance);
        const currentDrawdown = (maxBalance - runningBalance) / maxBalance;
        maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
      });

      return maxDrawdown;

    } catch (error) {
      console.error('Drawdown calculation failed:', error);
      return 0;
    }
  }

  private async calculatePortfolioCorrelation(positions: Array<{
    amount: number;
    currentPrice: number | null;
  }>): Promise<number> {
    // Simplified correlation calculation
    // In production, this would analyze actual price correlations
    if (positions.length <= 1) return 0;
    
    return Math.min(positions.length / 10, 0.8); // Placeholder correlation
  }

  private calculateRiskUtilization(positions: Array<{
    amount: number;
    currentPrice: number | null;
  }>): number {
    // Calculate how much of risk budget is currently used
    if (positions.length === 0) return 0;
    
    return Math.min(positions.length / 20, 1.0); // Simplified calculation
  }

  async getPortfolioHealthScore(userId: string): Promise<{
    score: number; // 0-100
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    factors: {
      diversification: number;
      riskManagement: number;
      profitability: number;
      volatility: number;
    };
    recommendations: string[];
  }> {
    try {
      const portfolio = await this.getPortfolioRisk(userId);
      const factors = {
        diversification: Math.max(0, 100 - portfolio.correlation * 100),
        riskManagement: Math.max(0, 100 - portfolio.totalRisk * 100),
        profitability: portfolio.dailyPnL > 0 ? 85 : 60,
        volatility: Math.max(0, 100 - portfolio.drawdown * 200)
      };

      const score = (factors.diversification + factors.riskManagement + factors.profitability + factors.volatility) / 4;
      
      let grade: 'A' | 'B' | 'C' | 'D' | 'F';
      if (score >= 90) grade = 'A';
      else if (score >= 80) grade = 'B';
      else if (score >= 70) grade = 'C';
      else if (score >= 60) grade = 'D';
      else grade = 'F';

      const recommendations: string[] = [];
      if (factors.diversification < 70) {
        recommendations.push('Consider diversifying across more tokens');
      }
      if (factors.riskManagement < 70) {
        recommendations.push('Reduce position sizes or implement stricter stop losses');
      }
      if (factors.profitability < 70) {
        recommendations.push('Review trading strategy and signal quality');
      }
      if (factors.volatility < 70) {
        recommendations.push('Consider reducing exposure to volatile assets');
      }

      return { score, grade, factors, recommendations };

    } catch (error) {
      console.error('Portfolio health calculation failed:', error);
      return {
        score: 50,
        grade: 'D',
        factors: { diversification: 50, riskManagement: 50, profitability: 50, volatility: 50 },
        recommendations: ['Unable to assess portfolio health']
      };
    }
  }

  async emergencyStop(userId: string, reason: string): Promise<void> {
    try {
      // Cancel all pending orders
      await this.prisma.trade.updateMany({
        where: {
          userId,
          status: 'PENDING'
        },
        data: {
          status: 'CANCELLED',
          metadata: {
            emergencyStop: true,
            reason
          }
        }
      });

      // Log emergency stop
      console.log(`Emergency stop triggered for user ${userId}: ${reason}`);

      // Could also:
      // - Send notifications
      // - Close positions
      // - Disable auto-trading
      
    } catch (error) {
      console.error('Emergency stop failed:', error);
    }
  }
}

export { RiskManager, type RiskParameters, type RiskAssessment, type PortfolioRisk };
