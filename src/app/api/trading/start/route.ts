import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, executeWithRetry, connectWithRetry } from '@/lib/prisma';
import { AutonomousTradingBot } from '@/lib/autonomous-trading-bot';

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

    // Get user's trading settings with retry logic, create default if not found
    let settings = await executeWithRetry(async () => {
      return await prisma.tradingSettings.findUnique({
        where: { userId: session.user.id }
      });
    });

    // Create default trading settings if they don't exist
    if (!settings) {
      console.log('Creating default trading settings for user:', session.user.id);
      settings = await executeWithRetry(async () => {
        return await prisma.tradingSettings.create({
          data: {
            userId: session.user.id,
            tradingMode: 'PAPER', // Start with paper trading
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
      console.log('Default trading settings created:', settings.id);
    }

    // Create trading bot configuration
    const botConfig = {
      userId: 'trading-bot-user', // This should come from session/auth
      isActive: true,
      tradingMode: settings.tradingMode,
      maxPositionSize: settings.maxPositionSize,
      portfolioCap: settings.portfolioCap,
      dailyDrawdownLimit: settings.dailyDrawdownLimit,
      winRateThreshold: settings.winRateThreshold,
      minLiquidity: settings.minLiquidity,
      minBuyerConfirmation: settings.minBuyerConfirmation,
      maxDevWalletControl: settings.maxDevWalletControl,
      maxPriceDump: settings.maxPriceDump,
      trailingStopLoss: settings.trailingStopLoss,
      autoTradingEnabled: true,
      signalSources: ['BIRDEYE', 'DEXSCREENER', 'COMPANY'],
      minConfidenceThreshold: 0.6
    };

    // Start trading bot if not already running
    if (!global.tradingBot) {
      global.tradingBot = new AutonomousTradingBot(botConfig);
      
      // Set up event listeners for real-time updates
      global.tradingBot.on('signalReceived', (signal) => {
        console.log('📡 Signal received:', signal.symbol);
        // Broadcast to WebSocket clients
        broadcastToClients('signal_update', signal);
      });

      global.tradingBot.on('tradeUpdate', (tradeUpdate) => {
        console.log('💼 Trade update:', tradeUpdate);
        // Broadcast to WebSocket clients
        broadcastToClients('trade_update', tradeUpdate);
      });

      global.tradingBot.on('portfolioUpdate', (portfolioUpdate) => {
        console.log('📊 Portfolio update:', portfolioUpdate);
        // Broadcast to WebSocket clients
        broadcastToClients('portfolio_update', portfolioUpdate);
      });

      await global.tradingBot.start();
    } else if (!global.tradingBot.isActive()) {
      global.tradingBot.updateConfig(botConfig);
      await global.tradingBot.start();
    }

    // Update trading settings to active with retry logic
    await executeWithRetry(async () => {
      return await prisma.tradingSettings.update({
        where: { userId: session.user.id },
        data: { isActive: true }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Autonomous trading started successfully',
      status: 'ACTIVE',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Failed to start trading:', error);
    
    // Determine error type and provide appropriate response
    if (error instanceof Error) {
      if (error.message.includes('database') || error.message.includes('connection')) {
        return NextResponse.json(
          { 
            error: 'Database connection failed',
            details: 'Unable to connect to the database. Please check your database configuration.',
            suggestion: 'Try again in a moment or contact support if the issue persists.'
          },
          { status: 503 }
        );
      }
      
      if (error.message.includes('UNIQUE constraint')) {
        return NextResponse.json(
          { 
            error: 'Trading settings conflict',
            details: 'There was a conflict creating trading settings. They may already exist.',
            suggestion: 'Please refresh the page and try again.'
          },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to start trading',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        suggestion: 'Please check your configuration and try again.'
      },
      { status: 500 }
    );
  }
}

// Helper function to broadcast to WebSocket clients
function broadcastToClients(type: string, payload: unknown) {
  // This would be implemented with your WebSocket server
  // For now, we'll log it
  console.log(`Broadcasting ${type}:`, payload);
}
