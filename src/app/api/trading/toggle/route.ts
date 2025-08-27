import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isActive } = await request.json();

    const updatedSettings = await prisma.tradingSettings.upsert({
      where: { userId: session.user.id },
      update: {
        isActive: isActive,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        tradingMode: 'PAPER',
        maxPositionSize: 500,
        portfolioCap: 5000,
        dailyDrawdownLimit: 0.15,
        winRateThreshold: 0.30,
        minLiquidity: 20000,
        minBuyerConfirmation: 10,
        maxDevWalletControl: 0.30,
        maxPriceDump: 0.20,
        trailingStopLoss: 0.10,
        isActive: isActive,
      },
    });

    return NextResponse.json({ success: true, isActive: updatedSettings.isActive });
  } catch (error) {
    console.error('Trading toggle error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle trading' },
      { status: 500 }
    );
  }
}
