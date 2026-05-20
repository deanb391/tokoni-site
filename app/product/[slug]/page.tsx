// app/product/[slug]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { getProductById, toggleLikeProduct } from '@/lib/api/products';
import { useChat } from '@/context/ChatContext';
import { getVendorById } from '@/lib/api/vendors';
import { fetchReviews, createReview, calculateProductAverageRating } from '@/lib/api/reviews';
import EditProductModal from '@/components/EditProductModal';
import ReviewModal from '@/components/ReviewModal';

// --- Inline SVG Icons ---
const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const ShareIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
        <polyline points="16 6 12 2 8 6"></polyline>
        <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>
);

const HeartIcon = ({ fill = "none", color = "#111" }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

const MessageIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        <line x1="9" y1="10" x2="15" y2="10"></line>
        <line x1="9" y1="14" x2="15" y2="14"></line>
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const StarIcon = ({ color = "#B9001B", fill = "none", size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

// Fallback high-fidelity mock data
const MOCK_PRODUCTS: Record<string, any> = {
    "1": {
        $id: "1",
        name: "Aero Glide Performance Sneakers",
        price: 189000,
        discountPrice: 165000,
        condition: "New",
        description: "Lightweight performance running sneakers featuring a responsive HSL-cushioned midsole and breathable double-layered mesh upper. Perfect for high-speed track workouts, morning runs, or ultimate everyday comfort. Features high-traction vulcanized rubber pods.",
        category: "Fashion",
        stock: 12,
        tags: ["Running", "Sneakers", "Athletic", "Activewear"],
        images: [],
        available: true,
        vendor: "mock-vendor-1",
        likes: 15,
        likedBy: []
    },
    "2": {
        $id: "2",
        name: "Luxe Leather Weekender Bag",
        price: 345000,
        discountPrice: null,
        condition: "New",
        description: "Handcrafted, full-grain vegetable-tanned leather duffel bag designed for the modern weekend traveler. Features premium solid brass hardware, a spacious canvas-lined interior compartment, an adjustable shoulder strap, and dual reinforced leather top handles. Built to last a lifetime.",
        category: "Fashion",
        stock: 5,
        tags: ["Travel", "Leather", "Bag", "Duffel"],
        images: [],
        available: true,
        vendor: "mock-vendor-2",
        likes: 24,
        likedBy: []
    },
    "3": {
        $id: "3",
        name: "Minimalist Matte Stoneware Vase",
        price: 85000,
        discountPrice: 75000,
        condition: "New",
        description: "Artisanal hand-thrown stoneware ceramic vase finished in a smooth matte charcoal glaze. Features a textured base with clean, modern curves designed to highlight beautiful floral stems or serve as a standalone sculptural center-piece for your dining table or console.",
        category: "Home Decor",
        stock: 8,
        tags: ["Ceramic", "Vase", "Decor", "Handcrafted"],
        images: [],
        available: true,
        vendor: "mock-vendor-3",
        likes: 9,
        likedBy: []
    },
    "4": {
        $id: "4",
        name: "Lumina Smart Dynamic Ambient Lamp",
        price: 120000,
        discountPrice: 110000,
        condition: "New",
        description: "App-controlled intelligent ambient lighting bar featuring seamless multi-color LED dynamic synchronization, customizable sleep timer schedules, and robust home assistant integrations. Projects a beautiful wash of customizable color options across your workspace or living room walls.",
        category: "Electronics",
        stock: 15,
        tags: ["Lighting", "Smart Home", "Desk Accessory", "Gadget"],
        images: [],
        available: true,
        vendor: "mock-vendor-4",
        likes: 42,
        likedBy: []
    }
};

export default function ProductDetailScreen() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug ? String(params.slug) : "";

    const { user, setUser, vendor, loading: userLoading } = useUser();
    const { startChatWithUser } = useChat();

    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Dynamic Product State
    const [product, setProduct] = useState<any | null>(null);
    const [vendorInfo, setVendorInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [messagingLoading, setMessagingLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleContactVendor = async () => {
        if (!user?.$id) {
            alert("Please log in to message this vendor.");
            router.push('/signin');
            return;
        }

        const targetUserId = vendorInfo?.users;
        if (!targetUserId) {
            alert("Unable to find vendor account details.");
            return;
        }

        if (targetUserId === user.$id) {
            alert("You cannot start a chat with yourself.");
            return;
        }

        setMessagingLoading(true);
        try {
            const chatId = await startChatWithUser(targetUserId);
            router.push(`/chats/${chatId}`);
        } catch (err) {
            console.error("Failed to start chat with vendor:", err);
            alert("Failed to start chat session. Please try again.");
        } finally {
            setMessagingLoading(false);
        }
    };

    // Likes & Reviews states
    const [reviewsList, setReviewsList] = useState<any[]>([]);
    const [avgVal, setAvgVal] = useState<number>(0);
    const [reviewsCount, setReviewsCount] = useState<number>(0);
    const [likedPulse, setLikedPulse] = useState(false);

    // Modal Control States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isSavingReview, setIsSavingReview] = useState(false);

    // Responsive layout tracking
    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load Product Data and Reviews
    useEffect(() => {
        if (!slug) return;

        const loadProductAndReviews = async () => {
            setLoading(true);
            try {
                // If it matches a mock ID
                if (MOCK_PRODUCTS[slug]) {
                    setProduct(MOCK_PRODUCTS[slug]);
                    setVendorInfo({
                        $id: MOCK_PRODUCTS[slug].vendor,
                        businessName: "Studio Audio Gear",
                        logoImage: "",
                        users: "mock-user-id"
                    });
                    // Load high fidelity mock reviews
                    setReviewsList([
                        { $id: "mock-1", user: { name: "Marcus Johnson" }, rating: 5, review: "Absolutely incredible craftsmanship. The quality completely exceeded my expectations. Highly recommend this vendor!", $createdAt: new Date(Date.now() - 86400000).toISOString() },
                        { $id: "mock-2", user: { name: "Sarah Lin" }, rating: 4, review: "Very comfortable and premium design. Arrived exactly as described in pristine condition. Docked one star just because shipping took an extra day.", $createdAt: new Date(Date.now() - 3 * 86400000).toISOString() }
                    ]);
                    setAvgVal(4.5);
                    setReviewsCount(2);
                } else {
                    const fetched = await getProductById(slug);
                    if (!fetched) {
                        throw new Error("Product not found");
                    }
                    setProduct(fetched);

                    // Fetch vendor details
                    if (fetched.vendor && !fetched.vendor.startsWith("mock-vendor-")) {
                        try {
                            const vInfo = await getVendorById(fetched.vendor);
                            setVendorInfo(vInfo);
                        } catch (vErr) {
                            console.error("Failed to load vendor details:", vErr);
                        }
                    }

                    // Fetch reviews
                    try {
                        const reviewsRes = await fetchReviews(slug);
                        setReviewsList(reviewsRes.reviews);

                        const averageRes = await calculateProductAverageRating(slug);
                        setAvgVal(averageRes.avgRating);
                        setReviewsCount(averageRes.totalReviews);
                    } catch (reviewErr) {
                        console.error("Error loading reviews for this database product:", reviewErr);
                    }
                }
            } catch (err) {
                console.error("Failed to load product by ID, falling back to mock details:", err);
                setProduct({
                    ...MOCK_PRODUCTS["3"],
                    $id: slug,
                    name: "Curated Artisanal Product"
                });
                setReviewsList([
                    { $id: "mock-fallback", user: { name: "John Doe" }, rating: 5, review: "Absolutely spectacular product, looks even better in real life!", $createdAt: new Date().toISOString() }
                ]);
                setAvgVal(5.0);
                setReviewsCount(1);
            } finally {
                setLoading(false);
            }
        };

        loadProductAndReviews();
    }, [slug]);

    const mobile = mounted ? isMobile : false;
    const isOwner = vendor?.$id && product && product.vendor === vendor.$id;
    const isLiked = user?.$id && product?.likedBy && Array.isArray(product.likedBy) ? product.likedBy.includes(user.$id) : false;

    // Liking/Unliking seamless interaction handler
    const handleLikeToggle = async () => {
        if (!user?.$id) {
            alert("Please log in to like this product.");
            return;
        }

        // Trigger scale pulse visual animation
        setLikedPulse(true);
        setTimeout(() => setLikedPulse(false), 400);

        // Optimistic State Update
        const wasLiked = product.likedBy?.includes(user.$id);
        let newLikedBy = [...(product.likedBy || [])];
        if (wasLiked) {
            newLikedBy = newLikedBy.filter(id => id !== user.$id);
        } else {
            newLikedBy.push(user.$id);
        }

        const optimisticProduct = {
            ...product,
            likes: newLikedBy.length,
            likedBy: newLikedBy
        };
        setProduct(optimisticProduct);

        try {
            const dbProductSlug = product.$id || slug;
            const res = await toggleLikeProduct(dbProductSlug, user.$id);
            setProduct((prev: any) => ({
                ...prev,
                likes: res.likes,
                likedBy: res.likedBy
            }));
            if (res.user && setUser) {
                setUser(res.user);
            }
        } catch (err) {
            console.error("Failed to update liked action in Appwrite, reverting...", err);
            // Revert state
            setProduct(product);
        }
    };

    // Review submission handler
    const handleReviewSubmit = async (payload: { rating: number; review: string }) => {
        if (!user?.$id) {
            alert("Please log in to leave a review.");
            return;
        }

        setIsSavingReview(true);
        try {
            const dbProductSlug = product.$id || slug;
            const newReview = await createReview({
                product: dbProductSlug,
                users: user.$id,
                rating: payload.rating,
                review: payload.review
            });

            // Hydrate the locally displayed review card with the logged-in user profile
            const hydratedReview = {
                ...newReview,
                user: {
                    $id: user.$id,
                    name: user.username || "Anonymous User",
                    email: user.email
                }
            };

            setReviewsList((prev: any[]) => [hydratedReview, ...prev]);
            setIsReviewModalOpen(false);

            // Dynamically recalculate aggregated rating UI locally immediately
            setReviewsCount((prev: number) => prev + 1);
            setAvgVal((prev: number) => {
                const total = reviewsCount + 1;
                const newAvg = ((avgVal * reviewsCount) + payload.rating) / total;
                return parseFloat(newAvg.toFixed(1));
            });

        } catch (err) {
            console.error("Error creating review:", err);
            alert("Failed to submit your review. Please try again.");
        } finally {
            setIsSavingReview(false);
        }
    };

    if (loading || !product) {
        return (
            <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: 'var(--font-body), sans-serif' }}>
                {/* Skeleton Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: mobile ? '0.75rem 1rem' : '1.25rem 2rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid #EDEDED' }}>
                    <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
                        <div className="skeleton" style={{ width: '80px', height: '40px', borderRadius: '24px' }}></div>
                    </div>
                </header>

                {/* Skeleton Body Content */}
                <main style={{ maxWidth: '1200px', margin: '0 auto', padding: mobile ? '1.5rem 1rem' : '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '3rem', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? '1.5rem' : '3rem', alignItems: 'flex-start' }}>
                        {/* Left: Image Showcase Skeleton */}
                        <div style={{ flex: 1.2, width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="skeleton" style={{ width: '100%', aspectRatio: '16/10', borderRadius: '16px' }}></div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div className="skeleton" style={{ width: '72px', height: '72px', borderRadius: '8px' }}></div>
                                <div className="skeleton" style={{ width: '72px', height: '72px', borderRadius: '8px' }}></div>
                                <div className="skeleton" style={{ width: '72px', height: '72px', borderRadius: '8px' }}></div>
                            </div>
                        </div>

                        {/* Right: Details Skeleton */}
                        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div className="skeleton" style={{ width: '120px', height: '20px', borderRadius: '10px' }}></div>
                            <div className="skeleton" style={{ width: '85%', height: '35px', borderRadius: '6px' }}></div>
                            <div className="skeleton" style={{ width: '150px', height: '25px', borderRadius: '6px' }}></div>
                            <div className="skeleton" style={{ width: '100%', height: '80px', borderRadius: '8px' }}></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div className="skeleton" style={{ height: '55px', borderRadius: '10px' }}></div>
                                <div className="skeleton" style={{ height: '55px', borderRadius: '10px' }}></div>
                            </div>
                            <div className="skeleton" style={{ height: '80px', borderRadius: '16px', marginTop: '0.5rem' }}></div>
                            <div className="skeleton" style={{ height: '60px', borderRadius: '16px' }}></div>
                        </div>
                    </div>
                </main>
                
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
        );
    }

    // Dynamic Price displays
    const displayPrice = product.discountPrice || product.price;
    const originalPrice = product.discountPrice ? product.price : null;

    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: 'var(--font-body), sans-serif' }}>

            {/* ================= HEADER ================= */}
            <header
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: mobile ? '0.75rem 1rem' : '1.25rem 2rem',
                    backgroundColor: '#FFFFFF',
                    borderBottom: '1px solid #EDEDED',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50
                }}
            >
                <button
                    onClick={() => router.back()}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    <BackIcon />
                </button>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <button style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <ShareIcon />
                    </button>
                    {/* Seamless Realtime Like button component container */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F3F4F6', padding: '0 12px 0 6px', borderRadius: '24px', height: '40px' }}>
                        <button
                            onClick={handleLikeToggle}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: 'transparent',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 0,
                                animation: likedPulse ? 'heartPulse 0.4s ease-out' : 'none'
                            }}
                        >
                            <HeartIcon fill={isLiked ? "#B9001B" : "none"} color={isLiked ? "#B9001B" : "#111111"} />
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#111111', minWidth: '10px' }}>
                            {product.likes || 0}
                        </span>
                    </div>
                </div>
            </header>

            {/* ================= MAIN CONTENT ================= */}
            <main
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: mobile ? '1.5rem 1rem' : '2.5rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3rem',
                    boxSizing: 'border-box'
                }}
            >
                {/* TOP SECTION: Media & Details */}
                <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? '1.5rem' : '3rem', alignItems: 'flex-start' }}>

                    {/* LEFT COLUMN: Media Gallery */}
                    <div style={{ flex: 1.2, width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Main Image Showcase */}
                        <div style={{
                            width: '100%',
                            aspectRatio: '16/10',
                            borderRadius: '16px',
                            backgroundColor: '#F3F4F6',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[activeImageIndex]}
                                    alt={product.name}
                                    onClick={() => setIsExpanded(true)}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
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
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    position: 'relative'
                                }}>
                                    <div style={{ width: '150px', height: '150px', border: '15px solid rgba(255,255,255,0.1)', borderRadius: '50%', position: 'absolute', top: '10%', left: '10%' }} />
                                    <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', transform: 'rotate(25deg)', position: 'absolute', bottom: '15%', right: '15%' }} />
                                    <span style={{ position: 'relative', zIndex: 2, opacity: 0.85 }}>{product.category} Item</span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Row */}
                        {product.images && product.images.length > 1 && (
                            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '4px' }}>
                                {product.images.map((img: string, idx: number) => (
                                    <div
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        style={{
                                            width: '72px',
                                            height: '72px',
                                            borderRadius: '8px',
                                            border: idx === activeImageIndex ? '2px solid #B9001B' : '1px solid #E5E7EB',
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            cursor: 'pointer',
                                            transition: 'border-color 0.2s'
                                        }}
                                    >
                                        <img src={img} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Product Info & Actions */}
                    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                        {/* Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ backgroundColor: '#FFF0F2', color: '#B9001B', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {product.condition} Condition
                            </span>
                            {product.stock <= 3 && product.stock > 0 && (
                                <span style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Only {product.stock} Left!
                                </span>
                            )}
                            {product.stock === 0 && (
                                <span style={{ backgroundColor: '#F3F4F6', color: '#1F2937', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Out Of Stock
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 style={{ fontSize: mobile ? '24px' : '30px', fontWeight: '800', color: '#111', margin: 0, lineHeight: '1.25', letterSpacing: '-0.4px' }}>
                            {product.name}
                        </h1>

                        {/* Pricing */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '26px', fontWeight: '800', color: '#B9001B' }}>
                                ₦{displayPrice.toLocaleString()}
                            </span>
                            {originalPrice && (
                                <span style={{ fontSize: '16px', textDecoration: 'line-through', color: '#888', fontWeight: '500' }}>
                                    ₦{originalPrice.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <p style={{ fontSize: '14.5px', color: '#444', lineHeight: '1.6', margin: 0 }}>
                            {product.description}
                        </p>

                        {/* Additional Info Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #EDEDED' }}>
                                <span style={{ fontSize: '11px', color: '#777', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '2px' }}>Category</span>
                                <span style={{ fontSize: '13.5px', color: '#111', fontWeight: '700' }}>{product.category}</span>
                            </div>
                            <div style={{ backgroundColor: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #EDEDED' }}>
                                <span style={{ fontSize: '11px', color: '#777', textTransform: 'uppercase', fontWeight: '600', display: 'block', marginBottom: '2px' }}>Tags</span>
                                <span style={{ fontSize: '13.5px', color: '#111', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                    {product.tags && product.tags.length > 0 ? product.tags.join(', ') : 'None'}
                                </span>
                            </div>
                        </div>

                        {/* Action Box */}
                        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '1.25rem', border: '1px solid #EDEDED', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', marginTop: '0.5rem' }}>
                            {isOwner ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563', margin: '0 0 4px 0', textAlign: 'center' }}>You own this product listing</p>
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        style={{ width: '100%', backgroundColor: '#B9001B', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0.8rem', fontSize: '14.5px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                    >
                                        <EditIcon />
                                        Edit Product Details
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <p style={{ fontSize: '13.5px', fontWeight: '600', color: '#111', margin: '0 0 8px 0' }}>Interested in this item?</p>
                                    <button
                                        onClick={handleContactVendor}
                                        disabled={messagingLoading}
                                        style={{ width: '100%', backgroundColor: '#B9001B', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0.8rem', fontSize: '14.5px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'background-color 0.2s', opacity: messagingLoading ? 0.7 : 1 }}
                                    >
                                        {messagingLoading ? (
                                            <div style={{ width: '20px', height: '20px', border: '2px solid #FFF', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                        ) : (
                                            <>
                                                <MessageIcon />
                                                Message Vendor
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Vendor Profile Box */}
                        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #EDEDED' }}>
                            <div 
                                onClick={() => vendorInfo?.users && router.push(`/profile/${vendorInfo.users}`)}
                                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                            >
                                {/* Vendor Avatar */}
                                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#D2D6DC', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5E7EB' }}>
                                    {vendorInfo?.logoImage ? (
                                        <img src={vendorInfo.logoImage} alt={vendorInfo.businessName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <svg width="42" height="42" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" fill="#E8ECEF" /><circle cx="16" cy="13" r="6" fill="#B0BEC5" /><path d="M4 28C4 22.4772 8.47715 18 14 18H18C23.5228 18 28 22.4772 28 28V32H4V28Z" fill="#B0BEC5" /></svg>
                                    )}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '13.5px', fontWeight: '700', color: '#111', margin: '0 0 2px 0' }}>
                                        {vendorInfo ? vendorInfo.businessName : "Loading Vendor..."}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#666' }}>
                                        <StarIcon size={11} fill="#B9001B" />
                                        <span style={{ fontWeight: '500', color: '#111' }}>{avgVal > 0 ? avgVal : "0.0"}</span> ({reviewsCount} reviews)
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => vendorInfo?.users && router.push(`/profile/${vendorInfo.users}`)}
                                style={{ backgroundColor: '#F3F4F6', color: '#333', border: 'none', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
                            >
                                View Profile
                            </button>
                        </div>

                    </div>
                </div>

                {/* ================= BOTTOM SECTION: REVIEWS ================= */}
                <div style={{ width: '100%', borderTop: '1px solid #EDEDED', paddingTop: '2.5rem' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: 0, letterSpacing: '-0.3px' }}>
                            Reviews ({reviewsCount})
                        </h2>
                        {user && (
                            <button
                                onClick={() => setIsReviewModalOpen(true)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#B9001B',
                                    fontSize: '13.5px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    padding: 0
                                }}
                            >
                                Write a review
                            </button>
                        )}
                    </div>

                    {/* Reviews Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem' }}>

                        {reviewsList.length === 0 ? (
                            <p style={{ color: '#777', fontSize: '14px', gridColumn: '1 / -1', textAlign: 'center', margin: '2rem 0', fontWeight: '500' }}>
                                No reviews yet. Be the first to leave one!
                            </p>
                        ) : (
                            reviewsList.map((review) => {
                                const reviewerName = review.user?.name || "Anonymous Shopper";
                                const displayDate = review.$createdAt ? new Date(review.$createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Just now";

                                return (
                                    <div key={review.$id} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '1.25rem', border: '1px solid #EDEDED' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {/* Reviewer Avatar */}
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#B9001B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: '600', fontSize: '13px' }}>
                                                    {reviewerName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111', margin: '0 0 2px 0' }}>{reviewerName}</h4>
                                                    <div style={{ display: 'flex', gap: '2px' }}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <StarIcon key={i} size={11} fill={i < review.rating ? "#B9001B" : "none"} color={i < review.rating ? "#B9001B" : "#CCC"} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#888' }}>{displayDate}</span>
                                        </div>
                                        <p style={{ fontSize: '13.5px', color: '#444', lineHeight: '1.5', margin: 0 }}>
                                            "{review.review}"
                                        </p>
                                    </div>
                                );
                            })
                        )}

                    </div>
                </div>

            </main>

            {/* Reusable Edit Modal */}
            <EditProductModal
                product={product}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={(updatedProduct) => {
                    setProduct(updatedProduct);
                }}
                onDeleteSuccess={() => {
                    router.push('/dashboard');
                }}
            />

            {/* Premium Star Review Modal */}
            <ReviewModal
                isOpen={isReviewModalOpen}
                isSaving={isSavingReview}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleReviewSubmit}
            />

            {/* Expanded Image Overlay */}
            {isExpanded && product.images && product.images.length > 0 && (
                <div
                    onClick={() => setIsExpanded(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        cursor: 'zoom-out',
                    }}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(255,255,255,0.15)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFF',
                            fontSize: '24px',
                            cursor: 'pointer',
                            zIndex: 1010,
                        }}
                    >
                        ✕
                    </button>
                    <img
                        src={product.images[activeImageIndex]}
                        alt={product.name}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '90%',
                            maxHeight: '85%',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        }}
                    />
                </div>
            )}

            <style jsx global>{`
                @keyframes heartPulse {
                    0% { transform: scale(1); }
                    35% { transform: scale(1.35); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
}