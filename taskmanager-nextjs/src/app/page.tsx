'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('organic-mind-auth') === 'true';
    
    // Redirect based on authentication status
    if (isAuthenticated) {
      router.push('/today');
    } else {
      router.push('/welcome');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Organic Mind
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait...
        </p>
      </div>
    </div>
  );
}
