// app/api/products/get/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getProductByIdService } from "@/lib/services/products.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId parameter" },
        { status: 400 }
      );
    }

    const product = await getProductByIdService(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, data: null, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: product },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET PRODUCT API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}
