import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdvancedExecutionEngine } from '@/lib/trading/execution-engine';
import { EnhancedRiskManager } from '@/lib/trading/risk-manager';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { isActive, signalSources } = await request.json();

    // Initialize the trading systems if activating
    if (isActive) {
      try {
        const executionEngine = new AdvancedExecutionEngine();
        const riskManager = new EnhancedRiskManager();
        
        // Validate user's portfolio health before activation
        const portfolioHealth = await riskManager.assessPortfolioHealth(session.user.id);
        
        if (portfolioHealth.riskLevel === 'EXTREME') {
          return NextResponse.json(
            { 
              error: 'Cannot activate trading: Portfolio risk level is critical',
              details: portfolioHealth
            },
            { status: 400 }
          );
        }

        // Initialize signal sources if provided
        if (signalSources && Array.isArray(signalSources)) {
          await executionEngine.initializeSignalSources(signalSources);
        }

        console.log(`Trading activated for user ${session.user.id} with portfolio health: ${portfolioHealth.riskLevel}`);
      } catch (initError) {
        console.error('Failed to initialize trading systems:', initError);
        return NextResponse.json(
          { error: 'Failed to initialize trading systems' },
          { status: 500 }
        );
      }
    }

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
