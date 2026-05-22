// lib/services/products.service.ts
import { ID, Query } from "node-appwrite";
import { databases } from "@/lib/appwrite/server";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a0b4741002e8ae14adc";
const PRODUCTS_COLLECTION = "product";

export type ProductDraft = {
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  category: string;
  condition: string; // 'New' | 'Used'
  tags: string[];
  images: string[];
  available: boolean;
  likes?: number;
  likedBy?: string | string[];
  isSponsored?: boolean;
};

export type Product = ProductDraft & {
  $id: string;
  vendor: string;
  likes: number;
  likedBy: string[];
  isSponsored: boolean;
  $createdAt: string;
  $updatedAt: string;
};

function mapProduct(doc: any): Product {
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
    name: doc.name || "",
    description: doc.description || "",
    price: typeof doc.price === "number" ? doc.price : parseFloat(doc.price || "0"),
    discountPrice: typeof doc.discountPrice === "number" ? doc.discountPrice : (doc.discountPrice ? parseFloat(doc.discountPrice) : null),
    stock: typeof doc.stock === "number" ? doc.stock : parseInt(doc.stock || "0", 10),
    category: doc.category || "",
    condition: doc.condition || "New",
    tags: doc.tags || [],
    images: doc.images || [],
    available: doc.available === undefined ? true : doc.available,
    vendor: doc.vendor || "",
    likes: typeof doc.likes === "number" ? doc.likes : parseInt(doc.likes || "0", 10),
    likedBy: parsedLikedBy,
    isSponsored: doc.isSponsored === true,
    $createdAt: doc.$createdAt,
    $updatedAt: doc.$updatedAt,
  };
}

export async function createProductService(
  draft: ProductDraft,
  vendor: string
): Promise<Product> {
  const now = new Date().toISOString();

  const payload = {
    ...draft,
    vendor,
    likes: draft.likes || 0,
    likedBy: typeof draft.likedBy === "string" ? draft.likedBy : JSON.stringify(draft.likedBy || []),
    $createdAt: now,
    $updatedAt: now,
  };

  const doc = await databases.createDocument(
    DATABASE_ID,
    PRODUCTS_COLLECTION,
    ID.unique(),
    payload
  );

  return mapProduct(doc);
}

export async function getProductsByVendorService(
  vendor: string
): Promise<Product[]> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      PRODUCTS_COLLECTION,
      [Query.equal("vendor", vendor), Query.orderDesc("$createdAt")]
    );

    return res.documents.map(mapProduct);
  } catch (err) {
    console.error("Error fetching vendor products secure service:", err);
    return [];
  }
}

export async function getProductsByVendorPaginatedService(
  vendor: string,
  limit = 10,
  cursor?: string
): Promise<{ products: Product[]; nextCursor?: string; hasMore: boolean }> {
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
      PRODUCTS_COLLECTION,
      queries
    );

    const products = res.documents.map(mapProduct);
    const nextCursor =
      res.documents.length === limit
        ? res.documents[res.documents.length - 1].$id
        : undefined;

    return {
      products,
      nextCursor,
      hasMore: Boolean(nextCursor),
    };
  } catch (err) {
    console.error("Error fetching vendor products paginated secure service:", err);
    return { products: [], hasMore: false };
  }
}

export async function editProductService(
  productId: string,
  updates: Partial<ProductDraft>
): Promise<Product> {
  const now = new Date().toISOString();

  const payload = {
    ...updates,
    $updatedAt: now,
  };

  const doc = await databases.updateDocument(
    DATABASE_ID,
    PRODUCTS_COLLECTION,
    productId,
    payload
  );

  return mapProduct(doc);
}

export async function getProductByIdService(
  productId: string
): Promise<Product | null> {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      PRODUCTS_COLLECTION,
      productId
    );
    return mapProduct(doc);
  } catch (err: any) {
    if (err.code === 404) {
      return null;
    }
    throw err;
  }
}

export async function deleteProductService(
  productId: string
): Promise<void> {
  await databases.deleteDocument(
    DATABASE_ID,
    PRODUCTS_COLLECTION,
    productId
  );
}

export async function toggleLikeProductService(
  productId: string,
  userId: string
): Promise<{ likes: number; likedBy: string[]; product: Product }> {
  const product = await getProductByIdService(productId);
  if (!product) {
    throw new Error("Product not found");
  }
  
  let likedByList: string[] = [];
  if (product.likedBy) {
    likedByList = Array.isArray(product.likedBy) ? product.likedBy : [];
  }
  
  const isLiked = likedByList.includes(userId);
  if (isLiked) {
    likedByList = likedByList.filter(id => id !== userId);
  } else {
    likedByList.push(userId);
  }
  
  const now = new Date().toISOString();
  const doc = await databases.updateDocument(
    DATABASE_ID,
    PRODUCTS_COLLECTION,
    productId,
    {
      likes: likedByList.length,
      likedBy: JSON.stringify(likedByList),
      $updatedAt: now
    }
  );

  // Sync user's savedProducts list
  try {
    const userDoc = await databases.getDocument(DATABASE_ID, "users", userId);
    let savedProducts: string[] = [];
    if (userDoc.savedProducts) {
      try {
        savedProducts = typeof userDoc.savedProducts === "string" ? JSON.parse(userDoc.savedProducts) : userDoc.savedProducts;
      } catch {
        savedProducts = [];
      }
    }
    
    const currentlySaved = savedProducts.includes(productId);
    let updatedSaved = [...savedProducts];
    if (!isLiked) {
      // The user is liking the product now (was not liked) -> add to savedProducts
      if (!currentlySaved) {
        updatedSaved.push(productId);
      }
    } else {
      // The user is unliking the product now (was liked) -> remove from savedProducts
      updatedSaved = updatedSaved.filter(id => id !== productId);
    }
    
    await databases.updateDocument(DATABASE_ID, "users", userId, {
      savedProducts: JSON.stringify(updatedSaved)
    });
  } catch (userErr) {
    console.error("Error updating user savedProducts on product like:", userErr);
  }
  
  const updatedProduct = mapProduct(doc);
  return {
    likes: updatedProduct.likes,
    likedBy: updatedProduct.likedBy,
    product: updatedProduct
  };
}

export async function getProductsByIdsService(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) return [];
  try {
    const promises = ids.map(id =>
      databases
        .getDocument(DATABASE_ID, PRODUCTS_COLLECTION, id)
        .then(mapProduct)
        .catch(() => null)
    );
    const results = await Promise.all(promises);
    return results.filter((p): p is Product => p !== null);
  } catch (error) {
    console.error("getProductsByIdsService error:", error);
    return [];
  }
}

function seedRandom(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(array: T[], seed: string): T[] {
  const rng = seedRandom(seed);
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

export async function getGlobalProductsService(
  limit = 10,
  cursor?: string,
  category?: string,
  search?: string,
  sponsored?: boolean,
  offset = 0,
  keywordsStr?: string,
  seed?: string,
  recommended?: boolean
): Promise<{ products: Product[]; nextCursor?: string; nextOffset?: number; hasMore: boolean }> {
  try {
    // 1. Sponsored Products flow
    if (sponsored) {
      const prodQueries = [Query.equal("isSponsored", true), Query.limit(100)];
      const prodsRes = await databases.listDocuments(DATABASE_ID, PRODUCTS_COLLECTION, prodQueries);
      let allSponsored = prodsRes.documents.map(mapProduct);

      // Fetch active sponsorships to determine durations
      let activeSponsorships: any[] = [];
      try {
        const sponsorshipsRes = await databases.listDocuments(
          DATABASE_ID,
          "tokoni_sponsorships",
          [Query.equal("status", "active"), Query.limit(100)]
        );
        activeSponsorships = sponsorshipsRes.documents;
      } catch (err) {
        console.error("Failed to fetch active sponsorships:", err);
      }

      const durationMap: Record<string, string> = {};
      activeSponsorships.forEach((doc) => {
        durationMap[doc.productId] = doc.duration;
      });

      // Priority ordering: Daily (day) = 3, Weekly (week) = 2, Monthly (month) = 1, default = 3
      const getPriority = (productId: string) => {
        const dur = durationMap[productId] || "day";
        if (dur === "day") return 3;
        if (dur === "week") return 2;
        return 1;
      };

      // Group products
      const dailyGroup = allSponsored.filter(p => getPriority(p.$id) === 3);
      const weeklyGroup = allSponsored.filter(p => getPriority(p.$id) === 2);
      const monthlyGroup = allSponsored.filter(p => getPriority(p.$id) === 1);

      // Shuffle within groups using the seed to randomize presentation while maintaining offset logic
      const finalSeed = seed || "default_seed";
      const shuffledDaily = shuffleWithSeed(dailyGroup, finalSeed);
      const shuffledWeekly = shuffleWithSeed(weeklyGroup, finalSeed);
      const shuffledMonthly = shuffleWithSeed(monthlyGroup, finalSeed);

      // Combine: Daily first, then Weekly, then Monthly
      const sortedSponsored = [...shuffledDaily, ...shuffledWeekly, ...shuffledMonthly];

      // Filter by category or search
      let filtered = sortedSponsored;
      if (category && category !== "All Categories") {
        filtered = filtered.filter(p => p.category === category);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchLower) || p.description.toLowerCase().includes(searchLower));
      }

      // Paginate
      const paginated = filtered.slice(offset, offset + limit);
      const hasMore = offset + limit < filtered.length;

      return {
        products: paginated,
        nextOffset: offset + paginated.length,
        hasMore,
      };
    }

    // 2. Main explore or category query
    const queries: any[] = [];
    if (category && category !== "All Categories") {
      queries.push(Query.equal("category", category));
    }
    if (search) {
      queries.push(Query.contains("name", search));
    }
    
    queries.push(Query.orderDesc("$createdAt"));
    queries.push(Query.limit(100));

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const res = await databases.listDocuments(DATABASE_ID, PRODUCTS_COLLECTION, queries);
    let candidateProducts = res.documents.map(mapProduct);

    // If cursor-based query is requested (e.g. from home feed), fallback to direct cursor pagination
    if (cursor) {
      const nextCursor = res.documents.length === limit ? res.documents[res.documents.length - 1].$id : undefined;
      return {
        products: candidateProducts.slice(0, limit),
        nextCursor,
        hasMore: Boolean(nextCursor)
      };
    }

    // Parse user keywords
    const keywords = keywordsStr
      ? keywordsStr.split(",").map(k => k.trim().toLowerCase()).filter(Boolean)
      : [];

    // Score relevance
    const getRelevanceScore = (p: Product) => {
      let score = 0;
      if (keywords.length === 0) return score;

      const name = p.name.toLowerCase();
      const desc = p.description.toLowerCase();
      const tags = (p.tags || []).map(t => t.toLowerCase());
      const cat = p.category.toLowerCase();

      keywords.forEach(kw => {
        if (name.includes(kw)) score += 100;
        if (desc.includes(kw)) score += 30;
        if (cat.includes(kw) || kw.includes(cat)) score += 50;
        tags.forEach(tag => {
          if (tag.includes(kw) || kw.includes(tag)) score += 50;
        });
      });
      return score;
    };

    let scoredCandidates = candidateProducts.map(p => ({
      product: p,
      relevance: getRelevanceScore(p),
    }));

    if (recommended) {
      // Recommendation section is strictly keywords-based. Sort by relevance, then recency
      scoredCandidates.sort((a, b) => {
        if (b.relevance !== a.relevance) {
          return b.relevance - a.relevance;
        }
        return new Date(b.product.$createdAt).getTime() - new Date(a.product.$createdAt).getTime();
      });
    } else {
      // Standard category feed. Sort primarily by relevance
      scoredCandidates.sort((a, b) => b.relevance - a.relevance);
    }

    // Split into keyword Pool vs general New Arrival pool for traction
    const keywordPool = scoredCandidates.filter(sc => sc.relevance > 0).map(sc => sc.product);
    // Sort general candidates strictly by newest for seller traction
    const newArrivalsPool = [...candidateProducts].sort(
      (a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    );

    // Merge: Interleave 80% keyword relevant, 20% newest overall
    const mergedList: Product[] = [];
    const seenIds = new Set<string>();

    let keyIdx = 0;
    let newIdx = 0;
    const targetKeywordRatio = 0.8;

    while (mergedList.length < candidateProducts.length) {
      const currentTotal = mergedList.length;
      let takeKeyword = false;

      if (keyIdx < keywordPool.length && newIdx < newArrivalsPool.length) {
        if (currentTotal === 0) {
          takeKeyword = keywordPool.length > 0;
        } else {
          const currentKeywordRatio = keyIdx / currentTotal;
          takeKeyword = currentKeywordRatio < targetKeywordRatio;
        }
      } else if (keyIdx < keywordPool.length) {
        takeKeyword = true;
      } else {
        takeKeyword = false;
      }

      if (takeKeyword) {
        const prod = keywordPool[keyIdx++];
        if (!seenIds.has(prod.$id)) {
          mergedList.push(prod);
          seenIds.add(prod.$id);
        }
      } else if (newIdx < newArrivalsPool.length) {
        const prod = newArrivalsPool[newIdx++];
        if (!seenIds.has(prod.$id)) {
          mergedList.push(prod);
          seenIds.add(prod.$id);
        }
      } else {
        break;
      }
    }

    // Shuffle using client's session seed to randomize the feed on page reload
    let finalMerged = mergedList;
    if (seed) {
      finalMerged = shuffleWithSeed(mergedList, seed);
    }

    // Paginate using offset and limit
    const paginated = finalMerged.slice(offset, offset + limit);
    const hasMore = offset + limit < finalMerged.length;

    return {
      products: paginated,
      nextOffset: offset + paginated.length,
      hasMore,
    };
  } catch (err: any) {
    // If isSponsored fails on query, log and return empty
    console.error("Error fetching global products secure service:", err);
    return { products: [], hasMore: false };
  }
}
