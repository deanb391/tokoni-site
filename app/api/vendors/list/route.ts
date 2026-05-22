// app/api/vendors/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getGlobalVendorsService } from "@/lib/services/vendors.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");
    const search = searchParams.get("search") || undefined;
    const sortByFollowersParam = searchParams.get("sortByFollowers");
    const newOnlyParam = searchParams.get("newOnly");

    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;
    const sortByFollowers = sortByFollowersParam === "true";
    const newOnly = newOnlyParam === "true";

    const result = await getGlobalVendorsService(
      limit,
      offset,
      search,
      sortByFollowers,
      newOnly
    );

    return NextResponse.json(
      { 
        success: true, 
        vendors: result.vendors, 
        hasMore: result.hasMore, 
        nextOffset: result.nextOffset 
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("LIST VENDORS API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch vendors list" },
      { status: 500 }
    );
  }
}
