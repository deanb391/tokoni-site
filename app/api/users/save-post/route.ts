// app/api/users/save-post/route.ts
import { NextRequest, NextResponse } from "next/server";
import { toggleSavePostService } from "@/lib/services/users.service";

export async function POST(req: NextRequest) {
  try {
    const { userId, postId } = await req.json();

    if (!userId || !postId) {
      return NextResponse.json(
        { error: "Missing required fields (userId, postId)" },
        { status: 400 }
      );
    }

    const updatedProfile = await toggleSavePostService(userId, postId);

    return NextResponse.json(
      { success: true, data: updatedProfile },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("TOGGLE SAVE POST API ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to toggle save post" },
      { status: 500 }
    );
  }
}
