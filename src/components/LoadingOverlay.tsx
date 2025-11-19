'use client';

import { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message: string;
  type?: 'signin' | 'signout';
}

export default function LoadingOverlay({ isVisible, message, type = 'signout' }: LoadingOverlayProps) {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowOverlay(true);
    } else {
      // Add delay before hiding for smooth transition
      const timer = setTimeout(() => {
        setShowOverlay(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!showOverlay) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-white" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
        {/* Animated Dots Spinner - Okta Style */}
        <div className="relative">
          <div className="w-20 h-20 relative">
            {/* Outer ring of dots - more subtle animation */}
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="absolute w-1.5 h-1.5 bg-blue-600 rounded-full"
                style={{
                  transform: `rotate(${i * 30}deg) translateY(-32px)`,
                  opacity: 0.3,
                  animation: `pulse 2s ease-in-out ${i * 0.15}s infinite`
                }}
              />
            ))}
            
            {/* Inner spinning circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {message}
          </h2>
        </div>

        {/* Brand/Logo area */}
        <div className="absolute bottom-8 right-8">
          <div className="text-gray-400 text-sm font-medium">
            PropertyFinder
          </div>
        </div>
      </div>
    </div>
  );
}
