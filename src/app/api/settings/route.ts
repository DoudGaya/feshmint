import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma, executeWithRetry, connectWithRetry } from '@/lib/prisma';
import { EncryptionService } from '@/lib/encryption';
import { z } from 'zod';

// Validation schema for user settings
const userSettingsSchema = z.object({
  solanaRpcUrl: z.string().url().optional().or(z.literal('')),
  // jitoApiKey removed per policy
  tradingWalletPrivateKey: z.string().optional().or(z.literal('')),
  telegramBotToken: z.string().optional().or(z.literal('')),
  discordWebhookUrl: z.string().url().optional().or(z.literal('')),
  emailNotifications: z.boolean().optional(),
  telegramNotifications: z.boolean().optional(),
  discordNotifications: z.boolean().optional(),
  dashboardTheme: z.enum(['dark', 'light']).optional(),
  timezone: z.string().optional(),
});

export async function GET() {
  try {
    await connectWithRetry();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const settings = await executeWithRetry(async () => {
      return await prisma.userSettings.findUnique({
        where: { userId: session.user.id },
      });
    });

    // Return settings without encrypted values (for security)
    const safeSettings = {
      emailNotifications: settings?.emailNotifications ?? true,
      telegramNotifications: settings?.telegramNotifications ?? false,
      discordNotifications: settings?.discordNotifications ?? false,
      dashboardTheme: settings?.dashboardTheme ?? 'dark',
      timezone: settings?.timezone ?? 'UTC',
      // Indicate if encrypted fields are set (without revealing values)
      hasSolanaRpcUrl: !!settings?.solanaRpcUrl,
  // jitoApiKey removed
      hasTradingWalletPrivateKey: !!settings?.tradingWalletPrivateKey,
      hasTelegramBotToken: !!settings?.telegramBotToken,
      hasDiscordWebhookUrl: !!settings?.discordWebhookUrl,
    };

    return NextResponse.json(safeSettings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    
    // Return default settings if database is unavailable
    return NextResponse.json({
      emailNotifications: true,
      telegramNotifications: false,
      discordNotifications: false,
      dashboardTheme: 'dark',
      timezone: 'UTC',
      hasSolanaRpcUrl: false,
      hasTradingWalletPrivateKey: false,
      hasTelegramBotToken: false,
      hasDiscordWebhookUrl: false,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = userSettingsSchema.parse(body);

    // Encrypt sensitive fields
    const encryptedData: Record<string, string> = {};
    
    if (validatedData.solanaRpcUrl) {
      encryptedData.solanaRpcUrl = EncryptionService.encrypt(validatedData.solanaRpcUrl);
    }
    
    // jitoApiKey removed
    
    if (validatedData.tradingWalletPrivateKey) {
      // Validate private key format before encrypting
      if (!validatedData.tradingWalletPrivateKey.match(/^[a-fA-F0-9]{64}$/)) {
        return NextResponse.json(
          { error: 'Invalid private key format. Must be 64 hex characters.' },
          { status: 400 }
        );
      }
      encryptedData.tradingWalletPrivateKey = EncryptionService.encrypt(validatedData.tradingWalletPrivateKey);
    }
    
    if (validatedData.telegramBotToken) {
      encryptedData.telegramBotToken = EncryptionService.encrypt(validatedData.telegramBotToken);
    }
    
    if (validatedData.discordWebhookUrl) {
      encryptedData.discordWebhookUrl = EncryptionService.encrypt(validatedData.discordWebhookUrl);
    }

    // Non-encrypted fields
    const plainData = {
      emailNotifications: validatedData.emailNotifications,
      telegramNotifications: validatedData.telegramNotifications,
      discordNotifications: validatedData.discordNotifications,
      dashboardTheme: validatedData.dashboardTheme,
      timezone: validatedData.timezone,
    };

    // Combine encrypted and plain data
    const updateData = { ...encryptedData, ...plainData };

    // Update or create user settings
    const _settings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        ...updateData,
      },
    });

    // Return success without sensitive data
    return NextResponse.json({
      message: 'Settings updated successfully',
      updated: Object.keys(updateData),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }
    
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await prisma.userSettings.delete({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      message: 'Settings deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
