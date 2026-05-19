// app/api/products/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getProductsByVendorService } from "@/lib/services/products.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendor = searchParams.get("vendor");

    if (!vendor) {
      return NextResponse.json(
        { error: "Missing vendor parameter" },
        { status: 400 }
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
