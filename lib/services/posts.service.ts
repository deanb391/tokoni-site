// lib/services/posts.service.ts
import { ID, Query } from "node-appwrite";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const POSTS_COLLECTION = "post";

export type PostDraft = {
  type: "image" | "video";
  media: string[];
  caption: string;
  taggedProducts: string[];
  likes?: number;
  likedBy?: string | string[];
  views?: number;
  shares?: number;
};

export type Post = {
  $id: string;
  type: "image" | "video";
  media: string[];
  caption: string;
  taggedProducts: string[];
  vendor: string;
  likes: number;
  likedBy: string[];
  comments: number;
  saved: number;
  views: number;
  shares: number;
  $createdAt: string;
  $updatedAt: string;
};

function mapPost(doc: any): Post {
  let parsedMedia: string[] = [];
  if (doc.media) {
    if (typeof doc.media === "string") {
      try {
        parsedMedia = JSON.parse(doc.media);
      } catch (e) {
        parsedMedia = [doc.media];
      }
    } else if (Array.isArray(doc.media)) {
      parsedMedia = doc.media;
    }
  }

  let parsedTaggedProducts: string[] = [];
  if (doc.taggedProducts) {
    if (typeof doc.taggedProducts === "string") {
      try {
        parsedTaggedProducts = JSON.parse(doc.taggedProducts);
      } catch (e) {
        parsedTaggedProducts = [];
      }
    } else if (Array.isArray(doc.taggedProducts)) {
      parsedTaggedProducts = doc.taggedProducts;
    }
  }

  let parsedLikedBy: string[] = [];
  if (doc.likedBy) {
    if (typeof doc.likedBy === "string") {
      try {
        parsedLikedBy = JSON.parse(doc.likedBy);
      } catch (e) {
        parsedLikedBy = [];
      }
    } else if (Array.isArray(doc.likedBy)) {
      parsedLikedBy = doc.likedBy;
    }
  }

  return {
    $id: doc.$id,
    type: doc.type || "image",
    media: parsedMedia,
    caption: doc.caption || "",
    taggedProducts: parsedTaggedProducts,
    vendor: doc.vendor || "",
    likes: typeof doc.likes === "number" ? doc.likes : parseInt(doc.likes || "0", 10),
    likedBy: parsedLikedBy,
    comments: typeof doc.comments === "number" ? doc.comments : parseInt(doc.comments || "0", 10),
    saved: typeof doc.saved === "number" ? doc.saved : parseInt(doc.saved || "0", 10),
    views: typeof doc.views === "number" ? doc.views : parseInt(doc.views || "0", 10),
    shares: typeof doc.shares === "number" ? doc.shares : parseInt(doc.shares || "0", 10),
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

export async function createPostService(
  draft: PostDraft,
  vendor: string
): Promise<Post> {
  const now = new Date().toISOString();

  // Appwrite attributes: convert arrays to JSON strings if needed
  // (We handle both array types or JSON strings in mapping, but we save as is. 
  // Appwrite collections can accept arrays of strings directly if defined as string arrays)
  const payload = {
    type: draft.type,
    media: draft.media,
    caption: draft.caption || "",
    taggedProducts: draft.taggedProducts || [],
    vendor,
    likes: draft.likes || 0,
    likedBy: JSON.stringify(Array.isArray(draft.likedBy) ? draft.likedBy : []),
    comments: 0,
    saved: 0,
    views: 0,
    shares: 0,
    $createdAt: now,
    $updatedAt: now,
  };

  const doc = await databases.createDocument(
    DATABASE_ID,
    POSTS_COLLECTION,
    ID.unique(),
    payload
  );

  return mapPost(doc);
}

export async function getPostsByVendorService(
  vendor: string,
  limit = 10,
  cursor?: string
): Promise<{ posts: Post[]; nextCursor?: string; hasMore: boolean }> {
  try {
    const queries: any[] = [
      Query.equal("vendor", vendor),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const res = await databases.listDocuments(
      DATABASE_ID,
      POSTS_COLLECTION,
      queries
    );

    const posts = res.documents.map(mapPost);
    const nextCursor =
      res.documents.length === limit
        ? res.documents[res.documents.length - 1].$id
        : undefined;

    return {
      posts,
      nextCursor,
      hasMore: Boolean(nextCursor),
    };
  } catch (err) {
    console.error("Error fetching vendor posts secure service:", err);
    return { posts: [], hasMore: false };
  }
}

export async function toggleLikePostService(
  postId: string,
  userId: string
): Promise<{ likes: number; likedBy: string[]; post: Post }> {
  const doc = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION, postId);
  const post = mapPost(doc);

  let likedByList = Array.isArray(post.likedBy) ? post.likedBy : [];
  const isLiked = likedByList.includes(userId);
  
  if (isLiked) {
    likedByList = likedByList.filter(id => id !== userId);
  } else {
    likedByList.push(userId);
  }

  const now = new Date().toISOString();
  const updatedDoc = await databases.updateDocument(
    DATABASE_ID,
    POSTS_COLLECTION,
    postId,
    {
      likes: likedByList.length,
      likedBy: JSON.stringify(likedByList),
      $updatedAt: now,
    }
  );

  const updatedPost = mapPost(updatedDoc);
  return {
    likes: updatedPost.likes,
    likedBy: updatedPost.likedBy,
    post: updatedPost,
  };
}

export async function getGlobalFeedPostsService(
  limit = 10,
  cursor?: string
): Promise<{ posts: Post[]; nextCursor?: string; hasMore: boolean }> {
  try {
    const queries: any[] = [
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const res = await databases.listDocuments(
      DATABASE_ID,
      POSTS_COLLECTION,
      queries
    );

    const posts = res.documents.map(mapPost);
    const nextCursor =
      res.documents.length === limit
        ? res.documents[res.documents.length - 1].$id
        : undefined;

    return {
      posts,
      nextCursor,
      hasMore: Boolean(nextCursor),
    };
  } catch (err) {
    console.error("Error fetching global feed posts secure service:", err);
    return { posts: [], hasMore: false };
  }
}

export async function incrementPostCommentsService(postId: string): Promise<void> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION, postId);
    const currentComments = typeof doc.comments === "number" ? doc.comments : parseInt(doc.comments || "0", 10);
    await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION, postId, {
      comments: currentComments + 1,
    });
  } catch (error) {
    console.error("incrementPostCommentsService error:", error);
  }
}

export async function togglePostSavedCountService(postId: string, increment: boolean): Promise<void> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION, postId);
    const currentSaved = typeof doc.saved === "number" ? doc.saved : parseInt(doc.saved || "0", 10);
    const newSaved = Math.max(0, currentSaved + (increment ? 1 : -1));
    await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION, postId, {
      saved: newSaved,
    });
  } catch (error) {
    console.error("togglePostSavedCountService error:", error);
  }
}

export async function getPostsByIdsService(ids: string[]): Promise<Post[]> {
  if (!ids || ids.length === 0) return [];
  try {
    const promises = ids.map(id =>
      databases
        .getDocument(DATABASE_ID, POSTS_COLLECTION, id)
        .then(mapPost)
        .catch(() => null)
    );
    const results = await Promise.all(promises);
    return results.filter((p): p is Post => p !== null);
  } catch (error) {
    console.error("getPostsByIdsService error:", error);
    return [];
  }
}

export async function incrementPostViewsService(postId: string): Promise<number> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION, postId);
    const currentViews = typeof doc.views === "number" ? doc.views : parseInt(doc.views || "0", 10);
    const newViews = currentViews + 1;
    await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION, postId, {
      views: newViews,
    });
    return newViews;
  } catch (error) {
    console.error("incrementPostViewsService error:", error);
    return 0;
  }
}

export async function incrementPostSharesService(postId: string): Promise<number> {
  try {
    const doc = await databases.getDocument(DATABASE_ID, POSTS_COLLECTION, postId);
    const currentShares = typeof doc.shares === "number" ? doc.shares : parseInt(doc.shares || "0", 10);
    const newShares = currentShares + 1;
    await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION, postId, {
      shares: newShares,
    });
    return newShares;
  } catch (error) {
    console.error("incrementPostSharesService error:", error);
    return 0;
  }
}
