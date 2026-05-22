"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getGlobalProducts } from '@/lib/api/products';
import { Product } from '@/lib/services/products.service';
import { trackSearchKeywords, getTopKeywords } from '@/lib/utils/keywordTracker';

interface SectionState {
  products: Product[];
  offset: number;
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
  const [seed, setSeed] = useState("");
  const [sortedCategories, setSortedCategories] = useState<string[]>(['All Categories', ...CATEGORIES]);

  const initialSectionState = (): SectionState => ({
    products: [],
    offset: 0,
    hasMore: true,
    loading: true,
    loadingMore: false
  });

  const [sections, setSections] = useState<Record<string, SectionState>>({});

  useEffect(() => {
    // Generate a random seed on page mount to randomize product sorting
    setSeed(Math.random().toString());

    const loadDynamicCategories = async () => {
      let dynamicCats = [...CATEGORIES];
      try {
        // Fetch up to 100 products to extract unique categories dynamically
        const res = await getGlobalProducts(100);
        res.products.forEach(p => {
          if (p.category && !dynamicCats.some(c => c.toLowerCase() === p.category.toLowerCase())) {
            // Capitalize category name nicely
            const formattedCat = p.category.charAt(0).toUpperCase() + p.category.slice(1);
            dynamicCats.push(formattedCat);
          }
        });
      } catch (err) {
        console.error("Failed to load dynamic categories:", err);
      }

      // Sort categories list based on top user keywords
      if (typeof window !== "undefined") {
        const kws = getTopKeywords().map(k => k.toLowerCase());
        const sorted = dynamicCats.sort((a, b) => {
          const scoreA = kws.filter(kw => a.toLowerCase().includes(kw) || kw.includes(a.toLowerCase())).length;
          const scoreB = kws.filter(kw => b.toLowerCase().includes(kw) || kw.includes(b.toLowerCase())).length;
          return scoreB - scoreA;
        });
        setSortedCategories(['All Categories', ...sorted]);
      }
    };

    loadDynamicCategories();
  }, []);

  const fetchSectionData = async (
    sectionKey: string, 
    currentSearch: string, 
    isLoadMore = false
  ) => {
    let category: string | undefined = undefined;
    let sponsored: boolean | undefined = undefined;
    let recommended = false;

    if (sectionKey === 'sponsored') {
      sponsored = true;
    } else if (sectionKey === 'recommended') {
      recommended = true;
    } else if (sectionKey === 'new') {
      sponsored = undefined;
    } else {
      category = sectionKey;
    }

    const state = sections[sectionKey] || initialSectionState();
    const currentOffset = isLoadMore ? state.offset : 0;
    const keywords = getTopKeywords();

    try {
      const res = await getGlobalProducts(
        10, 
        currentOffset, 
        category, 
        currentSearch || undefined, 
        sponsored,
        keywords.join(","),
        seed,
        recommended
      );
      
      setSections(prev => {
        const prevSection = prev[sectionKey] || initialSectionState();
        return {
          ...prev,
          [sectionKey]: {
            products: isLoadMore ? [...prevSection.products, ...res.products] : res.products,
            offset: res.nextOffset || 0,
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
    // Determine active sections. We include 'recommended' below 'sponsored'.
    const activeSectionKeys = activeCategory === "All Categories" 
      ? ['sponsored', 'recommended', 'new', ...sortedCategories.filter(c => c !== 'All Categories')]
      : [activeCategory];

    const initialMap: Record<string, SectionState> = {};
    activeSectionKeys.forEach(key => {
      initialMap[key] = {
        products: [],
        offset: 0,
        hasMore: true,
        loading: true,
        loadingMore: false
      };
    });
    setSections(initialMap);

    await Promise.all(
      activeSectionKeys.map(key => fetchSectionData(key, currentSearch, false))
    );
  };

  // Immediate execution when search is cleared, otherwise debounced
  useEffect(() => {
    if (searchQuery === "") {
      initAllSections("");
      return;
    }

    const delayDebounce = setTimeout(() => {
      trackSearchKeywords(searchQuery);
      initAllSections(searchQuery);
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, activeCategory]);

  const loadMoreForSection = async (sectionKey: string) => {
    const state = sections[sectionKey];
    if (!state || state.loadingMore || !state.hasMore) return;

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
      categories: sortedCategories
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
