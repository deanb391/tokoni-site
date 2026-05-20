// lib/api/comments.ts
import { Comment } from "@/lib/services/comments.service";
export type { Comment };

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function createComment(
  post: string,
  users: string,
  text: string,
  parentId?: string
): Promise<Comment> {
  const res = await fetch("/api/comments/create", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ post, users, text, parentId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create comment");
  }

  const data = await res.json();
  return data.data;
}

export async function getComments(
  post: string,
  parentId = "",
  limit = 10,
  cursor?: string
): Promise<{ comments: Comment[]; nextCursor?: string; hasMore: boolean }> {
  let url = `/api/comments/list?post=${encodeURIComponent(post)}&parentId=${encodeURIComponent(parentId)}&limit=${limit}`;
  if (cursor) {
    url += `&cursor=${encodeURIComponent(cursor)}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: jsonHeaders,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch comments");
  }

  const data = await res.json();
  return {
    comments: data.data.comments || [],
    nextCursor: data.data.nextCursor,
    hasMore: data.data.hasMore || false,
  };
}

export async function toggleCommentLike(
  commentId: string,
  users: string
): Promise<Comment> {
  const res = await fetch("/api/comments/like", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ commentId, users }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to toggle comment like");
  }

  const data = await res.json();
  return data.data;
}
