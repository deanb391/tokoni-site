// app/api/posts/share/route.ts
import { NextRequest, NextResponse } from "next/server";
import { incrementPostSharesService } from "@/lib/services/posts.service";

export async function POST(req: NextRequest) {
  try {
    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json(
        { error: "Missing postId" },
        { status: 400 }
      );
    }

    const shares = await incrementPostSharesService(postId);

    return NextResponse.json(
      { success: true, shares },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("SHARE POST API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to increment share on post" },
      { status: 500 }
    );
  }
}
