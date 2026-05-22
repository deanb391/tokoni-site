"use client";

import React, { useState, useEffect } from 'react';
import { useHomeFeed } from '@/context/HomeFeedContext';
import { useUser } from '@/context/UserContext';
import { useChat } from '@/context/ChatContext';
import { getVendorById, getGlobalVendors } from '@/lib/api/vendors';
import { getProductsByIds } from '@/lib/api/products';
import ProductCard from '@/components/ProductCard';
import PostCard from '@/components/PostCard';
import { Search, Loader2, Sparkles, AlertCircle, MessageSquare, X, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomeFeedScreen() {
    const router = useRouter();
    const { user } = useUser();
    const { startChatWithUser } = useChat();
    const {
        streamItems,
        loading,
        loadingMore,
        searchQuery,
        setSearchQuery,
        loadMore,
        hasMoreProducts,
        hasMorePosts,
        searchedProducts,
        searchedPosts,
        searchedVendors
    } = useHomeFeed();

    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Hydration maps for PostCard components
    const [vendorsMap, setVendorsMap] = useState<Record<string, any>>({});
    const [taggedProductsMap, setTaggedProductsMap] = useState<Record<string, any>>({});

    // Top & New Vendors States
    const [topVendors, setTopVendors] = useState<any[]>([]);
    const [topOffset, setTopOffset] = useState(0);
    const [hasMoreTop, setHasMoreTop] = useState(true);
    const [loadingTop, setLoadingTop] = useState(false);

    const [newVendors, setNewVendors] = useState<any[]>([]);
    const [newOffset, setNewOffset] = useState(0);
    const [hasMoreNew, setHasMoreNew] = useState(true);
    const [loadingNew, setLoadingNew] = useState(false);

    const [loadingMessageVendorId, setLoadingMessageVendorId] = useState<string | null>(null);

    const fetchTopVendors = async (isMore = false) => {
        if (loadingTop) return;
        setLoadingTop(true);
        try {
            const currentOffset = isMore ? topOffset : 0;
            const res = await getGlobalVendors(10, currentOffset, undefined, true, false);
            setTopVendors(prev => isMore ? [...prev, ...res.vendors] : res.vendors);
            setTopOffset(res.nextOffset);
            setHasMoreTop(res.hasMore);
        } catch (err) {
            console.error("Error fetching top vendors:", err);
        } finally {
            setLoadingTop(false);
        }
    };

    const fetchNewVendors = async (isMore = false) => {
        if (loadingNew) return;
        setLoadingNew(true);
        try {
            const currentOffset = isMore ? newOffset : 0;
            const res = await getGlobalVendors(10, currentOffset, undefined, false, true);
            setNewVendors(prev => isMore ? [...prev, ...res.vendors] : res.vendors);
            setNewOffset(res.nextOffset);
            setHasMoreNew(res.hasMore);
        } catch (err) {
            console.error("Error fetching new vendors:", err);
        } finally {
            setLoadingNew(false);
        }
    };

    useEffect(() => {
        fetchTopVendors();
        fetchNewVendors();
    }, []);

    const handleHorizontalScroll = (e: React.UIEvent<HTMLDivElement>, type: 'top' | 'new') => {
        const target = e.currentTarget;
        if (target.scrollWidth - target.scrollLeft - target.clientWidth < 120) {
            if (type === 'top') {
                if (hasMoreTop && !loadingTop) fetchTopVendors(true);
            } else {
                if (hasMoreNew && !loadingNew) fetchNewVendors(true);
            }
        }
    };

    const handleMessageVendor = async (e: React.MouseEvent, vendor: any) => {
        e.stopPropagation();
        if (!user?.$id) {
            alert("Please log in to message this vendor.");
            router.push('/signin');
            return;
        }
        if (vendor.users === user.$id) {
            alert("You cannot start a chat with yourself.");
            return;
        }
        setLoadingMessageVendorId(vendor.$id);
        try {
            const chatId = await startChatWithUser(vendor.users);
            router.push(`/chats/${chatId}`);
        } catch (err) {
            console.error("Failed to start chat with vendor:", err);
            alert("Failed to start chat session. Please try again.");
            setLoadingMessageVendorId(null);
        }
    };

    const renderVendorSkeleton = (count = 3) => {
        return Array.from({ length: count }).map((_, idx) => (
            <div
                key={`vendor-skeleton-${idx}`}
                style={{
                    flexShrink: 0,
                    width: '220px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '1.25rem',
                    padding: '1.5rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    gap: '10px'
                }}
            >
                <div className="skeleton" style={{ width: '70px', height: '70px', borderRadius: '50%' }}></div>
                <div className="skeleton" style={{ width: '80%', height: '14px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '60%', height: '11px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '45%', height: '18px', borderRadius: '12px', marginTop: '4px' }}></div>
                <div className="skeleton" style={{ width: '100%', height: '32px', borderRadius: '20px', marginTop: '8px' }}></div>
            </div>
        ));
    };

    const renderVendorRow = (title: string, subtitle: string, vendorsList: any[], type: 'top' | 'new', isLoading: boolean) => {
        if (vendorsList.length === 0 && !isLoading) return null;

        return (
            <div style={{ marginBottom: '3rem', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {type === 'top' ? <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> : <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-500" />}
                            {title}
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '13px', margin: 0, fontWeight: '500' }}>
                            {subtitle}
                        </p>
                    </div>
                </div>

                <div 
                    onScroll={(e) => handleHorizontalScroll(e, type)}
                    style={{
                        display: 'flex',
                        gap: '1.25rem',
                        overflowX: 'auto',
                        padding: '10px 4px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {vendorsList.map((vendor, idx) => (
                        <div
                            key={`${type}-vendor-${vendor.$id}-${idx}`}
                            onClick={() => router.push(`/profile/${vendor.users}`)}
                            style={{
                                flexShrink: 0,
                                width: '220px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E5E7EB',
                                borderRadius: '1.25rem',
                                padding: '1.5rem 1.25rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.01)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                boxSizing: 'border-box'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.05)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.01)';
                            }}
                        >
                            <div style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '50%',
                                backgroundColor: '#F3F4F6',
                                overflow: 'hidden',
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '3px solid #FFF',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            }}>
                                {vendor.logoImage ? (
                                    <img 
                                        src={vendor.logoImage} 
                                        alt={vendor.businessName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        background: 'linear-gradient(135deg, #B9001B 0%, #E53E3E 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#FFFFFF',
                                        fontWeight: '800',
                                        fontSize: '22px'
                                    }}>
                                        {vendor.businessName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <h4 style={{
                                fontSize: '15px',
                                fontWeight: '800',
                                color: '#111827',
                                margin: '0 0 4px 0',
                                width: '100%',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {vendor.businessName}
                            </h4>

                            <p style={{
                                fontSize: '11.5px',
                                color: '#6B7280',
                                margin: '0 0 12px 0',
                                height: '32px',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                width: '100%',
                                lineHeight: '1.3'
                            }}>
                                {vendor.tagline || 'Outstanding Tokoni Vendor'}
                            </p>

                            <div style={{
                                fontSize: '11px',
                                fontWeight: '700',
                                color: '#10B981',
                                backgroundColor: '#ECFDF5',
                                padding: '3px 10px',
                                borderRadius: '15px',
                                marginBottom: '16px'
                            }}>
                                {vendor.followersCount || 0} Followers
                            </div>

                            <button
                                onClick={(e) => handleMessageVendor(e, vendor)}
                                disabled={loadingMessageVendorId === vendor.$id}
                                style={{
                                    width: '100%',
                                    backgroundColor: loadingMessageVendorId === vendor.$id ? '#4b5563' : '#111827',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '20px',
                                    padding: '9px 0',
                                    fontSize: '11.5px',
                                    fontWeight: '700',
                                    cursor: loadingMessageVendorId === vendor.$id ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: 'background-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onMouseOver={(e) => {
                                    if (loadingMessageVendorId !== vendor.$id) {
                                        e.currentTarget.style.backgroundColor = '#1f2937';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (loadingMessageVendorId !== vendor.$id) {
                                        e.currentTarget.style.backgroundColor = '#111827';
                                    }
                                }}
                            >
                                {loadingMessageVendorId === vendor.$id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <MessageSquare style={{ width: "13px", height: "13px" }} />
                                )}
                                {loadingMessageVendorId === vendor.$id ? 'Connecting...' : 'Message'}
                            </button>
                        </div>
                    ))}

                    {isLoading && renderVendorSkeleton(vendorsList.length === 0 ? 5 : 2)}
                </div>
            </div>
        );
    };

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
                    uniqueVendorIds.forEach((id, index) => {
                        const v = vendorsData[index];
                        vMap[id] = v || { $id: id, businessName: 'Tokoni Vendor', logoImage: '' };
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
                            padding: searchQuery ? '14px 48px 14px 48px' : '14px 20px 14px 48px',
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
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            style={{
                                position: 'absolute',
                                right: '18px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#9CA3AF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '4px',
                                borderRadius: '50%',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {loading ? (
                    <div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: mobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
                            gap: mobile ? '0.75rem' : '1.5rem',
                            alignItems: 'start',
                            marginBottom: '4rem'
                        }}>
                            {/* Product Skeleton */}
                            <div style={{ gridColumn: 'span 1', backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '10px', border: '1px solid #EDEDED', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div className="skeleton" style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px' }}></div>
                                <div className="skeleton" style={{ width: '80%', height: '16px', borderRadius: '4px' }}></div>
                                <div className="skeleton" style={{ width: '40%', height: '14px', borderRadius: '4px' }}></div>
                            </div>

                            <div style={{ gridColumn: 'span 1', backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '10px', border: '1px solid #EDEDED', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div className="skeleton" style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px' }}></div>
                                <div className="skeleton" style={{ width: '80%', height: '16px', borderRadius: '4px' }}></div>
                                <div className="skeleton" style={{ width: '40%', height: '14px', borderRadius: '4px' }}></div>
                            </div>

                            <div style={{ gridColumn: 'span 1', backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '10px', border: '1px solid #EDEDED', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div className="skeleton" style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px' }}></div>
                                <div className="skeleton" style={{ width: '80%', height: '16px', borderRadius: '4px' }}></div>
                                <div className="skeleton" style={{ width: '40%', height: '14px', borderRadius: '4px' }}></div>
                            </div>

                            <div style={{ gridColumn: 'span 1', backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '10px', border: '1px solid #EDEDED', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div className="skeleton" style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px' }}></div>
                                <div className="skeleton" style={{ width: '80%', height: '16px', borderRadius: '4px' }}></div>
                                <div className="skeleton" style={{ width: '40%', height: '14px', borderRadius: '4px' }}></div>
                            </div>
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
                    <div>
                        {searchQuery !== "" ? (
                            /* Searching state Layout */
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginBottom: '4rem' }}>
                                {/* 1. Products search results */}
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '1.25rem', letterSpacing: '-0.4px' }}>
                                        Products matching "{searchQuery}"
                                    </h2>
                                    {searchedProducts.length === 0 ? (
                                        <div style={{ padding: '1.5rem', backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', color: '#6B7280', fontSize: '13.5px' }}>
                                            No matching products found.
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: mobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
                                            gap: mobile ? '0.75rem' : '1.5rem'
                                        }}>
                                            {searchedProducts.map((prod) => (
                                                <div key={`search-product-${prod.$id}`} style={{ gridColumn: 'span 1' }}>
                                                    <ProductCard product={prod} hideCart={true} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* 2. Vendors search results */}
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '1.25rem', letterSpacing: '-0.4px' }}>
                                        Vendors matching "{searchQuery}"
                                    </h2>
                                    {searchedVendors.length === 0 ? (
                                        <div style={{ padding: '1.5rem', backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', color: '#6B7280', fontSize: '13.5px' }}>
                                            No matching vendors found.
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'flex',
                                            gap: '1.25rem',
                                            overflowX: 'auto',
                                            padding: '10px 4px',
                                            scrollbarWidth: 'none',
                                            msOverflowStyle: 'none',
                                            WebkitOverflowScrolling: 'touch'
                                        }}>
                                            {searchedVendors.map((vendor, idx) => (
                                                <div
                                                    key={`search-vendor-${vendor.$id}-${idx}`}
                                                    onClick={() => router.push(`/profile/${vendor.users}`)}
                                                    style={{
                                                        flexShrink: 0,
                                                        width: '220px',
                                                        backgroundColor: '#FFFFFF',
                                                        border: '1px solid #E5E7EB',
                                                        borderRadius: '1.25rem',
                                                        padding: '1.5rem 1.25rem',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        textAlign: 'center',
                                                        boxShadow: '0 4px 15px rgba(0,0,0,0.01)',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                                        boxSizing: 'border-box'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '70px',
                                                        height: '70px',
                                                        borderRadius: '50%',
                                                        backgroundColor: '#F3F4F6',
                                                        overflow: 'hidden',
                                                        marginBottom: '12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '3px solid #FFF',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                                    }}>
                                                        {vendor.logoImage ? (
                                                            <img src={vendor.logoImage} alt={vendor.businessName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                background: 'linear-gradient(135deg, #B9001B 0%, #E53E3E 100%)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#FFFFFF',
                                                                fontWeight: '800',
                                                                fontSize: '22px'
                                                            }}>
                                                                {vendor.businessName.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {vendor.businessName}
                                                    </h4>
                                                    <p style={{ fontSize: '11.5px', color: '#6B7280', margin: '0 0 12px 0', height: '32px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', width: '100%', lineHeight: '1.3' }}>
                                                        {vendor.tagline || 'Outstanding Tokoni Vendor'}
                                                    </p>
                                                    <button
                                                        onClick={(e) => handleMessageVendor(e, vendor)}
                                                        disabled={loadingMessageVendorId === vendor.$id}
                                                        style={{
                                                            width: '100%',
                                                            backgroundColor: loadingMessageVendorId === vendor.$id ? '#4b5563' : '#111827',
                                                            color: '#FFFFFF',
                                                            border: 'none',
                                                            borderRadius: '20px',
                                                            padding: '8px 0',
                                                            fontSize: '11.5px',
                                                            fontWeight: '700',
                                                            cursor: loadingMessageVendorId === vendor.$id ? 'not-allowed' : 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '6px',
                                                            boxSizing: 'border-box'
                                                        }}
                                                    >
                                                        {loadingMessageVendorId === vendor.$id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <MessageSquare style={{ width: "13px", height: "13px" }} />
                                                        )}
                                                        {loadingMessageVendorId === vendor.$id ? 'Connecting...' : 'Message'}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* 3. Posts search results */}
                                <div>
                                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '1.25rem', letterSpacing: '-0.4px' }}>
                                        Posts matching "{searchQuery}"
                                    </h2>
                                    {searchedPosts.length === 0 ? (
                                        <div style={{ padding: '1.5rem', backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', color: '#6B7280', fontSize: '13.5px' }}>
                                            No matching posts found.
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: mobile ? 'repeat(1, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))',
                                            gap: mobile ? '1rem' : '1.5rem'
                                        }}>
                                            {searchedPosts.map((post) => {
                                                const vendor = vendorsMap[post.vendor];
                                                return (
                                                    <div key={`search-post-${post.$id}`} style={{ gridColumn: 'span 1' }}>
                                                        <PostCard
                                                             post={post}
                                                            vendorName={vendor?.businessName || 'Tokoni Vendor'}
                                                            vendorLogo={vendor?.logoImage || ''}
                                                            vendorUserId={vendor?.users}
                                                            taggedProductsMap={taggedProductsMap}
                                                            currentUserId={user?.$id}
                                                            isLoadingVendor={!vendor}
                                                         />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Normal feed layout */
                            <div>
                                {streamItems.length === 0 ? (
                                    <div>
                                        {renderVendorRow("Top Recommended Vendors", "Popular creators with active communities on Tokoni", topVendors, "top", loadingTop)}
                                        <div style={{
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: '16px',
                                            padding: '4rem 2rem',
                                            textAlign: 'center',
                                            border: '1px solid #EDEDED',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
                                            maxWidth: '400px',
                                            margin: '3rem auto'
                                        }}>
                                            <AlertCircle style={{ width: '40px', height: '40px', color: '#B9001B', margin: '0 auto 1rem', opacity: 0.8 }} />
                                            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '0.5rem' }}>No feed items</h3>
                                            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
                                                No feed items are available right now. Check back later!
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    /* Mosaic Stream Grid */
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: mobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
                                        gap: mobile ? '0.75rem' : '1.5rem',
                                        alignItems: 'start',
                                        marginBottom: '3rem'
                                    }}>
                                        {(() => {
                                            let didRenderTopVendors = false;
                                            return streamItems.flatMap((item, index) => {
                                                const elements = [];
                                                
                                                const shouldInsertTopVendors = !didRenderTopVendors && (
                                                    (item.type === 'post') || 
                                                    (index === 4) || 
                                                    (index === streamItems.length - 1)
                                                );

                                                if (shouldInsertTopVendors) {
                                                    didRenderTopVendors = true;
                                                    elements.push(
                                                        <div key="top-vendors-row" style={{ gridColumn: '1 / -1', margin: '1rem 0 2rem 0' }}>
                                                            {renderVendorRow("Top Recommended Vendors", "Popular creators with active communities on Tokoni", topVendors, "top", loadingTop)}
                                                        </div>
                                                    );
                                                }

                                                if (item.type === 'product') {
                                                    elements.push(
                                                        <div
                                                            key={`product-${item.data.$id}-${index}`}
                                                            style={{ gridColumn: 'span 1' }}
                                                        >
                                                            <ProductCard product={item.data} hideCart={true} />
                                                        </div>
                                                    );
                                                } else {
                                                    const vendor = vendorsMap[item.data.vendor];
                                                    elements.push(
                                                        <div
                                                            key={`post-${item.data.$id}-${index}`}
                                                            style={{ gridColumn: mobile ? 'span 2' : 'span 2' }}
                                                        >
                                                            <PostCard
                                                                post={item.data}
                                                                vendorName={vendor?.businessName || 'Tokoni Vendor'}
                                                                vendorLogo={vendor?.logoImage || ''}
                                                                vendorUserId={vendor?.users}
                                                                taggedProductsMap={taggedProductsMap}
                                                                currentUserId={user?.$id}
                                                                isLoadingVendor={!vendor}
                                                            />
                                                        </div>
                                                    );
                                                }

                                                return elements;
                                            });
                                        })()}
                                    </div>
                                )}

                                {/* New Vendors horizontal row */}
                                {renderVendorRow("New Creators", "Fresh talent who recently registered their business", newVendors, "new", loadingNew)}

                                {/* Load More Button */}
                                {(hasMoreProducts || hasMorePosts) && streamItems.length > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', margin: '3rem 0' }}>
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
                )}
            </div>
        </main>
    );
}