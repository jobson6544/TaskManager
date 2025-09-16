'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import useAuthStore from '@/store/useAuthStore';
import GoogleLoginButton from '@/components/GoogleLoginButton';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { login, loading, error, clearError, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/today');
    }
  }, [isAuthenticated, router]);

  // Clear errors when component mounts or fields change
  useEffect(() => {
    clearError();
    setLocalError('');
  }, [email, password, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    // Client-side validation
    if (!email.trim() || !password.trim()) {
      setLocalError('Email and password are required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    
    // Attempt login
    const success = await login({ email: email.trim(), password });
    
    if (success) {
      router.push('/today');
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="bg-dark w-full md:w-1/2 p-8 flex flex-col justify-between">
        <div className="mb-auto">
          <h1 className="text-3xl text-white font-bold mt-16">Organic Mind</h1>
        </div>
        
        <div className="relative">
          {/* Abstract shapes */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-primary rounded-full opacity-80"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary rounded-full opacity-80"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-white rounded-full opacity-20"></div>
          <div className="h-64 relative z-10"></div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Sign in</h2>
          </div>
          
          {displayError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {displayError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="email"
                placeholder="email.email@mail.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            
            <button
              type="submit"
              className="w-full bg-primary text-dark py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors dark:hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign in'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">or</p>
          </div>
          
          <div className="mt-4">
            <GoogleLoginButton 
              onSuccess={() => router.push('/today')}
              text="signin_with"
              size="large"
            />
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;