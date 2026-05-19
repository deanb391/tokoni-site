// lib/services/reviews.service.ts
import { ID, Query } from "node-appwrite";
import { databases, getUserById } from "@/lib/appwrite/server";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const REVIEW_COLLECTION = "product_reviews";

export type ReviewDraft = {
  product: string;
  users: string | any;
  rating: number;
  review: string;
};

export type Review = ReviewDraft & {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
};

function mapReview(doc: any): Review {
  return {
    $id: doc.$id,
    product: doc.product || "",
    rating: doc.rating || 0,
    review: doc.review || "",
    users: doc.users || "",
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

export async function createReviewService(
  draft: ReviewDraft
): Promise<Review> {
  const now = new Date().toISOString();

  const payload = {
    ...draft,
    $createdAt: now,
    $updatedAt: now,
  };

  const doc = await databases.createDocument(
    DATABASE_ID,
    REVIEW_COLLECTION,
    ID.unique(),
    payload
  );

  return mapReview(doc);
}

export async function fetchReviewsService(
  product: string,
  limit = 5,
  cursor?: string
): Promise<{
  reviews: Review[];
  nextCursor?: string;
  hasMore: boolean;
}> {
  const queries: any[] = [
    Query.equal("product", product),
    Query.orderDesc("$createdAt"),
    Query.limit(limit),
  ];

  if (cursor) {
    queries.push(Query.cursorAfter(cursor));
  }

  const res = await databases.listDocuments(
    DATABASE_ID,
    REVIEW_COLLECTION,
    queries
  );

  const reviews = res.documents.map(mapReview);
  const nextCursor =
    res.documents.length === limit
      ? res.documents[res.documents.length - 1].$id
      : undefined;

  // Hydrate user data (for reviewers)
  const validUserIds = [
    ...new Set(
      reviews
        .map((review) => review.users)
        .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
    ),
  ];

  const userPromises = validUserIds.map((userId) => getUserById(userId));
  const users = await Promise.all(userPromises);
  const userMap = new Map(validUserIds.map((id, index) => [id, users[index]]));

  reviews.forEach((review) => {
    if (typeof review.users !== "string") return;
    const userDoc = userMap.get(review.users);
    if (userDoc) {
      review.users = userDoc;
    }
  });

  return {
    reviews,
    nextCursor,
    hasMore: Boolean(nextCursor),
  };
}

export async function calculateProductAverageRatingService(productId: string): Promise<{
  avgRating: number;
  totalReviews: number;
}> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      REVIEW_COLLECTION,
      [
        Query.equal("product", productId),
        Query.limit(100),
      ]
    );

    const reviews = res.documents.map(mapReview);
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return { avgRating: 0, totalReviews: 0 };
    }

    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const avgRating = sum / totalReviews;

    return { avgRating, totalReviews };
  } catch (err) {
    console.error("Error calculating average rating service:", err);
    return { avgRating: 0, totalReviews: 0 };
  }
}
