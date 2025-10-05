import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, executeWithRetry, connectWithRetry } from '@/lib/prisma';
import { AutonomousTradingBot } from '@/lib/autonomous-trading-bot';

declare global {
  var tradingBot: AutonomousTradingBot | undefined;
}

export async function GET(request: NextRequest) {
  try {
    await connectWithRetry();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get trading settings with retry logic
    const settings = await executeWithRetry(async () => {
      return await prisma.tradingSettings.findUnique({
        where: { userId: session.user.id }
      });
    });

    // Get recent trades with retry logic
    const recentTrades = await executeWithRetry(async () => {
      return await prisma.trade.findMany({
        where: { 
          userId: session.user.id,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      });
    });

    // Get active positions with retry logic
    const activePositions = await executeWithRetry(async () => {
      const portfolioIds = await getPortfolioIds(session.user.id);
      return await prisma.position.findMany({
        where: { 
          portfolioId: { in: portfolioIds },
          amount: { gt: 0 }
        }
      });
    });

    // Calculate stats
    const successfulTrades = recentTrades.filter(t => t.status === 'EXECUTED').length;
    const totalTrades = recentTrades.length;
    const winRate = totalTrades > 0 ? successfulTrades / totalTrades : 0;
    
    const dailyPnL = recentTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const portfolioValue = activePositions.reduce((sum, pos) => 
      sum + (pos.amount * (pos.currentPrice || pos.averagePrice)), 0
    );

    // Check if trading bot is active
    const isActive = settings?.isActive || false;
    const botStatus = global.tradingBot ? 
      (global.tradingBot.isActive() ? 'ACTIVE' : 'STOPPED') : 'STOPPED';

    return NextResponse.json({
      isActive,
      botStatus,
      stats: {
        totalTrades,
        successfulTrades,
        winRate,
        dailyPnL,
        portfolioValue,
        activePositions: activePositions.length
      },
      recentTrades: recentTrades.map(trade => ({
        id: trade.id,
        symbol: trade.tokenSymbol,
        type: trade.type,
        amount: trade.amount,
        price: trade.price,
        status: trade.status,
        timestamp: trade.createdAt.getTime()
      })),
      activePositions: activePositions.map(pos => ({
        id: pos.id,
        symbol: pos.tokenSymbol,
        amount: pos.amount,
        averagePrice: pos.averagePrice,
        currentPrice: pos.currentPrice,
        unrealizedPnL: pos.unrealizedPnl
      }))
    });

  } catch (error) {
    console.error('Failed to get trading status:', error);
    return NextResponse.json(
      { error: 'Failed to get trading status' },
      { status: 500 }
    );
  }
}

async function getPortfolioIds(userId: string): Promise<string[]> {
  return await executeWithRetry(async () => {
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      select: { id: true }
    });
    return portfolios.map(p => p.id);
  });
}
