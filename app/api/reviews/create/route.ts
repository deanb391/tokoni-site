// app/api/reviews/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createReviewService } from "@/lib/services/reviews.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draft } = body;

    if (!draft || !draft.product || !draft.users || !draft.rating || !draft.review) {
      return NextResponse.json(
        { error: "Missing required review fields (productId, user, rating, review)" },
        { status: 400 }
      );
    }

    const createdReview = await createReviewService(draft);

    return NextResponse.json(
      { success: true, data: createdReview },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("CREATE REVIEW API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create product review" },
      { status: 500 }
    );
  }
}
