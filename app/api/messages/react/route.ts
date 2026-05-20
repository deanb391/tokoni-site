// app/api/messages/react/route.ts
import { NextRequest, NextResponse } from "next/server";
import { toggleMessageReactionService } from "@/lib/services/messages.service";

export async function POST(req: NextRequest) {
  try {
    const { messageId, userId, username, emoji } = await req.json();

    if (!messageId || !userId || !username || !emoji) {
      return NextResponse.json(
        { error: "Missing required fields (messageId, userId, username, emoji)" },
        { status: 400 }
      );
    }

    const message = await toggleMessageReactionService(messageId, userId, username, emoji);

    return NextResponse.json(
      { success: true, data: message },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("TOGGLE REACTION API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to toggle reaction" },
      { status: 500 }
    );
  }
}
