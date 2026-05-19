"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import logoImg from "@/assets/images/tokoni_logo.png";

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Track window size for responsive inline styles
  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Avoid hydration mismatch by waiting for mount
  const mobile = mounted ? isMobile : false;

  return (
    <footer
      style={{
        borderTop: '1px solid #f3f4f6',
        padding: mobile ? '3rem 1.5rem' : '4rem 6rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginTop: 'auto',
        gap: '2rem'
      }}
    >
      {/* Top Part: Logo and Tagline */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <Image 
          src={logoImg} 
          alt="Tokoni Logo" 
          height={28} 
          style={{ objectFit: 'contain', width: 'auto' }} 
          priority 
        />
        <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, fontWeight: '500', textAlign: 'center' }}>
          Discover curated premium goods from handpicked creators.
        </p>
      </div>

      {/* Divider */}
      <div style={{ width: '100%', height: '1px', backgroundColor: '#f3f4f6', maxWidth: '400px' }} />

      {/* Navigation Links */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: mobile ? '1rem 1.5rem' : '2.5rem',
          justifyContent: 'center',
          maxWidth: mobile ? '280px' : 'none'
        }}
      >
        {['About', 'Privacy Policy', 'Terms of Service', 'Help Center', 'Vendor Portal'].map((footLink) => (
          <a
            key={footLink}
            href="#"
            style={{
              fontSize: '13px',
              color: '#4b5563',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {footLink}
          </a>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: '100%', height: '1px', backgroundColor: '#f3f4f6' }} />

      {/* Copyright */}
      <span
        style={{
          fontSize: '12px',
          color: '#9ca3af',
          textAlign: 'center',
          fontWeight: '400'
        }}
      >
        © 2026 Tokoni. All rights reserved.
      </span>
    </footer>
  );
}