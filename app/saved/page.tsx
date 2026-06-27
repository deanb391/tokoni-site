"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'nextjs-toploader/app';

import { useUser } from '@/context/UserContext';
import { getProductsByIds } from '@/lib/api/products';
import { getPostsByIds } from '@/lib/api/posts';
import { getVendorById } from '@/lib/api/vendors';
import { toggleSaveProduct, toggleSavePost } from '@/lib/api/users';
import PostCard from '@/components/PostCard';
import { Bookmark, ShoppingBag, Grid, Trash2, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

export default function SavedItemsScreen() {
    const router = useRouter();
    const { user, setUser, loading: userLoading } = useUser();
    const [activeTab, setActiveTab] = useState<'products' | 'posts'>('products');
    const [loadingItems, setLoadingItems] = useState(true);
    
    const [savedProductsList, setSavedProductsList] = useState<any[]>([]);
    const [savedPostsList, setSavedPostsList] = useState<any[]>([]);
    const [vendorsMap, setVendorsMap] = useState<Record<string, any>>({});
    const [taggedProductsMap, setTaggedProductsMap] = useState<Record<string, any>>({});

    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Redirect to signin if not authenticated
    useEffect(() => {
        if (mounted && !userLoading && !user) {
            router.push('/signin');
        }
    }, [user, userLoading, mounted, router]);

    // Fetch details of saved products and posts
    useEffect(() => {
        if (!user) return;

        const fetchSavedDetails = async () => {
            setLoadingItems(true);
            try {
                // Fetch Products
                if (user.savedProducts && user.savedProducts.length > 0) {
                    const products = await getProductsByIds(user.savedProducts);
                    setSavedProductsList(products);
                } else {
                    setSavedProductsList([]);
                }

                // Fetch Posts
                if (user.savedPosts && user.savedPosts.length > 0) {
                    const posts = await getPostsByIds(user.savedPosts);
                    setSavedPostsList(posts);

                    // Fetch vendor info for these posts
                    const vendorIds = Array.from(new Set(posts.map(p => p.vendor)));
                    const vendorsData = await Promise.all(
                        vendorIds.map(id => getVendorById(id).catch(() => null))
                    );
                    const vMap: Record<string, any> = {};
                    vendorsData.forEach(v => {
                        if (v) vMap[v.$id] = v;
                    });
                    setVendorsMap(vMap);

                    // Fetch tagged products
                    const allProdIds = Array.from(new Set(posts.flatMap(p => p.taggedProducts)));
                    if (allProdIds.length > 0) {
                        const prodsData = await getProductsByIds(allProdIds).catch(() => []);
                        const pMap: Record<string, any> = {};
                        prodsData.forEach(p => {
                            if (p) pMap[p.$id] = p;
                        });
                        setTaggedProductsMap(pMap);
                    }
                } else {
                    setSavedPostsList([]);
                }
            } catch (err) {
                console.error("Error fetching saved details:", err);
            } finally {
                setLoadingItems(false);
            }
        };

        fetchSavedDetails();
    }, [user?.savedProducts, user?.savedPosts]);

    const handleUnsaveProduct = async (e: React.MouseEvent, productId: string) => {
        e.stopPropagation();
        if (!user?.$id) return;
        try {
            const updated = await toggleSaveProduct(user.$id, productId);
            setUser(updated);
            setSavedProductsList(prev => prev.filter(p => p.$id !== productId && String(p.id) !== productId));
        } catch (err) {
            console.error("Failed to unsave product:", err);
        }
    };

    const handleUnsavePost = async (postId: string) => {
        if (!user?.$id) return;
        try {
            const updated = await toggleSavePost(user.$id, postId);
            setUser(updated);
            setSavedPostsList(prev => prev.filter(p => p.$id !== postId));
        } catch (err) {
            console.error("Failed to unsave post:", err);
        }
    };

    if (userLoading || !user) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', fontFamily: 'var(--font-body), sans-serif' }}>
                <Loader2 className="w-8 h-8 text-[#B9001B] animate-spin mb-4" />
                <p className="text-neutral-500 font-medium">Checking auth status...</p>
            </div>
        );
    }

    const mobile = mounted ? isMobile : false;

    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: 'var(--font-body), sans-serif', paddingBottom: '5rem' }}>
            {/* Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #EDEDED',
                zIndex: 40,
                padding: mobile ? '0.75rem 1rem' : '1.25rem 2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <button
                    onClick={() => router.push('/menu')}
                    style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#F3F4F6',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#333'
                    }}
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#111', margin: 0 }}>Saved Items</h1>
                    <p style={{ fontSize: '11px', color: '#666', margin: 0, fontWeight: '500' }}>Your curated collection</p>
                </div>
            </header>

            <main style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: mobile ? '1rem' : '2rem 1.5rem',
                boxSizing: 'border-box'
            }}>
                {/* Tabs Selector */}
                <div style={{
                    display: 'flex',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '30px',
                    padding: '4px',
                    border: '1px solid #EDEDED',
                    marginBottom: '2rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}>
                    <button
                        onClick={() => setActiveTab('products')}
                        style={{
                            flex: 1,
                            backgroundColor: activeTab === 'products' ? '#B9001B' : 'transparent',
                            color: activeTab === 'products' ? '#FFFFFF' : '#666666',
                            border: 'none',
                            borderRadius: '25px',
                            padding: '0.6rem 0',
                            fontSize: '13.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Products ({savedProductsList.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('posts')}
                        style={{
                            flex: 1,
                            backgroundColor: activeTab === 'posts' ? '#B9001B' : 'transparent',
                            color: activeTab === 'posts' ? '#FFFFFF' : '#666666',
                            border: 'none',
                            borderRadius: '25px',
                            padding: '0.6rem 0',
                            fontSize: '13.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        <Grid className="w-4 h-4" />
                        Posts ({savedPostsList.length})
                    </button>
                </div>

                {loadingItems ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
                        <Loader2 className="w-7 h-7 text-[#B9001B] animate-spin mb-3" />
                        <span style={{ color: '#666', fontSize: '13px', fontWeight: '500' }}>Fetching details from database...</span>
                    </div>
                ) : (
                    <div>
                        {activeTab === 'products' && (
                            <div>
                                {savedProductsList.length === 0 ? (
                                    <div style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '16px',
                                        padding: '3rem 2rem',
                                        textAlign: 'center',
                                        border: '1px solid #EDEDED',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                                    }}>
                                        <Bookmark style={{ width: '40px', height: '40px', color: '#B9001B', margin: '0 auto 1rem', opacity: 0.8 }} />
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '0.5rem' }}>No Saved Products</h3>
                                        <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5', maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                                            Products you bookmark on the explore screen will appear here.
                                        </p>
                                        <button
                                            onClick={() => router.push('/products')}
                                            style={{
                                                backgroundColor: '#B9001B',
                                                color: '#FFFFFF',
                                                border: 'none',
                                                borderRadius: '25px',
                                                padding: '0.6rem 1.5rem',
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Explore Products
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                                        {savedProductsList.map(prod => (
                                            <div
                                                key={prod.$id || prod.id}
                                                onClick={() => router.push(`/product/${prod.$id || prod.id}`)}
                                                style={{
                                                    backgroundColor: '#FFFFFF',
                                                    borderRadius: '16px',
                                                    padding: '1rem',
                                                    border: '1px solid #EDEDED',
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    gap: '1rem',
                                                    position: 'relative',
                                                    transition: 'transform 0.2s',
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                                            >
                                                {/* Left side: Image cover */}
                                                <div style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '10px',
                                                    backgroundColor: '#F3F4F6',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0
                                                }}>
                                                    {prod.images && prod.images.length > 0 ? (
                                                        <img src={prod.images[0]} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            background: 'linear-gradient(135deg, #2A2D34 0%, #B9001B 100%)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#FFF',
                                                            fontSize: '10px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {prod.category?.slice(0, 3).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right side: details */}
                                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
                                                    <div>
                                                        <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', color: '#B9001B', backgroundColor: '#FFF0F2', padding: '2px 6px', borderRadius: '10px', display: 'inline-block', marginBottom: '4px' }}>
                                                            {prod.condition || 'New'}
                                                        </span>
                                                        <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {prod.name}
                                                        </h4>
                                                        <p style={{ fontSize: '11px', color: '#666', margin: '2px 0 0 0' }}>{prod.category}</p>
                                                    </div>
                                                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#111' }}>
                                                        ₦{(prod.discountPrice || prod.price).toLocaleString()}
                                                    </span>
                                                </div>

                                                {/* Delete icon */}
                                                <button
                                                    onClick={(e) => handleUnsaveProduct(e, prod.$id || String(prod.id))}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        right: '12px',
                                                        border: 'none',
                                                        backgroundColor: 'transparent',
                                                        color: '#888',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        borderRadius: '50%',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.color = '#B9001B'; e.currentTarget.style.backgroundColor = '#FFF0F2'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.color = '#888'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'posts' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {savedPostsList.length === 0 ? (
                                    <div style={{
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '16px',
                                        padding: '3rem 2rem',
                                        textAlign: 'center',
                                        border: '1px solid #EDEDED',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
                                    }}>
                                        <Bookmark style={{ width: '40px', height: '40px', color: '#B9001B', margin: '0 auto 1rem', opacity: 0.8 }} />
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '0.5rem' }}>No Saved Posts</h3>
                                        <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.5', maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                                            Reels and image posts you save on the main feed will appear here.
                                        </p>
                                        <button
                                            onClick={() => router.push('/')}
                                            style={{
                                                backgroundColor: '#B9001B',
                                                color: '#FFFFFF',
                                                border: 'none',
                                                borderRadius: '25px',
                                                padding: '0.6rem 1.5rem',
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            View Main Feed
                                        </button>
                                    </div>
                                ) : (
                                    savedPostsList.map(post => {
                                        const vendor = vendorsMap[post.vendor];
                                        return (
                                            <PostCard
                                                key={post.$id}
                                                post={post}
                                                vendorName={vendor?.businessName || 'Tokoni Vendor'}
                                                vendorLogo={vendor?.logoImage || ''}
                                                vendorUserId={vendor?.users}
                                                taggedProductsMap={taggedProductsMap}
                                                currentUserId={user.$id}
                                            />
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
