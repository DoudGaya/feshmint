/**
 * Helius SDK Configuration
 * 
 * This file contains all configuration settings for the Helius SDK integration,
 * including API keys, endpoints, and constants for Solana blockchain interaction.
 */

// Environment variables validation
if (!process.env.HELIUS_API_KEY) {
  console.warn('⚠️ HELIUS_API_KEY not found in environment variables. Using demo mode.');
}

/**
 * Helius API Configuration
 */
export const HELIUS_CONFIG = {
  // Main API key from environment variables
  API_KEY: process.env.HELIUS_API_KEY || 'demo-key',
  
  // Helius RPC endpoint with API key
  RPC_URL: process.env.HELIUS_API_KEY 
    ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
    : 'https://api.mainnet-beta.solana.com', // Fallback to public RPC
    
  // WebSocket endpoint for real-time updates
  WS_URL: process.env.HELIUS_API_KEY
    ? `wss://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
    : 'wss://api.mainnet-beta.solana.com',
    
  // Helius API base URL for REST endpoints
  API_BASE_URL: 'https://api.helius.xyz',
  
  // Network cluster
  CLUSTER: 'mainnet-beta' as const,
} as const;

/**
 * Solana Network Constants
 */
export const SOLANA_CONFIG = {
  // Commitment levels for transaction confirmation
  COMMITMENT: 'confirmed' as const,
  
  // Transaction timeout in milliseconds
  TRANSACTION_TIMEOUT: 60000,
  
  // Maximum retries for failed requests
  MAX_RETRIES: 3,
  
  // Retry delay in milliseconds
  RETRY_DELAY: 1000,
  
  // Batch size for bulk operations
  BATCH_SIZE: 100,
} as const;

/**
 * Trading Configuration
 */
export const TRADING_CONFIG = {
  // Default slippage tolerance (1%)
  DEFAULT_SLIPPAGE: 0.01,
  
  // Minimum SOL balance to keep in wallet (for fees)
  MIN_SOL_BALANCE: 0.01,
  
  // Maximum transaction fee in SOL
  MAX_FEE: 0.005,
  
  // Priority fee in micro-lamports
  PRIORITY_FEE: 1000,
  
  // Compute unit limit
  COMPUTE_UNIT_LIMIT: 200000,
} as const;

/**
 * Popular Solana Token Addresses
 */
export const TOKEN_ADDRESSES = {
  // Native SOL (wrapped SOL)
  SOL: 'So11111111111111111111111111111111111111112',
  
  // USDC
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  
  // USDT
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  
  // Popular meme tokens
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  PEPE: '6GCL6pT1j1JoC4k4rH9PV9nF1F8F5VJ9L2kV8N3mH8eM',
  
  // DeFi tokens
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  ORCA: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
} as const;

/**
 * DEX Program IDs
 */
export const DEX_PROGRAMS = {
  // Jupiter Aggregator V6
  JUPITER_V6: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
  
  // Raydium V4
  RAYDIUM_V4: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
  
  // Orca V1
  ORCA: '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP',
  
  // Serum V3
  SERUM_V3: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
} as const;

/**
 * Webhook Configuration
 */
export const WEBHOOK_CONFIG = {
  // Webhook types to subscribe to
  TRANSACTION_TYPES: [
    'TRANSFER',
    'SWAP',
    'NFT_SALE',
    'COMPRESSED_NFT_MINT',
  ] as const,
  
  // Account types to monitor
  ACCOUNT_TYPES: [
    'token',
    'nft',
  ] as const,
  
  // Webhook URL for receiving notifications
  WEBHOOK_URL: process.env.WEBHOOK_URL || 'http://localhost:3000/api/webhooks/helius',
} as const;

/**
 * Logging Configuration
 */
export const LOGGING_CONFIG = {
  // Log levels
  LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  
  // Enable/disable different log types
  ENABLE_API_LOGS: true,
  ENABLE_TRANSACTION_LOGS: true,
  ENABLE_ERROR_LOGS: true,
  ENABLE_PERFORMANCE_LOGS: process.env.NODE_ENV === 'development',
} as const;

/**
 * Rate Limiting Configuration
 */
export const RATE_LIMIT_CONFIG = {
  // Requests per minute for different tiers
  FREE_TIER: 100,
  PAID_TIER: 1000,
  ENTERPRISE_TIER: 10000,
  
  // Current tier (detected from API key or set manually)
  CURRENT_TIER: process.env.HELIUS_TIER || 'FREE_TIER',
} as const;

/**
 * Type definitions for configuration
 */
export type HeliusConfig = typeof HELIUS_CONFIG;
export type SolanaConfig = typeof SOLANA_CONFIG;
export type TradingConfig = typeof TRADING_CONFIG;
export type TokenAddresses = typeof TOKEN_ADDRESSES;
export type DexPrograms = typeof DEX_PROGRAMS;
export type WebhookConfig = typeof WEBHOOK_CONFIG;

/**
 * Validate configuration on module load
 */
export function validateConfig(): boolean {
  try {
    // Check if we have a valid API key
    if (HELIUS_CONFIG.API_KEY === 'demo-key') {
      console.warn('⚠️ Using demo configuration. Add HELIUS_API_KEY to environment variables for full functionality.');
    }
    
    // Validate required URLs
    if (!HELIUS_CONFIG.RPC_URL || !HELIUS_CONFIG.API_BASE_URL) {
      throw new Error('Missing required Helius configuration URLs');
    }
    
    console.log('✅ Helius configuration validated successfully');
    return true;
  } catch (error) {
    console.error('❌ Helius configuration validation failed:', error);
    return false;
  }
}

// Validate configuration on import
validateConfig();
