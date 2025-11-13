'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin page
    router.replace('/admin');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen" style={{backgroundColor: '#F0F9FF'}}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>
  );
}
