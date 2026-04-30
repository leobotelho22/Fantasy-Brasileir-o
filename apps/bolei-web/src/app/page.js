'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';

export default function RootPage() {
  const isLoggedIn = useStore(s => s.isLoggedIn);
  const router = useRouter();

  useEffect(() => {
    router.replace(isLoggedIn ? '/dashboard' : '/login');
  }, [isLoggedIn, router]);

  return <div className="min-h-screen bg-bg" />;
}
