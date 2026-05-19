// app/api/posts/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPostService } from "@/lib/services/posts.service";

export async function POST(req: NextRequest) {
  try {
    const { draft, vendor } = await req.json();

    if (!draft || !vendor) {
      return NextResponse.json(
        { error: "Missing draft or vendor fields" },
        { status: 400 }
      );
    }

    const post = await createPostService(draft, vendor);

    return NextResponse.json(
      { success: true, data: post },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("CREATE POST API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create post" },
      { status: 500 }
    );
  }
}
