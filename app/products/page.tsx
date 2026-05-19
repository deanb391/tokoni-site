"use client";

import React, { useState, useEffect } from 'react';

export default function ExploreProductsScreen() {
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All Categories');

    // Track window size for responsive inline styles
    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsMobile(window.innerWidth < 800);
        handleResize(); // Check on initial load
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const mobile = mounted ? isMobile : false;

    const categories = ['All Categories', 'Fashion', 'Electronics', 'Home & Garden', 'Beauty', 'Sports'];

    const products = [
        {
            id: 1,
            name: 'Aero Glide P...',
            price: '$189',
            tag: 'New Arrival',
            desc: 'Lightweight performance sneakers with responsive... cushioning and breathable',
            location: 'New York, NY',
            imgBackground: '#EAEAEA',
            element: (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '140px', height: '70px', backgroundColor: '#D11A2A', borderRadius: '40px 80px 30px 40px', transform: 'rotate(-15deg)', boxShadow: '0 15px 25px rgba(185, 0, 27, 0.3)' }}></div>
                    <div style={{ position: 'absolute', width: '130px', height: '65px', backgroundColor: '#B9001B', borderRadius: '40px 80px 30px 40px', transform: 'rotate(-10deg) translate(-10px, -5px)' }}></div>
                </div>
            )
        },
        {
            id: 2,
            name: 'Chrono Seri...',
            price: '$299',
            tag: null,
            desc: 'Advanced fitness tracking with an always-on retina display an... premium ceramic finish',
            location: 'Los Angeles, CA',
            imgBackground: '#E8ECEF',
            element: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '12px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111111', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}>
                        <div style={{ width: '6px', height: '30px', backgroundColor: '#FFFFFF', position: 'absolute', transform: 'rotate(30deg)', transformOrigin: 'bottom center', bottom: '50px' }}></div>
                    </div>
                </div>
            )
        },
        {
            id: 3,
            name: 'Sonic Quiet...',
            price: '$349',
            oldPrice: '$410',
            tag: '15% OFF',
            tagColor: '#B9001B',
            tagBg: '#FFFFFF',
            desc: 'Industry-leading noise cancellation with plush ear... cancellation with plush ear...',
            location: 'Chicago, IL',
            imgBackground: '#F0F2F5',
            element: (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <div style={{ width: '110px', height: '110px', border: '14px solid #222', borderRadius: '50%', borderBottomColor: 'transparent', position: 'relative' }}>
                        <div style={{ width: '35px', height: '55px', backgroundColor: '#222', borderRadius: '12px', position: 'absolute', left: '-20px', bottom: '-10px' }}></div>
                        <div style={{ width: '35px', height: '55px', backgroundColor: '#222', borderRadius: '12px', position: 'absolute', right: '-20px', bottom: '-10px' }}></div>
                    </div>
                </div>
            )
        },
        {
            id: 4,
            name: 'Retro Snap 90',
            price: '$120',
            tag: null,
            desc: 'Classic instant film camera refurbished to perfect workin... condition. Includes 2 packs of',
            location: 'Austin, TX',
            imgBackground: '#EAECEB',
            element: (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <div style={{ width: '130px', height: '85px', backgroundColor: '#2A2A2A', borderRadius: '12px', position: 'relative', padding: '10px', boxSizing: 'border-box' }}>
                        <div style={{ width: '25px', height: '12px', backgroundColor: '#EEEEEE', position: 'absolute', top: '12px', right: '15px', borderRadius: '2px' }}></div>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '6px solid #444', backgroundColor: '#111', margin: '10px auto 0 auto' }}></div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <main style={{ flex: 1, padding: mobile ? '2rem 1.5rem' : '3rem 4rem', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

                {/* Title and Controls */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: mobile ? '30px' : '36px', fontWeight: '700', margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
                            Explore Products
                        </h1>
                        <p style={{ color: '#666666', fontSize: '15px', margin: 0 }}>
                            Discover premium goods from curated sellers.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', width: mobile ? '100%' : 'auto' }}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#EFEAEB', border: 'none', borderRadius: '20px', padding: '0.6rem 1.2rem', fontSize: '14px', fontWeight: '500', color: '#444444', cursor: 'pointer' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444444" strokeWidth="2">
                                <line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line>
                            </svg>
                            Filters
                        </button>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', border: '1px solid #D0D0D0', borderRadius: '20px', padding: '0.6rem 1.2rem', fontSize: '14px', fontWeight: '500', color: '#222222', cursor: 'pointer' }}>
                            Sort by: Recommended
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#222222" strokeWidth="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Categories Ribbon */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
                    {categories.map((cat) => {
                        const isSelected = cat === activeCategory;
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    backgroundColor: isSelected ? '#B9001B' : '#F5F5F5',
                                    color: isSelected ? '#FFFFFF' : '#222222',
                                    border: 'none',
                                    borderRadius: '20px',
                                    padding: '0.55rem 1.2rem',
                                    fontSize: '13.5px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>

                {/* Dynamic Product Grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', // Responsive CSS Grid!
                        gap: '1.75rem',
                        marginBottom: '3.5rem'
                    }}
                >
                    {products.map((prod) => (
                        <div key={prod.id} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>

                            <div
                                style={{
                                    backgroundColor: prod.imgBackground || '#F5F5F5',
                                    height: '280px',
                                    borderRadius: '16px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {prod.element}

                                <button
                                    style={{
                                        position: 'absolute', top: '14px', right: '14px', backgroundColor: '#FFFFFF', border: 'none', width: '34px', height: '34px',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={prod.id === 3 ? '#B9001B' : '#444444'} strokeWidth="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </button>

                                {prod.tag && (
                                    <span style={{ position: 'absolute', bottom: '14px', left: '14px', backgroundColor: prod.tagBg || 'rgba(255, 255, 255, 0.9)', color: prod.tagColor || '#222222', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '0.3px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                                        {prod.tag}
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#111111' }}>{prod.name}</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#B9001B' }}>{prod.price}</span>
                                    {prod.oldPrice && <span style={{ fontSize: '12px', textDecoration: 'line-through', color: '#888888', marginTop: '1px' }}>{prod.oldPrice}</span>}
                                </div>
                            </div>

                            <p style={{ fontSize: '13px', color: '#666666', lineHeight: '1.5', margin: '0 0 1rem 0', minHeight: '38px' }}>
                                {prod.desc}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#777777' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#777777" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    <span style={{ fontSize: '12px', fontWeight: '500' }}>{prod.location}</span>
                                </div>

                                <button style={{ backgroundColor: '#B9001B', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(185, 0, 27, 0.2)' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3">
                                        <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                    <button style={{ backgroundColor: '#FFFFFF', border: '1px solid #CCCCCC', color: '#333333', borderRadius: '25px', padding: '0.75rem 2.2rem', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                        Load More Products
                    </button>
                </div>

        </main>
    );
}