'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAccess() {
  const router = useRouter();
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const SECRET_SEQUENCE = ['1', '2', '3', '4']; // Ctrl+1234

  useEffect(() => {
    // SOC unlock code disabled for demo - Admin button now visible in navigation
    return;

    // Disabled code below:
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Ctrl (or Cmd on Mac) is pressed
      if (event.ctrlKey || event.metaKey) {
        // Only capture number keys
        if (['1', '2', '3', '4'].includes(event.key)) {
          event.preventDefault();

          setKeySequence((prev) => {
            const newSequence = [...prev, event.key];

            // Keep only last 4 keys
            if (newSequence.length > 4) {
              newSequence.shift();
            }

            // Check if sequence matches
            if (newSequence.join('') === SECRET_SEQUENCE.join('')) {
              console.log('Admin access granted!');

              // Defer navigation to avoid updating during render
              setTimeout(() => {
                router.push('/admin');
              }, 0);

              return [];
            }

            return newSequence;
          });

          // Reset sequence after 2 seconds of inactivity
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            setKeySequence([]);
          }, 2000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [router]);
}
