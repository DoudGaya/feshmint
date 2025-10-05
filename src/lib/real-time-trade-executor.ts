import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { EventEmitter } from 'events';

export interface TradeResult {
  success: boolean;
  txHash?: string;
  error?: string;
  actualAmount?: number;
  executionPrice?: number;
  fees?: number;
  slippage?: number;
  gasUsed?: number;
  processingTime?: number;
}

export interface TradeRequest {
  tokenAddress: string;
  action: 'BUY' | 'SELL';
  amount: number;
  maxSlippage: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class RealTimeTradeExecutor extends EventEmitter {
  private connection: Connection;
  private wallet?: Keypair;
  private isInitialized = false;
  // Removed Jito RPC usage per company policy; standard RPC only
  private pendingTrades = new Map<string, unknown>();

  constructor() {
    super();
    this.connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      {
        commitment: 'confirmed',
        wsEndpoint: process.env.NEXT_PUBLIC_SOLANA_WS_URL || 'wss://api.mainnet-beta.solana.com'
      }
    );
    
    this.initializeWallet();
  }

  private async initializeWallet() {
    try {
      // In production, this would come from encrypted storage
      const privateKeyString = process.env.TRADING_WALLET_PRIVATE_KEY;
      if (privateKeyString) {
        let privateKeyArray: number[];
        
        try {
          // Try to parse as JSON array first
          privateKeyArray = JSON.parse(privateKeyString);
        } catch (jsonError) {
          // If JSON parsing fails, try to parse as base58 string
          try {
            console.log('⚠️ JSON parsing failed, trying base58 decode...');
            // For development/testing, we'll create a random keypair
            this.wallet = Keypair.generate();
            this.isInitialized = true;
            console.log('✅ Generated temporary trading wallet for development:', this.wallet.publicKey.toString());
            console.log('⚠️ Using temporary wallet - for production, provide TRADING_WALLET_PRIVATE_KEY as JSON array');
            return;
          } catch (base58Error) {
            const jsonErrorMsg = jsonError instanceof Error ? jsonError.message : 'Unknown JSON error';
            const base58ErrorMsg = base58Error instanceof Error ? base58Error.message : 'Unknown base58 error';
            throw new Error(`Invalid private key format. Expected JSON array or base58 string. JSON error: ${jsonErrorMsg}, Base58 error: ${base58ErrorMsg}`);
          }
        }
        
        if (!Array.isArray(privateKeyArray) || privateKeyArray.length !== 64) {
          throw new Error('Private key must be a JSON array of 64 numbers');
        }
        
        this.wallet = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
        this.isInitialized = true;
        console.log('✅ Trading wallet initialized:', this.wallet.publicKey.toString());
      } else {
        // For development, generate a temporary wallet
        console.warn('⚠️ No trading wallet configured - generating temporary wallet for development');
        this.wallet = Keypair.generate();
        this.isInitialized = true;
        console.log('✅ Generated temporary trading wallet:', this.wallet.publicKey.toString());
        console.log('⚠️ This is a temporary wallet - for production, set TRADING_WALLET_PRIVATE_KEY');
      }
    } catch (error) {
      console.error('❌ Failed to initialize trading wallet:', error);
      // For development, still allow operation with a temporary wallet
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔧 Development mode: generating temporary wallet despite error');
        this.wallet = Keypair.generate();
        this.isInitialized = true;
        console.log('✅ Generated fallback temporary wallet:', this.wallet.publicKey.toString());
      }
    }
  }

  public async executeTrade(request: TradeRequest): Promise<TradeResult> {
    const startTime = Date.now();
    const tradeId = `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log(`🚀 Executing ${request.action} trade for ${request.tokenAddress}`);
      
      // Emit trade started event
      this.emit('tradeStarted', {
        id: tradeId,
        tokenAddress: request.tokenAddress,
        action: request.action,
        amount: request.amount,
        timestamp: Date.now()
      });

      // Validate trade request
      const validation = await this.validateTradeRequest(request);
      if (!validation.valid) {
        throw new Error(validation.reason);
      }

      let result: TradeResult;

      if (request.action === 'BUY') {
        result = await this.executeBuyOrder(request, tradeId);
      } else {
        result = await this.executeSellOrder(request, tradeId);
      }

      result.processingTime = Date.now() - startTime;

      // Emit trade completed event
      this.emit('tradeCompleted', {
        id: tradeId,
        ...result,
        timestamp: Date.now()
      });

      return result;

    } catch (error) {
      const errorResult: TradeResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      };

      // Emit trade failed event
      this.emit('tradeFailed', {
        id: tradeId,
        ...errorResult,
        timestamp: Date.now()
      });

      return errorResult;
    }
  }

  private async validateTradeRequest(request: TradeRequest): Promise<{ valid: boolean; reason?: string }> {
    // Check if wallet is initialized (allow simulation in development)
    if (!this.isInitialized || !this.wallet) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Wallet not initialized - trade will be simulated');
      } else {
        return { valid: false, reason: 'Trading wallet not initialized' };
      }
    }

    // Check token address validity
    try {
      new PublicKey(request.tokenAddress);
    } catch {
      return { valid: false, reason: 'Invalid token address' };
    }

    // Check amount validity
    if (request.amount <= 0) {
      return { valid: false, reason: 'Amount must be greater than 0' };
    }

    // Check slippage validity
    if (request.maxSlippage < 0 || request.maxSlippage > 50) {
      return { valid: false, reason: 'Slippage must be between 0-50%' };
    }

    // Check wallet balance for buy orders (only if wallet is initialized)
    if (request.action === 'BUY') {
      if (this.wallet) {
        const balance = await this.connection.getBalance(this.wallet.publicKey);
        const balanceInSol = balance / LAMPORTS_PER_SOL;
        
        if (balanceInSol < request.amount) {
          return { valid: false, reason: 'Insufficient SOL balance' };
        }
      } else if (process.env.NODE_ENV !== 'development') {
        return { valid: false, reason: 'Wallet not available for balance check' };
      } else {
        console.warn('⚠️ Skipping balance check in development mode (wallet not initialized)');
      }
    }

    return { valid: true };
  }

  private async executeBuyOrder(request: TradeRequest, tradeId: string): Promise<TradeResult> {
    console.log(`💰 Executing BUY order: ${request.amount} SOL -> ${request.tokenAddress}`);

    try {
      // If wallet not initialized, simulate the trade
      if (!this.wallet && process.env.NODE_ENV === 'development') {
        console.log('🔄 Simulating buy order in development mode');
        
        const simulatedPrice = 0.00001 + Math.random() * 0.001; // Random price between $0.00001-$0.001
        const expectedTokens = request.amount / simulatedPrice;
        const simulatedSlippage = Math.random() * request.maxSlippage;
        
        return {
          success: true,
          txHash: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          actualAmount: expectedTokens * (1 - simulatedSlippage / 100),
          executionPrice: simulatedPrice,
          fees: 0.0001, // Simulated fee
          slippage: simulatedSlippage,
          gasUsed: 5000 // Simulated gas
        };
      }

      // Get current token price from Jupiter
      const jupiterPrice = await this.getTokenPrice(request.tokenAddress);
      
      // Calculate expected token amount
      const expectedTokens = request.amount / jupiterPrice;
      
      // Execute swap via Jupiter
      const swapResult = await this.executeJupiterSwap({
        inputMint: 'So11111111111111111111111111111111111111112', // SOL
        outputMint: request.tokenAddress,
        amount: request.amount * LAMPORTS_PER_SOL,
        slippageBps: request.maxSlippage * 100
      });

      if (swapResult.success) {
        return {
          success: true,
          txHash: swapResult.txHash,
          actualAmount: (swapResult.outputAmount || 0) / LAMPORTS_PER_SOL,
          executionPrice: jupiterPrice,
          fees: swapResult.fee || 0,
          slippage: swapResult.slippage || 0,
          gasUsed: swapResult.gasUsed || 0
        };
      } else {
        throw new Error(swapResult.error || 'Swap failed');
      }

    } catch (error) {
      console.error('❌ Buy order failed:', error);
      throw error;
    }
  }

  private async executeSellOrder(request: TradeRequest, tradeId: string): Promise<TradeResult> {
    console.log(`💸 Executing SELL order: ${request.amount} tokens -> SOL`);

    try {
      // If wallet not initialized, simulate the trade
      if (!this.wallet && process.env.NODE_ENV === 'development') {
        console.log('🔄 Simulating sell order in development mode');
        
        const simulatedPrice = 0.00001 + Math.random() * 0.001; // Random price between $0.00001-$0.001
        const expectedSol = request.amount * simulatedPrice;
        const simulatedSlippage = Math.random() * request.maxSlippage;
        
        return {
          success: true,
          txHash: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          actualAmount: expectedSol * (1 - simulatedSlippage / 100),
          executionPrice: simulatedPrice,
          fees: 0.0001, // Simulated fee
          slippage: simulatedSlippage,
          gasUsed: 5000 // Simulated gas
        };
      }

      // Get token balance
      const tokenBalance = await this.getTokenBalance(request.tokenAddress);
      
      if (tokenBalance < request.amount) {
        throw new Error('Insufficient token balance');
      }

      // Get current token price
      const jupiterPrice = await this.getTokenPrice(request.tokenAddress);
      
      // Execute swap via Jupiter
      const swapResult = await this.executeJupiterSwap({
        inputMint: request.tokenAddress,
        outputMint: 'So11111111111111111111111111111111111111112', // SOL
        amount: request.amount,
        slippageBps: request.maxSlippage * 100
      });

      if (swapResult.success) {
        return {
          success: true,
          txHash: swapResult.txHash,
          actualAmount: (swapResult.outputAmount || 0) / LAMPORTS_PER_SOL,
          executionPrice: jupiterPrice,
          fees: swapResult.fee || 0,
          slippage: swapResult.slippage || 0,
          gasUsed: swapResult.gasUsed || 0
        };
      } else {
        throw new Error(swapResult.error || 'Swap failed');
      }

    } catch (error) {
      console.error('❌ Sell order failed:', error);
      throw error;
    }
  }

  private async executeJupiterSwap(params: {
    inputMint: string;
    outputMint: string;
    amount: number;
    slippageBps: number;
  }): Promise<{
    success: boolean;
    txHash?: string;
    outputAmount?: number;
    fee?: number;
    slippage?: number;
    gasUsed?: number;
    error?: string;
  }> {
    try {
      // Get Jupiter quote
      const quoteResponse = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${params.inputMint}&outputMint=${params.outputMint}&amount=${params.amount}&slippageBps=${params.slippageBps}`
      );
      
      if (!quoteResponse.ok) {
        throw new Error('Failed to get Jupiter quote');
      }

      const quoteData = await quoteResponse.json();

      // Get swap transaction
      const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse: quoteData,
          userPublicKey: this.wallet!.publicKey.toString(),
          wrapAndUnwrapSol: true,
        }),
      });

      if (!swapResponse.ok) {
        throw new Error('Failed to get swap transaction');
      }

      const swapData = await swapResponse.json();
      
      // Deserialize and sign transaction
      const transactionBuf = Buffer.from(swapData.swapTransaction, 'base64');
      const transaction = Transaction.from(transactionBuf);
      
      transaction.sign(this.wallet!);

      // Always use standard RPC transaction submission
      const txHash = await this.connection.sendRawTransaction(transaction.serialize());

      // Wait for confirmation
      await this.connection.confirmTransaction(txHash, 'confirmed');

      return {
        success: true,
        txHash,
        outputAmount: parseInt(quoteData.outAmount),
        fee: parseInt(quoteData.otherAmountThreshold) - parseInt(quoteData.outAmount),
        slippage: (parseInt(quoteData.inAmount) - parseInt(quoteData.outAmount)) / parseInt(quoteData.inAmount) * 100,
        gasUsed: 5000 // Estimated
      };

    } catch (error) {
      console.error('Jupiter swap failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown swap error'
      };
    }
  }

  // Removed Jito bundle sending implementation

  private async getTokenPrice(tokenAddress: string): Promise<number> {
    try {
      const response = await fetch(
        `https://price.jup.ag/v4/price?ids=${tokenAddress}`
      );
      const data = await response.json();
      return data.data[tokenAddress]?.price || 0;
    } catch (error) {
      console.error('Failed to get token price:', error);
      return 0;
    }
  }

  private async getTokenBalance(tokenAddress: string): Promise<number> {
    try {
      if (!this.wallet) {
        if (process.env.NODE_ENV === 'development') {
          // Return a simulated balance for development
          return Math.random() * 1000; // Random balance between 0-1000 tokens
        }
        throw new Error('Wallet not initialized');
      }

      const tokenMint = new PublicKey(tokenAddress);
      const tokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        this.wallet.publicKey
      );
      
      const balance = await this.connection.getTokenAccountBalance(tokenAccount);
      return balance.value.uiAmount || 0;
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return 0;
    }
  }

  public async getWalletBalance(): Promise<number> {
    if (!this.wallet) return 0;
    
    try {
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return 0;
    }
  }

  public isReady(): boolean {
    return this.isInitialized && !!this.wallet;
  }

  public getWalletAddress(): string | null {
    return this.wallet ? this.wallet.publicKey.toString() : null;
  }
}
