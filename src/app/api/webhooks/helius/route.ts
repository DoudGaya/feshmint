/**
 * Helius Webhook Handler
 * 
 * API endpoint to receive and process webhook notifications from Helius
 * for real-time transaction monitoring and event processing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { heliusRealtimeMonitor } from '@/lib/helius/realtimeMonitor';
import { HeliusLogger } from '@/lib/helius/heliusClient';

/**
 * Webhook payload interface from Helius
 */
interface HeliusWebhookPayload {
  accountData?: Array<{
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges?: Array<{
      mint: string;
      rawTokenAmount: {
        tokenAmount: string;
        decimals: number;
      };
      userAccount: string;
    }>;
  }>;
  description: string;
  events: Record<string, unknown>;
  fee: number;
  feePayer: string;
  instructions: Array<{
    accounts: string[];
    data: string;
    programId: string;
    innerInstructions?: Array<Record<string, unknown>>;
  }>;
  nativeTransfers?: Array<{
    amount: number;
    fromUserAccount: string;
    toUserAccount: string;
  }>;
  signature: string;
  slot: number;
  timestamp: number;
  tokenTransfers?: Array<{
    fromTokenAccount: string;
    fromUserAccount: string;
    mint: string;
    toTokenAccount: string;
    toUserAccount: string;
    tokenAmount: number;
    tokenStandard: string;
  }>;
  transactionError?: Record<string, unknown> | null;
  type: string;
  source: string;
}

/**
 * Verify webhook authenticity (optional - implement based on your security needs)
 */
function verifyWebhookSignature(
  _payload: string,
  _signature: string,
  _secret: string
): boolean {
  // Implement HMAC verification if Helius provides webhook signatures
  // For now, we'll skip this verification
  return true;
}

/**
 * Process transaction webhook data
 */
function processTransactionWebhook(data: HeliusWebhookPayload) {
  try {
    HeliusLogger.info(`Processing ${data.type} transaction: ${data.signature}`);

    // Emit events based on transaction type
    switch (data.type) {
      case 'TRANSFER':
        heliusRealtimeMonitor.emit('transaction', {
          type: 'TRANSACTION' as const,
          signature: data.signature,
          slot: data.slot,
          timestamp: data.timestamp * 1000,
          accounts: data.instructions.flatMap(ix => ix.accounts),
          success: !data.transactionError,
          error: data.transactionError ? JSON.stringify(data.transactionError) : undefined,
          fee: data.fee,
        });
        break;

      case 'SWAP':
        if (data.tokenTransfers && data.tokenTransfers.length >= 2) {
          heliusRealtimeMonitor.emit('tokenSwap', {
            type: 'TOKEN_SWAP' as const,
            signature: data.signature,
            swapper: data.feePayer,
            inputMint: data.tokenTransfers[0].mint,
            outputMint: data.tokenTransfers[1].mint,
            inputAmount: data.tokenTransfers[0].tokenAmount,
            outputAmount: data.tokenTransfers[1].tokenAmount,
            timestamp: data.timestamp * 1000,
            dexProgram: data.instructions[0]?.programId,
          });
        }
        break;

      case 'NFT_SALE':
      case 'NFT_BID':
      case 'NFT_LISTING':
        // Handle NFT transactions if needed
        HeliusLogger.debug(`NFT transaction: ${data.type}`);
        break;

      default:
        HeliusLogger.debug(`Unhandled transaction type: ${data.type}`);
    }

    // Process balance changes
    if (data.accountData) {
      data.accountData.forEach(accountChange => {
        if (accountChange.nativeBalanceChange !== 0) {
          heliusRealtimeMonitor.emit('balanceChange', {
            type: 'BALANCE_CHANGE' as const,
            account: accountChange.account,
            mint: 'SOL',
            oldBalance: 0, // Would need to track previous state
            newBalance: accountChange.nativeBalanceChange,
            change: accountChange.nativeBalanceChange,
            timestamp: data.timestamp * 1000,
          });
        }

        // Process token balance changes
        if (accountChange.tokenBalanceChanges) {
          accountChange.tokenBalanceChanges.forEach(tokenChange => {
            heliusRealtimeMonitor.emit('balanceChange', {
              type: 'BALANCE_CHANGE' as const,
              account: tokenChange.userAccount,
              mint: tokenChange.mint,
              oldBalance: 0, // Would need to track previous state
              newBalance: parseInt(tokenChange.rawTokenAmount.tokenAmount),
              change: parseInt(tokenChange.rawTokenAmount.tokenAmount),
              timestamp: data.timestamp * 1000,
            });
          });
        }
      });
    }

    // Emit raw webhook data for custom processing
    heliusRealtimeMonitor.emit('webhookEvent', data);

  } catch (error) {
    HeliusLogger.error('Error processing webhook data', error);
  }
}

/**
 * POST handler for Helius webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Verify content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    // Parse webhook payload
    const body = await request.text();
    let webhookData: HeliusWebhookPayload[] | HeliusWebhookPayload;

    try {
      webhookData = JSON.parse(body);
    } catch (parseError) {
      HeliusLogger.error('Failed to parse webhook JSON', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Verify webhook signature if provided
    const signature = request.headers.get('x-webhook-signature');
    const webhookSecret = process.env.HELIUS_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(body, signature, webhookSecret);
      if (!isValid) {
        HeliusLogger.error('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Process webhook data
    if (Array.isArray(webhookData)) {
      // Handle batch of transactions
      HeliusLogger.info(`Processing batch of ${webhookData.length} webhook events`);
      webhookData.forEach(processTransactionWebhook);
    } else {
      // Handle single transaction
      processTransactionWebhook(webhookData);
    }

    // Log successful processing
    HeliusLogger.info('Webhook processed successfully');

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        processed: Array.isArray(webhookData) ? webhookData.length : 1,
        timestamp: Date.now()
      },
      { status: 200 }
    );

  } catch (error) {
    HeliusLogger.error('Webhook handler error', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for webhook verification/health check
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const challenge = url.searchParams.get('hub.challenge');
    
    // Return challenge for webhook verification (if using webhook verification flow)
    if (challenge) {
      return new Response(challenge, { status: 200 });
    }

    // Health check response
    return NextResponse.json({
      status: 'healthy',
      service: 'helius-webhook-handler',
      timestamp: Date.now(),
      version: '1.0.0'
    });

  } catch (error) {
    HeliusLogger.error('Webhook GET handler error', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
