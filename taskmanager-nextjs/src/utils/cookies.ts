/**
 * Cookie management utilities with GDPR compliance
 */

export interface CookieOptions {
  expires?: Date | number;
  maxAge?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: Date;
  version: string;
}

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_CONSENT_VERSION = '1.0';

/**
 * Set a cookie with proper options
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    if (typeof options.expires === 'number') {
      const expires = new Date();
      expires.setTime(expires.getTime() + options.expires * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${expires.toUTCString()}`;
    } else {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
  }

  if (options.maxAge) {
    cookieString += `; max-age=${options.maxAge}`;
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.path) {
    cookieString += `; path=${options.path}`;
  } else {
    cookieString += `; path=/`;
  }

  if (options.secure) {
    cookieString += `; secure`;
  }

  if (options.httpOnly) {
    cookieString += `; httponly`;
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string, options: Pick<CookieOptions, 'domain' | 'path'> = {}): void {
  setCookie(name, '', {
    ...options,
    expires: new Date(0),
  });
}

/**
 * Get all cookies as an object
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {};

  const cookies: Record<string, string> = {};
  const cookieArray = document.cookie.split(';');

  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    const [name, value] = cookie.split('=');
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  }

  return cookies;
}

/**
 * Check if cookies are enabled
 */
export function areCookiesEnabled(): boolean {
  if (typeof document === 'undefined') return false;

  try {
    const testCookie = 'cookietest';
    setCookie(testCookie, '1');
    const result = getCookie(testCookie) === '1';
    deleteCookie(testCookie);
    return result;
  } catch {
    return false;
  }
}

/**
 * Save cookie consent preferences
 */
export function saveCookieConsent(consent: Omit<CookieConsent, 'timestamp' | 'version'>): void {
  const consentData: CookieConsent = {
    ...consent,
    timestamp: new Date(),
    version: COOKIE_CONSENT_VERSION,
  };

  setCookie(COOKIE_CONSENT_KEY, JSON.stringify(consentData), {
    expires: 365, // 1 year
    secure: window.location.protocol === 'https:',
    sameSite: 'lax',
  });
}

/**
 * Get cookie consent preferences
 */
export function getCookieConsent(): CookieConsent | null {
  const consentString = getCookie(COOKIE_CONSENT_KEY);
  
  if (!consentString) return null;

  try {
    const consent = JSON.parse(consentString) as CookieConsent;
    
    // Check if consent is still valid (version match)
    if (consent.version !== COOKIE_CONSENT_VERSION) {
      return null;
    }

    // Convert timestamp string back to Date object
    consent.timestamp = new Date(consent.timestamp);
    
    return consent;
  } catch {
    return null;
  }
}

/**
 * Check if user has given consent for a specific cookie category
 */
export function hasConsentFor(category: keyof Omit<CookieConsent, 'timestamp' | 'version'>): boolean {
  const consent = getCookieConsent();
  
  if (!consent) return false;
  
  return consent[category];
}

/**
 * Clear all non-necessary cookies if consent is withdrawn
 */
export function clearNonEssentialCookies(): void {
  const consent = getCookieConsent();
  const allCookies = getAllCookies();

  // Define essential cookies that should never be deleted
  const essentialCookies = [
    COOKIE_CONSENT_KEY,
    'organic-mind-auth', // Authentication token
    'theme-preference', // Theme setting
  ];

  for (const cookieName of Object.keys(allCookies)) {
    if (!essentialCookies.includes(cookieName)) {
      // Check if we have consent for this type of cookie
      let shouldDelete = true;

      // Analytics cookies
      if (cookieName.startsWith('_ga') || cookieName.startsWith('_gid') || cookieName.includes('analytics')) {
        shouldDelete = !consent?.analytics;
      }
      // Marketing cookies
      else if (cookieName.includes('marketing') || cookieName.includes('ads') || cookieName.includes('tracking')) {
        shouldDelete = !consent?.marketing;
      }
      // Preference cookies
      else if (cookieName.includes('preference') || cookieName.includes('settings')) {
        shouldDelete = !consent?.preferences;
      }

      if (shouldDelete) {
        deleteCookie(cookieName);
      }
    }
  }
}

/**
 * Get cookie consent status for display
 */
export function getCookieConsentStatus(): {
  hasConsented: boolean;
  needsUpdate: boolean;
  consent: CookieConsent | null;
} {
  const consent = getCookieConsent();
  
  return {
    hasConsented: consent !== null,
    needsUpdate: consent?.version !== COOKIE_CONSENT_VERSION,
    consent,
  };
}