// app/api/sponsorships/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { databases } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doc = await databases.getDocument(DATABASE_ID, "tokoni_sponsorships", id);

    let product = null;
    if (doc.productId) {
      try {
        product = await databases.getDocument(DATABASE_ID, "product", doc.productId);
      } catch {
        // product may have been deleted
      }
    }

    return NextResponse.json({ success: true, sponsorship: doc, product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Not found" }, { status: 404 });
  }
}
