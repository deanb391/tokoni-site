"use client";

import React, { useState, useEffect } from 'react';

// --- Inline SVG Icons ---
const SearchIcon = ({ color = "#111" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const BellIcon = ({ color = "#111" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
);

const CartIcon = ({ color = "#111" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
);

const SunBurstIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <line x1="12" y1="5" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="19" y2="12"></line>
        <line x1="16.95" y1="7.05" x2="18.36" y2="5.64"></line>
        <line x1="5.64" y1="18.36" x2="7.05" y2="16.95"></line>
        <line x1="16.95" y1="16.95" x2="18.36" y2="18.36"></line>
        <line x1="5.64" y1="5.64" x2="7.05" y2="7.05"></line>
    </svg>
);

const StoreIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B9001B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const NetworkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B9001B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B9001B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

export default function AboutScreen() {
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const mobile = mounted ? isMobile : false;

    return (
        <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', fontFamily: 'var(--font-body), sans-serif', overflowX: 'hidden' }}>


            {/* ================= HERO SECTION ================= */}
            <section style={{ maxWidth: '1400px', margin: '0 auto', padding: mobile ? '3rem 1.5rem' : '5rem 4rem', display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: 'center', gap: mobile ? '3rem' : '5rem' }}>

                {/* Left: Text Content */}
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: mobile ? '40px' : '56px', fontWeight: '800', color: '#111', lineHeight: '1.1', margin: '0 0 1.5rem 0', letterSpacing: '-1.5px' }}>
                        The Intersection of<br />
                        <span style={{ color: '#B9001B' }}>Retail & Connection</span>
                    </h1>
                    <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6', maxWidth: '450px', margin: 0 }}>
                        Tokoni isn't just a marketplace. It's a curated ecosystem designed for the modern trend-conscious consumer, blending premium aesthetic discovery with seamless social interaction.
                    </p>
                </div>

                {/* Right: Visual Placeholder (Store Interior) */}
                <div style={{ flex: 1.2, width: '100%' }}>
                    <div style={{ width: '100%', height: mobile ? '300px' : '450px', backgroundColor: '#F3F4F6', borderRadius: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
                        {/* CSS Abstract Art representing the minimal white store */}
                        <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', width: '30%', height: '30%', backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E7EB', borderLeft: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB' }}></div>
                        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '15%', height: '60%', backgroundColor: '#FFFFFF', boxShadow: '2px 0 10px rgba(0,0,0,0.02)' }}></div>
                        <div style={{ position: 'absolute', top: '20%', right: '10%', width: '15%', height: '60%', backgroundColor: '#FFFFFF', boxShadow: '-2px 0 10px rgba(0,0,0,0.02)' }}></div>
                        <div style={{ position: 'absolute', top: '40%', right: '35%', width: '8%', height: '30%', backgroundColor: '#B9001B' }}></div>
                    </div>
                </div>

            </section>

            {/* ================= OUR STORY SECTION ================= */}
            <section style={{ maxWidth: '1400px', margin: '0 auto', padding: mobile ? '3rem 1.5rem' : '5rem 4rem', display: 'flex', flexDirection: mobile ? 'column' : 'row', alignItems: 'center', gap: mobile ? '3rem' : '6rem' }}>

                {/* Left: Visual Placeholder (Phone App) */}
                <div style={{ flex: 1, width: '100%' }}>
                    <div style={{ width: '100%', height: mobile ? '350px' : '450px', backgroundColor: '#F9FAFB', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* CSS Phone Mockup */}
                        <div style={{ width: '200px', height: '380px', backgroundColor: '#FFFFFF', borderRadius: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.1)', padding: '8px', border: '4px solid #F3F4F6', position: 'relative' }}>
                            <div style={{ width: '100%', height: '100%', backgroundColor: '#E5E7EB', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '10%', left: '0', right: '0', bottom: '30%', backgroundColor: '#9CA3AF' }}></div>
                                <div style={{ position: 'absolute', bottom: '15%', left: '20%', right: '20%', height: '24px', backgroundColor: '#D1D5DB', borderRadius: '12px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Text Content */}
                <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#111', margin: '0 0 1.5rem 0', letterSpacing: '-1px' }}>
                        Our Story
                    </h2>
                    <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.7', margin: '0 0 1.5rem 0' }}>
                        Born from the observation that traditional e-commerce felt isolated and transactional, Tokoni was built to reintroduce the human element into digital shopping. We believed that discovering a product should feel as engaging as discussing it with a friend.
                    </p>
                    <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.7', margin: 0 }}>
                        By weaving social features directly into the fabric of a high-end marketplace, we've created a space where inspiration flows freely, and commerce is driven by authentic community validation rather than algorithm alone.
                    </p>
                </div>

            </section>

            {/* ================= MISSION BANNER ================= */}
            <section style={{ backgroundColor: '#B9001B', padding: mobile ? '4rem 1.5rem' : '6rem 2rem', textAlign: 'center', color: '#FFFFFF' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <SunBurstIcon />
                    </div>
                    <h2 style={{ fontSize: mobile ? '32px' : '42px', fontWeight: '800', margin: '0 0 1.5rem 0', lineHeight: '1.2', letterSpacing: '-1px' }}>
                        To elevate digital commerce from a solitary task into a shared, beautiful experience.
                    </h2>
                    <p style={{ fontSize: '16px', fontWeight: '400', margin: 0, opacity: 0.9, lineHeight: '1.6' }}>
                        We engineer elegant digital spaces that respect the user's attention, prioritizing aesthetic pleasure and genuine connection over noise.
                    </p>
                </div>
            </section>

            {/* ================= ECOSYSTEM SECTION ================= */}
            <section style={{ backgroundColor: '#F9FAFB', padding: mobile ? '4rem 1.5rem' : '6rem 4rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111', margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
                            The Tokoni Ecosystem
                        </h2>
                        <p style={{ fontSize: '15px', color: '#666', margin: 0 }}>
                            Two pillars, one seamless experience.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: '2rem' }}>

                        {/* Card 1 */}
                        <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <StoreIcon />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: '0 0 1rem 0' }}>Premium Marketplace</h3>
                            <p style={{ fontSize: '14.5px', color: '#666', lineHeight: '1.6', margin: '0 0 2rem 0' }}>
                                A carefully curated selection of brands and products presented in an environment that allows imagery to breathe. We utilize clean, horizontal scroll mechanics to maximize discovery without overwhelming vertical fatigue.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CheckCircleIcon />
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>Curated Brand Portfolios</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CheckCircleIcon />
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>Frictionless Checkout</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <NetworkIcon />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: '0 0 1rem 0' }}>Social Connectivity</h3>
                            <p style={{ fontSize: '14.5px', color: '#666', lineHeight: '1.6', margin: '0 0 2rem 0' }}>
                                Shop alongside your network. Share finds, discuss trends, and validate purchases within a community that shares your aesthetic values. The social feed isn't an afterthought; it's the engine of discovery.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CheckCircleIcon />
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>Trend-Focused Feeds</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CheckCircleIcon />
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>Direct Peer Interactions</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ================= PHILOSOPHY SECTION ================= */}
            <section style={{ backgroundColor: '#FAFAFA', padding: mobile ? '5rem 1.5rem' : '8rem 2rem', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#B9001B', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>
                        Philosophy
                    </span>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111', margin: '0 0 1.5rem 0', letterSpacing: '-0.5px' }}>
                        Design as a Dialogue
                    </h2>
                    <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.7', margin: '0 0 3rem 0' }}>
                        At Tokoni, we believe that an interface should be as refined as the products it displays. We adhere to a strict minimalist ethos, employing expansive whitespace and tonal layering to guide the eye naturally. By removing visual clutter, we amplify the signal, allowing genuine connections and quality goods to take center stage.
                    </p>

                    <button style={{ backgroundColor: '#B9001B', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '1rem 2.5rem', fontSize: '15px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 14px rgba(185, 0, 27, 0.25)' }}>
                        Join the Ecosystem
                    </button>

                </div>
            </section>

        </div>
    );
}