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
};

export type Product = ProductDraft & {
  $id: string;
  vendor: string;
  likes: number;
  likedBy: string[];
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
): Promise<Product> {
  const doc = await databases.getDocument(
    DATABASE_ID,
    PRODUCTS_COLLECTION,
    productId
  );
  return mapProduct(doc);
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
  
  const updatedProduct = mapProduct(doc);
  return {
    likes: updatedProduct.likes,
    likedBy: updatedProduct.likedBy,
    product: updatedProduct
  };
}
