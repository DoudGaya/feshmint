import { NextRequest, NextResponse } from 'next/server';
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

    // Get or create trading settings for the user
    let tradingSettings = await prisma.tradingSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!tradingSettings) {
      // Create default trading settings
      tradingSettings = await prisma.tradingSettings.create({
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
          isActive: false,
        },
      });
    }

    return NextResponse.json({
      isActive: tradingSettings.isActive,
      tradingMode: tradingSettings.tradingMode,
      maxPositionSize: tradingSettings.maxPositionSize,
      portfolioCap: tradingSettings.portfolioCap,
      dailyDrawdownLimit: tradingSettings.dailyDrawdownLimit,
      winRateThreshold: tradingSettings.winRateThreshold,
      minLiquidity: tradingSettings.minLiquidity,
      minBuyerConfirmation: tradingSettings.minBuyerConfirmation,
      maxDevWalletControl: tradingSettings.maxDevWalletControl,
      maxPriceDump: tradingSettings.maxPriceDump,
      trailingStopLoss: tradingSettings.trailingStopLoss,
    });
  } catch (error) {
    console.error('Trading settings API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trading settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const _updatedSettings = await prisma.tradingSettings.upsert({
      where: { userId: session.user.id },
      update: {
        tradingMode: body.tradingMode,
        maxPositionSize: body.maxPositionSize,
        portfolioCap: body.portfolioCap,
        dailyDrawdownLimit: body.dailyDrawdownLimit,
        winRateThreshold: body.winRateThreshold,
        minLiquidity: body.minLiquidity,
        minBuyerConfirmation: body.minBuyerConfirmation,
        maxDevWalletControl: body.maxDevWalletControl,
        maxPriceDump: body.maxPriceDump,
        trailingStopLoss: body.trailingStopLoss,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        tradingMode: body.tradingMode || 'PAPER',
        maxPositionSize: body.maxPositionSize || 500,
        portfolioCap: body.portfolioCap || 5000,
        dailyDrawdownLimit: body.dailyDrawdownLimit || 0.15,
        winRateThreshold: body.winRateThreshold || 0.30,
        minLiquidity: body.minLiquidity || 20000,
        minBuyerConfirmation: body.minBuyerConfirmation || 10,
        maxDevWalletControl: body.maxDevWalletControl || 0.30,
        maxPriceDump: body.maxPriceDump || 0.20,
        trailingStopLoss: body.trailingStopLoss || 0.10,
        isActive: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Trading settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update trading settings' },
      { status: 500 }
    );
  }
}
