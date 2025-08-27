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

    const portfolio = await prisma.portfolio.findFirst({
      where: { 
        userId: session.user.id,
        isActive: true 
      },
    });

    if (!portfolio) {
      // Create default portfolio if none exists
      const newPortfolio = await prisma.portfolio.create({
        data: {
          userId: session.user.id,
          startingEquity: 5000,
          currentEquity: 5000,
          totalPnl: 0,
          dailyPnl: 0,
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          winRate: 0,
          tradingMode: 'PAPER',
          isActive: true,
        },
      });
      return NextResponse.json(newPortfolio);
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Portfolio API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}
