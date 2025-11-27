"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function Home() {
  const { currentUser, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        if (currentUser.role === 'doctor') {
          router.push('/analyze-disease');
        } else {
          router.push('/patient-management');
        }
      } else {
        router.push('/login');
      }
    }
  }, [currentUser, loading, router]);

  return <div>Loading...</div>;
}
