"use client";

import React, { useState, useEffect } from 'react';
import { useHomeFeed } from '@/context/HomeFeedContext';
import { useUser } from '@/context/UserContext';
import { getVendorById } from '@/lib/api/vendors';
import { getProductsByIds } from '@/lib/api/products';
import ProductCard from '@/components/ProductCard';
import PostCard from '@/components/PostCard';
import { Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function HomeFeedScreen() {
    const { user } = useUser();
    const {
        streamItems,
        loading,
        loadingMore,
        searchQuery,
        setSearchQuery,
        loadMore,
        hasMoreProducts,
        hasMorePosts
    } = useHomeFeed();

    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Hydration maps for PostCard components
    const [vendorsMap, setVendorsMap] = useState<Record<string, any>>({});
    const [taggedProductsMap, setTaggedProductsMap] = useState<Record<string, any>>({});

    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Hydrate vendor and product details for posts that appear in the stream
    useEffect(() => {
        const postsInStream = streamItems
            .filter(item => item.type === 'post')
            .map(item => item.data as any);

        if (postsInStream.length === 0) return;

        const hydratePosts = async () => {
            try {
                const missingVendorIds = postsInStream
                    .map(p => p.vendor)
                    .filter(id => id && !vendorsMap[id]);

                if (missingVendorIds.length > 0) {
                    const uniqueVendorIds = Array.from(new Set(missingVendorIds));
                    const vendorsData = await Promise.all(
                        uniqueVendorIds.map(id => getVendorById(id).catch(() => null))
                    );
                    const vMap: Record<string, any> = {};
                    vendorsData.forEach(v => {
                        if (v) vMap[v.$id] = v;
                    });
                    setVendorsMap(prev => ({ ...prev, ...vMap }));
                }

                const allTaggedProductIds = postsInStream.flatMap(p => p.taggedProducts || []);
                const missingProductIds = allTaggedProductIds.filter(id => id && !taggedProductsMap[id]);

                if (missingProductIds.length > 0) {
                    const uniqueProdIds = Array.from(new Set(missingProductIds));
                    const prodsData = await getProductsByIds(uniqueProdIds).catch(() => []);
                    const pMap: Record<string, any> = {};
                    prodsData.forEach(p => {
                        if (p) pMap[p.$id] = p;
                    });
                    setTaggedProductsMap(prev => ({ ...prev, ...pMap }));
                }
            } catch (err) {
                console.error("Error hydrating posts in stream:", err);
            }
        };

        hydratePosts();
    }, [streamItems]);

    const mobile = mounted ? isMobile : false;

    return (
        <main style={{
            flex: 1,
            backgroundColor: '#F9FAFB',
            padding: mobile ? '1rem 0.85rem 5rem 0.85rem' : '3rem 2rem',
            boxSizing: 'border-box',
            fontFamily: 'var(--font-body), sans-serif'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {/* Header Title Section */}
                <div style={{ textAlign: 'center', marginBottom: mobile ? '1.25rem' : '2.5rem' }}>
                    {!mobile && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFF0F2', color: '#B9001B', padding: '4px 12px', borderRadius: '30px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                            <Sparkles className="w-3.5 h-3.5" />
                            Curated Marketplace
                        </div>
                    )}
                    <h1 style={{ fontSize: mobile ? '22px' : '40px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
                        Discover Tokoni
                    </h1>
                    {!mobile && (
                        <p style={{ color: '#6b7280', fontSize: '14.5px', margin: 0, fontWeight: '500' }}>
                            Explore products and posts tailored to you.
                        </p>
                    )}
                </div>

                {/* Premium Search Bar */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '550px',
                    margin: mobile ? '0 auto 1.25rem' : '0 auto 3rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                    borderRadius: '30px'
                }}>
                    <Search
                        style={{
                            position: 'absolute',
                            left: '18px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#9CA3AF',
                            width: '20px',
                            height: '20px'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Search products, captions, posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '14px 20px 14px 48px',
                            borderRadius: '30px',
                            border: '1px solid #E5E7EB',
                            fontSize: '14px',
                            color: '#1F2937',
                            backgroundColor: '#FFFFFF',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#B9001B'}
                        onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    />
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0' }}>
                        <Loader2 className="w-8 h-8 text-[#B9001B] animate-spin mb-4" />
                        <span style={{ color: '#666', fontSize: '13.5px', fontWeight: '500' }}>Fetching updates...</span>
                    </div>
                ) : (
                    <div>
                        {streamItems.length === 0 ? (
                            <div style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: '16px',
                                padding: '4rem 2rem',
                                textAlign: 'center',
                                border: '1px solid #EDEDED',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
                                maxWidth: '400px',
                                margin: '0 auto'
                            }}>
                                <AlertCircle style={{ width: '40px', height: '40px', color: '#B9001B', margin: '0 auto 1rem', opacity: 0.8 }} />
                                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '0.5rem' }}>No results found</h3>
                                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                                    Try searching for different keywords or clear your query.
                                </p>
                            </div>
                        ) : (
                            /* Responsive mosaic layout grid */
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: mobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
                                gap: mobile ? '0.75rem' : '1.5rem',
                                alignItems: 'start',
                                marginBottom: '4rem'
                            }}>
                                {streamItems.map((item, index) => {
                                    if (item.type === 'product') {
                                        return (
                                            <div
                                                key={`product-${item.data.$id}-${index}`}
                                                style={{ gridColumn: 'span 1' }}
                                            >
                                                <ProductCard product={item.data} />
                                            </div>
                                        );
                                    } else {
                                        const vendor = vendorsMap[item.data.vendor];
                                        return (
                                            <div
                                                key={`post-${item.data.$id}-${index}`}
                                                style={{ gridColumn: mobile ? 'span 2' : 'span 2' }}
                                            >
                                                <PostCard
                                                    post={item.data}
                                                    vendorName={vendor?.businessName || 'Tokoni Vendor'}
                                                    vendorLogo={vendor?.logoImage || ''}
                                                    taggedProductsMap={taggedProductsMap}
                                                    currentUserId={user?.$id}
                                                />
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        )}

                        {/* Load More Button */}
                        {(hasMoreProducts || hasMorePosts) && streamItems.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        border: '1px solid #E5E7EB',
                                        color: '#1F2937',
                                        borderRadius: '25px',
                                        padding: '0.75rem 2.2rem',
                                        fontSize: '13.5px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                                        e.currentTarget.style.borderColor = '#D1D5DB';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                    }}
                                >
                                    {loadingMore && <Loader2 className="w-4 h-4 animate-spin text-[#B9001B]" />}
                                    {loadingMore ? 'Loading more...' : 'Load More Feed'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}