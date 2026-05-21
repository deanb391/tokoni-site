"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide Header and Footer on login/signup flows
  const hideLayout = pathname?.startsWith('/signin') || pathname?.startsWith('/signup');
  const hideFooter = hideLayout || pathname?.startsWith('/chats');

  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div style={{ paddingTop: '72px' }}>
        {children}
      </div>
      {!hideFooter && <Footer />}
    </>
  );
}
