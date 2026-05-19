"use client";

import React, { useState, useEffect } from 'react';

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

const HeartIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const StarIcon = ({ color = "#B9001B", fill = "none", size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);


export default function ProductDetailScreen() {
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Responsive layout tracking
    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const mobile = mounted ? isMobile : false;

    // Mock Review Data
    const reviews = [
        { id: 1, name: "Marcus Johnson", rating: 5, date: "1 day ago", comment: "Absolutely incredible sound quality. The noise cancellation completely blocks out my noisy office. Highly recommend this seller!", avatarBg: "#0284C7" },
        { id: 2, name: "Sarah Lin", rating: 4, date: "3 days ago", comment: "Very comfortable for long sessions. Arrived exactly as described in pristine condition. Docked one star just because shipping took an extra day.", avatarBg: "#10B981" }
    ];

    return (
        <div style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

            {/* ================= HEADER ================= */}
            <header
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem 2rem',
                    backgroundColor: '#FFFFFF',
                    borderBottom: '1px solid #EDEDED',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50
                }}
            >
                <button style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <BackIcon />
                </button>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <ShareIcon />
                    </button>
                    <button style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <HeartIcon />
                    </button>
                </div>
            </header>

            {/* ================= MAIN CONTENT ================= */}
            <main
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: mobile ? '1.5rem' : '2.5rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3rem'
                }}
            >
                {/* TOP SECTION: Media & Details */}
                <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: '3rem', alignItems: 'flex-start' }}>

                    {/* LEFT COLUMN: Media Gallery */}
                    <div style={{ flex: 1.2, width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Main Image Placeholder (Gradient mimicking headphones lighting) */}
                        <div style={{ width: '100%', aspectRatio: '16/10', borderRadius: '16px', background: 'linear-gradient(135deg, #2A2D34 0%, #1A1A1A 50%, #5A2A2A 100%)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* Abstract shapes to mimic the headphone silhouette */}
                            <div style={{ width: '200px', height: '220px', border: '30px solid #333', borderRadius: '100px 100px 20px 20px', borderBottom: 'none', position: 'absolute', top: '10%' }}></div>
                            <div style={{ width: '60px', height: '90px', backgroundColor: '#222', borderRadius: '30px', position: 'absolute', left: '28%', bottom: '20%', transform: 'rotate(15deg)', boxShadow: 'inset -5px 0 15px rgba(255,100,100,0.2)' }}></div>
                            <div style={{ width: '70px', height: '100px', backgroundColor: '#222', borderRadius: '35px', position: 'absolute', right: '28%', bottom: '15%', transform: 'rotate(-10deg)', boxShadow: 'inset 5px 0 20px rgba(255,100,100,0.3)' }}></div>
                        </div>

                        {/* Thumbnail Row */}
                        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '8px', border: '2px solid #B9001B', background: 'linear-gradient(135deg, #5A6A6A, #2A2A2A)', flexShrink: 0 }}></div>
                            <div style={{ width: '80px', height: '80px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'linear-gradient(135deg, #7A7A7A, #4A4A4A)', flexShrink: 0 }}></div>
                            <div style={{ width: '80px', height: '80px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'linear-gradient(135deg, #8A8A8A, #5A5A5A)', flexShrink: 0 }}></div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Product Info & Actions */}
                    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ backgroundColor: '#FFF0F2', color: '#B9001B', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px' }}>
                                Premium Condition
                            </span>
                            <span style={{ color: '#666', fontSize: '12.5px' }}>Posted 2 hours ago</span>
                        </div>

                        {/* Title */}
                        <h1 style={{ fontSize: mobile ? '28px' : '32px', fontWeight: '800', color: '#111', margin: 0, lineHeight: '1.2', letterSpacing: '-0.5px' }}>
                            Acoustic Noise Cancelling Headphones – Onyx Black
                        </h1>

                        {/* Description */}
                        <p style={{ fontSize: '15px', color: '#444', lineHeight: '1.6', margin: 0 }}>
                            Experience world-class silence and high-fidelity audio. These headphones feature advanced active noise cancellation, plush ear cushions for all-day comfort, and up to 24 hours of battery life. Perfect for travel or focused work sessions. Comes with original carrying case and cables.
                        </p>

                        {/* Action Box */}
                        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', border: '1px solid #F3F4F6', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginTop: '0.5rem' }}>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111', margin: '0 0 1rem 0' }}>Interested in this item?</p>
                            <button style={{ width: '100%', backgroundColor: '#B9001B', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0.85rem', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                                <MessageIcon />
                                Message Vendor
                            </button>
                        </div>

                        {/* Vendor Profile Box */}
                        <div style={{ backgroundColor: '#F3F4F6', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {/* Vendor Avatar */}
                                <div style={{ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#D2D6DC', overflow: 'hidden' }}>
                                    <svg width="46" height="46" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" fill="#E8ECEF" /><circle cx="16" cy="13" r="6" fill="#B0BEC5" /><path d="M4 28C4 22.4772 8.47715 18 14 18H18C23.5228 18 28 22.4772 28 28V32H4V28Z" fill="#B0BEC5" /></svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '14.5px', fontWeight: '600', color: '#111', margin: '0 0 2px 0' }}>Studio Audio Gear</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#666' }}>
                                        <StarIcon size={12} fill="#B9001B" />
                                        <span style={{ fontWeight: '500', color: '#111' }}>4.9</span> (128 reviews)
                                    </div>
                                </div>
                            </div>
                            <button style={{ backgroundColor: '#E5E7EB', color: '#333', border: 'none', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                                Follow
                            </button>
                        </div>

                    </div>
                </div>

                {/* ================= BOTTOM SECTION: REVIEWS ================= */}
                {/* Added to fill the blank space below as requested */}
                <div style={{ width: '100%', borderTop: '1px solid #EDEDED', paddingTop: '3rem' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111', margin: 0, letterSpacing: '-0.3px' }}>
                            Reviews
                        </h2>
                        <a href="#" style={{ color: '#B9001B', fontSize: '14.5px', fontWeight: '600', textDecoration: 'none' }}>
                            Leave a review
                        </a>
                    </div>

                    {/* Reviews Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(2, 1fr)', gap: '2rem' }}>

                        {reviews.map((review) => (
                            <div key={review.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', border: '1px solid #EDEDED', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {/* Reviewer Avatar */}
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: review.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: '600', fontSize: '14px' }}>
                                            {review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#111', margin: '0 0 2px 0' }}>{review.name}</h4>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <StarIcon key={i} size={12} fill={i < review.rating ? "#B9001B" : "none"} color={i < review.rating ? "#B9001B" : "#CCC"} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '12.5px', color: '#888' }}>{review.date}</span>
                                </div>
                                <p style={{ fontSize: '14.5px', color: '#444', lineHeight: '1.5', margin: 0 }}>
                                    "{review.comment}"
                                </p>
                            </div>
                        ))}

                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
                        <button style={{ backgroundColor: '#FFFFFF', border: '1px solid #CCC', color: '#333', borderRadius: '25px', padding: '0.75rem 2.2rem', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                            View all 128 reviews
                        </button>
                    </div>

                </div>

            </main>
        </div>
    );
}