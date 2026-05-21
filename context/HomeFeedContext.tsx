"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getGlobalProducts } from '@/lib/api/products';
import { getGlobalFeedPosts } from '@/lib/api/posts';
import { Post } from '@/lib/services/posts.service';
import { Product } from '@/lib/services/products.service';
import { trackSearchKeywords } from '@/lib/utils/keywordTracker';

export type StreamItem = 
  | { type: 'product'; data: Product }
  | { type: 'post'; data: Post };

interface HomeFeedContextType {
  streamItems: StreamItem[];
  loading: boolean;
  loadingMore: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  hasMoreProducts: boolean;
  hasMorePosts: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const HomeFeedContext = createContext<HomeFeedContextType | undefined>(undefined);

export function HomeFeedProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [prodCursor, setProdCursor] = useState<string | undefined>(undefined);
  const [postCursor, setPostCursor] = useState<string | undefined>(undefined);

  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const combineIntoPattern = (prods: Product[], psts: Post[]): StreamItem[] => {
    const result: StreamItem[] = [];
    let prodIdx = 0;
    let postIdx = 0;

    while (prodIdx < prods.length || postIdx < psts.length) {
      // 1. Add 4 products
      for (let i = 0; i < 4; i++) {
        if (prodIdx < prods.length) {
          result.push({ type: 'product', data: prods[prodIdx++] });
        }
      }
      // 2. Add 1 post
      if (postIdx < psts.length) {
        result.push({ type: 'post', data: psts[postIdx++] });
      }
      // 3. Add 2 products
      for (let i = 0; i < 2; i++) {
        if (prodIdx < prods.length) {
          result.push({ type: 'product', data: prods[prodIdx++] });
        }
      }
      // 4. Add 2 posts
      for (let i = 0; i < 2; i++) {
        if (postIdx < psts.length) {
          result.push({ type: 'post', data: psts[postIdx++] });
        }
      }
    }
    return result;
  };

  const fetchInitialData = async (searchVal: string) => {
    setLoading(true);
    try {
      // Fetch products (limit 12 for good initial density)
      const prodRes = await getGlobalProducts(12, undefined, undefined, searchVal || undefined);
      // Fetch posts (limit 6)
      const postRes = await getGlobalFeedPosts(6, undefined); 

      // If search query is present, we filter posts client-side (or just keep global posts if they don't support search matching)
      // Since posts service doesn't support text search natively, we can filter them by caption client-side if a query exists
      let filteredPosts = postRes.posts;
      if (searchVal) {
        filteredPosts = postRes.posts.filter(p => 
          p.caption?.toLowerCase().includes(searchVal.toLowerCase())
        );
      }

      setProducts(prodRes.products);
      setPosts(filteredPosts);

      setProdCursor(prodRes.nextCursor);
      setPostCursor(postRes.nextCursor);

      setHasMoreProducts(prodRes.hasMore);
      setHasMorePosts(postRes.hasMore);
    } catch (err) {
      console.error("Error fetching home feed data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery) {
        trackSearchKeywords(searchQuery);
      }
      fetchInitialData(searchQuery);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const loadMore = async () => {
    if (loadingMore || (!hasMoreProducts && !hasMorePosts)) return;
    setLoadingMore(true);
    try {
      let newProds: Product[] = [];
      let newPosts: Post[] = [];

      if (hasMoreProducts) {
        const prodRes = await getGlobalProducts(12, prodCursor, undefined, searchQuery || undefined);
        newProds = prodRes.products;
        setProdCursor(prodRes.nextCursor);
        setHasMoreProducts(prodRes.hasMore);
      }

      if (hasMorePosts) {
        const postRes = await getGlobalFeedPosts(6, postCursor);
        let fetchedPosts = postRes.posts;
        if (searchQuery) {
          fetchedPosts = postRes.posts.filter(p => 
            p.caption?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        newPosts = fetchedPosts;
        setPostCursor(postRes.nextCursor);
        setHasMorePosts(postRes.hasMore);
      }

      setProducts(prev => [...prev, ...newProds]);
      setPosts(prev => [...prev, ...newPosts]);
    } catch (err) {
      console.error("Error loading more home feed items:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const refresh = async () => {
    await fetchInitialData(searchQuery);
  };

  const streamItems = combineIntoPattern(products, posts);

  return (
    <HomeFeedContext.Provider value={{
      streamItems,
      loading,
      loadingMore,
      searchQuery,
      setSearchQuery,
      hasMoreProducts,
      hasMorePosts,
      loadMore,
      refresh
    }}>
      {children}
    </HomeFeedContext.Provider>
  );
}

export function useHomeFeed() {
  const context = useContext(HomeFeedContext);
  if (context === undefined) {
    throw new Error('useHomeFeed must be used within a HomeFeedProvider');
  }
  return context;
}
