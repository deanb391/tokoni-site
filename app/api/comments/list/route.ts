// app/api/comments/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCommentsByPostService } from "@/lib/services/comments.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const post = searchParams.get("post");
    const parentId = searchParams.get("parentId") || "";
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const cursor = searchParams.get("cursor") || undefined;

    if (!post) {
      return NextResponse.json(
        { error: "Missing required query parameter: postId" },
        { status: 400 }
      );
    }

    const res = await getCommentsByPostService(post, parentId, limit, cursor);

    return NextResponse.json(
      { success: true, data: res },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("LIST COMMENTS API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to list comments" },
      { status: 500 }
    );
  }
}
