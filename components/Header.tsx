"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import logoImg from "@/assets/images/tokoni_logo.png";
import { useUser } from '@/context/UserContext';
import { useChat } from '@/context/ChatContext';
import { account } from '@/lib/services/auth.service';
import { Menu, X } from 'lucide-react';

const BRAND_RED = "#B9001B";

export default function Header() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, vendor, refreshUser, loading, vendorLoading } = useUser();
  const { chats = [] } = useChat();

  const unreadCount = user?.$id && Array.isArray(chats)
    ? chats.reduce((acc, chat) => acc + (chat.unreadCounts?.[user.$id] || 0), 0)
    : 0;

  const isAuthLoading = !mounted || loading || vendorLoading;

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      await refreshUser();
      router.push("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const mobile = mounted ? isMobile : false;

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: (color: string, isActive?: boolean) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isActive ? color : "none"} stroke={color} strokeWidth={isActive ? "2" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      name: 'Feed',
      path: '/feed',
      icon: (color: string, isActive?: boolean) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isActive ? color : "none"} stroke={color} strokeWidth={isActive ? "2" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      )
    },
    {
      name: 'Products',
      path: '/products',
      icon: (color: string, isActive?: boolean) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isActive ? color : "none"} stroke={color} strokeWidth={isActive ? "2" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
      )
    },
    {
      name: 'Messages',
      path: '/chats',
      icon: (color: string, isActive?: boolean) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isActive ? color : "none"} stroke={color} strokeWidth={isActive ? "2" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    },
    {
      name: 'Menu',
      path: '/menu',
      icon: (color: string, isActive?: boolean) => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={isActive ? "2" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      )
    }
  ];

  const visibleNavItems = user
    ? navItems
    : navItems.filter(item => ['Home', 'Feed', 'Products'].includes(item.name));

  return (
    <>
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% {
            background-color: #f3f4f6;
          }
          50% {
            background-color: #e5e7eb;
          }
        }
        .skeleton-item {
          animation: skeleton-pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: mobile ? '0 1.25rem' : '0 4rem',
          height: '72px', // Slightly taller for breathing room
          backgroundColor: 'rgba(255, 255, 255, 0.85)', // More transparent for better blur
          backdropFilter: 'saturate(180%) blur(16px)',
          WebkitBackdropFilter: 'saturate(180%) blur(16px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          boxSizing: 'border-box',
          boxShadow: mobile ? 'none' : '0 4px 30px rgba(0, 0, 0, 0.03)', // Softer, wider shadow
          fontFamily: 'var(--font-body), sans-serif'
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image
            src={logoImg}
            alt="Tokoni Logo"
            height={mobile ? 24 : 28} // Slightly smaller logo for premium subtlety
            style={{ objectFit: 'contain', width: 'auto' }}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        {!mobile && (
          <nav
            style={{
              display: 'flex',
              gap: '2.5rem',
              alignItems: 'center',
              height: '100%',
            }}
          >
            {visibleNavItems.map((link) => {
              const isActive = link.path === '/' ? pathname === '/' : pathname?.startsWith(link.path);
              const color = isActive ? BRAND_RED : '#6b7280';
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? '600' : '500',
                    color: color,
                    textDecoration: 'none',
                    height: '100%',
                    position: 'relative',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                    {link.icon(color, isActive)}
                    {link.name === 'Messages' && unreadCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '10px',
                        backgroundColor: BRAND_RED,
                        color: '#FFF',
                        fontSize: '9px',
                        fontWeight: '700',
                        borderRadius: '50%',
                        minWidth: '15px',
                        height: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 3px',
                        boxSizing: 'border-box'
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {link.name}
                  {/* Active Indicator Line - Made softer and rounded */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '10%',
                      right: '10%', // Doesn't stretch all the way to the edges
                      height: '3px',
                      backgroundColor: BRAND_RED,
                      borderRadius: '3px 3px 0 0'
                    }} />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Actions */}
        {!mobile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isAuthLoading ? (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div
                  className="skeleton-item"
                  style={{
                    width: '100px',
                    height: '38px',
                    borderRadius: '9999px'
                  }}
                />
                <div
                  className="skeleton-item"
                  style={{
                    width: '75px',
                    height: '38px',
                    borderRadius: '9999px'
                  }}
                />
              </div>
            ) : user ? (
              <>
                {user?.isVendor || vendor ? (
                  <Link
                    href="/dashboard"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: BRAND_RED,
                      textDecoration: 'none',
                      borderRadius: '9999px',
                      padding: '0.625rem 1.5rem',
                      backgroundColor: '#fff1f2',
                      transition: 'background-color 0.2s ease',
                      boxShadow: 'inset 0 0 0 1px rgba(185, 0, 27, 0.1)' // Sharper than a standard border
                    }}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/onboarding"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#ffffff',
                      textDecoration: 'none',
                      backgroundColor: BRAND_RED,
                      borderRadius: '9999px',
                      padding: '0.625rem 1.5rem',
                      transition: 'opacity 0.2s ease',
                      boxShadow: '0 2px 4px rgba(185, 0, 27, 0.2)'
                    }}
                  >
                    Sell on Tokoni
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  style={{
                    background: '#f3f4f6',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    width: '40px', // Slightly larger touch target
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s ease',
                    marginLeft: '0.5rem'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: BRAND_RED,
                    borderRadius: '50%',
                    border: '2px solid #f3f4f6'
                  }}></span>
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Link
                  href="/signin"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#374151',
                    textDecoration: 'none',
                    padding: '0.625rem 1rem',
                    borderRadius: '9999px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#ffffff',
                    textDecoration: 'none',
                    backgroundColor: BRAND_RED,
                    borderRadius: '9999px',
                    padding: '0.625rem 1.5rem',
                    boxShadow: '0 2px 4px rgba(185, 0, 27, 0.2)',
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {user && (
              <button
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  position: 'relative',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: BRAND_RED,
                  borderRadius: '50%',
                  border: '2px solid #ffffff'
                }}></span>
              </button>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                WebkitTapHighlightColor: 'transparent',
                position: 'relative'
              }}
            >
              {/* Using a custom, elegant SVG for the hamburger menu */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="15" y2="18"></line>
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: BRAND_RED,
                  borderRadius: '50%',
                  border: '2px solid #ffffff'
                }} />
              )}
            </button>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {mobile && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeMenu}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(17, 24, 39, 0.4)', // Darker, native-feeling backdrop
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 60,
              opacity: menuOpen ? 1 : 0,
              pointerEvents: menuOpen ? 'auto' : 'none',
              transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />

          {/* Drawer Content */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              width: '65%',
              maxWidth: '360px',
              backgroundColor: '#ffffff',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
              zIndex: 70,
              transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', // Smooth iOS-like spring
              borderTopLeftRadius: '24px',
              borderBottomLeftRadius: '24px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              fontFamily: 'var(--font-body), sans-serif'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ fontWeight: '800', fontSize: '1.0rem', color: '#111827', letterSpacing: '-0.025em', fontFamily: 'var(--font-heading), sans-serif' }}>Menu</div>
              <button
                onClick={closeMenu}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                {/* Replaced <X /> with native SVG to avoid missing imports */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {visibleNavItems.map((link) => {
                const isActive = link.path === '/' ? pathname === '/' : pathname?.startsWith(link.path);
                const color = isActive ? BRAND_RED : '#4b5563';
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    onClick={closeMenu}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '16px',
                      backgroundColor: isActive ? '#fff1f2' : 'transparent',
                      color: color,
                      textDecoration: 'none',
                      fontSize: '0.80rem',
                      fontWeight: isActive ? '700' : '600',
                      transition: 'background-color 0.2s ease',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                  >
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                      {link.icon(color, isActive)}
                      {link.name === 'Messages' && unreadCount > 0 && (
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '10px',
                          backgroundColor: BRAND_RED,
                          color: '#FFF',
                          fontSize: '9px',
                          fontWeight: '700',
                          borderRadius: '50%',
                          minWidth: '15px',
                          height: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 3px',
                          boxSizing: 'border-box'
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {link.name}
                  </Link>
                );
              })}

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '2rem 0 1.5rem 0' }} />

              {/* Auth/User Actions for Mobile */}
              {isAuthLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                  {/* Premium User Card Skeleton inside Drawer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '16px',
                    border: '1px solid #f3f4f6'
                  }}>
                    <div
                      className="skeleton-item"
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%'
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <div className="skeleton-item" style={{ width: '60%', height: '14px', borderRadius: '4px' }} />
                      <div className="skeleton-item" style={{ width: '40%', height: '10px', borderRadius: '4px' }} />
                    </div>
                  </div>

                  <div
                    className="skeleton-item"
                    style={{
                      height: '54px',
                      borderRadius: '9999px',
                      width: '100%'
                    }}
                  />
                  <div
                    className="skeleton-item"
                    style={{
                      height: '54px',
                      borderRadius: '9999px',
                      width: '100%'
                    }}
                  />
                </div>
              ) : user ? (
                <>
                  {/* Premium User Card inside Drawer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '16px',
                    marginBottom: '1.5rem',
                    border: '1px solid #f3f4f6'
                  }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: '700', color: '#4b5563', overflow: 'hidden' }}>
                      {user.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.username?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <div style={{ fontWeight: '700', color: '#111827', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
                      <div style={{ fontSize: '0.65rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                    </div>
                  </div>

                  {user?.isVendor || vendor ? (
                    <Link
                      href="/dashboard"
                      onClick={closeMenu}
                      style={{
                        padding: '12px',
                        borderRadius: '9999px',
                        backgroundColor: '#fff1f2',
                        color: BRAND_RED,
                        textDecoration: 'none',
                        fontWeight: '700',
                        textAlign: 'center',
                        boxShadow: 'inset 0 0 0 1.5px rgba(185, 0, 27, 0.1)',
                        marginBottom: '0.75rem',
                        WebkitTapHighlightColor: 'transparent',
                        fontSize: '0.80rem',
                      }}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/onboarding"
                      onClick={closeMenu}
                      style={{
                        padding: '12px',
                        borderRadius: '9999px',
                        backgroundColor: BRAND_RED,
                        color: '#fff',
                        textDecoration: 'none',
                        fontWeight: '700',
                        textAlign: 'center',
                        marginBottom: '0.75rem',
                        boxShadow: '0 4px 12px rgba(185, 0, 27, 0.2)',
                        WebkitTapHighlightColor: 'transparent',
                        fontSize: '0.80rem',
                      }}
                    >
                      Sell on Tokoni
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); closeMenu(); }}
                    style={{
                      padding: '12px',
                      borderRadius: '9999px',
                      backgroundColor: '#ffffff',
                      color: '#4b5563',
                      border: '1px solid #e5e7eb',
                      fontWeight: '700',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      fontSize: '0.80rem',
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    style={{
                      padding: '12px',
                      borderRadius: '9999px',
                      backgroundColor: BRAND_RED,
                      color: '#fff',
                      textDecoration: 'none',
                      fontWeight: '700',
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(185, 0, 27, 0.2)',
                      WebkitTapHighlightColor: 'transparent',
                      fontSize: '0.80rem',
                    }}
                  >
                    Create an Account
                  </Link>
                  <Link
                    href="/signin"
                    onClick={closeMenu}
                    style={{
                      padding: '12px',
                      borderRadius: '9999px',
                      backgroundColor: '#ffffff',
                      color: '#374151',
                      textDecoration: 'none',
                      fontWeight: '700',
                      textAlign: 'center',
                      border: '1px solid #e5e7eb',
                      WebkitTapHighlightColor: 'transparent',
                      fontSize: '0.80rem',
                    }}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}