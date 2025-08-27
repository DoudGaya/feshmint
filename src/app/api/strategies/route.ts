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

    const strategies = await prisma.strategy.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(strategies.map(strategy => ({
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
      status: strategy.status,
      totalTrades: strategy.totalTrades,
      winRate: strategy.winRate,
      totalPnl: strategy.totalPnl,
      isActive: strategy.isActive,
      createdAt: strategy.createdAt.toISOString(),
      config: strategy.config,
    })));
  } catch (error) {
    console.error('Strategies API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch strategies' },
      { status: 500 }
    );
  }
}
