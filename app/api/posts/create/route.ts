// app/api/posts/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createPostService } from "@/lib/services/posts.service";
import { getVendorByUserIdService } from "@/lib/services/vendors.service";
import {
  isVendorPremium,
  getVendorPostCountThisMonth,
  FREE_TIER_LIMITS,
} from "@/lib/services/subscriptions.service";


export async function POST(req: NextRequest) {
  try {
    const { draft, vendor, userId } = await req.json();

    if (!draft || !vendor) {
      return NextResponse.json(
        { error: "Missing draft or vendor fields" },
        { status: 400 }
      );
    }

    // Enforce Free-tier monthly post limit
    if (userId) {
      try {
        const vendorDoc = await getVendorByUserIdService(userId);
        if (vendorDoc && !isVendorPremium(vendorDoc)) {
          const count = await getVendorPostCountThisMonth(vendor);
          if (count >= FREE_TIER_LIMITS.posts) {
            return NextResponse.json(
              {
                error: `Free plan limit reached. You can only publish ${FREE_TIER_LIMITS.posts} posts per month. Upgrade to Premium for unlimited posts.`,
                limitReached: true,
                plan: "free",
              },
              { status: 403 }
            );
          }
        }
      } catch (limitErr) {
        console.error("Post limit check failed (non-blocking):", limitErr);
      }
    }

    const post = await createPostService(draft, vendor);

    return NextResponse.json(
      { success: true, data: post },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("CREATE POST API ROUTE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create post" },
      { status: 500 }
    );
  }
}
