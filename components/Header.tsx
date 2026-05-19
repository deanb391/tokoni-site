"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import logoImg from "@/assets/images/tokoni_logo.png";
import { useUser } from '@/context/UserContext';
import { account } from '@/lib/services/auth.service';
import { Menu, X } from 'lucide-react';

const BRAND_RED = "#B9001B";

export default function Header() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, vendor, refreshUser } = useUser();

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
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: mobile ? '0 1.25rem' : '0 4rem',
          height: '70px',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderBottom: '1px solid #f0f0f0',
          boxSizing: 'border-box',
          boxShadow: mobile ? 'none' : '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image 
            src={logoImg} 
            alt="Tokoni Logo" 
            height={mobile ? 28 : 32} 
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
                    gap: '6px',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? '600' : '500',
                    color: color,
                    textDecoration: 'none',
                    height: '100%',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {link.icon(color, isActive)}
                  {link.name}
                  {/* Active Indicator Line */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      backgroundColor: BRAND_RED,
                      borderTopLeftRadius: '3px',
                      borderTopRightRadius: '3px'
                    }} />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Actions */}
        {!mobile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {user ? (
              <>
                {user?.isVendor || vendor ? (
                  <Link
                    href="/dashboard"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: BRAND_RED,
                      textDecoration: 'none',
                      border: `1.5px solid ${BRAND_RED}`,
                      borderRadius: '999px',
                      padding: '0.5rem 1.25rem',
                      backgroundColor: '#fff1f2',
                      transition: 'all 0.2s ease'
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
                      borderRadius: '999px',
                      padding: '0.5rem 1.25rem',
                      transition: 'opacity 0.2s ease'
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
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link
                  href="/signin"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#4b5563',
                    textDecoration: 'none',
                    padding: '0.5rem'
                  }}
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
                    borderRadius: '999px',
                    padding: '0.5rem 1.25rem',
                    boxShadow: '0 2px 4px rgba(185, 0, 27, 0.2)'
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Notification Icon for Mobile (optional, but good for UX) */}
            {user && (
               <button 
                 style={{ 
                   background: '#f3f4f6', 
                   border: 'none', 
                   cursor: 'pointer', 
                   position: 'relative', 
                   width: '36px',
                   height: '36px',
                   borderRadius: '50%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center'
                 }}
               >
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2">
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
            )}
            <button 
              onClick={() => setMenuOpen(true)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.25rem'
              }}
            >
              <Menu size={28} color="#1f2937" />
            </button>
          </div>
        )}
      </header>

      {/* Mobile Drawer (Escaping the header's backdrop-filter containing block!) */}
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
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 60,
              opacity: menuOpen ? 1 : 0,
              pointerEvents: menuOpen ? 'auto' : 'none',
              transition: 'opacity 0.3s ease'
            }}
          />

          {/* Drawer Content */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              width: '85%',
              maxWidth: '320px',
              backgroundColor: '#fff',
              boxShadow: '-4px 0 25px rgba(0,0,0,0.1)',
              zIndex: 70,
              transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#1f2937' }}>Menu</div>
              <button onClick={closeMenu} style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} color="#4b5563" />
              </button>
            </div>
            
            {/* Menu Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: isActive ? '#fff1f2' : 'transparent',
                      color: color,
                      textDecoration: 'none',
                      fontSize: '1.05rem',
                      fontWeight: isActive ? '600' : '500',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {link.icon(color, isActive)}
                    {link.name}
                  </Link>
                );
              })}

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '1.5rem 0' }} />

              {/* Auth/User Actions for Mobile */}
              {user ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '1.5rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '600', color: '#4b5563', overflow: 'hidden' }}>
                       {user.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '1rem' }}>{user.username}</div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{user.email}</div>
                    </div>
                  </div>

                  {user?.isVendor || vendor ? (
                    <Link
                      href="/dashboard"
                      onClick={closeMenu}
                      style={{
                        padding: '14px',
                        borderRadius: '999px',
                        backgroundColor: '#fff1f2',
                        color: BRAND_RED,
                        textDecoration: 'none',
                        fontWeight: '600',
                        textAlign: 'center',
                        border: `1.5px solid ${BRAND_RED}`,
                        marginBottom: '0.75rem'
                      }}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/onboarding"
                      onClick={closeMenu}
                      style={{
                        padding: '14px',
                        borderRadius: '999px',
                        backgroundColor: BRAND_RED,
                        color: '#fff',
                        textDecoration: 'none',
                        fontWeight: '600',
                        textAlign: 'center',
                        marginBottom: '0.75rem'
                      }}
                    >
                      Sell on Tokoni
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); closeMenu(); }}
                    style={{
                      padding: '14px',
                      borderRadius: '999px',
                      backgroundColor: '#f3f4f6',
                      color: '#4b5563',
                      border: 'none',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    onClick={closeMenu}
                    style={{
                      padding: '14px',
                      borderRadius: '999px',
                      backgroundColor: '#f3f4f6',
                      color: '#4b5563',
                      textDecoration: 'none',
                      fontWeight: '600',
                      textAlign: 'center',
                      marginBottom: '0.75rem'
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    style={{
                      padding: '14px',
                      borderRadius: '999px',
                      backgroundColor: BRAND_RED,
                      color: '#fff',
                      textDecoration: 'none',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}