/**
 * Helius Client for Solana Blockchain Interaction
 * 
 * This module provides a clean interface to interact with the Solana blockchain
 * using Helius RPC endpoints and REST API, without importing the problematic Helius SDK.
 */

import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  TransactionInstruction,
  Keypair,
  SendOptions,
  SystemProgram,
  LAMPORTS_PER_SOL,
  type Commitment,
} from '@solana/web3.js';
import { HELIUS_CONFIG, SOLANA_CONFIG } from './config';

// Simple logger for Helius operations
const HeliusLogger = {
  info: (...args: unknown[]) => console.log('[HeliusClient]', ...args),
  warn: (...args: unknown[]) => console.warn('[HeliusClient]', ...args),
  error: (...args: unknown[]) => console.error('[HeliusClient]', ...args),
  debug: (...args: unknown[]) => console.debug('[HeliusClient]', ...args),
};

/**
 * Token balance information from Helius API
 */
export interface TokenBalance {
  mint: string;
  tokenAccount: string;
  amount: string; // raw amount string
  decimals: number;
  uiAmount: number;
  symbol?: string;
}

/**
 * Decoded transaction information from Helius API
 */
export interface DecodedTransaction {
  signature: string;
  slot: number;
  timestamp?: number;
  type?: string;
  source?: string;
  fee?: number;
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
  tokenTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    tokenAmount: number;
    mint: string;
    tokenStandard?: string;
    symbol?: string;
  }>;
  description?: string;
  events?: Record<string, unknown>;
}

/**
 * Enhanced send transaction options
 */
export interface SendTxOptions extends SendOptions {
  preflightCommitment?: Commitment;
}

/**
 * Rate limiter for API calls
 */
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number;

  constructor(maxRequests = 10, timeWindowMs = 1000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    // If we're at the limit, wait
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.acquire();
      }
    }
    
    this.requests.push(now);
  }
}

/**
 * Main Helius Client class
 * Provides methods to interact with Solana blockchain via Helius RPC and REST API
 */
export class HeliusClient {
  private httpUrl: string;
  private wsUrl: string;
  private apiKey: string;
  private commitment: Commitment;
  private timeoutMs: number;
  private connection: Connection; // Initialize in constructor
  private rateLimiter: RateLimiter;

  constructor(opts?: {
    httpUrl?: string;
    wsUrl?: string;
    apiKey?: string;
    commitment?: Commitment;
    timeoutMs?: number;
  }) {
    this.httpUrl = opts?.httpUrl || HELIUS_CONFIG.RPC_URL;
    this.wsUrl = opts?.wsUrl || HELIUS_CONFIG.WS_URL;
    this.apiKey = opts?.apiKey || HELIUS_CONFIG.API_KEY;
    this.commitment = opts?.commitment || SOLANA_CONFIG.COMMITMENT;
    this.timeoutMs = opts?.timeoutMs || SOLANA_CONFIG.TRANSACTION_TIMEOUT;
    this.rateLimiter = new RateLimiter(10, 1000); // 10 requests per second

    // Initialize Connection with HTTP endpoint
    this.connection = new Connection(this.httpUrl, {
      commitment: this.commitment,
      wsEndpoint: this.wsUrl,
    });

    HeliusLogger.info('Initialized', {
      httpUrl: this.httpUrl.includes('helius') ? 'helius' : 'solana',
      wsUrl: this.wsUrl.includes('helius') ? 'helius' : 'solana',
      commitment: this.commitment,
    });
  }

  /**
   * Get the underlying Solana connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Fetch token balances for a wallet address using Helius REST API
   * Falls back to RPC if REST API fails
   */
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    await this.rateLimiter.acquire();
    
    try {
      const url = `${HELIUS_CONFIG.API_BASE_URL}/v0/addresses/${address}/balances?api-key=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Helius balances failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as { tokens?: Array<Record<string, unknown>> };
      
      // Normalize token balance data
      const tokens: TokenBalance[] = (data?.tokens || []).map((token) => ({
        mint: String(token?.mint || ''),
        tokenAccount: String(token?.tokenAccount || ''),
        amount: String(token?.amount ?? '0'),
        decimals: Number(token?.decimals ?? 0),
        uiAmount: Number(token?.uiAmount ?? 0),
        symbol: token?.symbol as string | undefined,
      }));
      
      return tokens;
    } catch (error) {
      HeliusLogger.warn('Helius REST balances failed, falling back to RPC:', error);
      
      // Fallback: use RPC to fetch SPL tokens
      const owner = new PublicKey(address);
      const tokenProgramId = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
      const response = await this.connection.getParsedTokenAccountsByOwner(owner, { programId: tokenProgramId });
      
      const tokens: TokenBalance[] = response.value.map(({ account, pubkey }) => {
        const info = account.data.parsed.info as Record<string, unknown>;
        const tokenAmount = info.tokenAmount as Record<string, unknown>;
        const mint = String(info.mint || '');
        const decimals = Number(tokenAmount.decimals ?? 0);
        const uiAmount = Number(tokenAmount.uiAmount ?? 0);
        
        return {
          mint,
          tokenAccount: pubkey.toBase58(),
          amount: String(tokenAmount.amount ?? '0'),
          decimals,
          uiAmount,
        };
      });
      
      return tokens;
    }
  }

  /**
   * Fetch recent decoded transactions for an address using Helius REST API
   */
  async getRecentTransactions(address: string, limit = 20): Promise<DecodedTransaction[]> {
    await this.rateLimiter.acquire();
    
    const url = `${HELIUS_CONFIG.API_BASE_URL}/v0/addresses/${address}/transactions?api-key=${this.apiKey}&limit=${limit}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Helius transactions failed: ${response.status} ${response.statusText}`);
    }
    
    const transactions = await response.json() as DecodedTransaction[];
    return transactions;
  }

  /**
   * Create a webhook for real-time notifications (server-side usage)
   */
  async createWebhook(params: {
    webhookUrl: string; // Your HTTPS webhook receiver
    accountAddresses?: string[];
    transactionTypes?: string[]; // e.g. ["SWAP","TRANSFER"]
    authHeader?: string; // Optional secret header
  }): Promise<{ id: string }> {
    await this.rateLimiter.acquire();
    
    const url = `${HELIUS_CONFIG.API_BASE_URL}/v0/webhooks?api-key=${this.apiKey}`;
    const body = {
      webhookURL: params.webhookUrl,
      accountAddresses: params.accountAddresses || [],
      transactionTypes: params.transactionTypes || [],
      authHeader: params.authHeader || undefined,
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`Helius createWebhook failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as Record<string, unknown>;
    return { id: String(data?.id || data?.webhookID || '') };
  }

  /**
   * Subscribe to account changes via WebSocket
   */
  async onAccountChange(address: string, callback: (lamports: number) => void): Promise<number> {
    const pubkey = new PublicKey(address);
    const subscriptionId = this.connection.onAccountChange(pubkey, (accountInfo) => {
      callback(accountInfo.lamports);
    });
    return subscriptionId;
  }

  /**
   * Subscribe to program logs via WebSocket
   */
  async onLogs(programId: string, callback: (logs: string[]) => void): Promise<number> {
    const subscriptionId = this.connection.onLogs(
      new PublicKey(programId),
      (logInfo) => callback(logInfo.logs || []),
      this.commitment
    );
    return subscriptionId;
  }

  /**
   * Remove a WebSocket subscription
   */
  async removeSubscription(subscriptionId: number): Promise<void> {
    try {
      await this.connection.removeOnLogsListener(subscriptionId);
    } catch {
      try {
        await this.connection.removeAccountChangeListener(subscriptionId);
      } catch (error) {
        HeliusLogger.warn('removeSubscription failed', error);
      }
    }
  }

  /**
   * Simulate a transaction to check for errors
   */
  async simulate(transaction: Transaction): Promise<void> {
    const simulation = await this.connection.simulateTransaction(transaction);
    
    if (simulation.value.err) {
      HeliusLogger.error('Simulation error:', simulation.value.err, simulation.value.logs);
      throw new Error(JSON.stringify(simulation.value.err));
    }
    
    HeliusLogger.info('Simulation success. Units consumed:', simulation.value.unitsConsumed);
  }

  /**
   * Send and confirm a transaction (supports both legacy and versioned transactions)
   */
  async sendAndConfirm(
    transaction: Transaction | VersionedTransaction,
    options?: SendTxOptions
  ): Promise<string> {
    let signature: string;
    const preflightCommitment = (options?.preflightCommitment || this.commitment) as Commitment;

    if (transaction instanceof VersionedTransaction) {
      // Versioned transaction overload
      signature = await this.connection.sendTransaction(transaction, {
        preflightCommitment,
        skipPreflight: options?.skipPreflight,
        maxRetries: options?.maxRetries,
      });
    } else {
      // Legacy transaction overload - assume already signed
      signature = await this.connection.sendTransaction(transaction, [], {
        preflightCommitment,
        skipPreflight: options?.skipPreflight,
        maxRetries: options?.maxRetries,
      });
    }

    // Confirm the transaction
    const latestBlockhash = await this.connection.getLatestBlockhash(this.commitment);
    const confirmation = await this.connection.confirmTransaction(
      {
        signature,
        ...latestBlockhash,
      },
      this.commitment
    );

    if (confirmation.value.err) {
      HeliusLogger.error('Transaction confirmation error:', confirmation.value.err);
      throw new Error('Transaction failed to confirm');
    }

    HeliusLogger.info('Transaction confirmed', signature);
    return signature;
  }

  /**
   * Example: Build and send a simple SOL transfer
   */
  async transferSOL(params: {
    from: Keypair;
    to: string;
    sol: number;
  }): Promise<string> {
    const transaction = new Transaction();
    transaction.feePayer = params.from.publicKey;
    
    const latestBlockhash = await this.connection.getLatestBlockhash(this.commitment);
    transaction.recentBlockhash = latestBlockhash.blockhash;

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: params.from.publicKey,
        toPubkey: new PublicKey(params.to),
        lamports: Math.round(params.sol * LAMPORTS_PER_SOL),
      })
    );

    transaction.sign(params.from);

    await this.simulate(transaction);
    return this.sendAndConfirm(transaction);
  }
}

// Export the logger for use in other modules
export { HeliusLogger };
