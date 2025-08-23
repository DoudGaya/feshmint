import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const tradeSchema = z.object({
  type: z.enum(["BUY", "SELL"]),
  tokenAddress: z.string().min(1),
  tokenSymbol: z.string().optional(),
  tokenName: z.string().optional(),
  amount: z.number().positive(),
  estimatedPrice: z.number().positive().optional(),
  tradingMode: z.enum(["LIVE", "PAPER"]).default("PAPER"),
  signalId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = tradeSchema.parse(body);

    // Get user's portfolio for the trading mode
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        userId: session.user.id,
        tradingMode: validatedData.tradingMode,
        isActive: true,
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: "No active portfolio found for this trading mode" },
        { status: 400 }
      );
    }

    // Check if user has sufficient balance for buy orders
    if (validatedData.type === "BUY") {
      const estimatedCost = validatedData.amount * (validatedData.estimatedPrice || 1);
      if (estimatedCost > portfolio.currentEquity) {
        return NextResponse.json(
          { error: "Insufficient balance" },
          { status: 400 }
        );
      }
    }

    // Create trade record
    const trade = await prisma.trade.create({
      data: {
        userId: session.user.id,
        portfolioId: portfolio.id,
        type: validatedData.type,
        tokenAddress: validatedData.tokenAddress,
        tokenSymbol: validatedData.tokenSymbol,
        tokenName: validatedData.tokenName,
        amount: validatedData.amount,
        estimatedPrice: validatedData.estimatedPrice,
        tradingMode: validatedData.tradingMode,
        signalId: validatedData.signalId,
        status: "PENDING",
      },
    });

    // In paper trading mode, simulate execution
    if (validatedData.tradingMode === "PAPER") {
      // Simulate trade execution with realistic slippage
      const slippage = Math.random() * 0.05; // 0-5% slippage
      const actualPrice = validatedData.estimatedPrice 
        ? validatedData.estimatedPrice * (1 + (validatedData.type === "BUY" ? slippage : -slippage))
        : Math.random() * 100; // Random price for demo

      const fees = validatedData.amount * actualPrice * 0.02; // 2% fees

      await prisma.trade.update({
        where: { id: trade.id },
        data: {
          status: "EXECUTED",
          price: actualPrice,
          slippage,
          fees,
          executedAt: new Date(),
        },
      });

      // Update portfolio
      const newEquity = validatedData.type === "BUY" 
        ? portfolio.currentEquity - (validatedData.amount * actualPrice + fees)
        : portfolio.currentEquity + (validatedData.amount * actualPrice - fees);

      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          currentEquity: newEquity,
          totalTrades: { increment: 1 },
        },
      });
    }

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Trade creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tradingMode = searchParams.get("mode") as "LIVE" | "PAPER" || "PAPER";
    const limit = parseInt(searchParams.get("limit") || "50");

    const trades = await prisma.trade.findMany({
      where: {
        userId: session.user.id,
        tradingMode,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        signal: true,
      },
    });

    return NextResponse.json({ trades });
  } catch (error) {
    console.error("Error fetching trades:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
