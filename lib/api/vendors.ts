// lib/api/vendors.ts
import { VendorDraft, Vendor } from "@/lib/services/vendors.service";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function createVendor(
  draft: VendorDraft,
  userId: string
): Promise<Vendor> {
  const res = await fetch("/api/vendors/create", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ draft, userId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create vendor profile");
  }

  const data = await res.json();
  return data.data;
}

export async function editVendor(
  vendorId: string,
  updates: Partial<VendorDraft>
): Promise<Vendor> {
  const res = await fetch("/api/vendors/edit", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ vendorId, updates }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to edit vendor profile");
  }

  const data = await res.json();
  return data.data;
}

export async function getMyVendor(userId: string): Promise<Vendor | null> {
  const res = await fetch(`/api/vendors/me?userId=${encodeURIComponent(userId)}`, {
    method: "GET",
    headers: jsonHeaders,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch vendor profile status");
  }

  const data = await res.json();
  return data.vendor;
}

export async function hasVendorAccount(userId: string): Promise<boolean> {
  try {
    const vendor = await getMyVendor(userId);
    return vendor !== null;
  } catch (err) {
    console.error("Error checking vendor account status:", err);
    return false;
  }
}

export async function getVendorById(vendorId: string): Promise<Vendor> {
  const res = await fetch(`/api/vendors/get?vendorId=${encodeURIComponent(vendorId)}`, {
    method: "GET",
    headers: jsonHeaders,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch vendor details");
  }

  const data = await res.json();
  return data.data;
}
