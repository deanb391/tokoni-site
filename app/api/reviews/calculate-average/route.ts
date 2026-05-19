// app/api/reviews/calculate-average/route.ts
import { NextRequest, NextResponse } from "next/server";
import { calculateProductAverageRatingService } from "@/lib/services/reviews.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId query parameter" },
        { status: 400 }
      );
    }

    const result = await calculateProductAverageRatingService(productId);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("CALCULATE AVERAGE RATING API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to calculate product average rating" },
      { status: 500 }
    );
  }
}
