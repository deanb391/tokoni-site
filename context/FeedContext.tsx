"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Post } from "@/lib/services/posts.service";
import { Product } from "@/lib/services/products.service";
import { Vendor } from "@/lib/services/vendors.service";
import { getGlobalFeedPosts, toggleLikePost as toggleLikePostApi } from "@/lib/api/posts";
import { getProductById } from "@/lib/api/products";
import { getVendorById } from "@/lib/api/vendors";
import { useUser } from "@/context/UserContext";

interface FeedContextType {
  posts: Post[];
  loading: boolean;
  hasMore: boolean;
  highestViewedIndex: number;
  expandedPostIndex: number | null;
  productsMap: Record<string, Product>;
  vendorsMap: Record<string, Vendor>;
  setHighestViewedIndex: (index: number) => void;
  setExpandedPostIndex: (index: number | null) => void;
  toggleLike: (postId: string) => Promise<void>;
  refreshFeed: () => Promise<void>;
  fetchNextBatch: (limit?: number) => Promise<void>;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [highestViewedIndex, setHighestViewedIndexState] = useState(-1);
  const [expandedPostIndex, setExpandedPostIndex] = useState<number | null>(null);

  // Caches for tagged products and vendor profiles
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [vendorsMap, setVendorsMap] = useState<Record<string, Vendor>>({});

  const postsRef = useRef<Post[]>([]);
  const highestViewedRef = useRef(-1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  // Keep refs up-to-date for background prefetching closure safety
  useEffect(() => { postsRef.current = posts; }, [posts]);
  useEffect(() => { highestViewedRef.current = highestViewedIndex; }, [highestViewedIndex]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  // Update highest viewed index
  const setHighestViewedIndex = (index: number) => {
    setHighestViewedIndexState(prev => Math.max(prev, index));
  };

  // Helper to resolve referenced products and vendors for loaded posts
  const resolveMetadataForPosts = async (postsList: Post[]) => {
    // 1. Tagged products
    const productIds = Array.from(new Set(postsList.flatMap(p => p.taggedProducts)));
    const missingProductIds = productIds.filter(id => !productsMap[id]);

    if (missingProductIds.length > 0) {
      Promise.all(
        missingProductIds.map(async id => {
          try {
            const prod = await getProductById(id);
            return { id, prod };
          } catch (e) {
            console.error(`Failed resolving product metadata for ${id}:`, e);
            return null;
          }
        })
      ).then(results => {
        setProductsMap(prev => {
          const next = { ...prev };
          results.forEach(res => {
            if (res) next[res.id] = res.prod;
          });
          return next;
        });
      });
    }

    // 2. Vendors profiles
    const vendorIds = Array.from(new Set(postsList.map(p => p.vendor)));
    const missingVendorIds = vendorIds.filter(id => !vendorsMap[id]);

    if (missingVendorIds.length > 0) {
      Promise.all(
        missingVendorIds.map(async id => {
          try {
            const vendor = await getVendorById(id);
            return { id, vendor };
          } catch (e) {
            console.error(`Failed resolving vendor metadata for ${id}:`, e);
            return null;
          }
        })
      ).then(results => {
        setVendorsMap(prev => {
          const next = { ...prev };
          results.forEach(res => {
            if (res) next[res.id] = res.vendor;
          });
          return next;
        });
      });
    }
  };

  // Fetch a batch of posts
  const fetchNextBatch = async (limit = 5) => {
    if (loadingRef.current || !hasMoreRef.current) return;
    setLoading(true);

    try {
      const res = await getGlobalFeedPosts(limit, cursor);
      
      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.$id));
        const filteredNew = res.posts.filter(p => !existingIds.has(p.$id));
        const combined = [...prev, ...filteredNew];
        
        // Asynchronously resolve vendor/product metadata for the combined list
        resolveMetadataForPosts(filteredNew);
        return combined;
      });

      setCursor(res.nextCursor);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error("Error fetching feed batch:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize feed with first 10 posts
  const refreshFeed = async () => {
    setLoading(true);
    try {
      const res = await getGlobalFeedPosts(10);
      setPosts(res.posts);
      setCursor(res.nextCursor);
      setHasMore(res.hasMore);
      setHighestViewedIndexState(-1);
      
      resolveMetadataForPosts(res.posts);
    } catch (err) {
      console.error("Error refreshing feed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    refreshFeed();
  }, []);

  // Prefetch loop: runs whenever highestViewedIndex or posts.length changes
  // Buffer size: posts.length - (highestViewedIndex + 1)
  // We keep pre-fetching in batches of 5 until bufferSize >= 20 or no more posts are available
  useEffect(() => {
    if (loading || !hasMore) return;

    const bufferSize = posts.length - (highestViewedIndex + 1);
    if (bufferSize < 20) {
      fetchNextBatch(5);
    }
  }, [posts.length, highestViewedIndex, loading, hasMore]);

  // Handle toggling post like
  const toggleLike = async (postId: string) => {
    if (!user?.$id) return;
    
    // Find current post
    const postIndex = posts.findIndex(p => p.$id === postId);
    if (postIndex === -1) return;

    const post = posts[postIndex];
    const isLiked = post.likedBy.includes(user.$id);

    // Optimistic Update
    const updatedLikedBy = isLiked
      ? post.likedBy.filter(id => id !== user.$id)
      : [...post.likedBy, user.$id];

    const updatedPost: Post = {
      ...post,
      likes: updatedLikedBy.length,
      likedBy: updatedLikedBy,
    };

    setPosts(prev => prev.map(p => (p.$id === postId ? updatedPost : p)));

    try {
      await toggleLikePostApi(postId, user.$id);
    } catch (err) {
      console.error("Failed to sync like with backend, reverting:", err);
      // Revert if API fails
      setPosts(prev => prev.map(p => (p.$id === postId ? post : p)));
    }
  };

  return (
    <FeedContext.Provider
      value={{
        posts,
        loading,
        hasMore,
        highestViewedIndex,
        expandedPostIndex,
        productsMap,
        vendorsMap,
        setHighestViewedIndex,
        setExpandedPostIndex,
        toggleLike,
        refreshFeed,
        fetchNextBatch,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
}

export function useFeed() {
  const context = useContext(FeedContext);
  if (context === undefined) {
    throw new Error("useFeed must be used within a FeedProvider");
  }
  return context;
}
