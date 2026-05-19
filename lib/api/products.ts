// lib/api/products.ts
import { ProductDraft, Product } from "@/lib/services/products.service";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function createProduct(
  draft: ProductDraft,
  vendor: string
): Promise<Product> {
  const res = await fetch("/api/products/create", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ draft, vendor }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create product");
  }

  const data = await res.json();
  return data.data;
}

export async function getVendorProducts(
  vendor: string
): Promise<Product[]> {
  const res = await fetch(`/api/products/list?vendor=${encodeURIComponent(vendor)}`, {
    method: "GET",
    headers: jsonHeaders,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch products");
  }

  const data = await res.json();
  return data.products || [];
}

export async function getProductById(
  productId: string
): Promise<Product> {
  const res = await fetch(`/api/products/get?productId=${encodeURIComponent(productId)}`, {
    method: "GET",
    headers: jsonHeaders,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch product details");
  }

  const data = await res.json();
  return data.data;
}

export async function editProduct(
  productId: string,
  draft: ProductDraft
): Promise<Product> {
  const res = await fetch("/api/products/edit", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ productId, draft }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update product");
  }

  const data = await res.json();
  return data.data;
}

export async function deleteProduct(
  productId: string
): Promise<void> {
  const res = await fetch("/api/products/delete", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ productId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete product");
  }
}

export async function toggleLikeProduct(
  productId: string,
  userId: string
): Promise<{ likes: number; likedBy: string[]; product: Product }> {
  const res = await fetch("/api/products/like", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ productId, userId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to toggle like");
  }

  const data = await res.json();
  return data.data;
}
