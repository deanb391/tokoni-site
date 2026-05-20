// app/api/chats/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getChatsForUserService } from "@/lib/services/chats.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const chats = await getChatsForUserService(userId);

    return NextResponse.json(
      { success: true, chats },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("LIST CHATS API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to list chats" },
      { status: 500 }
    );
  }
}
