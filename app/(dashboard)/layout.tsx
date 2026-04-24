'use client';

import SidebarLayout from '@/components/SidebarLayout';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      router.push('/login');
    }
  }, [router]);

  const isAuthenticated = typeof window !== 'undefined' ? sessionStorage.getItem('isAuthenticated') === 'true' : false;

  if (!isAuthenticated) {
    return null;
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}