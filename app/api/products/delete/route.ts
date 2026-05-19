// app/api/products/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deleteProductService } from "@/lib/services/products.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId" },
        { status: 400 }
      );
    }

    await deleteProductService(productId);

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("DELETE PRODUCT API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
