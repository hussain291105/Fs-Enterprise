'use client';

import SidebarLayout from '@/components/SidebarLayout';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setMounted(true);
    const auth = sessionStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(auth);
    
    if (!auth) {
      router.push('/login');
    }
  }, [router]);

  if (!mounted) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}