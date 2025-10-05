'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { WebSocketManager, RealTimeSignal, LiveTradeUpdate, PortfolioUpdate } from '@/lib/websocket-manager';
import { heliusRealtimeMonitor, ConnectionState } from '@/lib/helius/realtimeMonitor';
import { heliusTradingBot, WalletBalance } from '@/lib/helius/tradingBot';
import { HeliusLogger } from '@/lib/helius/heliusClient';

export interface RealTimeTradingState {
  isConnected: boolean;
  tradingActive: boolean;
  currentSignals: RealTimeSignal[];
  recentTrades: LiveTradeUpdate[];
  portfolioStats: PortfolioUpdate | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  // Helius integration
  heliusConnected: boolean;
  walletBalances: WalletBalance[];
  walletAddress: string | null;
  networkStats: Record<string, unknown> | null;
}

export interface RealTimeTradingActions {
  startTrading: () => Promise<void>;
  stopTrading: () => Promise<void>;
  executeManualTrade: (signal: RealTimeSignal, amount: number) => Promise<void>;
  updateTradingSettings: (settings: unknown) => Promise<void>;
  clearSignals: () => void;
  // Helius integration
  refreshWalletBalances: () => Promise<void>;
  getTokenBalance: (mintAddress: string) => Promise<WalletBalance | null>;
  subscribeToWallet: (walletAddress: string) => Promise<void>;
  executeTrade: (params: { inputMint: string; outputMint: string; amount: number; slippage?: number }) => Promise<{
    success: boolean;
    signature?: string;
    inputAmount: number;
    outputAmount?: number;
    priceImpact?: number;
    fee?: number;
    error?: string;
    logs?: string[];
  }>;
}

const RealTimeTradingContext = createContext<{
  state: RealTimeTradingState;
  actions: RealTimeTradingActions;
} | null>(null);

export function RealTimeTradingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RealTimeTradingState>({
    isConnected: false,
    tradingActive: false,
    currentSignals: [],
    recentTrades: [],
    portfolioStats: null,
    connectionStatus: 'disconnected',
    // Helius integration
    heliusConnected: false,
    walletBalances: [],
    walletAddress: null,
    networkStats: null,
  });

  const [wsManager, setWsManager] = useState<WebSocketManager | null>(null);

  useEffect(() => {
    // Initialize WebSocket manager
    const manager = new WebSocketManager();
    setWsManager(manager);

    // Set up event listeners
    manager.on('signal', (signal: RealTimeSignal) => {
      setState(prev => {
        // Check if signal already exists to prevent duplicates
        const existingSignalIndex = prev.currentSignals.findIndex(s => s.id === signal.id);
        let newSignals;
        
        if (existingSignalIndex >= 0) {
          // Update existing signal
          newSignals = [...prev.currentSignals];
          newSignals[existingSignalIndex] = signal;
        } else {
          // Add new signal at the beginning
          newSignals = [signal, ...prev.currentSignals].slice(0, 50); // Keep last 50 signals
        }
        
        return {
          ...prev,
          currentSignals: newSignals
        };
      });
    });

    manager.on('tradeUpdate', (tradeUpdate: LiveTradeUpdate) => {
      setState(prev => {
        // Check if trade update already exists to prevent duplicates
        const existingTradeIndex = prev.recentTrades.findIndex(t => t.id === tradeUpdate.id);
        let newTrades;
        
        if (existingTradeIndex >= 0) {
          // Update existing trade
          newTrades = [...prev.recentTrades];
          newTrades[existingTradeIndex] = tradeUpdate;
        } else {
          // Add new trade at the beginning
          newTrades = [tradeUpdate, ...prev.recentTrades].slice(0, 100); // Keep last 100 trades
        }
        
        return {
          ...prev,
          recentTrades: newTrades
        };
      });
    });

    manager.on('portfolioUpdate', (portfolioUpdate: PortfolioUpdate) => {
      setState(prev => ({
        ...prev,
        portfolioStats: portfolioUpdate
      }));
    });

    // Helius Real-time Monitor Event Handlers
    heliusRealtimeMonitor.on('connected', () => {
      HeliusLogger.info('Helius real-time monitor connected');
      setState(prev => ({
        ...prev,
        heliusConnected: true
      }));
    });

    heliusRealtimeMonitor.on('disconnected', () => {
      HeliusLogger.info('Helius real-time monitor disconnected');
      setState(prev => ({
        ...prev,
        heliusConnected: false
      }));
    });

    heliusRealtimeMonitor.on('transaction', (transactionEvent) => {
      HeliusLogger.debug('Received transaction event', transactionEvent);
      // Convert Helius transaction event to our signal format if relevant
      if (transactionEvent.success) {
        // Process successful transactions for signal generation
      }
    });

    heliusRealtimeMonitor.on('balanceChange', (balanceEvent) => {
      HeliusLogger.debug('Received balance change event', balanceEvent);
      // Update wallet balances in state
      setState(prev => {
        const updatedBalances = prev.walletBalances.map(balance => 
          balance.mint === balanceEvent.mint && balance.address === balanceEvent.account
            ? { ...balance, balance: balanceEvent.newBalance, uiAmount: balanceEvent.newBalance }
            : balance
        );
        return {
          ...prev,
          walletBalances: updatedBalances
        };
      });
    });

    heliusRealtimeMonitor.on('tokenSwap', (swapEvent) => {
      HeliusLogger.debug('Received token swap event', swapEvent);
      // Convert swap event to trade update
      const tradeUpdate: LiveTradeUpdate = {
        id: swapEvent.signature,
        type: 'BUY',
        tokenSymbol: 'SWAP',
        price: swapEvent.outputAmount / swapEvent.inputAmount,
        amount: swapEvent.inputAmount,
        timestamp: swapEvent.timestamp,
        status: 'COMPLETED',
        txHash: swapEvent.signature
      };
      
      setState(prev => ({
        ...prev,
        recentTrades: [tradeUpdate, ...prev.recentTrades].slice(0, 100)
      }));
    });

    // Initialize Helius connection
    const initializeHelius = async () => {
      try {
        await heliusRealtimeMonitor.connect();
        // Get wallet address from environment or user settings
        const walletAddress = process.env.NEXT_PUBLIC_WALLET_ADDRESS;
        if (walletAddress) {
          setState(prev => ({ ...prev, walletAddress }));
          await heliusRealtimeMonitor.subscribeToAccount(walletAddress);
        }
      } catch (error) {
        HeliusLogger.error('Failed to initialize Helius connection', error);
      }
    };

    initializeHelius();

    // Connection status updates
    const updateConnectionStatus = () => {
      const isConnected = manager.getConnectionStatus();
      setState(prev => ({
        ...prev,
        isConnected,
        connectionStatus: isConnected ? 'connected' : 'disconnected'
      }));
    };

    // Check connection status every 5 seconds
    const connectionInterval = setInterval(updateConnectionStatus, 5000);
    updateConnectionStatus(); // Initial check

    // Check trading status on mount
    checkTradingStatus();
    
    // Initialize trading settings if needed
    initializeTradingSettings();

    return () => {
      clearInterval(connectionInterval);
      manager.disconnect();
    };
  }, []);

  const initializeTradingSettings = async () => {
    try {
      const response = await fetch('/api/trading/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Trading settings initialized:', result.message);
      } else {
        console.warn('Failed to initialize trading settings:', response.statusText);
      }
    } catch (error) {
      console.error('Error initializing trading settings:', error);
    }
  };

  const checkTradingStatus = async () => {
    try {
      const response = await fetch('/api/trading/status');
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          tradingActive: data.isActive || false
        }));
      }
    } catch (error) {
      console.error('Failed to check trading status:', error);
    }
  };

  const startTrading = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, connectionStatus: 'connecting' }));
      
      const response = await fetch('/api/trading/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (response.ok) {
        setState(prev => ({
          ...prev,
          tradingActive: true,
          connectionStatus: 'connected'
        }));
        console.log('✅ Trading started successfully:', result.message);
      } else {
        const errorMessage = result.error || result.details || 'Failed to start trading';
        console.error('Trading start failed:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to start trading:', errorMessage);
      setState(prev => ({ 
        ...prev, 
        connectionStatus: 'error',
        tradingActive: false 
      }));
      throw error;
    }
  }, []);

  const stopTrading = useCallback(async () => {
    try {
      const response = await fetch('/api/trading/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setState(prev => ({
          ...prev,
          tradingActive: false
        }));
        console.log('✅ Trading stopped successfully');
      } else {
        throw new Error('Failed to stop trading');
      }
    } catch (error) {
      console.error('Failed to stop trading:', error);
      throw error;
    }
  }, []);

  const executeManualTrade = useCallback(async (signal: RealTimeSignal, amount: number) => {
    try {
      const response = await fetch('/api/trading/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signal,
          amount,
          manual: true
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Manual trade executed:', result);
        
        // Add to recent trades
        setState(prev => ({
          ...prev,
          recentTrades: [{
            id: result.trade?.id || `manual-${Date.now()}`,
            status: 'COMPLETED' as const,
            tokenSymbol: signal.symbol,
            type: signal.action,
            amount: amount,
            price: result.execution?.executionPrice,
            txHash: result.trade?.txHash,
            timestamp: Date.now()
          }, ...prev.recentTrades].slice(0, 100)
        }));
      } else {
        throw new Error('Failed to execute manual trade');
      }
    } catch (error) {
      console.error('Failed to execute manual trade:', error);
      throw error;
    }
  }, []);

  const updateTradingSettings = useCallback(async (settings: unknown) => {
    try {
      const response = await fetch('/api/trading/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to update trading settings');
      }

      console.log('✅ Trading settings updated');
    } catch (error) {
      console.error('Failed to update trading settings:', error);
      throw error;
    }
  }, []);

  const clearSignals = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentSignals: []
    }));
  }, []);

  // Helius-specific actions
  const refreshWalletBalances = useCallback(async () => {
    try {
      const balances = await heliusTradingBot.getWalletBalances(false); // Force refresh
      setState(prev => ({
        ...prev,
        walletBalances: balances
      }));
    } catch (error) {
      HeliusLogger.error('Failed to refresh wallet balances', error);
      throw error;
    }
  }, []);

  const getTokenBalance = useCallback(async (mintAddress: string): Promise<WalletBalance | null> => {
    try {
      return await heliusTradingBot.getTokenBalance(mintAddress);
    } catch (error) {
      HeliusLogger.error('Failed to get token balance', error);
      return null;
    }
  }, []);

  const subscribeToWallet = useCallback(async (walletAddress: string) => {
    try {
      setState(prev => ({ ...prev, walletAddress }));
      await heliusRealtimeMonitor.subscribeToAccount(walletAddress);
      HeliusLogger.info(`Subscribed to wallet: ${walletAddress}`);
    } catch (error) {
      HeliusLogger.error('Failed to subscribe to wallet', error);
      throw error;
    }
  }, []);

  const executeTrade = useCallback(async (params: { 
    inputMint: string; 
    outputMint: string; 
    amount: number; 
    slippage?: number 
  }) => {
    try {
      const result = await heliusTradingBot.executeTrade({
        inputMint: params.inputMint,
        outputMint: params.outputMint,
        amount: params.amount,
        slippage: params.slippage || 0.01,
      });

      if (result.success) {
        // Update recent trades
        const tradeUpdate: LiveTradeUpdate = {
          id: result.signature || `trade-${Date.now()}`,
          type: 'BUY',
          tokenSymbol: 'SOL',
          price: result.outputAmount ? result.outputAmount / result.inputAmount : 0,
          amount: result.inputAmount,
          timestamp: Date.now(),
          status: 'COMPLETED',
          txHash: result.signature
        };
        
        setState(prev => ({
          ...prev,
          recentTrades: [tradeUpdate, ...prev.recentTrades].slice(0, 100)
        }));

        // Refresh wallet balances after trade
        await refreshWalletBalances();
      }

      return result;
    } catch (error) {
      HeliusLogger.error('Failed to execute trade', error);
      throw error;
    }
  }, [refreshWalletBalances]);

  const actions: RealTimeTradingActions = useMemo(() => ({
    startTrading,
    stopTrading,
    executeManualTrade,
    updateTradingSettings,
    clearSignals,
    // Helius integration
    refreshWalletBalances,
    getTokenBalance,
    subscribeToWallet,
    executeTrade,
  }), [
    startTrading,
    stopTrading,
    executeManualTrade,
    updateTradingSettings,
    clearSignals,
    refreshWalletBalances,
    getTokenBalance,
    subscribeToWallet,
    executeTrade,
  ]);

  return (
    <RealTimeTradingContext.Provider value={{ state, actions }}>
      {children}
    </RealTimeTradingContext.Provider>
  );
}

export function useRealTimeTrading() {
  const context = useContext(RealTimeTradingContext);
  if (!context) {
    throw new Error('useRealTimeTrading must be used within a RealTimeTradingProvider');
  }
  return context;
}

// Hook for real-time portfolio updates
export function usePortfolioStats() {
  const { state } = useRealTimeTrading();
  return state.portfolioStats;
}

// Hook for real-time signals
export function useRealTimeSignals() {
  const { state, actions } = useRealTimeTrading();
  return {
    signals: state.currentSignals,
    clearSignals: actions.clearSignals
  };
}

// Hook for real-time trades
export function useRealTimeTrades() {
  const { state } = useRealTimeTrading();
  return state.recentTrades;
}

// Hook for connection status
export function useConnectionStatus() {
  const { state } = useRealTimeTrading();
  return {
    isConnected: state.isConnected,
    status: state.connectionStatus,
    tradingActive: state.tradingActive
  };
}
