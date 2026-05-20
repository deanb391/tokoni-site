// app/api/messages/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMessagesByChatService } from "@/lib/services/messages.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const cursor = searchParams.get("cursor") || undefined;

    if (!chatId) {
      return NextResponse.json(
        { error: "Missing chatId parameter" },
        { status: 400 }
      );
    }

    const data = await getMessagesByChatService(chatId, limit, cursor);

    return NextResponse.json(
      { success: true, ...data },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("LIST MESSAGES API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to list messages" },
      { status: 500 }
    );
  }
}
