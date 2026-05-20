// app/api/chats/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createChatService } from "@/lib/services/chats.service";

export async function POST(req: NextRequest) {
  try {
    const { participants } = await req.json();

    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      return NextResponse.json(
        { error: "Participants must be an array with at least 2 users" },
        { status: 400 }
      );
    }

    const chat = await createChatService(participants);

    return NextResponse.json(
      { success: true, data: chat },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("CREATE CHAT API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create chat" },
      { status: 500 }
    );
  }
}
