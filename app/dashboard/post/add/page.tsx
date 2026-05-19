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

const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const CloudUploadIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

const PlusCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B9001B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
);

// Sidebar Icons
const DashboardIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>;
const InventoryIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const OrdersIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>;
const AnalyticsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
const CustomersIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const SettingsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const HelpIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const LogoutIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

export default function CreateNewPostScreen() {
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

    const sidebarLinks = [
        { name: 'Dashboard', icon: DashboardIcon, active: false },
        { name: 'Inventory', icon: InventoryIcon, active: true },
        { name: 'Orders', icon: OrdersIcon, active: false },
        { name: 'Analytics', icon: AnalyticsIcon, active: false },
        { name: 'Customers', icon: CustomersIcon, active: false },
        { name: 'Settings', icon: SettingsIcon, active: false },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#FAFAFA', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>



            {/* ================= BODY ================= */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>



                {/* ================= MAIN CONTENT (MODAL-LIKE AREA) ================= */}
                <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#FAFAFA', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    <div style={{ width: '100%', maxWidth: '800px', padding: mobile ? '1.5rem' : '3rem 2rem', boxSizing: 'border-box' }}>

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111', margin: 0 }}>Create New Post</h1>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Upload Area */}
                        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #EDEDED', marginBottom: '2rem' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <CloudUploadIcon />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111', margin: '0 0 0.5rem 0' }}>Drag and drop media here</h3>
                            <p style={{ fontSize: '14px', color: '#888', margin: '0 0 1.5rem 0' }}>Supports JPG, PNG, MP4 up to 50MB</p>
                            <button style={{ backgroundColor: '#FFF0F2', color: '#B9001B', border: 'none', borderRadius: '20px', padding: '0.6rem 1.5rem', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                                Browse Files
                            </button>
                        </div>

                        {/* Caption */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '0.75rem' }}>Caption</label>
                            <textarea
                                placeholder="Write a compelling caption for your followers..."
                                style={{ width: '100%', minHeight: '120px', backgroundColor: '#F5F5F5', border: 'none', borderRadius: '12px', padding: '1rem', fontSize: '15px', color: '#333', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#888' }}>0 / 2200</span>
                            </div>
                        </div>

                        {/* Tag Products */}
                        <div style={{ marginBottom: '4rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>Tag Products</label>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><PlusCircleIcon /></button>
                            </div>

                            {/* Internal Search */}
                            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}><SearchIcon color="#888" /></div>
                                <input
                                    type="text"
                                    placeholder="Search your inventory..."
                                    style={{ width: '100%', backgroundColor: '#F5F5F5', border: 'none', borderRadius: '12px', padding: '1rem 1rem 1rem 2.5rem', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#333' }}
                                />
                            </div>

                            {/* Mock Product Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>

                                {/* Product 1 */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ width: '100%', height: '240px', backgroundColor: '#EAEAEA', borderRadius: '12px', marginBottom: '0.75rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {/* Simulated Watch graphic */}
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FFF', border: '4px solid #D4AF37', position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: '2px', height: '25px', backgroundColor: '#333', transform: 'rotate(45deg)', transformOrigin: 'bottom center', position: 'absolute', bottom: '50%' }}></div>
                                        </div>
                                        <div style={{ position: 'absolute', top: '20px', bottom: '20px', width: '40px', backgroundColor: '#9CA3AF', borderRadius: '4px', zIndex: 1 }}></div>
                                    </div>
                                    <h4 style={{ fontSize: '13px', fontWeight: '500', color: '#111', margin: '0 0 2px 0' }}>Classic Chronograph</h4>
                                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#B9001B' }}>₦129.00</span>
                                </div>

                                {/* Product 2 */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ width: '100%', height: '240px', backgroundColor: '#2D3035', borderRadius: '12px', marginBottom: '0.75rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {/* Simulated Headphones graphic */}
                                        <div style={{ width: '100px', height: '120px', border: '20px solid #111', borderRadius: '60px 60px 20px 20px', borderBottom: 'none', position: 'absolute', top: '40px' }}></div>
                                        <div style={{ width: '40px', height: '60px', backgroundColor: '#E5E7EB', borderRadius: '15px', position: 'absolute', left: '60px', bottom: '50px' }}></div>
                                        <div style={{ width: '40px', height: '60px', backgroundColor: '#E5E7EB', borderRadius: '15px', position: 'absolute', right: '#60px', bottom: '50px' }}></div>
                                    </div>
                                    <h4 style={{ fontSize: '13px', fontWeight: '500', color: '#111', margin: '0 0 2px 0' }}>Studio Pro ANC</h4>
                                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#B9001B' }}>₦299.00</span>
                                </div>

                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div style={{ display: 'flex', gap: '1rem', paddingBottom: '3rem', flexDirection: mobile ? 'column' : 'row' }}>
                            <button style={{ flex: 1, backgroundColor: '#EAEAEA', color: '#B9001B', border: 'none', borderRadius: '12px', padding: '1.25rem', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                                Save as Draft
                            </button>
                            <button style={{ flex: 1, backgroundColor: '#B9001B', color: '#FFFFFF', border: 'none', borderRadius: '12px', padding: '1.25rem', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                                Publish Post
                            </button>
                        </div>

                    </div>
                </main>
            </div>

        </div>
    );
}