"use client";

import React, { useState, useEffect } from 'react';

// --- Inline SVGs ---
const HeartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

const CommentIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const ShareIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);

const BookmarkIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
);

const MoreIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="19" cy="12" r="1"></circle>
        <circle cx="5" cy="12" r="1"></circle>
    </svg>
);

const ShoppingBagIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
);


export default function FeedScreen() {
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const mobile = mounted ? isMobile : false;

    // Mock Feed Data
    const posts = [
        {
            id: 1,
            username: 'elevate_style',
            time: '2 hours ago',
            avatarBg: '#E0F2FE',
            imageBg: '#2A3036', // Dark building background
            priceOverlay: '₦249',
            likes: '1,204',
            caption: 'The new essential trench. Uncompromising structure meets fluid movement. Available now in the shop. #minimalist #fashion #tokoni',
            // Inline placeholder representing the red coat model
            visualPlaceholder: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
                    <div style={{ width: '30px', height: '35px', backgroundColor: '#FDE047', borderRadius: '50%', marginBottom: '5px' }}></div>
                    <div style={{ width: '80px', height: '240px', backgroundColor: '#D11A2A', borderRadius: '20px 20px 5px 5px', position: 'relative' }}>
                        <div style={{ position: 'absolute', bottom: '-40px', left: '10px', width: '15px', height: '50px', backgroundColor: '#111', transform: 'rotate(15deg)' }}></div>
                        <div style={{ position: 'absolute', bottom: '-40px', right: '10px', width: '15px', height: '50px', backgroundColor: '#111', transform: 'rotate(-15deg)' }}></div>
                    </div>
                </div>
            )
        },
        {
            id: 2,
            username: 'minimal_living',
            time: '5 hours ago',
            avatarBg: '#E2E8F0',
            imageBg: '#F3F4F6', // Light clean room background
            priceOverlay: null,
            likes: '856',
            caption: 'Curating space. Less is always more when every piece has purpose. Link in bio to shop the collection.',
            // Inline placeholder representing the minimalist chair and table
            visualPlaceholder: (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '100%', paddingBottom: '80px', gap: '50px' }}>
                    <div style={{ width: '120px', height: '100px', backgroundColor: '#D1D5DB', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}></div>
                    <div style={{ width: '50px', height: '80px', border: '4px solid #D4AF37', borderTop: 'none', borderBottom: 'none' }}>
                        <div style={{ width: '50px', height: '6px', backgroundColor: '#D4AF37', marginLeft: '-4px' }}></div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <main style={{ padding: mobile ? '1rem 0' : '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                <div style={{ width: '100%', maxWidth: '540px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {posts.map((post) => (
                        <article
                            key={post.id}
                            style={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #EDEDED',
                                borderRadius: mobile ? '0' : '12px',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Post Header */}
                            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: post.avatarBg }}></div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{post.username}</span>
                                        <span style={{ fontSize: '12px', color: '#888' }}>{post.time}</span>
                                    </div>
                                </div>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                    <MoreIcon />
                                </button>
                            </div>

                            {/* Post Image Area */}
                            <div
                                style={{
                                    width: '100%',
                                    height: mobile ? '450px' : '650px',
                                    backgroundColor: post.imageBg,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {post.visualPlaceholder}

                                {/* Price Overlay Tag */}
                                {post.priceOverlay && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: '16px',
                                            right: '16px',
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: '30px',
                                            padding: '6px 6px 6px 14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                        }}
                                    >
                                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>{post.priceOverlay}</span>
                                        <div style={{ backgroundColor: '#B9001B', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <ShoppingBagIcon />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Bar (Icons) */}
                            <div style={{ padding: '12px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><HeartIcon /></button>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><CommentIcon /></button>
                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><ShareIcon /></button>
                                </div>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><BookmarkIcon /></button>
                            </div>

                            {/* Likes & Caption */}
                            <div style={{ padding: '0 16px 16px' }}>
                                <div style={{ fontSize: '13.5px', fontWeight: '600', color: '#111', marginBottom: '6px' }}>
                                    {post.likes} likes
                                </div>
                                <div style={{ fontSize: '14px', color: '#222', lineHeight: '1.4' }}>
                                    <span style={{ fontWeight: '600', marginRight: '6px' }}>{post.username}</span>
                                    {post.caption}
                                </div>
                            </div>

                        </article>
                    ))}

                </div>
        </main>
    );
}