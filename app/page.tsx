'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null;
}
