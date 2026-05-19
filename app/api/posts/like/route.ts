// app/api/posts/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { toggleLikePostService } from "@/lib/services/posts.service";

export async function POST(req: NextRequest) {
  try {
    const { postId, userId } = await req.json();

    if (!postId || !userId) {
      return NextResponse.json(
        { error: "Missing postId or userId" },
        { status: 400 }
      );
    }

    const result = await toggleLikePostService(postId, userId);

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("LIKE POST API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to toggle like on post" },
      { status: 500 }
    );
  }
}
