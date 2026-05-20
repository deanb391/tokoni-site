// app/api/comments/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createCommentService } from "@/lib/services/comments.service";

export async function POST(req: NextRequest) {
  try {
    const { post, users, text, parentId } = await req.json();

    if (!post || !users || !text) {
      return NextResponse.json(
        { error: "Missing required fields (post, users, text)" },
        { status: 400 }
      );
    }

    const comment = await createCommentService(post, users, text, parentId);

    return NextResponse.json(
      { success: true, data: comment },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("CREATE COMMENT API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create comment" },
      { status: 500 }
    );
  }
}
