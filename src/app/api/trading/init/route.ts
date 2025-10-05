import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, executeWithRetry } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if trading settings already exist
    const existingSettings = await executeWithRetry(async () => {
      return await prisma.tradingSettings.findUnique({
        where: { userId: session.user.id }
      });
    });

    if (existingSettings) {
      return NextResponse.json({
        success: true,
        message: 'Trading settings already exist',
        settings: existingSettings
      });
    }

    // Create default trading settings
    const settings = await executeWithRetry(async () => {
      return await prisma.tradingSettings.create({
        data: {
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
      message: 'Trading settings initialized successfully',
      settings
    });

  } catch (error) {
    console.error('Failed to initialize trading settings:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize trading settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
