'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import useAuthStore from '@/store/useAuthStore';
import GoogleLoginButton from '@/components/GoogleLoginButton';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { register, loading, error, clearError, isAuthenticated } = useAuthStore();
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
  }, [name, email, password, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    // Client-side validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      setLocalError('All fields are required');
      return;
    }
    
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }
    
    // Attempt registration
    const success = await register({ name: name.trim(), email: email.trim(), password });
    
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
      
      {/* Right side - Signup form */}
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Productive Mind</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              With only the features you need, Organic Mind is customized for individuals seeking a stress-free way to stay focused on their goals, projects, and tasks.
            </p>
          </div>
          
          {displayError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {displayError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
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
              {loading ? 'Creating Account...' : 'Get Started'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">or</p>
          </div>
          
          <div className="mt-4">
            <GoogleLoginButton 
              onSuccess={() => router.push('/today')}
              text="signup_with"
              size="large"
            />
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;