"use client";

import React, { useState, useEffect } from 'react';

const BRAND_RED = "#B9001B";

export default function ProductExploreScreen() {
  const [activeCategory, setActiveCategory] = useState('All Categories');
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

  const categories = ['All Categories', 'Fashion', 'Electronics', 'Home & Garden', 'Beauty', 'Sports'];

  const products = [
    {
      id: 1,
      name: 'Aero Glide Performance',
      price: '$189',
      tag: 'New Arrival',
      desc: 'Lightweight performance sneakers with responsive cushioning, perfect for running.',
      location: 'New York, NY',
      imgBackground: '#F3F4F6', // Softer, premium gray
      element: (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '140px', height: '70px', backgroundColor: '#e11d48', borderRadius: '40px 80px 30px 40px', transform: 'rotate(-15deg)', boxShadow: '0 15px 25px rgba(225, 29, 72, 0.2)' }}></div>
          <div style={{ position: 'absolute', width: '130px', height: '65px', backgroundColor: BRAND_RED, borderRadius: '40px 80px 30px 40px', transform: 'rotate(-10deg) translate(-10px, -5px)' }}></div>
        </div>
      )
    },
    {
      id: 2,
      name: 'Chrono Series Smartwatch',
      price: '$299',
      tag: null,
      desc: 'Advanced fitness tracking with an always-on retina display and premium ceramic finish.',
      location: 'Los Angeles, CA',
      imgBackground: '#E5E7EB',
      element: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '12px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'relative' }}>
            <div style={{ width: '6px', height: '30px', backgroundColor: '#FFFFFF', position: 'absolute', transform: 'rotate(30deg)', transformOrigin: 'bottom center', bottom: '50px', borderRadius: '4px' }}></div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      name: 'Sonic Quiet Headphones',
      price: '$349',
      oldPrice: '$410',
      tag: '15% OFF',
      tagColor: '#ffffff',
      tagBg: BRAND_RED,
      desc: 'Industry-leading noise cancellation with plush ear pads and ultra-clear audio drivers.',
      location: 'Chicago, IL',
      imgBackground: '#F3F4F6',
      element: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ width: '110px', height: '110px', border: '14px solid #1f2937', borderRadius: '50%', borderBottomColor: 'transparent', position: 'relative' }}>
            <div style={{ width: '35px', height: '55px', backgroundColor: '#1f2937', borderRadius: '12px', position: 'absolute', left: '-20px', bottom: '-10px' }}></div>
            <div style={{ width: '35px', height: '55px', backgroundColor: '#1f2937', borderRadius: '12px', position: 'absolute', right: '-20px', bottom: '-10px' }}></div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      name: 'Retro Snap 90 Camera',
      price: '$120',
      tag: null,
      desc: 'Classic instant film camera refurbished to perfect working condition. Includes film packs.',
      location: 'Austin, TX',
      imgBackground: '#E5E7EB',
      element: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ width: '130px', height: '85px', backgroundColor: '#374151', borderRadius: '12px', position: 'relative', padding: '10px', boxSizing: 'border-box', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '25px', height: '12px', backgroundColor: '#f9fafb', position: 'absolute', top: '12px', right: '15px', borderRadius: '2px' }}></div>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '6px solid #6b7280', backgroundColor: '#111827', margin: '10px auto 0 auto' }}></div>
          </div>
        </div>
      )
    }
  ];

  // Render normally on server and client to support progressive enhancement

  return (
    <main
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: mobile ? '1.5rem 1rem 5rem 1rem' : '3rem 4rem',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>

        {/* Title and Controls Flex Row */}
        <div
          style={{
            display: 'flex',
            flexDirection: mobile ? 'column' : 'row',
            gap: '1.5rem',
            justifyContent: 'space-between',
            alignItems: mobile ? 'stretch' : 'flex-end',
            marginBottom: '2rem'
          }}
        >
          <div>
            <h1 style={{ fontSize: mobile ? '2rem' : '2.5rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: '#111827', letterSpacing: '-0.025em' }}>
              Explore Products
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0 }}>
              Discover premium goods from curated sellers.
            </p>
          </div>

          {/* Action Functional Buttons */}
          <div
            style={{
              display: mobile ? 'grid' : 'flex',
              gridTemplateColumns: mobile ? '1fr 1fr' : 'auto auto',
              gap: '0.75rem',
              alignItems: 'center'
            }}
          >
            {/* Filter Button */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '9999px',
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
              Filters
            </button>

            {/* Sort Dropdown Button */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '9999px',
                padding: '0.625rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#111827',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Sort: Recommended
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </div>

        {/* Categories Horizontal Selection Ribbon */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE
          }}
        >
          {/* Hide Webkit Scrollbar using a global style trick or just let the container hide it */}
          {categories.map((cat) => {
            const isSelected = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  backgroundColor: isSelected ? BRAND_RED : '#f9fafb',
                  color: isSelected ? '#ffffff' : '#4b5563',
                  border: isSelected ? `1px solid ${BRAND_RED}` : '1px solid #e5e7eb',
                  borderRadius: '9999px',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 6px -1px rgba(185, 0, 27, 0.1)' : 'none'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* RESPONSIVE DYNAMIC PRODUCT GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '4rem'
          }}
        >
          {products.map((prod) => (
            <div
              key={prod.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                backgroundColor: '#ffffff',
                border: '1px solid #f3f4f6',
                borderRadius: '1.25rem',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
            >
              {/* Image Wrapper */}
              <div
                style={{
                  backgroundColor: prod.imgBackground || '#F3F4F6',
                  height: '240px',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid #f3f4f6'
                }}
              >
                <div style={{ transform: 'scale(0.9)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {prod.element}
                </div>

                {/* Favorite Button */}
                <button
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: '#ffffff',
                    border: 'none',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={prod.id === 3 ? BRAND_RED : "none"} stroke={prod.id === 3 ? BRAND_RED : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>

                {/* Conditional Badge */}
                {prod.tag && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      backgroundColor: prod.tagBg || '#ffffff',
                      color: prod.tagColor || '#111827',
                      fontSize: '0.625rem',
                      fontWeight: '800',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    {prod.tag}
                  </span>
                )}
              </div>

              {/* Card Content Wrapper */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>

                {/* Title & Price */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0, color: '#111827', lineHeight: 1.3 }}>
                    {prod.name}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: '800', color: BRAND_RED }}>
                      {prod.price}
                    </span>
                    {prod.oldPrice && (
                      <span style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#9ca3af', fontWeight: '600' }}>
                        {prod.oldPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  lineHeight: '1.5',
                  margin: '0 0 1.25rem 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {prod.desc}
                </p>

                {/* Footer: Location & Add Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#9ca3af' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{prod.location}</span>
                  </div>

                  <button
                    style={{
                      backgroundColor: '#111827', // Darker, premium button color
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '9999px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM PAGINATION */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              color: '#374151',
              borderRadius: '9999px',
              padding: '0.875rem 2.5rem',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease'
            }}
          >
            Load More Products
          </button>
        </div>

      </div>
    </main>
  );
}