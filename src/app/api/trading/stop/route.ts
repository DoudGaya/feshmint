import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, executeWithRetry, connectWithRetry } from '@/lib/prisma';
import { AutonomousTradingBot } from '@/lib/autonomous-trading-bot';

// Reference to the global trading bot instance
declare global {
  var tradingBot: AutonomousTradingBot | undefined;
}

export async function POST(request: NextRequest) {
  try {
    await connectWithRetry();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Stop the global trading bot if it exists
    if (global.tradingBot && global.tradingBot.isActive()) {
      await global.tradingBot.stop();
      console.log('🛑 Trading bot stopped');
    }

    // Upsert trading settings to inactive with retry logic
    await executeWithRetry(async () => {
      return await prisma.tradingSettings.upsert({
        where: { userId: session.user.id },
        update: { isActive: false },
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
          isActive: false
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Trading stopped successfully',
      status: 'STOPPED',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Failed to stop trading:', error);
    return NextResponse.json(
      { 
        error: 'Failed to stop trading',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
