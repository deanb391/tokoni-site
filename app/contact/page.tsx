"use client";

import React, { useState, useEffect } from 'react';

// --- Inline SVG Icons ---
const SearchIcon = ({ color = "#666" }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const HeadsetIcon = ({ color = "#B9001B" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
    </svg>
);

const ShoppingBagIcon = ({ color = "#B9001B" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
);

const StoreIcon = ({ color = "#B9001B" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const BuildingIcon = ({ color = "#111" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <path d="M9 22v-4h6v4"></path>
        <path d="M8 6h.01"></path>
        <path d="M16 6h.01"></path>
        <path d="M12 6h.01"></path>
        <path d="M12 10h.01"></path>
        <path d="M12 14h.01"></path>
        <path d="M16 10h.01"></path>
        <path d="M16 14h.01"></path>
        <path d="M8 10h.01"></path>
        <path d="M8 14h.01"></path>
    </svg>
);

const WrenchIcon = ({ color = "#111" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
);

const SendIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B9001B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

const GlobeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
);

const AtSignIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>
    </svg>
);

const MessageSquareIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

export default function HelpCenterScreen() {
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

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.9rem 1rem',
        backgroundColor: '#F5F5F5',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14.5px',
        color: '#111',
        outline: 'none',
        boxSizing: 'border-box'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '13.5px',
        fontWeight: '500',
        color: '#111',
        marginBottom: '8px'
    };

    return (
        <div style={{ backgroundColor: '#FAFAFA', minHeight: '100vh', fontFamily: 'var(--font-body), sans-serif' }}>



            {/* ================= MAIN CONTENT ================= */}
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: mobile ? '2rem 1.5rem' : '4rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                {/* HERO SECTION */}
                <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: mobile ? 'flex-start' : 'center', gap: '2rem' }}>
                    <div style={{ maxWidth: '600px' }}>
                        <h1 style={{ fontSize: mobile ? '36px' : '48px', fontWeight: '800', color: '#111', margin: '0 0 1rem 0', letterSpacing: '-1px' }}>
                            How can we help?
                        </h1>
                        <p style={{ fontSize: '16px', color: '#666', margin: 0, lineHeight: '1.5' }}>
                            Whether you have a question about our products, need technical assistance, or want to explore partnership opportunities, our dedicated team is here to support you.
                        </p>
                    </div>

                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #EDEDED', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', width: mobile ? '100%' : 'auto', minWidth: '280px', boxSizing: 'border-box' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HeadsetIcon />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111', margin: '0 0 2px 0' }}>Live Chat</h3>
                            <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Avg. wait 2 mins</p>
                        </div>
                    </div>
                </div>

                {/* MIDDLE SECTION: Form & Categories */}
                <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: '2rem', alignItems: 'flex-start' }}>

                    {/* Left: Contact Form */}
                    <div style={{ flex: 1.5, width: '100%', backgroundColor: '#FFFFFF', borderRadius: '16px', padding: mobile ? '1.5rem' : '2.5rem', border: '1px solid #EDEDED', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111', margin: '0 0 2rem 0' }}>Send us a message</h2>

                        <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Full Name</label>
                                <input type="text" placeholder="Jane Doe" style={inputStyle} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Email Address</label>
                                <input type="email" placeholder="jane@example.com" style={inputStyle} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Subject</label>
                            <div style={{ position: 'relative' }}>
                                <input type="text" defaultValue="Order Support" readOnly style={{ ...inputStyle, cursor: 'pointer' }} />
                                <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}>
                                    <ChevronDownIcon />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={labelStyle}>Message</label>
                            <textarea
                                placeholder="How can we help you today?"
                                style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }}
                            />
                        </div>

                        <button style={{ backgroundColor: '#B9001B', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '0.9rem 2rem', fontSize: '14.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            Send Message <SendIcon />
                        </button>
                    </div>

                    {/* Right: Support Categories */}
                    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '1.5rem', border: '1px solid #EDEDED', display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <ShoppingBagIcon />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#111', margin: '0 0 4px 0' }}>Customer Support</h4>
                                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Help with orders, shipping, and returns.</p>
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '1.5rem', border: '1px solid #EDEDED', display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <StoreIcon color="#111" />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#111', margin: '0 0 4px 0' }}>Vendor Relations</h4>
                                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Support for sellers and brand partners.</p>
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '1.5rem', border: '1px solid #EDEDED', display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <BuildingIcon />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#111', margin: '0 0 4px 0' }}>Business Inquiries</h4>
                                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Partnerships, press, and corporate.</p>
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '1.5rem', border: '1px solid #EDEDED', display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer', transition: 'box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <WrenchIcon />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#111', margin: '0 0 4px 0' }}>Technical Help</h4>
                                <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>App issues, account recovery, and bugs.</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* BOTTOM SECTION: FAQ */}
                <div style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111', margin: 0 }}>Frequently Asked Questions</h2>
                        <a href="#" style={{ color: '#B9001B', fontSize: '14px', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            View All <ArrowRightIcon />
                        </a>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>

                        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '1.5rem', border: '1px solid #EDEDED' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#111', margin: '0 0 0.75rem 0' }}>How long does shipping usually take?</h4>
                            <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.5' }}>
                                Standard shipping takes 3-5 business days. Premium expedited options are available at checkout for next-day delivery.
                            </p>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '1.5rem', border: '1px solid #EDEDED' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#111', margin: '0 0 0.75rem 0' }}>What is your return policy?</h4>
                            <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.5' }}>
                                We offer a 30-day return window for unworn items in original packaging. Refunds are processed within 5-7 business days.
                            </p>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '1.5rem', border: '1px solid #EDEDED' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#111', margin: '0 0 0.75rem 0' }}>Can I modify my order after placing it?</h4>
                            <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.5' }}>
                                Orders can be modified within 1 hour of placement. Please use the 'Live Chat' feature for immediate assistance.
                            </p>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '1.5rem', border: '1px solid #EDEDED' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#111', margin: '0 0 0.75rem 0' }}>How do I track my delivery?</h4>
                            <p style={{ fontSize: '14px', color: '#666', margin: 0, lineHeight: '1.5' }}>
                                Once shipped, you will receive a tracking link via email. You can also view live tracking in the 'My Orders' section.
                            </p>
                        </div>

                    </div>
                </div>

            </main>



        </div>
    );
}