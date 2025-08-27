import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';

    // Calculate date range based on timeframe
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    const trades = await prisma.trade.findMany({
      where: { 
        userId: session.user.id,
        createdAt: {
          gte: startDate,
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to prevent large responses
    });

    return NextResponse.json(trades.map(trade => ({
      id: trade.id,
      type: trade.type,
      tokenSymbol: trade.tokenSymbol,
      amount: trade.amount,
      price: trade.price,
      pnl: trade.pnl,
      pnlPercentage: trade.pnlPercentage,
      status: trade.status,
      createdAt: trade.createdAt.toISOString(),
      executedAt: trade.executedAt?.toISOString(),
    })));
  } catch (error) {
    console.error('Portfolio trades API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio trades' },
      { status: 500 }
    );
  }
}
