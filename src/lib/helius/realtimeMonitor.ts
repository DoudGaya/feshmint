/**
 * Helius Real-Time Monitoring
 * 
 * Implements WebSocket connections and webhook handling for real-time
 * transaction monitoring, price updates, and blockchain events using
 * Helius enhanced APIs.
 */

import { EventEmitter } from 'events';
import { HeliusLogger } from './heliusClient';
import { HELIUS_CONFIG, SOLANA_CONFIG, WEBHOOK_CONFIG } from './config';

/**
 * WebSocket message types
 */
interface WebSocketMessage {
  jsonrpc: string;
  method?: string;
  params?: Record<string, unknown>;
  result?: Record<string, unknown>;
  id?: number;
}

interface TransactionNotificationParams {
  subscription: number;
  result: {
    signature: string;
    slot: number;
    err?: unknown;
    meta?: {
      fee?: number;
      err?: unknown;
      innerInstructions?: Array<{
        instructions?: Array<{
          programId: string;
          accounts: string[];
          data: string;
        }>;
      }>;
      preBalances?: number[];
      postBalances?: number[];
      logMessages?: string[];
    };
    transaction?: {
      message?: {
        accountKeys?: string[];
        instructions?: Array<Record<string, unknown>>;
      };
    };
  };
}

interface AccountNotificationParams {
  subscription: number;
  result: {
    pubkey: string;
    account: {
      lamports: number;
      data?: [string, string];
      owner?: string;
      executable?: boolean;
      rentEpoch?: number;
      parsed?: {
        info?: {
          mint?: string;
        };
      };
    };
  };
}

interface WebhookEvent {
  signature: string;
  type: string;
  slot: number;
  timestamp?: number;
  accounts?: string[];
  failed?: boolean;
  fee?: number;
  feePayer?: string;
  instructions?: Array<{
    programId: string;
    accounts: string[];
    data: string;
  }>;
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }>;
  tokenTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount: string;
    mint: string;
    tokenAmount: number;
  }>;
  description?: string;
  source?: string;
}

/**
 * Real-time event types
 */
export interface TransactionEvent {
  type: 'TRANSACTION';
  signature: string;
  slot: number;
  timestamp: number;
  accounts: string[];
  success: boolean;
  error?: string;
  fee?: number;
  programInvocations?: string[];
}

export interface BalanceChangeEvent {
  type: 'BALANCE_CHANGE';
  account: string;
  mint: string;
  oldBalance: number;
  newBalance: number;
  change: number;
  timestamp: number;
}

export interface TokenSwapEvent {
  type: 'TOKEN_SWAP';
  signature: string;
  swapper: string;
  inputMint: string;
  outputMint: string;
  inputAmount: number;
  outputAmount: number;
  timestamp: number;
  dexProgram?: string;
}

export interface PriceUpdateEvent {
  type: 'PRICE_UPDATE';
  mint: string;
  symbol?: string;
  price: number;
  priceChange24h?: number;
  volume24h?: number;
  timestamp: number;
}

export type RealtimeEvent = 
  | TransactionEvent 
  | BalanceChangeEvent 
  | TokenSwapEvent 
  | PriceUpdateEvent;

/**
 * WebSocket connection states
 */
export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

/**
 * Subscription configuration
 */
export interface SubscriptionConfig {
  accounts?: string[];
  programs?: string[];
  mentions?: string[];
  transactionTypes?: string[];
  commitment?: string;
}

/**
 * Real-time monitoring class using Helius WebSocket and webhook APIs
 */
export class HeliusRealtimeMonitor extends EventEmitter {
  private wsConnection: WebSocket | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private subscriptions: Map<string, SubscriptionConfig> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = 0;

  constructor() {
    super();
    this.setupErrorHandling();
  }

  /**
   * Setup global error handling
   */
  private setupErrorHandling(): void {
    this.on('error', (error) => {
      HeliusLogger.error('Realtime monitor error', error);
    });
  }

  /**
   * Connect to Helius WebSocket
   */
  async connect(): Promise<void> {
    if (this.connectionState === ConnectionState.CONNECTED) {
      HeliusLogger.debug('Already connected to WebSocket');
      return;
    }

    try {
      this.connectionState = ConnectionState.CONNECTING;
      
      // Check if we have a proper Helius API key
      if (!process.env.HELIUS_API_KEY || process.env.HELIUS_API_KEY === 'demo-key') {
        HeliusLogger.warn('No Helius API key found, skipping WebSocket connection (demo mode)');
        this.connectionState = ConnectionState.DISCONNECTED;
        
        // Emit mock data instead of trying to connect
        this.startMockDataEmission();
        return;
      }
      
      HeliusLogger.info('Connecting to Helius WebSocket...');

      // Use Helius WebSocket endpoint
      const wsUrl = HELIUS_CONFIG.WS_URL;
      
      if (typeof WebSocket === 'undefined') {
        // Node.js environment - would need ws package
        const WebSocketImpl = (await import('ws')).default;
        this.wsConnection = new WebSocketImpl(wsUrl) as unknown as WebSocket;
      } else {
        // Browser environment
        this.wsConnection = new WebSocket(wsUrl);
      }

      this.setupWebSocketHandlers();
      
    } catch (error) {
      this.connectionState = ConnectionState.ERROR;
      HeliusLogger.error('Failed to connect to WebSocket', error);
      this.emit('error', error);
      
      // Fallback to mock data
      this.startMockDataEmission();
    }
  }

  /**
   * Start emitting mock data when WebSocket is not available
   */
  private startMockDataEmission(): void {
    HeliusLogger.info('Starting mock data emission for demo mode');
    
    // Emit mock events every few seconds
    setInterval(() => {
      // Mock transaction event
      const mockTransaction: TransactionEvent = {
        type: 'TRANSACTION',
        signature: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        slot: Math.floor(Math.random() * 1000000) + 200000000,
        timestamp: Date.now(),
        accounts: ['11111111111111111111111111111112'],
        success: Math.random() > 0.1, // 90% success rate
        fee: Math.floor(Math.random() * 10000) + 5000,
        programInvocations: ['11111111111111111111111111111112']
      };
      
      this.emit('transaction', mockTransaction);
      
      // Mock price update
      const mockPriceUpdate: PriceUpdateEvent = {
        type: 'PRICE_UPDATE',
        mint: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        price: 20 + Math.random() * 10, // Random price between 20-30
        priceChange24h: (Math.random() - 0.5) * 10, // Random change between -5 to +5
        volume24h: Math.random() * 1000000,
        timestamp: Date.now()
      };
      
      this.emit('priceUpdate', mockPriceUpdate);
      
    }, 5000); // Every 5 seconds
    
    this.emit('connected'); // Emit connected event for mock mode
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupWebSocketHandlers(): void {
    if (!this.wsConnection) return;

    this.wsConnection.onopen = () => {
      this.connectionState = ConnectionState.CONNECTED;
      this.reconnectAttempts = 0;
      HeliusLogger.info('✅ Connected to Helius WebSocket');
      this.emit('connected');
      this.startHeartbeat();
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data.toString());
        this.handleWebSocketMessage(data);
      } catch (error) {
        HeliusLogger.error('Failed to parse WebSocket message', error);
      }
    };

    this.wsConnection.onclose = (event) => {
      this.connectionState = ConnectionState.DISCONNECTED;
      this.stopHeartbeat();
      HeliusLogger.info(`WebSocket disconnected: ${event.code} ${event.reason}`);
      this.emit('disconnected', { code: event.code, reason: event.reason });
      
      // Attempt reconnection if not intentional
      if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnection();
      }
    };

    this.wsConnection.onerror = (error) => {
      this.connectionState = ConnectionState.ERROR;
      
      // Better error logging with more context
      const errorDetails = {
        url: this.wsConnection?.url || 'unknown',
        readyState: this.wsConnection?.readyState || 'unknown',
        error: error
      };
      
      HeliusLogger.error('WebSocket error occurred:', errorDetails);
      
      // Don't emit error for expected disconnections
      if (this.connectionState === ConnectionState.ERROR) {
        this.emit('error', error);
      }
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(data: WebSocketMessage): void {
    try {
      // Parse Helius WebSocket message format
      if (data.method === 'transactionNotification' && data.params) {
        const txEvent = this.parseTransactionNotification(data.params as unknown as TransactionNotificationParams);
        this.emit('transaction', txEvent);
      } else if (data.method === 'accountNotification' && data.params) {
        const balanceEvent = this.parseAccountNotification(data.params as unknown as AccountNotificationParams);
        this.emit('balanceChange', balanceEvent);
      }
      
      // Emit raw data for custom handling
      this.emit('rawMessage', data);
      
    } catch (error) {
      HeliusLogger.error('Error handling WebSocket message', error);
    }
  }

  /**
   * Parse transaction notification from Helius
   */
  private parseTransactionNotification(params: TransactionNotificationParams): TransactionEvent {
    const result = params.result;
    
    return {
      type: 'TRANSACTION',
      signature: result.signature,
      slot: result.slot,
      timestamp: Date.now(),
      accounts: result.transaction?.message?.accountKeys || [],
      success: result.meta?.err === null,
      error: result.meta?.err ? JSON.stringify(result.meta.err) : undefined,
      fee: result.meta?.fee,
      programInvocations: result.meta?.innerInstructions?.map((ix: Record<string, unknown>) => 
        (ix.instructions as Array<Record<string, unknown>>)?.map((i: Record<string, unknown>) => String(i.programId))
      ).flat().filter(Boolean),
    };
  }

  /**
   * Parse account notification from Helius
   */
  private parseAccountNotification(params: AccountNotificationParams): BalanceChangeEvent {
    const result = params.result;
    
    return {
      type: 'BALANCE_CHANGE',
      account: result.pubkey,
      mint: 'SOL', // Default to SOL for now
      oldBalance: 0, // Would need to track previous state
      newBalance: result.account?.lamports || 0,
      change: result.account?.lamports || 0,
      timestamp: Date.now(),
    };
  }

  /**
   * Subscribe to account changes
   */
  async subscribeToAccount(accountAddress: string, config?: SubscriptionConfig): Promise<void> {
    if (this.connectionState !== ConnectionState.CONNECTED) {
      await this.connect();
    }

    try {
      const subscriptionRequest = {
        jsonrpc: '2.0',
        id: `account_${accountAddress}`,
        method: 'accountSubscribe',
        params: [
          accountAddress,
          {
            commitment: config?.commitment || SOLANA_CONFIG.COMMITMENT,
            encoding: 'jsonParsed',
          }
        ]
      };

      this.wsConnection?.send(JSON.stringify(subscriptionRequest));
      this.subscriptions.set(`account_${accountAddress}`, config || {});
      
      HeliusLogger.info(`Subscribed to account: ${accountAddress}`);
      
    } catch (error) {
      HeliusLogger.error(`Failed to subscribe to account ${accountAddress}`, error);
      throw error;
    }
  }

  /**
   * Subscribe to program account changes
   */
  async subscribeToProgram(programId: string, config?: SubscriptionConfig): Promise<void> {
    if (this.connectionState !== ConnectionState.CONNECTED) {
      await this.connect();
    }

    try {
      const subscriptionRequest = {
        jsonrpc: '2.0',
        id: `program_${programId}`,
        method: 'programSubscribe',
        params: [
          programId,
          {
            commitment: config?.commitment || SOLANA_CONFIG.COMMITMENT,
            encoding: 'jsonParsed',
          }
        ]
      };

      this.wsConnection?.send(JSON.stringify(subscriptionRequest));
      this.subscriptions.set(`program_${programId}`, config || {});
      
      HeliusLogger.info(`Subscribed to program: ${programId}`);
      
    } catch (error) {
      HeliusLogger.error(`Failed to subscribe to program ${programId}`, error);
      throw error;
    }
  }

  /**
   * Subscribe to transaction signatures
   */
  async subscribeToSignature(signature: string): Promise<void> {
    if (this.connectionState !== ConnectionState.CONNECTED) {
      await this.connect();
    }

    try {
      const subscriptionRequest = {
        jsonrpc: '2.0',
        id: `signature_${signature}`,
        method: 'signatureSubscribe',
        params: [
          signature,
          {
            commitment: SOLANA_CONFIG.COMMITMENT,
          }
        ]
      };

      this.wsConnection?.send(JSON.stringify(subscriptionRequest));
      
      HeliusLogger.info(`Subscribed to signature: ${signature}`);
      
    } catch (error) {
      HeliusLogger.error(`Failed to subscribe to signature ${signature}`, error);
      throw error;
    }
  }

  /**
   * Setup Helius webhooks for enhanced monitoring
   */
  async setupWebhook(webhookUrl: string, config: {
    accountAddresses?: string[];
    webhookType: 'enhanced' | 'raw' | 'discord';
    transactionTypes?: string[];
    authHeader?: string;
  }): Promise<{ webhookID: string }> {
    try {
      HeliusLogger.info('Setting up Helius webhook...', config);

      // This would use Helius REST API to create webhooks
      const response = await fetch(`${HELIUS_CONFIG.API_BASE_URL}/v0/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HELIUS_CONFIG.API_KEY}`,
        },
        body: JSON.stringify({
          webhookURL: webhookUrl,
          transactionTypes: config.transactionTypes || WEBHOOK_CONFIG.TRANSACTION_TYPES,
          accountAddresses: config.accountAddresses || [],
          webhookType: config.webhookType,
          authHeader: config.authHeader,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create webhook: ${response.statusText}`);
      }

      const result = await response.json();
      HeliusLogger.info(`✅ Webhook created: ${result.webhookID}`);
      
      return result;
      
    } catch (error) {
      HeliusLogger.error('Failed to setup webhook', error);
      throw error;
    }
  }

  /**
   * Handle incoming webhook data
   */
  handleWebhookData(data: WebhookEvent[]): void {
    try {
      // Parse Helius webhook data
      if (Array.isArray(data)) {
        data.forEach(event => this.processWebhookEvent(event));
      } else {
        this.processWebhookEvent(data);
      }
    } catch (error) {
      HeliusLogger.error('Error handling webhook data', error);
    }
  }

  /**
   * Process individual webhook event
   */
  private processWebhookEvent(event: WebhookEvent): void {
    try {
      if (event.type === 'TRANSFER') {
        this.emit('transaction', this.parseTransferEvent(event));
      } else if (event.type === 'SWAP') {
        this.emit('tokenSwap', this.parseSwapEvent(event));
      }
      
      // Emit raw event for custom handling
      this.emit('webhookEvent', event);
      
    } catch (error) {
      HeliusLogger.error('Error processing webhook event', error);
    }
  }

  /**
   * Parse transfer event from webhook
   */
  private parseTransferEvent(event: WebhookEvent): TransactionEvent {
    return {
      type: 'TRANSACTION',
      signature: event.signature,
      slot: event.slot,
      timestamp: event.timestamp ? event.timestamp * 1000 : Date.now(),
      accounts: event.accounts || [],
      success: !event.failed,
      fee: event.fee,
    };
  }

  /**
   * Parse swap event from webhook
   */
  private parseSwapEvent(event: WebhookEvent): TokenSwapEvent {
    return {
      type: 'TOKEN_SWAP',
      signature: event.signature,
      swapper: event.feePayer || '',
      inputMint: event.tokenTransfers?.[0]?.mint || '',
      outputMint: event.tokenTransfers?.[1]?.mint || '',
      inputAmount: event.tokenTransfers?.[0]?.tokenAmount || 0,
      outputAmount: event.tokenTransfers?.[1]?.tokenAmount || 0,
      timestamp: event.timestamp ? event.timestamp * 1000 : Date.now(),
      dexProgram: event.instructions?.[0]?.programId,
    };
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.wsConnection?.readyState === WebSocket.OPEN) {
        // Send a ping message to keep connection alive
        this.wsConnection.send(JSON.stringify({ type: 'ping' }));
        this.lastHeartbeat = Date.now();
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Attempt to reconnect after connection loss
   */
  private async attemptReconnection(): Promise<void> {
    if (this.connectionState === ConnectionState.RECONNECTING) {
      return;
    }

    this.connectionState = ConnectionState.RECONNECTING;
    this.reconnectAttempts++;
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    HeliusLogger.info(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(async () => {
      try {
        await this.connect();
        // Resubscribe to all previous subscriptions
        await this.resubscribeAll();
      } catch (error) {
        HeliusLogger.error('Reconnection failed', error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnection();
        } else {
          this.emit('reconnectionFailed');
        }
      }
    }, delay);
  }

  /**
   * Resubscribe to all previous subscriptions
   */
  private async resubscribeAll(): Promise<void> {
    for (const [subscriptionId, config] of this.subscriptions) {
      try {
        if (subscriptionId.startsWith('account_')) {
          const address = subscriptionId.replace('account_', '');
          await this.subscribeToAccount(address, config);
        } else if (subscriptionId.startsWith('program_')) {
          const programId = subscriptionId.replace('program_', '');
          await this.subscribeToProgram(programId, config);
        }
      } catch (error) {
        HeliusLogger.error(`Failed to resubscribe to ${subscriptionId}`, error);
      }
    }
  }

  /**
   * Get connection status
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    try {
      this.connectionState = ConnectionState.DISCONNECTED;
      this.stopHeartbeat();
      
      if (this.wsConnection) {
        this.wsConnection.close(1000, 'Client disconnect');
        this.wsConnection = null;
      }
      
      this.subscriptions.clear();
      this.removeAllListeners();
      
      HeliusLogger.info('✅ Realtime monitor disconnected');
      
    } catch (error) {
      HeliusLogger.error('Error during disconnect', error);
      throw error;
    }
  }
}

// Export singleton instance
export const heliusRealtimeMonitor = new HeliusRealtimeMonitor();
