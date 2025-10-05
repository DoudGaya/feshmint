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

    const { signal, tradeType, amount, settings } = await request.json();

    // Validate required fields
    if (!signal || !tradeType || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: signal, tradeType, amount' },
        { status: 400 }
      );
    }

    // Check if trading is enabled for this user
    const userSettings = await prisma.tradingSettings.findUnique({
      where: { userId: session.user.id }
    });

    if (!userSettings?.isActive) {
      return NextResponse.json(
        { error: 'Trading is not enabled for this account' },
        { status: 403 }
      );
    }

    // Initialize trading systems
    const executionEngine = new AdvancedExecutionEngine();
    const riskManager = new EnhancedRiskManager();

    // Pre-trade risk assessment
    const riskAssessment = await riskManager.assessTradeRisk({
      userId: session.user.id,
      tokenAddress: signal.tokenAddress,
      tradeType,
      amount,
      currentPrice: signal.price,
      signal: {
        confidence: signal.confidence,
        source: signal.source,
        type: signal.type,
        metadata: signal.metadata
      }
    });

    if (!riskAssessment.approved) {
      return NextResponse.json(
        { 
          error: 'Trade rejected by risk management',
          riskScore: riskAssessment.riskScore,
          riskFactors: riskAssessment.riskFactors,
          recommendations: riskAssessment.recommendations
        },
        { status: 400 }
      );
    }

    // Execute the trade
    const executionResult = await executionEngine.executeTrade({
      userId: session.user.id,
      signal,
      tradeType,
      amount: riskAssessment.adjustedPositionSize || amount,
      settings: {
        ...settings,
        maxSlippage: settings?.maxSlippage || 0.01,
        priorityFee: settings?.priorityFee || 0.001,
        ...userSettings
      }
    });

    if (!executionResult.success) {
      return NextResponse.json(
        {
          error: 'Trade execution failed',
          reason: executionResult.error,
          details: executionResult.details
        },
        { status: 500 }
      );
    }

    // Get or create user's portfolio
    let portfolio = await prisma.portfolio.findFirst({
      where: {
        userId: session.user.id,
        tradingMode: 'LIVE'
      }
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId: session.user.id,
          tradingMode: 'LIVE'
        }
      });
    }

    // Record the trade in the database (using correct schema fields)
    const trade = await prisma.trade.create({
      data: {
        userId: session.user.id,
        portfolioId: portfolio.id,
        signalId: signal.id,
        tokenAddress: signal.tokenAddress,
        tokenName: signal.tokenName || 'Unknown',
        tokenSymbol: signal.tokenSymbol || 'UNK',
        type: tradeType,
        amount: executionResult.actualAmount || amount,
        price: executionResult.executionPrice || signal.price,
        estimatedPrice: signal.price,
        fees: executionResult.fees || 0,
        slippage: executionResult.slippage || 0,
        txHash: executionResult.txHash || '',
        status: 'EXECUTED',
        tradingMode: 'LIVE',
        metadata: {}
      }
    });

    return NextResponse.json({
      success: true,
      trade: {
        id: trade.id,
        tokenAddress: trade.tokenAddress,
        tokenSymbol: trade.tokenSymbol,
        type: trade.type,
        amount: trade.amount,
        price: trade.price,
        fees: trade.fees,
        slippage: trade.slippage,
        txHash: trade.txHash,
        status: trade.status,
        createdAt: trade.createdAt
      },
      execution: {
        actualAmount: executionResult.actualAmount || amount,
        executionPrice: executionResult.executionPrice || signal.price,
        fees: executionResult.fees || 0,
        slippage: executionResult.slippage || 0,
        gasUsed: executionResult.gasUsed || 0,
        processingTime: executionResult.processingTime || 0
      },
      riskAssessment: {
        riskScore: riskAssessment.riskScore,
        riskFactors: riskAssessment.riskFactors,
        warnings: riskAssessment.warnings
      }
    });

  } catch (error) {
    console.error('Trade execution error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during trade execution',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}
