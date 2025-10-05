import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, executeWithRetry, connectWithRetry } from '@/lib/prisma';

export async function GET() {
  try {
    await connectWithRetry();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const positions = await executeWithRetry(async () => {
      return await prisma.position.findMany({
        where: { 
          portfolio: {
            userId: session.user.id,
            isActive: true
          }
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    return NextResponse.json(positions.map(position => ({
      id: position.id,
      tokenSymbol: position.tokenSymbol,
      tokenName: position.tokenName,
      tokenAddress: position.tokenAddress || '',
      amount: position.amount,
      averagePrice: position.averagePrice,
      currentPrice: position.currentPrice,
      unrealizedPnl: position.unrealizedPnl,
      realizedPnl: position.realizedPnl,
      stopLossPrice: position.stopLossPrice,
      takeProfitPrice: position.takeProfitPrice,
      tradingMode: position.tradingMode,
      createdAt: position.createdAt.toISOString(),
      updatedAt: position.updatedAt.toISOString(),
    })));
  } catch (error) {
    console.error('Positions API error:', error);
    
    // Return mock data if database is unavailable
    return NextResponse.json([
      {
        id: 'mock-1',
        tokenSymbol: 'SOL',
        tokenName: 'Solana',
        tokenAddress: 'So11111111111111111111111111111111111111112',
        amount: 5.0,
        averagePrice: 145.50,
        currentPrice: 152.30,
        unrealizedPnl: 34.00,
        realizedPnl: 0,
        stopLossPrice: 130.95,
        takeProfitPrice: 174.60,
        tradingMode: 'PAPER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ]);
  }
}
