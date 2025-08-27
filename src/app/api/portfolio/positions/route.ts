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

    const positions = await prisma.position.findMany({
      where: { 
        portfolio: {
          userId: session.user.id,
          isActive: true
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(positions.map(position => ({
      id: position.id,
      tokenSymbol: position.tokenSymbol,
      tokenName: position.tokenName,
      amount: position.amount,
      averagePrice: position.averagePrice,
      currentPrice: position.currentPrice,
      unrealizedPnl: position.unrealizedPnl,
      tradingMode: position.tradingMode,
      createdAt: position.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error('Portfolio positions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio positions' },
      { status: 500 }
    );
  }
}
