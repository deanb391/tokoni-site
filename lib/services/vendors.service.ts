// lib/services/vendors.service.ts
import { ID, Query } from "node-appwrite";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const VENDORS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_VENDORS_COLLECTION || "vendor";

export type VendorDraft = {
  businessName: string;
  tagline?: string;
  coverImage?: string;
  logoImage?: string;
  phoneNumber: string;
  countryCode: string;
  category: string[];
  country: string;
  state: string;
  address: string;
  status?: string;
  plan?: string;
  trialEndsAt?: string;
  planEndsAt?: string;
};

export type Vendor = VendorDraft & {
  $id: string;
  users: string;
  $createdAt: string;
  $updatedAt: string;
  followersCount?: number;
  plan?: string;
  trialEndsAt?: string;
  planEndsAt?: string;
};

function mapVendor(doc: any): Vendor {
  return {
    $id: doc.$id,
    businessName: doc.businessName || doc.username || "",
    tagline: doc.tagline || "",
    coverImage: doc.coverImage || "",
    logoImage: doc.logoImage || doc.logoImage || "",
    phoneNumber: doc.phoneNumber || "",
    countryCode: doc.countryCode || "",
    category: doc.category || [],
    country: doc.country || "",
    state: doc.state || "",
    address: doc.address || "",
    status: doc.status || "pending",
    users: doc.users || "",
    plan: doc.plan || "free",
    trialEndsAt: doc.trialEndsAt || undefined,
    planEndsAt: doc.planEndsAt || undefined,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

export async function createVendorService(
  draft: VendorDraft,
  user: string
): Promise<Vendor> {
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setMonth(trialEnd.getMonth() + 2); // 2-month premium trial

  const payload = {
    ...draft,
    users: user,
    status: "pending",
    plan: "premium",
    trialEndsAt: trialEnd.toISOString(),
    planEndsAt: null,
    $createdAt: now.toISOString(),
    $updatedAt: now.toISOString(),
  };

  const doc = await databases.createDocument(
    DATABASE_ID,
    VENDORS_COLLECTION,
    ID.unique(),
    payload
  );

  // We should also update the user's document to mark them as a vendor
  try {
    const USER_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION || "users";
    await databases.updateDocument(
      DATABASE_ID,
      USER_COLLECTION,
      user,
      { isVendor: true }
    );
  } catch (err) {
    console.error("Failed to update user isVendor flag:", err);
  }

  return mapVendor(doc);
}

export async function editVendorService(
  vendorId: string,
  updates: Partial<VendorDraft>
): Promise<Vendor> {
  const now = new Date().toISOString();

  const payload = {
    ...updates,
    $updatedAt: now,
  };

  const doc = await databases.updateDocument(
    DATABASE_ID,
    VENDORS_COLLECTION,
    vendorId,
    payload
  );

  return mapVendor(doc);
}

export async function getVendorFollowersCountService(
  vendorId: string
): Promise<number> {
  try {
    const USER_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION || "users";
    const res = await databases.listDocuments(
      DATABASE_ID,
      USER_COLLECTION,
      [Query.contains("following", vendorId)]
    );
    return res.total;
  } catch (err) {
    console.error("Error fetching followers count:", err);
    return 0;
  }
}

export async function getVendorByUserIdService(
  userId: string
): Promise<Vendor | null> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      VENDORS_COLLECTION,
      [Query.equal("users", userId)]
    );

    if (res.documents.length === 0) {
      return null;
    }

    const vendor = mapVendor(res.documents[0]);
    vendor.followersCount = await getVendorFollowersCountService(vendor.$id);
    return vendor;
  } catch (err) {
    console.error("Error fetching vendor by userId secure service:", err);
    return null;
  }
}

export async function fetchVendorService(
  vendorId: string
): Promise<Vendor> {
  const doc = await databases.getDocument(
    DATABASE_ID,
    VENDORS_COLLECTION,
    vendorId
  );

  const vendor = mapVendor(doc);
  vendor.followersCount = await getVendorFollowersCountService(vendorId);
  return vendor;
}

export async function getGlobalVendorsService(
  limit = 10,
  offset = 0,
  search?: string,
  sortByFollowers = false,
  newOnly = false
): Promise<{ vendors: Vendor[]; hasMore: boolean; nextOffset: number }> {
  try {
    const queries = [];
    queries.push(Query.orderDesc("$createdAt"));

    if (!sortByFollowers) {
      queries.push(Query.limit(limit + 1));
      queries.push(Query.offset(offset));
    } else {
      queries.push(Query.limit(100));
    }

    const res = await databases.listDocuments(
      DATABASE_ID,
      VENDORS_COLLECTION,
      queries
    );

    let vendors = await Promise.all(
      res.documents.map(async doc => {
        const v = mapVendor(doc);
        v.followersCount = await getVendorFollowersCountService(v.$id);
        return v;
      })
    );

    if (search) {
      const queryLower = search.toLowerCase();
      vendors = vendors.filter(v => 
        v.businessName.toLowerCase().includes(queryLower) || 
        (v.tagline && v.tagline.toLowerCase().includes(queryLower))
      );
    }

    if (newOnly) {
      const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
      vendors = vendors.filter(v => new Date(v.$createdAt).getTime() >= twoWeeksAgo);
    }

    if (sortByFollowers) {
      vendors.sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0));
    }

    const paginatedVendors = sortByFollowers 
      ? vendors.slice(offset, offset + limit)
      : vendors.slice(0, limit);

    const hasMore = sortByFollowers
      ? (offset + limit) < vendors.length
      : res.documents.length > limit;

    return {
      vendors: paginatedVendors,
      hasMore,
      nextOffset: offset + limit
    };
  } catch (err) {
    console.error("Error in getGlobalVendorsService:", err);
    return { vendors: [], hasMore: false, nextOffset: offset };
  }
}
