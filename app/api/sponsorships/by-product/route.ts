// app/api/sponsorships/by-product/route.ts
import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "Missing productId" }, { status: 400 });
  }

  try {
    const res = await databases.listDocuments(DATABASE_ID, "tokoni_sponsorships", [
      Query.equal("productId", productId),
      Query.equal("status", "active"),
      Query.orderDesc("$createdAt"),
      Query.limit(1),
    ]);

    const sponsorship = res.documents[0] || null;
    return NextResponse.json({ success: true, sponsorship });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch" }, { status: 500 });
  }
}
