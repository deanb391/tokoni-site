// app/api/products/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getProductsByVendorService, getProductsByVendorPaginatedService } from "@/lib/services/products.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendor = searchParams.get("vendor");
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor") || undefined;

    if (!vendor) {
      return NextResponse.json(
        { error: "Missing vendor parameter" },
        { status: 400 }
      );
    }

    if (limitParam) {
      const limit = parseInt(limitParam, 10) || 10;
      const result = await getProductsByVendorPaginatedService(vendor, limit, cursor);
      return NextResponse.json(
        { success: true, products: result.products, nextCursor: result.nextCursor, hasMore: result.hasMore },
        { status: 200 }
      );
    }

    const products = await getProductsByVendorService(vendor);
    return NextResponse.json(
      { success: true, products },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("LIST PRODUCTS API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
