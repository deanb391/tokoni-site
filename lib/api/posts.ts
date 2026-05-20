// lib/api/posts.ts
import { PostDraft, Post } from "@/lib/services/posts.service";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function createPost(
  draft: PostDraft,
  vendor: string
): Promise<Post> {
  const res = await fetch("/api/posts/create", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ draft, vendor }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create post");
  }

  const data = await res.json();
  return data.data;
}

export async function getVendorPosts(
  vendor: string,
  limit = 10,
  cursor?: string
): Promise<{ posts: Post[]; nextCursor?: string; hasMore: boolean }> {
  let url = `/api/posts/list?vendor=${encodeURIComponent(vendor)}&limit=${limit}`;
  if (cursor) {
    url += `&cursor=${encodeURIComponent(cursor)}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: jsonHeaders,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch posts");
  }

  const data = await res.json();
  return {
    posts: data.posts || [],
    nextCursor: data.nextCursor,
    hasMore: data.hasMore || false,
  };
}

export async function toggleLikePost(
  postId: string,
  userId: string
): Promise<{ likes: number; likedBy: string[]; post: Post }> {
  const res = await fetch("/api/posts/like", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ postId, userId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to toggle like");
  }

  const data = await res.json();
  return data.data;
}

export async function getGlobalFeedPosts(
  limit = 10,
  cursor?: string
): Promise<{ posts: Post[]; nextCursor?: string; hasMore: boolean }> {
  let url = `/api/posts/list?limit=${limit}`;
  if (cursor) {
    url += `&cursor=${encodeURIComponent(cursor)}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: jsonHeaders,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch global feed posts");
  }

  const data = await res.json();
  return {
    posts: data.posts || [],
    nextCursor: data.nextCursor,
    hasMore: data.hasMore || false,
  };
}

export async function getPostsByIds(
  postIds: string[]
): Promise<Post[]> {
  if (!postIds || postIds.length === 0) return [];
  const res = await fetch(`/api/posts/list?ids=${encodeURIComponent(postIds.join(","))}`, {
    method: "GET",
    headers: jsonHeaders,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch posts");
  }

  const data = await res.json();
  return data.posts || [];
}
