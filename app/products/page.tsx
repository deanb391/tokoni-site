"use client";

import React, { useState, useEffect } from 'react';
import { useProducts } from '@/context/ProductsContext';
import ProductCard from '@/components/ProductCard';
import { Search, Loader2, Sparkles, Star, Award, Bookmark, ArrowRight, Grid } from 'lucide-react';

const BRAND_RED = "#B9001B";

export default function ExploreProductsScreen() {
    const {
        sections,
        searchQuery,
        setSearchQuery,
        activeCategory,
        setActiveCategory,
        loadMoreForSection,
        categories
    } = useProducts();

    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>, sectionKey: string) => {
        const target = e.currentTarget;
        // Check if user scrolled near the end of horizontal scrolling row
        if (target.scrollWidth - target.scrollLeft - target.clientWidth < 120) {
            loadMoreForSection(sectionKey);
        }
    };

    const mobile = mounted ? isMobile : false;

    // Helper to render section title and icon
    const getSectionHeader = (sectionKey: string) => {
        switch (sectionKey) {
            case 'sponsored':
                return {
                    title: 'Sponsored Products',
                    subtitle: 'Featured items from our top partners',
                    icon: <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                };
            case 'new':
                return {
                    title: 'New Arrivals',
                    subtitle: 'Freshly listed products from vendors',
                    icon: <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-500" />
                };
            default:
                return {
                    title: `${sectionKey} Collection`,
                    subtitle: `Discover quality ${sectionKey.toLowerCase()} items`,
                    icon: <Award className="w-5 h-5 text-[#B9001B]" />
                };
        }
    };

    return (
        <main style={{
            flex: 1,
            backgroundColor: '#F9FAFB',
            padding: mobile ? '1.5rem 1rem 5rem 1rem' : '3rem 2.5rem',
            boxSizing: 'border-box',
            fontFamily: 'var(--font-body), sans-serif'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                
                {/* Header title */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: mobile ? '28px' : '36px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.8px' }}>
                        Browse Marketplace
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '14.5px', margin: 0, fontWeight: '500' }}>
                        Find outstanding items across various curated sections.
                    </p>
                </div>

                {/* Search Bar */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '600px',
                    marginBottom: '2.5rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                    borderRadius: '30px'
                }}>
                    <Search style={{
                        position: 'absolute',
                        left: '18px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9CA3AF',
                        width: '18px',
                        height: '18px'
                    }} />
                    <input 
                        type="text"
                        placeholder="Search products by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '13px 20px 13px 46px',
                            borderRadius: '30px',
                            border: '1px solid #E5E7EB',
                            fontSize: '13.5px',
                            color: '#1F2937',
                            backgroundColor: '#FFFFFF',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = BRAND_RED}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    />
                </div>

                {/* Categories Pills */}
                <div style={{
                    display: 'flex',
                    gap: '0.6rem',
                    marginBottom: '3rem',
                    overflowX: 'auto',
                    paddingBottom: '6px',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none'
                }}>
                    {categories.map((cat) => {
                        const isSelected = cat === activeCategory;
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    backgroundColor: isSelected ? BRAND_RED : '#FFFFFF',
                                    color: isSelected ? '#FFFFFF' : '#4B5563',
                                    border: isSelected ? `1px solid ${BRAND_RED}` : '1px solid #E5E7EB',
                                    borderRadius: '25px',
                                    padding: '0.55rem 1.25rem',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.01)'
                                }}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                {/* Render Sections */}
                {Object.keys(sections).length === 0 ? (
                    <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            {[1, 2].map(rowIdx => (
                                <div key={rowIdx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div className="skeleton" style={{ width: '38px', height: '38px', borderRadius: '10px' }}></div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div className="skeleton" style={{ width: '150px', height: '16px', borderRadius: '4px' }}></div>
                                            <div className="skeleton" style={{ width: '220px', height: '12px', borderRadius: '4px' }}></div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'hidden' }}>
                                        {[1, 2, 3, 4].map(idx => (
                                            <div 
                                                key={`section-shimmer-${idx}`}
                                                style={{
                                                    minWidth: '260px',
                                                    width: '280px',
                                                    height: '340px',
                                                    backgroundColor: '#FFFFFF',
                                                    borderRadius: '20px',
                                                    border: '1px solid #EDEDED',
                                                    padding: '12px',
                                                    boxSizing: 'border-box',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '10px',
                                                    flexShrink: 0
                                                }}
                                            >
                                                <div className="skeleton" style={{ width: '100%', height: '220px', borderRadius: '12px' }}></div>
                                                <div className="skeleton" style={{ width: '80%', height: '15px', borderRadius: '4px' }}></div>
                                                <div className="skeleton" style={{ width: '40%', height: '12px', borderRadius: '4px' }}></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <style jsx global>{`
                            .skeleton {
                                background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
                                background-size: 200% 100%;
                                animation: loading 1.5s infinite;
                            }
                            @keyframes loading {
                                0% { background-position: 200% 0; }
                                100% { background-position: -200% 0; }
                            }
                        `}</style>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
                        {Object.entries(sections).map(([sectionKey, state]) => {
                            // If we selected a category and this section does not match it, skip it
                            if (activeCategory !== 'All Categories' && sectionKey !== activeCategory) {
                                return null;
                            }

                            // If All Categories is active and a category row has no products, hide it to save space
                            if (activeCategory === 'All Categories' && sectionKey !== 'sponsored' && sectionKey !== 'new' && state.products.length === 0 && !state.loading) {
                                return null;
                            }

                            const header = getSectionHeader(sectionKey);

                            return (
                                <div key={sectionKey} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Section Info */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '38px',
                                                height: '38px',
                                                borderRadius: '10px',
                                                backgroundColor: '#FFFFFF',
                                                border: '1px solid #EDEDED',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                                            }}>
                                                {header.icon}
                                            </div>
                                            <div>
                                                <h2 style={{ fontSize: '16.5px', fontWeight: '800', color: '#111827', margin: 0 }}>
                                                    {header.title}
                                                </h2>
                                                <p style={{ fontSize: '11.5px', color: '#6B7280', margin: 0, fontWeight: '500' }}>
                                                    {header.subtitle}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Horizontal Scrolling Row */}
                                    {state.loading ? (
                                        <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'hidden' }}>
                                            {[1, 2, 3, 4].map(idx => (
                                                <div 
                                                    key={`shimmer-${idx}`}
                                                    style={{
                                                        minWidth: '260px',
                                                        width: '280px',
                                                        height: '340px',
                                                        backgroundColor: '#FFFFFF',
                                                        borderRadius: '20px',
                                                        border: '1px solid #EDEDED',
                                                        padding: '12px',
                                                        boxSizing: 'border-box',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '10px',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    <div className="skeleton" style={{ width: '100%', height: '220px', borderRadius: '12px' }}></div>
                                                    <div className="skeleton" style={{ width: '80%', height: '15px', borderRadius: '4px' }}></div>
                                                    <div className="skeleton" style={{ width: '40%', height: '12px', borderRadius: '4px' }}></div>
                                                </div>
                                            ))}
                                            <style jsx global>{`
                                                .skeleton {
                                                    background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
                                                    background-size: 200% 100%;
                                                    animation: loading 1.5s infinite;
                                                }
                                                @keyframes loading {
                                                    0% { background-position: 200% 0; }
                                                    100% { background-position: -200% 0; }
                                                }
                                            `}</style>
                                        </div>
                                    ) : state.products.length === 0 ? (
                                        <div style={{
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: '16px',
                                            padding: '2.5rem',
                                            textAlign: 'center',
                                            border: '1px solid #EDEDED',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.01)'
                                        }}>
                                            <p style={{ fontSize: '13px', color: '#666', margin: 0, fontWeight: '500' }}>
                                                No products found in this section.
                                            </p>
                                        </div>
                                    ) : (
                                        <div 
                                            onScroll={(e) => handleScroll(e, sectionKey)}
                                            style={{
                                                display: 'flex',
                                                gap: '1.25rem',
                                                overflowX: 'auto',
                                                paddingBottom: '12px',
                                                WebkitOverflowScrolling: 'touch',
                                                scrollBehavior: 'smooth',
                                                boxSizing: 'border-box'
                                            }}
                                        >
                                            {state.products.map(prod => (
                                                <div 
                                                    key={prod.$id}
                                                    style={{
                                                        minWidth: '260px',
                                                        width: '280px',
                                                        flexShrink: 0,
                                                        boxSizing: 'border-box'
                                                    }}
                                                >
                                                    <ProductCard product={prod} />
                                                </div>
                                            ))}

                                            {/* Circular Loader when fetching next batch */}
                                            {state.hasMore && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    minWidth: '120px',
                                                    height: '350px',
                                                    flexShrink: 0,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                                                    borderRadius: '20px',
                                                    border: '1px dashed #D1D5DB'
                                                }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                        <Loader2 className="w-5 h-5 text-[#B9001B] animate-spin" />
                                                        <span style={{ fontSize: '10px', color: '#6B7280', fontWeight: '700' }}>LOADING...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}