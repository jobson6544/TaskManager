'use client';

import Link from 'next/link';

const WelcomePage = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding with abstract shapes */}
      <div className="bg-dark w-full md:w-1/2 p-8 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl text-white font-bold mt-16">
            Organic<br />Mind
          </h1>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-md h-full">
            {/* Yellow leaf shape top */}
            <div className="absolute top-1/4 left-1/4 w-24 h-32 bg-primary rounded-bl-full rounded-tr-full rotate-45 opacity-90"></div>
            
            {/* White circle */}
            <div className="absolute top-1/3 left-1/2 w-20 h-20 rounded-full border-2 border-white opacity-70"></div>
            
            {/* Orange shape */}
            <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-secondary rounded-full opacity-90"></div>
            
            {/* Swirl line - using a div with border */}
            <div className="absolute top-0 left-0 right-0 bottom-0 border-t-2 border-white opacity-50 rounded-full scale-75 rotate-45"></div>
            
            {/* Yellow shape bottom */}
            <div className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-primary rounded-tl-full rounded-br-full rotate-12 opacity-90"></div>
            
            {/* Small orange dot */}
            <div className="absolute bottom-1/3 left-1/5 w-8 h-8 bg-secondary rounded-full opacity-90"></div>
            
            {/* Small white dots */}
            <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-white rounded-full opacity-90"></div>
            <div className="absolute bottom-1/3 right-1/2 w-3 h-3 bg-white rounded-full opacity-90"></div>
            <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-white rounded-full opacity-90"></div>
          </div>
        </div>
      </div>
      
      {/* Right side - Content */}
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold mb-4">Productive Mind</h2>
          
          <p className="text-gray-600 mb-8">
            With only the features you need, Organic Mind is customized 
            for individuals seeking a stress-free way to stay focused on 
            their goals, projects, and tasks.
          </p>
          
          <Link 
            href="/signup" 
            className="block w-full bg-primary text-dark py-3 text-center rounded-lg font-medium hover:bg-opacity-90 transition-colors mb-4"
          >
            Get Started
          </Link>
          
          <div className="text-center">
            <p className="text-gray-600">
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

export default WelcomePage;