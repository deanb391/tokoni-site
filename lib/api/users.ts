// lib/api/users.ts
import { UserProfile } from "@/lib/services/users.service";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function getUserById(userId: string): Promise<any> {
  const res = await fetch(`/api/users/get?id=${encodeURIComponent(userId)}`, {
    method: "GET",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch user profile");
  }

  const data = await res.json();
  return data.data;
}

export async function toggleFollowVendor(
  userId: string,
  vendorId: string
): Promise<UserProfile> {
  const res = await fetch("/api/users/follow", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ userId, vendorId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to toggle follow vendor");
  }

  const data = await res.json();
  return data.data;
}

export async function toggleSavePost(
  userId: string,
  postId: string
): Promise<UserProfile> {
  const res = await fetch("/api/users/save-post", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ userId, postId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to toggle save post");
  }

  const data = await res.json();
  return data.data;
}

export async function toggleSaveProduct(
  userId: string,
  productId: string
): Promise<UserProfile> {
  const res = await fetch("/api/users/save-product", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ userId, productId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to toggle save product");
  }

  const data = await res.json();
  return data.data;
}
