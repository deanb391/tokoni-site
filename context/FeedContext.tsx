"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Post } from "@/lib/services/posts.service";
import { Product } from "@/lib/services/products.service";
import { Vendor } from "@/lib/services/vendors.service";
import { getGlobalFeedPosts, toggleLikePost as toggleLikePostApi } from "@/lib/api/posts";
import { getProductById } from "@/lib/api/products";
import { getVendorById } from "@/lib/api/vendors";
import { useUser } from "@/context/UserContext";
import { getTopKeywords } from "@/lib/utils/keywordTracker";

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
  incrementCommentCount: (postId: string) => void;
  toggleSaveCount: (postId: string, isSaved: boolean) => void;
  refreshFeed: () => Promise<void>;
  fetchNextBatch: (limit?: number) => Promise<void>;
  initializeReels: (postId: string, preloadedPost?: Post) => Promise<void>;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [highestViewedIndex, setHighestViewedIndexState] = useState(-1);
  const [expandedPostIndex, setExpandedPostIndex] = useState<number | null>(null);

  // Caches for tagged products and vendor profiles
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [vendorsMap, setVendorsMap] = useState<Record<string, Vendor>>({});

  const postsRef = useRef<Post[]>([]);
  const highestViewedRef = useRef(-1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const offsetRef = useRef(0);

  // Keep refs up-to-date for background prefetching closure safety
  useEffect(() => { postsRef.current = posts; }, [posts]);
  useEffect(() => { highestViewedRef.current = highestViewedIndex; }, [highestViewedIndex]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { offsetRef.current = offset; }, [offset]);

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
            if (res && res.prod) next[res.id] = res.prod;
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
  const fetchNextBatch = async (limit = 10) => {
    if (loadingRef.current || !hasMoreRef.current) return;
    setLoading(true);

    try {
      const keywords = getTopKeywords();
      const userId = user?.$id || "";
      const url = `/api/posts/feed?type=feed&limit=${limit}&offset=${offsetRef.current}&keywords=${encodeURIComponent(keywords.join(","))}&userId=${encodeURIComponent(userId)}`;
      
      const res = await fetch(url).then(r => r.json());
      if (res && res.success) {
        const fetchedPosts: Post[] = res.posts || [];
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.$id));
          const filteredNew = fetchedPosts.filter(p => !existingIds.has(p.$id));
          const combined = [...prev, ...filteredNew];
          resolveMetadataForPosts(filteredNew);
          return combined;
        });

        setOffset(prev => prev + fetchedPosts.length);
        setHasMore(res.hasMore);
      }
    } catch (err) {
      console.error("Error fetching feed batch:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize feed with first 2 posts, then queue 10 more
  const refreshFeed = async () => {
    setLoading(true);
    try {
      const keywords = getTopKeywords();
      const userId = user?.$id || "";

      // 1. Fetch first 2 posts
      const url1 = `/api/posts/feed?type=feed&limit=2&offset=0&keywords=${encodeURIComponent(keywords.join(","))}&userId=${encodeURIComponent(userId)}`;
      const res1 = await fetch(url1).then(r => r.json());
      const initialPosts: Post[] = res1 && res1.success ? res1.posts : [];

      // 2. Queue next 10 posts
      const url2 = `/api/posts/feed?type=feed&limit=10&offset=${initialPosts.length}&keywords=${encodeURIComponent(keywords.join(","))}&userId=${encodeURIComponent(userId)}`;
      const res2 = await fetch(url2).then(r => r.json());
      const queuedPosts: Post[] = res2 && res2.success ? res2.posts : [];

      const combined = [...initialPosts, ...queuedPosts];
      setPosts(combined);
      setOffset(combined.length);
      setHasMore(res2 && res2.success ? res2.hasMore : false);
      setHighestViewedIndexState(-1);
      
      resolveMetadataForPosts(combined);
    } catch (err) {
      console.error("Error refreshing feed:", err);
    } finally {
      setLoading(false);
    }
  };

  const initializeReels = async (postId: string, preloadedPost?: Post) => {
    // If we have a preloaded post, populate the feed list immediately to open the overlay instantly
    if (preloadedPost) {
      setPosts([preloadedPost]);
      setExpandedPostIndex(0);
      setHighestViewedIndexState(0);
      resolveMetadataForPosts([preloadedPost]);
    }

    try {
      let targetPost = preloadedPost;

      // If no preloaded post was provided, fetch it first (blocking)
      if (!targetPost) {
        setLoading(true);
        const resPost = await fetch(`/api/posts/list?ids=${encodeURIComponent(postId)}`).then(r => r.json());
        targetPost = resPost.posts?.[0];
        if (!targetPost) return;

        resolveMetadataForPosts([targetPost]);
        setPosts([targetPost]);
        setExpandedPostIndex(0);
        setHighestViewedIndexState(0);
      }

      // Fetch the remaining reels queue asynchronously in the background
      const keywords = getTopKeywords();
      const userId = user?.$id || "";
      const url = `/api/posts/feed?type=reels&limit=10&offset=0&keywords=${encodeURIComponent(keywords.join(","))}&userId=${encodeURIComponent(userId)}`;
      const resFeed = await fetch(url).then(r => r.json());
      
      let feedPosts = resFeed.success ? resFeed.posts : [];
      // Filter out the target post
      if (targetPost) {
        feedPosts = feedPosts.filter((p: Post) => p.$id !== targetPost.$id);
        const combined = [targetPost, ...feedPosts];
        setPosts(combined);
        setOffset(combined.length);
        setHasMore(resFeed.hasMore || false);
        resolveMetadataForPosts(feedPosts);
      }
    } catch (err) {
      console.error("Error initializing reels queue:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname.includes("/reels/")) {
      // Skip automatic refreshFeed on reels route since the reels page will call initializeReels
      return;
    }
    refreshFeed();
  }, [user?.$id]); // reload if user changes

  // Prefetch loop: runs when highestViewedIndex or posts.length changes
  // Threshold: When 8 of the 10 queued items (posts.length - 4) have been rendered/viewed
  useEffect(() => {
    if (loading || !hasMore || posts.length === 0) return;

    if (highestViewedIndex >= posts.length - 4) {
      fetchNextBatch(10);
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

  const incrementCommentCount = (postId: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.$id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p
      )
    );
  };

  const toggleSaveCount = (postId: string, isSaved: boolean) => {
    setPosts(prev =>
      prev.map(p =>
        p.$id === postId
          ? { ...p, saved: Math.max(0, (p.saved || 0) + (isSaved ? 1 : -1)) }
          : p
      )
    );
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
        incrementCommentCount,
        toggleSaveCount,
        refreshFeed,
        fetchNextBatch,
        initializeReels,
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
