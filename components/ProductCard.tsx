"use client";

import React, { useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';

import { useUser } from '@/context/UserContext';
import { useChat } from '@/context/ChatContext';
import { getVendorById } from '@/lib/api/vendors';
import { toggleLikeProduct } from '@/lib/api/products';
import { Product } from '@/lib/services/products.service';
import { Heart, MapPin, MessageCircle, ShoppingBag, Star } from 'lucide-react';
import { addToCart, CartItem } from '@/lib/utils/cart';

interface ProductCardProps {
    product: Product;
    hideCart?: boolean;
}

const BRAND_RED = "#B9001B";

export default function ProductCard({ product: initialProduct, hideCart = false }: ProductCardProps) {
    const router = useRouter();
    const { user, setUser } = useUser();
    const [product, setProduct] = useState<Product>(initialProduct);
    const [isLiking, setIsLiking] = useState(false);

    const isLiked = user?.$id ? product.likedBy?.includes(user.$id) : false;


    const handleLikeClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user?.$id) {
            alert("Please sign in to like products.");
            return;
        }
        if (isLiking) return;

        setIsLiking(true);

        // Optimistic UI updates
        const previouslyLiked = isLiked;
        const newLikedBy = previouslyLiked
            ? (product.likedBy || []).filter(id => id !== user.$id)
            : [...(product.likedBy || []), user.$id];

        setProduct(prev => ({
            ...prev,
            likes: newLikedBy.length,
            likedBy: newLikedBy
        }));

        try {
            const res = await toggleLikeProduct(product.$id, user.$id);
            setProduct(prev => ({
                ...prev,
                likes: res.likes,
                likedBy: res.likedBy
            }));
            if (res.user && setUser) {
                setUser(res.user);
            }
        } catch (err) {
            console.error("Failed to toggle product like:", err);
            // Revert state on error
            setProduct(prev => ({
                ...prev,
                likes: previouslyLiked ? (prev.likes + 1) : Math.max(0, prev.likes - 1),
                likedBy: previouslyLiked ? [...prev.likedBy, user.$id] : prev.likedBy.filter(id => id !== user.$id)
            }));
        } finally {
            setIsLiking(false);
        }
    };

    const { startChatWithUser } = useChat();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!product.vendor) return;
        const currentPrice = product.discountPrice || product.price;
        const item: CartItem = {
            productId: product.$id,
            name: product.name,
            price: currentPrice,
            image: product.images?.[0] || ""
        };
        addToCart(product.vendor, item);
        alert("Added to cart!");
        window.dispatchEvent(new Event("tokoni_cart_updated"));
    };

    const handleContactClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user?.$id) {
            alert("Please log in to contact this vendor.");
            router.push('/signin');
            return;
        }
        try {
            let targetUserId = "";
            if (product.vendor.startsWith("mock-vendor-")) {
                targetUserId = "mock-user-id";
            } else {
                const vendorData = await getVendorById(product.vendor);
                targetUserId = vendorData.users;
            }

            if (targetUserId === user.$id) {
                alert("You cannot start a chat with yourself.");
                return;
            }

            const chatId = await startChatWithUser(targetUserId);
            router.push(`/chats/${chatId}?autoSendProductId=${product.$id}`);
        } catch (err) {
            console.error("Failed to start chat with vendor:", err);
            alert("Failed to start chat session. Please try again.");
        }
    };

    return (
        <div
            onClick={() => router.push(`/product/${product.$id}`)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                backgroundColor: '#ffffff',
                border: '1px solid #f3f4f6',
                borderRadius: '1.25rem',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease',
                cursor: 'pointer',
                height: '100%'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.05)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.02)';
            }}
        >
            {/* Image Wrapper */}
            <div
                style={{
                    backgroundColor: '#F3F4F6',
                    height: '220px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid #f3f4f6',
                    overflow: 'hidden'
                }}
            >
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                        className="product-card-image"
                    />
                ) : (
                    /* Beautiful Premium Gradient Fallback Cover */
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #2A2D34 0%, #1A1A1A 50%, #B9001B 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        position: 'relative'
                    }}>
                        <div style={{ width: '80px', height: '80px', border: '8px solid rgba(255,255,255,0.05)', borderRadius: '50%', position: 'absolute', top: '10%', left: '10%' }} />
                        <span style={{ position: 'relative', zIndex: 2, opacity: 0.8 }}>{product.category || 'Premium Item'}</span>
                    </div>
                )}

                {/* Priority Status Badge */}
                {(() => {
                    const isSponsored = product.isSponsored === true || (product as any).sponsored === true;
                    const isNew = (Date.now() - new Date(product.$createdAt).getTime()) < 24 * 60 * 60 * 1000;
                    if (isSponsored) {
                        return (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '12px',
                                    backgroundColor: BRAND_RED,
                                    color: '#FFFFFF',
                                    fontSize: '9px',
                                    fontWeight: '800',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    boxShadow: '0 4px 10px rgba(185, 0, 27, 0.3)',
                                    zIndex: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <Star className="w-2.5 h-2.5 fill-white text-white" />
                                Sponsored
                            </span>
                        );
                    }
                    if (isNew) {
                        return (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    left: '12px',
                                    backgroundColor: '#10B981',
                                    color: '#FFFFFF',
                                    fontSize: '9px',
                                    fontWeight: '800',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
                                    zIndex: 10
                                }}
                            >
                                New
                            </span>
                        );
                    }
                    return null;
                })()}

                {/* Like Button */}
                <button
                    onClick={handleLikeClick}
                    disabled={isLiking}
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: '#ffffff',
                        border: 'none',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
                        zIndex: 10,
                        transition: 'transform 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Heart
                        className="w-4.5 h-4.5"
                        fill={isLiked ? BRAND_RED : "none"}
                        color={isLiked ? BRAND_RED : '#6b7280'}
                        strokeWidth={2}
                    />
                </button>

                {/* Conditional Condition Tag */}
                <span
                    style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#111827',
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '20px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                >
                    {product.condition || 'New'}
                </span>
            </div>

            {/* Card Content Wrapper */}
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>

                {/* Category & Title */}
                <span style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px', fontWeight: '500' }}>
                    {product.category}
                </span>

                <h3 style={{
                    fontSize: '14.5px',
                    fontWeight: '700',
                    margin: '0 0 6px 0',
                    color: '#111827',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {product.name}
                </h3>

                {/* Price Label */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: BRAND_RED }}>
                        ₦{(product.discountPrice || product.price).toLocaleString()}
                    </span>
                    {product.discountPrice && (
                        <span style={{ fontSize: '11px', textDecoration: 'line-through', color: '#9ca3af', fontWeight: '600' }}>
                            ₦{product.price.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Description Truncation */}
                <p style={{
                    fontSize: '12.5px',
                    color: '#6b7280',
                    lineHeight: '1.4',
                    margin: '0 0 1rem 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '35px'
                }}>
                    {product.description}
                </p>

                {/* Footer: Location & Contact Vendor Button */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginTop: 'auto',
                    paddingTop: '10px',
                    borderTop: '1px solid #f3f4f6'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9ca3af', flexShrink: 0 }}>
                        <MapPin className="w-3.5 h-3.5" />
                        <span style={{ fontSize: '11px', fontWeight: '600' }}>Nigeria</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {!hideCart && (
                            <button
                                onClick={handleAddToCart}
                                title="Add to Cart"
                                style={{
                                    backgroundColor: '#B9001B',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '20px',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease, transform 0.15s',
                                    flexShrink: 0
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#9e0014';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = '#B9001B';
                                    e.currentTarget.style.transform = 'none';
                                }}
                            >
                                <ShoppingBag style={{ width: "14px", height: "14px" }} />
                            </button>
                        )}

                        <button
                            onClick={handleContactClick}
                            style={{
                                backgroundColor: '#111827',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '0.45rem 0.9rem',
                                fontSize: '11px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease',
                                flexShrink: 0
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#111827'}
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>
                                Contact<span className="hidden lg:inline"> Vendor</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
