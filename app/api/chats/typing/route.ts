// app/api/chats/typing/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateChatTypingStateService } from "@/lib/services/chats.service";

export async function POST(req: NextRequest) {
  try {
    const { chatId, userId, isTyping } = await req.json();

    if (!chatId || !userId || isTyping === undefined) {
      return NextResponse.json(
        { error: "Missing required fields (chatId, userId, isTyping)" },
        { status: 400 }
      );
    }

    const chat = await updateChatTypingStateService(chatId, userId, isTyping);

    return NextResponse.json(
      { success: true, data: chat },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("UPDATE TYPING STATE API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update typing state" },
      { status: 500 }
    );
  }
}
