// app/api/products/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { 
  getProductsByVendorService, 
  getProductsByVendorPaginatedService, 
  getProductsByIdsService,
  getGlobalProductsService 
} from "@/lib/services/products.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");
    const vendor = searchParams.get("vendor") || undefined;
    const limitParam = searchParams.get("limit");
    const cursor = searchParams.get("cursor") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const sponsoredParam = searchParams.get("sponsored");
    const sponsored = sponsoredParam === "true" || sponsoredParam === "1" ? true : undefined;

    if (idsParam) {
      const ids = idsParam.split(",").filter(Boolean);
      const products = await getProductsByIdsService(ids);
      return NextResponse.json(
        { success: true, products },
        { status: 200 }
      );
    }

    const limit = parseInt(limitParam || "10", 10);

    if (vendor) {
      if (limitParam) {
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
    }

    // Global query
      const offsetParam = searchParams.get("offset");
      const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
      const keywordsParam = searchParams.get("keywords") || "";
      const seed = searchParams.get("seed") || undefined;
      const recommendedParam = searchParams.get("recommended");
      const recommended = recommendedParam === "true";

      const result = await getGlobalProductsService(
        limit,
        cursor,
        category,
        search,
        sponsored,
        offset,
        keywordsParam,
        seed,
        recommended
      );
      return NextResponse.json(
        { 
          success: true, 
          products: result.products, 
          nextCursor: result.nextCursor, 
          nextOffset: result.nextOffset, 
          hasMore: result.hasMore 
        },
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
