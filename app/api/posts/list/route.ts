// app/api/posts/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPostsByVendorService, getGlobalFeedPostsService, getPostsByIdsService } from "@/lib/services/posts.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");
    const vendor = searchParams.get("vendor") || undefined;
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor") || undefined;

    if (idsParam) {
      const ids = idsParam.split(",").filter(Boolean);
      const posts = await getPostsByIdsService(ids);
      return NextResponse.json(
        { success: true, posts, nextCursor: undefined, hasMore: false },
        { status: 200 }
      );
    }

    const limit = parseInt(limitParam || "10", 10);
    let result;

    if (vendor) {
      result = await getPostsByVendorService(vendor, limit, cursor);
    } else {
      result = await getGlobalFeedPostsService(limit, cursor);
    }

    return NextResponse.json(
      { success: true, posts: result.posts, nextCursor: result.nextCursor, hasMore: result.hasMore },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("LIST POSTS API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
