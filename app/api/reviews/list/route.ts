// app/api/reviews/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchReviewsService } from "@/lib/services/reviews.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product");
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor") || undefined;

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId query parameter" },
        { status: 400 }
      );
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 5;
    const result = await fetchReviewsService(productId, limit, cursor);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("LIST REVIEWS API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to list product reviews" },
      { status: 500 }
    );
  }
}
