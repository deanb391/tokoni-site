// app/api/products/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createProductService, ProductDraft } from "@/lib/services/products.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draft, vendor } = body;

    if (!draft || !vendor) {
      return NextResponse.json(
        { error: "Missing product draft or vendor ID" },
        { status: 400 }
      );
    }

    const missingFields: string[] = [];
    if (!draft.name) missingFields.push("Product Name");
    if (!draft.description) missingFields.push("Description");
    if (draft.price === undefined || draft.price === null) missingFields.push("Base Price");
    if (draft.stock === undefined || draft.stock === null) missingFields.push("Stock Quantity");
    if (!draft.category) missingFields.push("Category");
    if (!draft.condition) missingFields.push("Condition");
    if (!Array.isArray(draft.images) || draft.images.length === 0) missingFields.push("Product Images");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Explicitly parse values to ensure data type compatibility with Appwrite database attributes
    const parsedDraft: ProductDraft = {
      name: String(draft.name).trim(),
      description: String(draft.description).trim(),
      price: parseFloat(String(draft.price)),
      discountPrice: draft.discountPrice ? parseFloat(String(draft.discountPrice)) : null,
      stock: parseInt(String(draft.stock), 10),
      category: String(draft.category),
      condition: String(draft.condition),
      tags: Array.isArray(draft.tags) ? draft.tags.map(String) : [],
      images: Array.isArray(draft.images) ? draft.images.map(String) : [],
      available: draft.available === undefined ? true : Boolean(draft.available),
    };

    const product = await createProductService(parsedDraft, vendor);

    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("CREATE PRODUCT API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
