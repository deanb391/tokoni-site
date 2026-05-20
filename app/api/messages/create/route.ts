// app/api/messages/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createMessageService } from "@/lib/services/messages.service";

export async function POST(req: NextRequest) {
  try {
    const draft = await req.json();

    if (!draft.chatId || !draft.senderId) {
      return NextResponse.json(
        { error: "Missing required fields (chatId, senderId)" },
        { status: 400 }
      );
    }

    const message = await createMessageService(draft);

    return NextResponse.json(
      { success: true, data: message },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("CREATE MESSAGE API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create message" },
      { status: 500 }
    );
  }
}
