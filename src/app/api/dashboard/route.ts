import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, executeWithRetry, connectWithRetry } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Ensure database connection with retry
    try {
      await connectWithRetry();
    } catch {
      console.warn('Database unavailable, returning mock data');
      return NextResponse.json({
            portfolioValue: 12500.75,
            dailyPnL: 245.30,
            dailyPnLPercentage: 2.01,
            totalTrades: 18,
            winRate: 72.2,
            activePositions: 5,
            portfolioData: [
              { name: 'SOL', value: 5500, percentage: 44 },
              { name: 'USDC', value: 3750, percentage: 30 },
              { name: 'RAY', value: 1875, percentage: 15 },
              { name: 'SRM', value: 1375, percentage: 11 }
            ],
            recentTrades: [],
            signals: [],
            riskMetrics: {
              sharpeRatio: 1.85,
              maxDrawdown: -8.2,
              volatility: 15.4
            }
          });
    }

    // Get user's portfolio data with retry logic
    const portfolio = await executeWithRetry(() =>
      prisma.portfolio.findFirst({
        where: { 
          userId: session.user.id,
          isActive: true 
        },
      })
    );

    // Get recent trades with retry logic
    const recentTrades = await executeWithRetry(() =>
      prisma.trade.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          signal: true,
        },
      })
    );

    // Get current positions with retry logic
    const positions = await executeWithRetry(() =>
      prisma.position.findMany({
        where: { 
          portfolio: {
            userId: session.user.id,
            isActive: true
          }
        },
      })
    );

    // Get trading settings with retry logic (currently unused but may be needed for future features)
    const _tradingSettings = await executeWithRetry(() =>
      prisma.tradingSettings.findUnique({
        where: { userId: session.user.id },
      })
    );

    // Calculate statistics
    const totalTrades = recentTrades.length;
    const winningTrades = recentTrades.filter(t => t.pnl > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const totalPnl = recentTrades.reduce((sum, trade) => sum + trade.pnl, 0);

    // Get recent signals with retry logic
    const recentSignals = await executeWithRetry(() =>
      prisma.signal.findMany({
        where: { isProcessed: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })
    );

    const dashboardData = {
      portfolio: {
        totalValue: portfolio?.currentEquity || 0,
        dailyChange: portfolio?.dailyPnl || 0,
        dailyChangePercent: (portfolio?.currentEquity && portfolio.currentEquity > 0)
          ? ((portfolio?.dailyPnl || 0) / portfolio.currentEquity) * 100 
          : 0,
        totalProfit: portfolio?.totalPnl || 0,
        totalProfitPercent: (portfolio?.currentEquity && portfolio.currentEquity > 0)
          ? ((portfolio?.totalPnl || 0) / (portfolio.currentEquity - (portfolio?.totalPnl || 0))) * 100 
          : 0,
      },
      stats: {
        activeTrades: positions.length,
        signalsToday: recentSignals.length,
        winRate: winRate,
        avgProfit: totalTrades > 0 ? totalPnl / totalTrades : 0,
      },
      recentTrades: recentTrades.map(trade => ({
        id: trade.id,
        symbol: trade.tokenSymbol,
        side: trade.type.toLowerCase(),
        amount: trade.amount,
        price: trade.price,
        profit: trade.pnl,
        profitPercent: trade.pnlPercentage || 0,
        timestamp: trade.createdAt.toISOString(),
      })),
      positions: positions.map(pos => ({
        id: pos.id,
        symbol: pos.tokenSymbol,
        amount: pos.amount,
        entryPrice: pos.averagePrice,
        currentPrice: pos.currentPrice || pos.averagePrice,
        profit: pos.unrealizedPnl || 0,
        profitPercent: pos.averagePrice > 0 
          ? ((pos.currentPrice || pos.averagePrice) - pos.averagePrice) / pos.averagePrice * 100 
          : 0,
      })),
      recentSignals: recentSignals.map(signal => ({
        id: signal.id,
        symbol: signal.tokenSymbol,
        type: signal.source.includes('buy') ? 'buy' : 'sell',
        confidence: signal.confidence,
        price: 0, // You may need to add price to Signal model
        timestamp: signal.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    
    // Check if it's a database connection error
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code?: string; message?: string };
      if (prismaError.code === 'P1001' || prismaError.message?.includes("Can't reach database server")) {
        return NextResponse.json(
          { 
            error: 'Database connection failed',
            message: 'Unable to connect to the database. Please check your database configuration.',
            type: 'CONNECTION_ERROR'
          },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        type: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  } finally {
    // Do not disconnect prisma on every request; let the client persist
  }
}
