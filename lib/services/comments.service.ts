// lib/services/comments.service.ts
import { ID, Query } from "node-appwrite";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const COMMENTS_COLLECTION = "comment";

export type Comment = {
  $id: string;
  post: string;
  users: string;
  text: string;
  parentId: string; // Empty string if top-level comment, contains parent comment ID if reply
  likes: number;
  likedBy: string[];
  $createdAt: string;
  $updatedAt: string;
};

function mapComment(doc: any): Comment {
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

  let userVal = "";
  if (doc.users) {
    if (typeof doc.users === "object") {
      userVal = doc.users.$id || "";
    } else {
      userVal = doc.users;
    }
  }

  return {
    $id: doc.$id,
    post: doc.post || "",
    users: userVal,
    text: doc.text || "",
    parentId: doc.parentId || "",
    likes: typeof doc.likes === "number" ? doc.likes : parseInt(doc.likes || "0", 10),
    likedBy: parsedLikedBy,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

import { incrementPostCommentsService } from "@/lib/services/posts.service";

export async function createCommentService(
  post: string,
  users: string,
  text: string,
  parentId?: string
): Promise<Comment> {
  const now = new Date().toISOString();
  const payload = {
    post,
    users,
    text,
    parentId: parentId || "",
    likes: 0,
    likedBy: JSON.stringify([]),
    $createdAt: now,
    $updatedAt: now,
  };

  const doc = await databases.createDocument(
    DATABASE_ID,
    COMMENTS_COLLECTION,
    ID.unique(),
    payload
  );

  // Increment comments count in post document asynchronously
  incrementPostCommentsService(post).catch((err) => {
    console.error("Failed to increment post comments count:", err);
  });

  const mapped = mapComment(doc);
  if (!mapped.users) {
    mapped.users = users;
  }
  return mapped;
}

export async function getCommentsByPostService(
  post: string,
  parentId = "",
  limit = 10,
  cursor?: string
): Promise<{ comments: Comment[]; nextCursor?: string; hasMore: boolean }> {
  try {
    const queries: any[] = [
      Query.equal("post", post),
      Query.equal("parentId", parentId),
      Query.orderDesc("$createdAt"), // Show latest comments/replies first (or orderAsc? orderDesc is great for feed view, let's keep orderDesc)
      Query.limit(limit),
    ];

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const res = await databases.listDocuments(
      DATABASE_ID,
      COMMENTS_COLLECTION,
      queries
    );

    const comments = res.documents.map(mapComment);
    const nextCursor =
      res.documents.length === limit
        ? res.documents[res.documents.length - 1].$id
        : undefined;

    return {
      comments,
      nextCursor,
      hasMore: res.documents.length === limit,
    };
  } catch (error) {
    console.error("Error in getCommentsByPostService:", error);
    return { comments: [], hasMore: false };
  }
}

export async function toggleCommentLikeService(
  commentId: string,
  users: string
): Promise<Comment> {
  // Fetch existing comment document
  const doc = await databases.getDocument(
    DATABASE_ID,
    COMMENTS_COLLECTION,
    commentId
  );

  let likedBy: string[] = [];
  if (doc.likedBy) {
    try {
      likedBy = typeof doc.likedBy === "string" ? JSON.parse(doc.likedBy) : doc.likedBy;
    } catch (e) {
      likedBy = [];
    }
  }

  const isLiked = likedBy.includes(users);
  if (isLiked) {
    likedBy = likedBy.filter((id) => id !== users);
  } else {
    likedBy.push(users);
  }

  const updatedDoc = await databases.updateDocument(
    DATABASE_ID,
    COMMENTS_COLLECTION,
    commentId,
    {
      likes: likedBy.length,
      likedBy: JSON.stringify(likedBy),
    }
  );

  return mapComment(updatedDoc);
}
