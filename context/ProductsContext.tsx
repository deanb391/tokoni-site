"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getGlobalProducts } from '@/lib/api/products';
import { Product } from '@/lib/services/products.service';
import { trackSearchKeywords } from '@/lib/utils/keywordTracker';

interface SectionState {
  products: Product[];
  cursor: string | undefined;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
}

interface ProductsContextType {
  sections: Record<string, SectionState>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  loadMoreForSection: (sectionKey: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  categories: string[];
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const CATEGORIES = ['Fashion', 'Electronics', 'Home & Garden', 'Beauty', 'Sports'];

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Categories");

  const initialSectionState = (): SectionState => ({
    products: [],
    cursor: undefined,
    hasMore: true,
    loading: true,
    loadingMore: false
  });

  const [sections, setSections] = useState<Record<string, SectionState>>({});

  const fetchSectionData = async (
    sectionKey: string, 
    currentSearch: string, 
    isLoadMore = false
  ) => {
    // Determine query params based on section key
    let category: string | undefined = undefined;
    let sponsored: boolean | undefined = undefined;

    if (sectionKey === 'sponsored') {
      sponsored = true;
    } else if (sectionKey === 'new') {
      // "New" is basically recent global feed items without sponsored filter
      sponsored = undefined;
    } else {
      // Category row
      category = sectionKey;
    }

    const state = sections[sectionKey] || initialSectionState();
    const cursor = isLoadMore ? state.cursor : undefined;

    try {
      const res = await getGlobalProducts(10, cursor, category, currentSearch || undefined, sponsored);
      
      setSections(prev => {
        const prevSection = prev[sectionKey] || initialSectionState();
        return {
          ...prev,
          [sectionKey]: {
            products: isLoadMore ? [...prevSection.products, ...res.products] : res.products,
            cursor: res.nextCursor,
            hasMore: res.hasMore,
            loading: false,
            loadingMore: false
          }
        };
      });
    } catch (err) {
      console.error(`Error loading products for section ${sectionKey}:`, err);
      setSections(prev => ({
        ...prev,
        [sectionKey]: {
          ...(prev[sectionKey] || initialSectionState()),
          loading: false,
          loadingMore: false
        }
      }));
    }
  };

  const initAllSections = async (currentSearch: string) => {
    // Initialize loading indicators for active sections
    const activeSectionKeys = activeCategory === "All Categories" 
      ? ['sponsored', 'new', ...CATEGORIES]
      : [activeCategory];

    const initialMap: Record<string, SectionState> = {};
    activeSectionKeys.forEach(key => {
      initialMap[key] = {
        products: [],
        cursor: undefined,
        hasMore: true,
        loading: true,
        loadingMore: false
      };
    });
    setSections(initialMap);

    // Fetch data concurrently for active sections
    await Promise.all(
      activeSectionKeys.map(key => fetchSectionData(key, currentSearch, false))
    );
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery) {
        trackSearchKeywords(searchQuery);
      }
      initAllSections(searchQuery);
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, activeCategory]);

  const loadMoreForSection = async (sectionKey: string) => {
    const state = sections[sectionKey];
    if (!state || state.loadingMore || !state.hasMore) return;

    // Set loadingMore state
    setSections(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        loadingMore: true
      }
    }));

    await fetchSectionData(sectionKey, searchQuery, true);
  };

  const refreshAll = async () => {
    await initAllSections(searchQuery);
  };

  return (
    <ProductsContext.Provider value={{
      sections,
      searchQuery,
      setSearchQuery,
      activeCategory,
      setActiveCategory,
      loadMoreForSection,
      refreshAll,
      categories: ['All Categories', ...CATEGORIES]
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
