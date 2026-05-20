// app/api/comments/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { toggleCommentLikeService } from "@/lib/services/comments.service";

export async function POST(req: NextRequest) {
  try {
    const { commentId, users } = await req.json();

    if (!commentId || !users) {
      return NextResponse.json(
        { error: "Missing required fields (commentId, users)" },
        { status: 400 }
      );
    }

    const comment = await toggleCommentLikeService(commentId, users);

    return NextResponse.json(
      { success: true, data: comment },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("LIKE COMMENT API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to toggle comment like" },
      { status: 500 }
    );
  }
}
