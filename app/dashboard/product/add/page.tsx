"use client";

import React, { useState, useEffect } from 'react';

// --- Inline SVG Icons ---
const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const UploadImageIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B9001B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
        <path d="M14 14.5l2-2 2 2"></path>
        <path d="M16 12.5v6"></path>
    </svg>
);

const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const XSmallIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);


export default function AddProductScreen() {
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Responsive layout tracking
    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const mobile = mounted ? isMobile : false;

    // Reusable Input Wrapper Style
    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.85rem 1rem',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#111',
        backgroundColor: '#FFFFFF',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#111',
        marginBottom: '8px'
    };

    const reqAsterisk = <span style={{ color: '#B9001B' }}>*</span>;

    const cardStyle: React.CSSProperties = {
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        boxSizing: 'border-box',
        width: '100%',
    };

    return (
        <div style={{ backgroundColor: '#F6F6F6', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

            {/* ================= HEADER ================= */}
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    backgroundColor: '#FFFFFF',
                    borderBottom: '1px solid #EDEDED',
                    padding: mobile ? '1rem' : '1.25rem 2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                        <CloseIcon />
                    </button>
                    <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#111', margin: 0 }}>Add New Product</h1>
                </div>

                <div style={{ display: 'flex', gap: '1rem', width: mobile ? '100%' : 'auto' }}>
                    <button
                        style={{
                            flex: mobile ? 1 : 'none',
                            backgroundColor: '#F3F4F6',
                            color: '#111',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.6rem 1.5rem',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                    >
                        Save as Draft
                    </button>
                    <button
                        style={{
                            flex: mobile ? 1 : 'none',
                            backgroundColor: '#B9001B',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.6rem 1.5rem',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                    >
                        Publish Product
                    </button>
                </div>
            </header>

            {/* ================= MAIN CONTENT ================= */}
            <main
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: mobile ? '1.5rem 1rem' : '2.5rem 2rem',
                    display: 'flex',
                    flexDirection: mobile ? 'column' : 'row',
                    gap: '2rem',
                    alignItems: 'flex-start'
                }}
            >
                {/* ================= LEFT COLUMN ================= */}
                <div style={{ flex: mobile ? 'none' : 2, width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Card 1: Product Media */}
                    <section style={cardStyle}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 0.5rem 0' }}>Product Media</h2>
                        <p style={{ fontSize: '14px', color: '#666', margin: '0 0 1.5rem 0' }}>Add up to 8 images. The first image will be the cover.</p>

                        {/* Drag & Drop Upload Area */}
                        <div
                            style={{
                                border: '2px dashed #ECA1A6', // Reddish dashed border
                                backgroundColor: '#FFFDFD',
                                borderRadius: '12px',
                                padding: '3rem 1rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                marginBottom: '1.5rem'
                            }}
                        >
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#FFF0F2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                <UploadImageIcon />
                            </div>
                            <p style={{ fontSize: '15px', fontWeight: '600', color: '#111', margin: '0 0 0.5rem 0' }}>Click to upload or drag and drop</p>
                            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>SVG, PNG, JPG or GIF (max. 5MB)</p>
                        </div>

                        {/* Thumbnail Row */}
                        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>

                            {/* Cover Thumbnail (Simulated Smartwatch) */}
                            <div style={{ width: '140px', height: '140px', borderRadius: '12px', backgroundColor: '#E2E6E9', position: 'relative', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #D1D5DB' }}>
                                <span style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#FFF', color: '#111', fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '4px', zIndex: 2 }}>COVER</span>

                                {/* CSS Art: Watch */}
                                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
                                    {/* Watch body */}
                                    <div style={{ width: '45px', height: '55px', backgroundColor: '#111', borderRadius: '10px', border: '2px solid #555', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                                        <div style={{ width: '25px', height: '25px', border: '2px solid #06B6D4', borderRadius: '50%', borderTopColor: 'transparent', transform: 'rotate(45deg)' }}></div>
                                    </div>
                                    {/* Watch band top/bottom */}
                                    <div style={{ width: '25px', height: '15px', backgroundColor: '#333', position: 'absolute', top: '-12px', borderRadius: '4px 4px 0 0' }}></div>
                                    <div style={{ width: '25px', height: '15px', backgroundColor: '#333', position: 'absolute', bottom: '-12px', borderRadius: '0 0 4px 4px' }}></div>
                                    {/* Pedestal */}
                                    <div style={{ width: '90px', height: '20px', backgroundColor: '#F3F4F6', borderRadius: '50%', position: 'absolute', bottom: '-25px', borderBottom: '4px solid #D1D5DB' }}></div>
                                </div>
                            </div>

                            {/* Empty Slots */}
                            {[1, 2].map((i) => (
                                <div key={i} style={{ width: '140px', height: '140px', borderRadius: '12px', border: '2px dashed #E5E7EB', backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                                    <PlusIcon />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Card 2: Basic Information */}
                    <section style={cardStyle}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 1.5rem 0' }}>Basic Information</h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Product Name {reqAsterisk}</label>
                            <input type="text" placeholder="e.g. Minimalist Ceramic Vase" style={{ ...inputStyle, border: '1px solid #ECA1A6' /* Matches focus/active state in image */ }} />
                        </div>

                        <div>
                            <label style={labelStyle}>Description {reqAsterisk}</label>
                            <textarea
                                placeholder="Describe your product's features, materials, and benefits..."
                                style={{ ...inputStyle, minHeight: '140px', resize: 'vertical', border: '1px solid #ECA1A6' }}
                            />
                        </div>
                    </section>
                </div>

                {/* ================= RIGHT COLUMN ================= */}
                <div style={{ flex: mobile ? 'none' : 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: mobile ? 'auto' : '340px' }}>

                    {/* Card 3: Pricing */}
                    <section style={cardStyle}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 1.5rem 0' }}>Pricing</h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Base Price {reqAsterisk}</label>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ECA1A6', borderRadius: '8px', backgroundColor: '#FFF' }}>
                                <span style={{ paddingLeft: '1rem', color: '#666', fontSize: '15px' }}>$</span>
                                <input type="text" placeholder="0.00" style={{ ...inputStyle, border: 'none', paddingLeft: '0.5rem' }} />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Discount Price (Optional)</label>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ECA1A6', borderRadius: '8px', backgroundColor: '#FFF' }}>
                                <span style={{ paddingLeft: '1rem', color: '#666', fontSize: '15px' }}>$</span>
                                <input type="text" placeholder="0.00" style={{ ...inputStyle, border: 'none', paddingLeft: '0.5rem' }} />
                            </div>
                        </div>
                    </section>

                    {/* Card 4: Inventory */}
                    <section style={cardStyle}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 1.5rem 0' }}>Inventory</h2>
                        <div>
                            <label style={labelStyle}>Stock Quantity {reqAsterisk}</label>
                            <input type="number" placeholder="0" style={{ ...inputStyle, border: '1px solid #ECA1A6' }} />
                        </div>
                    </section>

                    {/* Card 5: Organization */}
                    <section style={cardStyle}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 1.5rem 0' }}>Organization</h2>

                        {/* Category Dropdown */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Category {reqAsterisk}</label>
                            <div style={{ position: 'relative' }}>
                                <input type="text" placeholder="Select a category" readOnly style={{ ...inputStyle, border: '1px solid #ECA1A6', cursor: 'pointer' }} />
                                <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <ChevronDownIcon />
                                </div>
                            </div>
                        </div>

                        {/* Condition Radio */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={labelStyle}>Condition</label>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: '#111' }}>
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '5px solid #B9001B', boxSizing: 'border-box' }}></div>
                                    New
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: '#111' }}>
                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1px solid #CCC', boxSizing: 'border-box' }}></div>
                                    Used
                                </label>
                            </div>
                        </div>

                        {/* Tags Input */}
                        <div>
                            <label style={labelStyle}>Tags</label>
                            <input type="text" placeholder="Press enter to add tags" style={{ ...inputStyle, border: '1px solid #ECA1A6', marginBottom: '1rem' }} />

                            {/* Tag Pills */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <div style={{ backgroundColor: '#F3F4F6', color: '#333', padding: '6px 12px', borderRadius: '20px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    Minimalist
                                    <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><XSmallIcon /></button>
                                </div>
                                <div style={{ backgroundColor: '#F3F4F6', color: '#333', padding: '6px 12px', borderRadius: '20px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    Premium
                                    <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><XSmallIcon /></button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Card 6: Availability */}
                    <section style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 0.25rem 0' }}>Availability</h2>
                            <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>Make product visible on store</p>
                        </div>

                        {/* Custom Toggle Switch */}
                        <div style={{ width: '52px', height: '28px', backgroundColor: '#B9001B', borderRadius: '14px', position: 'relative', cursor: 'pointer' }}>
                            <div style={{ position: 'absolute', right: '2px', top: '2px', width: '24px', height: '24px', backgroundColor: '#FFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
                                <CheckIcon />
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}