// app/api/chats/clear-unread/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clearChatUnreadCountService } from "@/lib/services/chats.service";

export async function POST(req: NextRequest) {
  try {
    const { chatId, userId } = await req.json();

    if (!chatId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields (chatId, userId)" },
        { status: 400 }
      );
    }

    const chat = await clearChatUnreadCountService(chatId, userId);

    return NextResponse.json(
      { success: true, data: chat },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("CLEAR UNREAD COUNT API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to clear unread count" },
      { status: 500 }
    );
  }
}
