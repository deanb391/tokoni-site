"use client";

import React, { useState, useEffect } from 'react';

// --- Inline SVGs for Icons ---
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

const PhoneIcon = ({ color = "#111" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

const MoreIcon = ({ color = "#111" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>
    </svg>
);

const PlusIcon = ({ color = "#111" }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const SendIcon = ({ color = "#FFF" }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);

const BackIcon = ({ color = "#111" }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

export default function MessagesScreen() {
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [mobileView, setMobileView] = useState('chat'); // 'list' or 'chat'

    // Track window size for responsive inline styles
    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const mobile = mounted ? isMobile : false;

    // Mock Data
    const chatList = [
        { id: 1, name: 'Aura Ceramics', time: '10:42 AM', preview: 'Yes, the new glaze collection is finall...', isActive: true, avatarBg: '#3B4A3F', unread: false },
        { id: 2, name: 'Modern Threads', time: 'Yesterday', preview: 'Your order #4829 has been sh...', isActive: false, avatarBg: '#0284C7', unread: true, isInitials: true, initials: 'M' },
        { id: 3, name: 'Sarah Jenkins', time: 'Mon', preview: 'Thanks! I absolutely love the jacket, ...', isActive: false, avatarBg: '#10B981', unread: false },
        { id: 4, name: 'Lumina Lighting', time: 'Oct 12', preview: 'We are expecting restock next Tues...', isActive: false, avatarBg: '#E5E7EB', unread: false, isIcon: true }
    ];



    const renderSidebar = () => (
        <div
            style={{
                width: mobile ? '100%' : '340px',
                borderRight: mobile ? 'none' : '1px solid #EDEDED',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            {/* Sidebar Search */}
            <div style={{ padding: '1rem' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', left: '14px' }}><SearchIcon /></div>
                    <input
                        type="text"
                        placeholder="Search messages..."
                        style={{ width: '100%', backgroundColor: '#F5F5F5', border: 'none', borderRadius: '12px', padding: '0.75rem 1rem 0.75rem 2.5rem', fontSize: '14px', outline: 'none', color: '#111', boxSizing: 'border-box' }}
                    />
                </div>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', padding: '0 1rem 1rem', borderBottom: '1px solid #EDEDED' }}>
                <button style={{ backgroundColor: '#FFF0F2', color: '#B9001B', border: 'none', borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>All</button>
                <button style={{ backgroundColor: '#F5F5F5', color: '#555555', border: 'none', borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Unread</button>
                <button style={{ backgroundColor: '#F5F5F5', color: '#555555', border: 'none', borderRadius: '20px', padding: '0.4rem 1rem', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Vendors</button>
            </div>

            {/* Chat List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {chatList.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => { if (mobile) setMobileView('chat'); }}
                        style={{
                            display: 'flex',
                            padding: '1.25rem 1rem',
                            borderBottom: '1px solid #F5F5F5',
                            cursor: 'pointer',
                            backgroundColor: chat.isActive && !mobile ? '#FAFAFA' : '#FFFFFF',
                            borderLeft: chat.isActive && !mobile ? '3px solid #B9001B' : '3px solid transparent'
                        }}
                    >
                        {/* Avatar */}
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: chat.avatarBg, marginRight: '12px', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {chat.isInitials && <span style={{ color: '#FFF', fontWeight: '600', fontSize: '16px' }}>{chat.initials}</span>}
                            {chat.isIcon && (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                            )}
                            {!chat.isInitials && !chat.isIcon && (
                                <svg width="44" height="44" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" fill={chat.avatarBg} /><circle cx="16" cy="13" r="6" fill="#FFFFFF" opacity="0.3" /><path d="M4 28C4 22.4772 8.47715 18 14 18H18C23.5228 18 28 22.4772 28 28V32H4V28Z" fill="#FFFFFF" opacity="0.3" /></svg>
                            )}
                            {chat.isActive && <span style={{ position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px', backgroundColor: '#10B981', borderRadius: '50%', border: '2px solid #FFF' }}></span>}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: chat.unread ? '700' : '600', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.name}</span>
                                <span style={{ fontSize: '12px', color: chat.unread ? '#B9001B' : '#888', flexShrink: 0, marginLeft: '8px' }}>{chat.time}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '13.5px', color: chat.unread ? '#111' : '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: chat.unread ? '500' : '400' }}>
                                    {chat.preview}
                                </span>
                                {chat.unread && <span style={{ width: '8px', height: '8px', backgroundColor: '#B9001B', borderRadius: '50%', flexShrink: 0, marginLeft: '8px' }}></span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderChatArea = () => (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#F9FAFB', height: '100%' }}>
            {/* Chat Header */}
            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid #EDEDED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {mobile && (
                        <button onClick={() => setMobileView('list')} style={{ background: 'none', border: 'none', padding: '0 8px 0 0', cursor: 'pointer' }}>
                            <BackIcon />
                        </button>
                    )}
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3B4A3F', position: 'relative', overflow: 'hidden' }}>
                        <svg width="40" height="40" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" fill="#3B4A3F" /><circle cx="16" cy="13" r="6" fill="#FFFFFF" opacity="0.3" /><path d="M4 28C4 22.4772 8.47715 18 14 18H18C23.5228 18 28 22.4772 28 28V32H4V28Z" fill="#FFFFFF" opacity="0.3" /></svg>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: '0 0 2px 0' }}>Aura Ceramics</h2>
                        <p style={{ fontSize: '12.5px', color: '#666', margin: 0 }}>Active now • Vendor</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><PhoneIcon /></button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><MoreIcon /></button>
                </div>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Date Divider */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                    <span style={{ backgroundColor: '#FFFFFF', border: '1px solid #EDEDED', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: '#555' }}>Today</span>
                </div>

                {/* Message 1 (Incoming) */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#3B4A3F', flexShrink: 0, overflow: 'hidden' }}>
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" fill="#3B4A3F" /><circle cx="16" cy="13" r="6" fill="#FFFFFF" opacity="0.3" /><path d="M4 28C4 22.4772 8.47715 18 14 18H18C23.5228 18 28 22.4772 28 28V32H4V28Z" fill="#FFFFFF" opacity="0.3" /></svg>
                    </div>
                    <div style={{ maxWidth: '70%' }}>
                        <div style={{ backgroundColor: '#EFEAEB', padding: '12px 16px', borderRadius: '4px 16px 16px 16px', fontSize: '14px', color: '#111', lineHeight: '1.5' }}>
                            Hi there! Thanks for your interest in the matte black vase.
                        </div>
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '6px', marginLeft: '4px' }}>10:30 AM</div>
                    </div>
                </div>

                {/* Message 2 (Outgoing) */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div style={{ backgroundColor: '#B9001B', padding: '12px 16px', borderRadius: '16px 4px 16px 16px', fontSize: '14px', color: '#FFFFFF', lineHeight: '1.5' }}>
                            Hello! Is it safe for holding water for fresh flowers?
                        </div>
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '6px', marginRight: '4px' }}>10:35 AM</div>
                    </div>
                </div>

                {/* Message 3 (Incoming with Product) */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#3B4A3F', flexShrink: 0, overflow: 'hidden' }}>
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" fill="#3B4A3F" /><circle cx="16" cy="13" r="6" fill="#FFFFFF" opacity="0.3" /><path d="M4 28C4 22.4772 8.47715 18 14 18H18C23.5228 18 28 22.4772 28 28V32H4V28Z" fill="#FFFFFF" opacity="0.3" /></svg>
                    </div>
                    <div style={{ maxWidth: '85%' }}>
                        <div style={{ backgroundColor: '#EFEAEB', padding: '12px', borderRadius: '4px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '14px', color: '#111', lineHeight: '1.5', padding: '4px' }}>
                                Yes, absolutely! The interior is fully glazed and water-tight. Here's the specific item for reference:
                            </div>
                            {/* Product Attachment */}
                            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0A0A6', borderRadius: '12px', padding: '12px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '56px', height: '56px', backgroundColor: '#D5D1CB', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {/* Vase visual placeholder */}
                                    <div style={{ width: '24px', height: '30px', backgroundColor: '#222', borderRadius: '10px 10px 15px 15px' }}></div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '4px' }}>Minimalist Matte Vase</div>
                                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#B9001B' }}>$85.00</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '6px', marginLeft: '4px' }}>10:40 AM</div>
                    </div>
                </div>

                {/* Typing Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#3B4A3F', flexShrink: 0, overflow: 'hidden' }}>
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" fill="#3B4A3F" /><circle cx="16" cy="13" r="6" fill="#FFFFFF" opacity="0.3" /><path d="M4 28C4 22.4772 8.47715 18 14 18H18C23.5228 18 28 22.4772 28 28V32H4V28Z" fill="#FFFFFF" opacity="0.3" /></svg>
                    </div>
                    <div style={{ backgroundColor: '#EFEAEB', padding: '12px 16px', borderRadius: '4px 16px 16px 16px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ width: '6px', height: '6px', backgroundColor: '#888', borderRadius: '50%' }}></span>
                        <span style={{ width: '6px', height: '6px', backgroundColor: '#888', borderRadius: '50%' }}></span>
                        <span style={{ width: '6px', height: '6px', backgroundColor: '#888', borderRadius: '50%' }}></span>
                    </div>
                </div>

            </div>

            {/* Message Input Area */}
            <div style={{ padding: '1rem 1.5rem', backgroundColor: '#FFFFFF', borderTop: '1px solid #EDEDED' }}>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: '30px', padding: '0.5rem 0.5rem 0.5rem 1.25rem' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', marginRight: '12px' }}>
                        <PlusIcon />
                    </button>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        style={{ flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: '#111' }}
                    />
                    <button style={{ backgroundColor: '#B9001B', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '12px' }}>
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: mobile ? 'calc(100vh - 116px)' : 'calc(100vh - 73px)', backgroundColor: '#FFFFFF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            {/* Main Content Area */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* Desktop View renders both. Mobile View renders conditionally */}
                {(!mobile || mobileView === 'list') && renderSidebar()}
                {(!mobile || mobileView === 'chat') && renderChatArea()}

            </div>
        </div>
    );
}