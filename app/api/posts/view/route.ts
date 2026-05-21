// app/api/posts/view/route.ts
import { NextRequest, NextResponse } from "next/server";
import { incrementPostViewsService } from "@/lib/services/posts.service";

export async function POST(req: NextRequest) {
  try {
    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json(
        { error: "Missing postId" },
        { status: 400 }
      );
    }

    const views = await incrementPostViewsService(postId);

    return NextResponse.json(
      { success: true, views },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("VIEW POST API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to increment view on post" },
      { status: 500 }
    );
  }
}
