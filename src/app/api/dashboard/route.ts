import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's portfolio data
    const portfolio = await prisma.portfolio.findFirst({
      where: { 
        userId: session.user.id,
        isActive: true 
      },
    });

    // Get recent trades
    const recentTrades = await prisma.trade.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        signal: true,
      },
    });

    // Get current positions
    const positions = await prisma.position.findMany({
      where: { 
        portfolio: {
          userId: session.user.id,
          isActive: true
        }
      },
    });

    // Get trading settings (currently unused but may be needed for future features)
    const _tradingSettings = await prisma.tradingSettings.findUnique({
      where: { userId: session.user.id },
    });

    // Calculate statistics
    const totalTrades = recentTrades.length;
    const winningTrades = recentTrades.filter(t => t.pnl > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const totalPnl = recentTrades.reduce((sum, trade) => sum + trade.pnl, 0);

    // Get recent signals
    const recentSignals = await prisma.signal.findMany({
      where: { isProcessed: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

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
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
