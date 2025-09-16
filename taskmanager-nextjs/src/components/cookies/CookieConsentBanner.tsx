'use client';

import { useState, useEffect } from 'react';
import { 
  getCookieConsentStatus, 
  saveCookieConsent, 
  clearNonEssentialCookies,
  type CookieConsent 
} from '@/utils/cookies';

interface CookieConsentBannerProps {
  onConsentChange?: (consent: CookieConsent) => void;
}

export default function CookieConsentBanner({ onConsentChange }: CookieConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
    preferences: true, // Default to true for better UX
  });

  useEffect(() => {
    const { hasConsented, needsUpdate } = getCookieConsentStatus();
    
    if (!hasConsented || needsUpdate) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    
    saveCookieConsent(fullConsent);
    setShowBanner(false);
    onConsentChange?.(fullConsent as CookieConsent);
  };

  const handleAcceptSelected = () => {
    saveCookieConsent(consent);
    setShowBanner(false);
    onConsentChange?.(consent as CookieConsent);
    
    // Clear cookies that are no longer consented to
    clearNonEssentialCookies();
  };

  const handleRejectAll = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    
    saveCookieConsent(minimalConsent);
    setShowBanner(false);
    onConsentChange?.(minimalConsent as CookieConsent);
    
    // Clear all non-essential cookies
    clearNonEssentialCookies();
  };

  const handleConsentChange = (category: keyof typeof consent, value: boolean) => {
    if (category === 'necessary') return; // Cannot be disabled
    
    setConsent(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            🍪 Cookie Preferences
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            We use cookies to enhance your experience, analyze site usage, and assist in marketing efforts. 
            Choose which cookies you'd like to accept.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showDetails ? (
            /* Simplified View */
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We respect your privacy. You can accept all cookies, customize your preferences, 
                or use only essential cookies required for basic functionality.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  What cookies do we use?
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• <strong>Essential:</strong> Required for basic site functionality</li>
                  <li>• <strong>Preferences:</strong> Remember your settings and preferences</li>
                  <li>• <strong>Analytics:</strong> Help us understand how you use our site</li>
                  <li>• <strong>Marketing:</strong> Used to show relevant content (disabled by default)</li>
                </ul>
              </div>

              <button
                onClick={() => setShowDetails(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Customize cookie preferences →
              </button>
            </div>
          ) : (
            /* Detailed View */
            <div className="space-y-6">
              <button
                onClick={() => setShowDetails(false)}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                ← Back to simple view
              </button>

              {/* Necessary Cookies */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Essential Cookies
                  </h3>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Always On</span>
                    <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end p-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These cookies are necessary for the website to function and cannot be disabled. 
                  They include authentication, security, and basic functionality cookies.
                </p>
              </div>

              {/* Preferences Cookies */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Preference Cookies
                  </h3>
                  <button
                    onClick={() => handleConsentChange('preferences', !consent.preferences)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors ${
                      consent.preferences ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      consent.preferences ? 'translate-x-4' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These cookies remember your settings and preferences, such as theme choice, 
                  language, and notification preferences to provide a personalized experience.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Analytics Cookies
                  </h3>
                  <button
                    onClick={() => handleConsentChange('analytics', !consent.analytics)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors ${
                      consent.analytics ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      consent.analytics ? 'translate-x-4' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These cookies help us understand how visitors interact with our website by 
                  collecting anonymous information about usage patterns and performance.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Marketing Cookies
                  </h3>
                  <button
                    onClick={() => handleConsentChange('marketing', !consent.marketing)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors ${
                      consent.marketing ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      consent.marketing ? 'translate-x-4' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  These cookies are used to track visitors and display relevant advertisements. 
                  Currently not used but may be implemented for future features.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRejectAll}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              Use Essential Only
            </button>
            
            {showDetails && (
              <button
                onClick={handleAcceptSelected}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </button>
            )}
            
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1 sm:flex-initial"
            >
              Accept All Cookies
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            You can change these settings anytime in your account preferences. 
            By continuing to use our site, you agree to our{' '}
            <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}