'use client';

import { useEffect } from 'react';
import NProgress from 'nprogress';
import { usePathname, useSearchParams } from 'next/navigation';
import '../styles/nprogress.css';

// Configure NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
  showSpinner: false,
});

export default function LoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done(); // Finish any previous loading
    NProgress.start(); // Start new loading
    
    const timer = setTimeout(() => {
      NProgress.done();
    }, 500);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null;
} 