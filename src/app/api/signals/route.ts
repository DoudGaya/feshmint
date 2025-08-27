import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SignalProcessor, SignalData } from '@/lib/signalProcessor';
import { z } from 'zod';

const signalSchema = z.object({
  tokenAddress: z.string().min(32).max(44), // Solana address length
  tokenSymbol: z.string().optional(),
  tokenName: z.string().optional(),
  action: z.enum(['BUY', 'SELL']),
  price: z.number().positive(),
  confidence: z.number().min(0).max(1),
  source: z.enum(['TELEGRAM', 'DISCORD', 'SOLANA_INDEXER', 'MANUAL']),
  metadata: z.record(z.string(), z.unknown()).optional()
});

const signalProcessor = new SignalProcessor();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = signalSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid signal data', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const signalData: SignalData = validationResult.data;

    // Process the signal
    const processedSignal = await signalProcessor.processSignal(session.user.id, signalData);

    if (!processedSignal) {
      return NextResponse.json(
        { error: 'Signal was rejected or could not be processed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      signal: processedSignal
    });

  } catch (error) {
    console.error('Error in signals API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      const signalStats = await signalProcessor.getSignalStats(session.user.id);
      return NextResponse.json(signalStats);
    }

    const signals = await signalProcessor.getSignalHistory(session.user.id, limit);
    return NextResponse.json({ signals });

  } catch (error) {
    console.error('Error fetching signals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
