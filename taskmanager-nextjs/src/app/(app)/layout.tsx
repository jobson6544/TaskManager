'use client';

import { useEffect, useState } from 'react';
import { useInitializeData } from '@/hooks/useInitializeData';
import CookieConsentBanner from '@/components/cookies/CookieConsentBanner';
import { getCookieConsent } from '@/utils/cookies';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  // Initialize data from API when app starts
  useInitializeData();
  
  // Check if cookie consent has been given
  useEffect(() => {
    const consent = getCookieConsent();
    if (!consent) {
      setShowCookieBanner(true);
    }
  }, []);

  return (
    <div className="min-h-full bg-gray-100 dark:bg-gray-900">
      {children}
      
      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <CookieConsentBanner
          onConsentChange={() => {
            setShowCookieBanner(false);
          }}
        />
      )}
    </div>
  );
}