/**
 * Helius Trading Bot
 * 
 * Core trading bot implementation using Helius SDK for Solana blockchain
 * interaction. Handles wallet balance monitoring, transaction execution,
 * and real-time trading operations.
 */

import { 
  Keypair, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import { HeliusClient, HeliusLogger, TokenBalance } from './heliusClient';
import { SOLANA_CONFIG, TOKEN_ADDRESSES, TRADING_CONFIG } from './config';

/**
 * Wallet balance information
 */
export interface WalletBalance {
  address: string;
  mint: string;
  symbol?: string;
  balance: number;
  decimals: number;
  uiAmount: number;
  valueInSOL?: number;
  valueInUSD?: number;
}

/**
 * Transaction monitoring result
 */
export interface TransactionResult {
  signature: string;
  success: boolean;
  slot?: number;
  blockTime?: number;
  fee?: number;
  error?: string;
  logs?: string[];
  description?: string;
}

/**
 * Trade execution parameters
 */
export interface TradeParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippage?: number;
  priorityFee?: number;
  computeUnitLimit?: number;
}

/**
 * Trade execution result
 */
export interface TradeResult {
  success: boolean;
  signature?: string;
  inputAmount: number;
  outputAmount?: number;
  priceImpact?: number;
  fee?: number;
  error?: string;
  logs?: string[];
}

/**
 * Main Trading Bot Class
 * 
 * Handles all trading operations including balance monitoring,
 * transaction execution, and real-time market interactions.
 */
export class HeliusTradingBot {
  private wallet: Keypair | null = null;
  private balanceCache: Map<string, WalletBalance> = new Map();
  private lastBalanceUpdate: number = 0;
  private balanceCacheTimeout: number = 30000; // 30 seconds
  private heliusClient: HeliusClient;

  constructor(private walletPrivateKey?: string) {
    this.heliusClient = new HeliusClient();
    if (walletPrivateKey) {
      this.initializeWallet(walletPrivateKey);
    }
  }

  /**
   * Initialize wallet from private key
   */
  private initializeWallet(privateKey: string): void {
    try {
      const keyBytes = Uint8Array.from(JSON.parse(privateKey));
      this.wallet = Keypair.fromSecretKey(keyBytes);
      HeliusLogger.info(`Wallet initialized: ${this.wallet.publicKey.toBase58()}`);
    } catch (error) {
      HeliusLogger.error('Failed to initialize wallet from private key', error);
      throw new Error('Invalid wallet private key format');
    }
  }

  /**
   * Set wallet keypair directly
   */
  setWallet(wallet: Keypair): void {
    this.wallet = wallet;
    this.clearBalanceCache();
    HeliusLogger.info(`Wallet set: ${wallet.publicKey.toBase58()}`);
  }

  /**
   * Get wallet public key
   */
  getWalletAddress(): string | null {
    return this.wallet?.publicKey.toBase58() || null;
  }

  /**
   * Clear balance cache
   */
  private clearBalanceCache(): void {
    this.balanceCache.clear();
    this.lastBalanceUpdate = 0;
  }

  /**
   * Get comprehensive wallet balances including SOL and all tokens
   */
  async getWalletBalances(useCache: boolean = true): Promise<WalletBalance[]> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized. Call setWallet() first.');
    }

    const now = Date.now();
    
    // Return cached balances if still valid
    if (useCache && 
        this.balanceCache.size > 0 && 
        (now - this.lastBalanceUpdate) < this.balanceCacheTimeout) {
      HeliusLogger.debug('Returning cached wallet balances');
      return Array.from(this.balanceCache.values());
    }

    try {
      HeliusLogger.debug('Fetching fresh wallet balances...');
      const balances: WalletBalance[] = [];

      // Get SOL balance
      const solBalance = await this.heliusClient.getConnection().getBalance(this.wallet.publicKey);
      const solBalanceData: WalletBalance = {
        address: this.wallet.publicKey.toBase58(),
        mint: TOKEN_ADDRESSES.SOL,
        symbol: 'SOL',
        balance: solBalance,
        decimals: 9,
        uiAmount: solBalance / LAMPORTS_PER_SOL,
        valueInSOL: solBalance / LAMPORTS_PER_SOL,
      };
      balances.push(solBalanceData);

      // Get token balances using Helius enhanced API
      const tokenAccounts = await this.heliusClient.getTokenBalances(this.wallet.publicKey.toBase58());
      
      for (const account of tokenAccounts) {
        const mint = account.mint;
        const balance = parseInt(account.amount);
        const decimals = account.decimals;
        const uiAmount = account.uiAmount;

        if (balance > 0) { // Only include tokens with positive balance
          const tokenBalance: WalletBalance = {
            address: account.tokenAccount,
            mint,
            balance,
            decimals,
            uiAmount,
          };

          // Try to get symbol from known tokens
          const knownToken = Object.entries(TOKEN_ADDRESSES).find(([, address]) => address === mint);
          if (knownToken) {
            tokenBalance.symbol = knownToken[0];
          }

          balances.push(tokenBalance);
        }
      }

      // Update cache
      this.balanceCache.clear();
      balances.forEach(balance => {
        this.balanceCache.set(balance.mint, balance);
      });
      this.lastBalanceUpdate = now;

      HeliusLogger.info(`Fetched balances for ${balances.length} tokens`);
      return balances;

    } catch (error) {
      HeliusLogger.error('Failed to fetch wallet balances', error);
      throw error;
    }
  }

  /**
   * Get balance for a specific token
   */
  async getTokenBalance(mintAddress: string): Promise<WalletBalance | null> {
    const balances = await this.getWalletBalances();
    return balances.find(balance => balance.mint === mintAddress) || null;
  }

  /**
   * Monitor recent transactions for the wallet
   */
  async getRecentTransactions(limit: number = 50): Promise<TransactionResult[]> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      HeliusLogger.debug(`Fetching ${limit} recent transactions...`);
      
      const signatures = await this.heliusClient.getRecentTransactions(
        this.wallet.publicKey.toBase58(),
        20
      );

      const transactions: TransactionResult[] = [];

      for (const sigInfo of signatures) {
        try {
          const txResult: TransactionResult = {
            signature: sigInfo.signature,
            success: true, // Decoded transactions from Helius are typically successful
            slot: sigInfo.slot,
            blockTime: sigInfo.timestamp,
          };

          // Add additional transaction details if available
          if (sigInfo.description) {
            txResult.description = sigInfo.description;
          }

          transactions.push(txResult);
        } catch (error) {
          HeliusLogger.error(`Failed to process transaction ${sigInfo.signature}`, error);
        }
      }

      HeliusLogger.info(`Retrieved ${transactions.length} recent transactions`);
      return transactions;

    } catch (error) {
      HeliusLogger.error('Failed to fetch recent transactions', error);
      throw error;
    }
  }

  /**
   * Get detailed transaction information
   */
  async getTransactionDetails(signature: string): Promise<Record<string, unknown> | null> {
    try {
      const transaction = await this.heliusClient.getConnection().getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });
      return transaction;
    } catch (error) {
      HeliusLogger.error(`Failed to get transaction details for ${signature}`, error);
      throw error;
    }
  }

  /**
   * Simulate a trade before execution
   */
  async simulateTrade(params: TradeParams): Promise<{
    success: boolean;
    inputAmount: number;
    outputAmount?: number;
    priceImpact?: number;
    fee?: number;
    error?: string;
  }> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      HeliusLogger.debug('Simulating trade...', params);

      // This is a simplified simulation
      // In production, you would use Jupiter or other DEX APIs
      const transaction = await this.buildTradeTransaction(params, true);
      
      await this.heliusClient.simulate(transaction);
      
      // If simulation succeeds, provide mock results
      // Parse simulation results (simplified)
      const outputAmount = params.amount * 0.99; // Mock 1% slippage
      const priceImpact = 0.01; // Mock 1% price impact
      const fee = 0.000005; // Mock fee in SOL

      return {
        success: true,
        inputAmount: params.amount,
        outputAmount,
        priceImpact,
        fee,
      };

    } catch (error) {
      HeliusLogger.error('Trade simulation failed', error);
      return {
        success: false,
        inputAmount: params.amount,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute a trade
   */
  async executeTrade(params: TradeParams): Promise<TradeResult> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      HeliusLogger.info('Executing trade...', params);

      // First simulate the trade
      const simulation = await this.simulateTrade(params);
      if (!simulation.success) {
        return {
          success: false,
          inputAmount: params.amount,
          error: simulation.error,
        };
      }

      // Build and send transaction
      const transaction = await this.buildTradeTransaction(params);
      const signature = await this.heliusClient.sendAndConfirm(transaction);

      const result: TradeResult = {
        success: true,
        signature,
        inputAmount: params.amount,
        outputAmount: simulation.outputAmount,
        priceImpact: simulation.priceImpact,
        fee: simulation.fee,
      };

      HeliusLogger.info('Trade executed successfully', result);
      
      // Clear balance cache to force refresh
      this.clearBalanceCache();
      
      return result;

    } catch (error) {
      HeliusLogger.error('Trade execution failed', error);
      return {
        success: false,
        inputAmount: params.amount,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Build a trade transaction (simplified - replace with actual DEX integration)
   */
  private async buildTradeTransaction(
    params: TradeParams, 
    isSimulation: boolean = false
  ): Promise<Transaction> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    const transaction = new Transaction();

    // Add compute budget instructions
    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: params.computeUnitLimit || TRADING_CONFIG.COMPUTE_UNIT_LIMIT,
      })
    );

    if (params.priorityFee && params.priorityFee > 0) {
      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: params.priorityFee,
        })
      );
    }

    // This is a placeholder for actual DEX integration
    // In production, you would integrate with Jupiter, Raydium, etc.
    
    // For demonstration, create a simple transfer instruction
    if (params.inputMint === TOKEN_ADDRESSES.SOL) {
      // SOL transfer example
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: this.wallet.publicKey,
          toPubkey: this.wallet.publicKey, // Self-transfer for demo
          lamports: Math.floor(params.amount * LAMPORTS_PER_SOL),
        })
      );
    }

    // Get recent blockhash
    const { blockhash } = await this.heliusClient.getConnection().getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = this.wallet.publicKey;

    // Sign transaction if not simulation
    if (!isSimulation) {
      transaction.sign(this.wallet);
    }

    return transaction;
  }

  /**
   * Check if wallet has sufficient balance for trade
   */
  async hasSufficientBalance(mintAddress: string, amount: number): Promise<boolean> {
    try {
      const balance = await this.getTokenBalance(mintAddress);
      if (!balance) return false;

      // Add buffer for fees
      if (mintAddress === TOKEN_ADDRESSES.SOL) {
        return balance.uiAmount >= (amount + TRADING_CONFIG.MIN_SOL_BALANCE);
      }

      return balance.uiAmount >= amount;
    } catch (error) {
      HeliusLogger.error('Failed to check balance', error);
      return false;
    }
  }

  /**
   * Get optimal trade route (placeholder for DEX aggregator integration)
   */
  async getTradeRoute(
    inputMint: string,
    outputMint: string,
    amount: number
  ): Promise<{
    route?: Record<string, unknown>;
    outputAmount?: number;
    priceImpact?: number;
    error?: string;
  }> {
    try {
      // This would integrate with Jupiter or other DEX aggregators
      // For now, return mock data
      return {
        outputAmount: amount * 0.99, // Mock 1% slippage
        priceImpact: 0.01,
      };
    } catch (error) {
      HeliusLogger.error('Failed to get trade route', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Monitor wallet for incoming transactions
   */
  async startTransactionMonitoring(callback: (transaction: Record<string, unknown>) => void): Promise<void> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    HeliusLogger.info('Starting transaction monitoring...');
    
    // This would implement WebSocket connection for real-time monitoring
    // For now, we'll implement polling as a fallback
    const pollInterval = 5000; // 5 seconds
    
    const poll = async () => {
      try {
        const recentTransactions = await this.getRecentTransactions(5);
        // Process new transactions
        // Implementation depends on your specific requirements
      } catch (error) {
        HeliusLogger.error('Error in transaction monitoring', error);
      }
    };

    // Start polling
    setInterval(poll, pollInterval);
  }

  /**
   * Get current network performance stats
   */
  async getNetworkStats(): Promise<Record<string, unknown>> {
    try {
      // Since we don't have a specific getNetworkStats method, 
      // let's return some basic network info
      const slot = await this.heliusClient.getConnection().getSlot();
      const blockHeight = await this.heliusClient.getConnection().getBlockHeight();
      
      return {
        currentSlot: slot,
        blockHeight,
        cluster: 'mainnet-beta', // or devnet based on your config
      };
    } catch (error) {
      HeliusLogger.error('Failed to get network stats', error);
      throw error;
    }
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect(): Promise<void> {
    try {
      this.clearBalanceCache();
      // Since our HeliusClient doesn't have a disconnect method,
      // we'll just clean up our internal state
      HeliusLogger.info('Trading bot disconnected');
    } catch (error) {
      HeliusLogger.error('Error during disconnect', error);
      throw error;
    }
  }
}

// Export singleton instance (optional - you might prefer to create instances manually)
export const heliusTradingBot = new HeliusTradingBot();
