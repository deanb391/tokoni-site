// app/api/products/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { toggleLikeProductService } from "@/lib/services/products.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, userId } = body;

    if (!productId || !userId) {
      return NextResponse.json(
        { error: "Missing productId or userId" },
        { status: 400 }
      );
    }

    const result = await toggleLikeProductService(productId, userId);

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("LIKE PRODUCT API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to toggle product like" },
      { status: 500 }
    );
  }
}
