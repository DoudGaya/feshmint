import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface FeatureAccess {
  canAccessLiveTrading: boolean;
  canAccessFullSignalSources: boolean;
  canAccessMEVProtection: boolean;
  canAccessCustomStrategies: boolean;
  canAccessFullAnalytics: boolean;
  canAccessBacktesting: boolean;
  maxDailyTrades: number;
  analyticsHistoryDays: number;
}

export const TIER_FEATURES: Record<SubscriptionTier, FeatureAccess> = {
  FREE: {
    canAccessLiveTrading: false,
    canAccessFullSignalSources: false,
    canAccessMEVProtection: false,
    canAccessCustomStrategies: false,
    canAccessFullAnalytics: false,
    canAccessBacktesting: false,
    maxDailyTrades: 0,
    analyticsHistoryDays: 7,
  },
  PRO: {
    canAccessLiveTrading: true,
    canAccessFullSignalSources: true,
    canAccessMEVProtection: true,
    canAccessCustomStrategies: false,
    canAccessFullAnalytics: true,
    canAccessBacktesting: false,
    maxDailyTrades: 100,
    analyticsHistoryDays: 90,
  },
  ENTERPRISE: {
    canAccessLiveTrading: true,
    canAccessFullSignalSources: true,
    canAccessMEVProtection: true,
    canAccessCustomStrategies: true,
    canAccessFullAnalytics: true,
    canAccessBacktesting: true,
    maxDailyTrades: -1, // Unlimited
    analyticsHistoryDays: -1, // Unlimited
  },
};

export class SubscriptionService {
  /**
   * Get user's current subscription tier and features
   */
  static async getUserSubscription(userId: string): Promise<{
    tier: SubscriptionTier;
    features: FeatureAccess;
    isActive: boolean;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          subscriptionTier: true,
          subscriptionStatus: true,
          subscriptionEndsAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const tier = user.subscriptionTier as SubscriptionTier;
      const isActive = this.isSubscriptionActive(user.subscriptionStatus, user.subscriptionEndsAt);

      return {
        tier: isActive ? tier : 'FREE',
        features: TIER_FEATURES[isActive ? tier : 'FREE'],
        isActive,
      };
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return {
        tier: 'FREE',
        features: TIER_FEATURES.FREE,
        isActive: false,
      };
    }
  }

  /**
   * Check if user can access a specific feature
   */
  static async canAccessFeature(
    userId: string,
    feature: keyof FeatureAccess
  ): Promise<boolean> {
    const { features } = await this.getUserSubscription(userId);
    return Boolean(features[feature]);
  }

  /**
   * Middleware to check feature access
   */
  static requireFeature(feature: keyof FeatureAccess) {
    return async (_req: NextRequest): Promise<NextResponse | null> => {
      try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        const hasAccess = await this.canAccessFeature(session.user.id, feature);
        
        if (!hasAccess) {
          const { tier } = await this.getUserSubscription(session.user.id);
          return NextResponse.json(
            { 
              error: 'Feature not available in your subscription tier',
              currentTier: tier,
              requiredFeature: feature 
            },
            { status: 403 }
          );
        }

        return null; // Allow access
      } catch (error) {
        console.error('Subscription middleware error:', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    };
  }

  /**
   * Check if subscription is active
   */
  private static isSubscriptionActive(
    status?: string | null,
    endsAt?: Date | null
  ): boolean {
    if (!status || status !== 'active') {
      return false;
    }

    if (endsAt && new Date() > endsAt) {
      return false;
    }

    return true;
  }

  /**
   * Get daily trade count for user
   */
  static async getDailyTradeCount(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await prisma.trade.count({
      where: {
        userId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        status: 'EXECUTED',
      },
    });

    return count;
  }

  /**
   * Check if user can make more trades today
   */
  static async canMakeMoreTrades(userId: string): Promise<boolean> {
    const { features } = await this.getUserSubscription(userId);
    
    if (features.maxDailyTrades === -1) {
      return true; // Unlimited
    }

    const todayCount = await this.getDailyTradeCount(userId);
    return todayCount < features.maxDailyTrades;
  }
}

/**
 * Helper function to check subscription access for a specific feature
 */
export async function hasSubscriptionAccess(userId: string, feature: string): Promise<boolean> {
  try {
    const { features } = await SubscriptionService.getUserSubscription(userId);
    
    switch (feature) {
      case 'LIVE_TRADING':
        return features.canAccessLiveTrading;
      case 'SIGNAL_PROCESSING':
        return features.canAccessFullSignalSources;
      case 'MEV_PROTECTION':
        return features.canAccessMEVProtection;
      case 'CUSTOM_STRATEGIES':
        return features.canAccessCustomStrategies;
      case 'FULL_ANALYTICS':
        return features.canAccessFullAnalytics;
      case 'BACKTESTING':
        return features.canAccessBacktesting;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking subscription access:', error);
    return false;
  }
}

export default SubscriptionService;
