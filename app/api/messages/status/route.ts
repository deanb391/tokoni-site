// app/api/messages/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateMessagesStatusService } from "@/lib/services/messages.service";

export async function POST(req: NextRequest) {
  try {
    const { messageIds, status, chatId } = await req.json();

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: "messageIds must be a non-empty array of strings" },
        { status: 400 }
      );
    }

    if (status !== "delivered" && status !== "seen") {
      return NextResponse.json(
        { error: "status must be either 'delivered' or 'seen'" },
        { status: 400 }
      );
    }

    const success = await updateMessagesStatusService(messageIds, status, chatId);

    return NextResponse.json(
      { success },
      { status: success ? 200 : 500 }
    );
  } catch (err: any) {
    console.error("UPDATE MESSAGE STATUS API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update message status" },
      { status: 500 }
    );
  }
}
