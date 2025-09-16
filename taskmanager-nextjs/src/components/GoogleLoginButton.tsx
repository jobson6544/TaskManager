'use client';

import { useEffect, useRef } from 'react';
import useAuthStore from '@/store/useAuthStore';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              type?: 'standard' | 'icon';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: string;
              logo_alignment?: 'left' | 'center';
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  size?: 'large' | 'medium' | 'small';
}

export default function GoogleLoginButton({ 
  onSuccess, 
  text = 'signin_with',
  size = 'large' 
}: GoogleLoginButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { googleAuth } = useAuthStore();

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id';

  useEffect(() => {
    if (!window.google || !buttonRef.current) return;

    const initializeGoogleSignIn = () => {
      window.google!.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google!.accounts.id.renderButton(buttonRef.current!, {
        theme: 'outline',
        size: size,
        type: 'standard',
        text: text,
        shape: 'rectangular',
        width: '100%',
        logo_alignment: 'left',
      });
    };

    // Check if Google Identity Services is loaded
    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
    } else {
      // Wait for the script to load
      const checkGoogleLoaded = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkGoogleLoaded);
          initializeGoogleSignIn();
        }
      }, 100);

      return () => clearInterval(checkGoogleLoaded);
    }
  }, [GOOGLE_CLIENT_ID, text, size]); // handleCredentialResponse is stable, doesn't need to be in deps

  const handleCredentialResponse = async (response: { credential: string }) => {
    try {
      // Decode the JWT token to get user info
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      console.log('Google login payload:', payload);

      // Extract user information
      const googleUserData = {
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        profilePictureUrl: payload.picture,
      };

      console.log('Attempting Google login with:', googleUserData);

      // Call the auth store Google login function
      const success = await googleAuth(googleUserData);
      
      if (success) {
        console.log('Google login successful');
        onSuccess?.();
      } else {
        console.error('Google login failed');
      }
    } catch (error) {
      console.error('Error processing Google credential response:', error);
    }
  };

  return (
    <div className="w-full">
      <div ref={buttonRef} className="w-full" />
    </div>
  );
}