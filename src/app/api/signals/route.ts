import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const signalSchema = z.object({
  source: z.enum(["TELEGRAM", "DISCORD", "SOLANA_INDEXER", "MANUAL"]),
  sourceId: z.string().optional(),
  tokenAddress: z.string().min(1),
  tokenSymbol: z.string().optional(),
  tokenName: z.string().optional(),
  rawMessage: z.string().optional(),
  confidence: z.number().min(0).max(10).default(0),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signalSchema.parse(body);

    // Calculate signal score based on source and confidence
    let score = validatedData.confidence;
    
    // Adjust score based on source reliability
    switch (validatedData.source) {
      case "TELEGRAM":
        score *= 0.8; // Telegram signals are generally less reliable
        break;
      case "DISCORD":
        score *= 0.9; // Discord signals moderate reliability
        break;
      case "SOLANA_INDEXER":
        score *= 1.0; // On-chain data is most reliable
        break;
      case "MANUAL":
        score *= 0.7; // Manual signals depend on user expertise
        break;
    }

    // Create signal in database
    const signal = await prisma.signal.create({
      data: {
        ...validatedData,
        score,
      },
    });

    // Only process signals with score >= 7
    if (score >= 7) {
      // TODO: Add signal to processing queue
      console.log(`High-quality signal received: ${signal.id} with score ${score}`);
    }

    return NextResponse.json({ signal, processed: score >= 7 }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Signal processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const signals = await prisma.signal.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ signals });
  } catch (error) {
    console.error("Error fetching signals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
