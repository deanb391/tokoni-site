"use client";

import React, { useState, useEffect } from 'react';

// --- Inline SVG Icon Components ---
const ChevronRightIcon = ({ color = "#888" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const UserIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const OrderIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const BookmarkIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
);

const StoreIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const BellIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
);

const SettingsIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
);

const HelpIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const LogoutIcon = ({ color = "#B9001B" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const MoreIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"></circle>
        <circle cx="19" cy="12" r="1"></circle>
        <circle cx="5" cy="12" r="1"></circle>
    </svg>
);

// --- Main Screen Component ---
export default function MenuScreen() {
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

    const menuItems = [
        { id: 'profile', label: 'Profile Details', icon: <UserIcon /> },
        { id: 'orders', label: 'My Orders', icon: <OrderIcon /> },
        { id: 'saved', label: 'Saved Products', icon: <BookmarkIcon /> },
        { id: 'vendor', label: 'Vendor Dashboard', icon: <StoreIcon /> },
        { id: 'notifications', label: 'Notifications', icon: <BellIcon />, hasBadge: true },
        { id: 'settings', label: 'Settings & Privacy', icon: <SettingsIcon /> },
        { id: 'help', label: 'Help Center', icon: <HelpIcon /> },
        { id: 'logout', label: 'Logout', icon: <LogoutIcon />, isRed: true },
    ];

    return (
        <main style={{ paddingBottom: '4rem' }}>
                {/* 2. Hero Banner Background */}
                <div
                    style={{
                        height: '220px',
                        width: '100%',
                        backgroundColor: '#3b554f', // Approximating the dark green from the image
                        borderRadius: '0 0 24px 24px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Subtle background abstract element to match the image's faint list UI aesthetic */}
                    <div style={{ position: 'absolute', right: '10%', top: '20%', width: '300px', height: '100%', opacity: 0.1, border: '2px solid white', borderRadius: '12px' }}></div>
                </div>

                {/* 3. Profile Information Section */}
                <div
                    style={{
                        maxWidth: '900px',
                        margin: '0 auto',
                        padding: mobile ? '0 1.5rem' : '0 2rem',
                        position: 'relative',
                        marginTop: '-50px', // Pull up to overlap the banner
                        display: 'flex',
                        flexDirection: mobile ? 'column' : 'row',
                        alignItems: mobile ? 'flex-start' : 'flex-end',
                        justifyContent: 'space-between',
                        gap: '1.5rem'
                    }}
                >
                    {/* Left Side: Avatar & Text */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
                        {/* Avatar Circle */}
                        <div
                            style={{
                                width: '110px',
                                height: '110px',
                                borderRadius: '50%',
                                backgroundColor: '#D2D6DC',
                                border: '4px solid #FFFFFF',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Simulated Avatar Graphic */}
                            <svg width="100%" height="100%" viewBox="0 0 32 32" fill="none">
                                <rect width="32" height="32" fill="#E8ECEF" />
                                <circle cx="16" cy="13" r="7" fill="#B0BEC5" />
                                <path d="M2 32C2 24.268 8.268 18 16 18C23.732 18 30 24.268 30 32H2Z" fill="#B0BEC5" />
                            </svg>
                        </div>

                        {/* Profile Text Info */}
                        <div style={{ paddingBottom: '0.5rem' }}>
                            <h1 style={{ fontSize: '28px', fontWeight: '700', color: mobile ? '#111' : '#111', margin: '0 0 0.25rem 0', letterSpacing: '-0.5px' }}>
                                Alex Mercer
                            </h1>
                            <p style={{ fontSize: '14px', color: '#666666', margin: 0, fontWeight: '500' }}>
                                @alexmercer • New York, NY
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.5rem', width: mobile ? '100%' : 'auto' }}>
                        <button
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                backgroundColor: '#B9001B',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '25px',
                                padding: '0.6rem 1.5rem',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                flex: mobile ? 1 : 'none',
                                boxShadow: '0 2px 8px rgba(185, 0, 27, 0.2)'
                            }}
                        >
                            <EditIcon />
                            Edit Profile
                        </button>
                        <button
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#EAEAEA',
                                border: 'none',
                                borderRadius: '50%',
                                width: '42px',
                                height: '42px',
                                cursor: 'pointer'
                            }}
                        >
                            <MoreIcon />
                        </button>
                    </div>
                </div>

                {/* 4. Menu List Box */}
                <div
                    style={{
                        maxWidth: '750px',
                        margin: '2.5rem auto 0',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                        padding: '0.5rem 0',
                        width: mobile ? '90%' : '100%'
                    }}
                >
                    {menuItems.map((item, index) => {
                        const isLast = index === menuItems.length - 1;
                        return (
                            <div
                                key={item.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1.15rem 1.5rem',
                                    borderBottom: isLast ? 'none' : '1px solid #F3F4F6',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {/* Icon Circle Container */}
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: '#FFF0F2',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative'
                                        }}
                                    >
                                        {item.icon}

                                        {/* Optional Notification Dot */}
                                        {item.hasBadge && (
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    width: '8px',
                                                    height: '8px',
                                                    backgroundColor: '#B9001B',
                                                    borderRadius: '50%',
                                                    border: '2px solid #FFF0F2'
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Label Text */}
                                    <span
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '500',
                                            color: item.isRed ? '#B9001B' : '#111111'
                                        }}
                                    >
                                        {item.label}
                                    </span>
                                </div>

                                {/* Chevron Arrow */}
                                {!item.isRed && <ChevronRightIcon />}
                            </div>
                        );
                    })}
                </div>
        </main>
    );
}