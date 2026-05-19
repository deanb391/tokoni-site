// lib/api/reviews.ts
import type { ReviewDraft, Review } from "@/lib/services/reviews.service";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function createReview(
  draft: ReviewDraft
): Promise<Review> {
  const res = await fetch("/api/reviews/create", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ draft }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to submit review");
  }

  const data = await res.json();
  return data.data;
}

export async function fetchReviews(
  product: string,
  limit = 5,
  cursor?: string
): Promise<{
  reviews: Review[];
  nextCursor?: string;
  hasMore: boolean;
}> {
  const query = new URLSearchParams({ product, limit: String(limit) });

  if (cursor) {
    query.append("cursor", cursor);
  }

  const res = await fetch(`/api/reviews/list?${query.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch product reviews");
  }

  return res.json();
}

export async function calculateProductAverageRating(
  productId: string
): Promise<{
  avgRating: number;
  totalReviews: number;
}> {
  const res = await fetch(`/api/reviews/calculate-average?productId=${productId}`);

  if (!res.ok) {
    throw new Error("Failed to calculate average rating");
  }

  return res.json();
}
