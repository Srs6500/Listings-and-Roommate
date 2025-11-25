'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNavigation = (path: string) => {
    if (isMounted) {
      router.push(path);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <Navigation />
      <main className="flex-grow">
        {/* Hero Section - Blaxel Style */}
        <div className="relative overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
          {/* Modern geometric pattern overlay instead of property image */}
          <div className="absolute inset-0 opacity-10">
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(135deg, var(--accent-primary) 0%, transparent 50%),
                  linear-gradient(225deg, var(--accent-hover) 0%, transparent 50%),
                  radial-gradient(circle at 20% 50%, var(--accent-light) 0%, transparent 50%),
                  radial-gradient(circle at 80% 50%, var(--accent-light) 0%, transparent 50%)
                `
              }}
            ></div>
          </div>
          
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0" style={{ 
            background: 'linear-gradient(to bottom, transparent 0%, var(--background) 100%)'
          }}></div>
          
          {/* Animated accent dots */}
          <div className="absolute top-20 left-10 w-2 h-2 rounded-full opacity-30 animate-pulse" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
          <div className="absolute top-40 right-20 w-3 h-3 rounded-full opacity-20 animate-pulse delay-1000" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
          <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 rounded-full opacity-25 animate-pulse delay-2000" style={{ backgroundColor: 'var(--accent-primary)' }}></div>
          
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <div className="text-center">
              <div 
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8 border"
                style={{ 
                  backgroundColor: 'var(--surface-primary)', 
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-secondary)'
                }}
              >
                <span 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                ></span>
                Powered by Blockchain Technology
              </div>
              
              <h1 
                className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6"
                style={{ color: 'var(--text-primary)' }}
              >
                Find Your Perfect
                <br />
                <span style={{ color: 'var(--accent-primary)' }}>Property</span>
              </h1>
              
              <p 
                className="mt-6 text-xl max-w-3xl mx-auto leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Discover your dream home with our blockchain-powered platform. Secure payments, transparent transactions, and verified listings in New York and New Jersey.
              </p>
              
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => handleNavigation(user ? '/listings' : '/auth/signin')}
                  className="group inline-flex items-center justify-center px-12 py-4 text-lg font-semibold rounded-lg transition-all duration-200 hover:scale-105"
                  style={{ 
                    backgroundColor: 'var(--accent-primary)', 
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
                >
                  <span>Browse Properties</span>
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
              
              {/* Stats */}
              <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>500+</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Properties Listed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>$2.5M+</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Secure Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>99.9%</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section - Blaxel Dark Theme */}
        <div 
          className="py-20 relative"
          style={{ backgroundColor: 'var(--surface-primary)' }}
        >
          {/* Subtle top border for separation */}
          <div 
            className="absolute top-0 left-0 right-0 h-px"
            style={{ 
              background: 'linear-gradient(to right, transparent, var(--border-default), transparent)'
            }}
          ></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div 
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 border"
                style={{ 
                  backgroundColor: 'var(--surface-secondary)', 
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-secondary)'
                }}
              >
                <span 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                ></span>
                How It Works
              </div>
              <h2 
                className="text-4xl font-bold sm:text-5xl mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                Find Your Perfect Home with
                <span style={{ color: 'var(--accent-primary)' }}> Blockchain Technology</span>
              </h2>
              <p 
                className="text-xl max-w-3xl mx-auto"
                style={{ color: 'var(--text-secondary)' }}
              >
                Our platform combines traditional real estate with cutting-edge blockchain technology for secure, transparent transactions.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 - Connect Wallet & Sign In */}
              <div 
                className="group relative rounded-lg p-8 border transition-all duration-300 hover:scale-105"
                style={{ 
                  backgroundColor: 'var(--surface-secondary)', 
                  borderColor: 'var(--border-default)'
                }}
              >
                <div className="absolute -top-4 left-8">
                  <div 
                    className="flex items-center justify-center h-16 w-16 rounded-lg font-bold text-xl"
                    style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}
                  >
                    1
                  </div>
                </div>
                <div className="pt-8">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-colors duration-300"
                    style={{ backgroundColor: 'var(--accent-light)' }}
                  >
                    <svg className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Connect Wallet & Sign In</h3>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Sign in with your university email (.edu) and connect your MetaMask wallet for secure, blockchain-powered property browsing.</p>
                  <div className="flex items-center text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                    <span>University Students Only</span>
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Step 2 - Browse Properties */}
              <div 
                className="group relative rounded-lg p-8 border transition-all duration-300 hover:scale-105"
                style={{ 
                  backgroundColor: 'var(--surface-secondary)', 
                  borderColor: 'var(--border-default)'
                }}
              >
                <div className="absolute -top-4 left-8">
                  <div 
                    className="flex items-center justify-center h-16 w-16 rounded-lg font-bold text-xl"
                    style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}
                  >
                    2
                  </div>
                </div>
                <div className="pt-8">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-colors duration-300"
                    style={{ backgroundColor: 'var(--accent-light)' }}
                  >
                    <svg className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Browse & Discover</h3>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Explore verified properties with detailed information, high-quality photos, and transparent pricing in New York and New Jersey.</p>
                  <div className="flex items-center text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                    <span>Verified Listings</span>
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div 
                className="group relative rounded-lg p-8 border transition-all duration-300 hover:scale-105"
                style={{ 
                  backgroundColor: 'var(--surface-secondary)', 
                  borderColor: 'var(--border-default)'
                }}
              >
                <div className="absolute -top-4 left-8">
                  <div 
                    className="flex items-center justify-center h-16 w-16 rounded-lg font-bold text-xl"
                    style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}
                  >
                    3
                  </div>
                </div>
                <div className="pt-8">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 transition-colors duration-300"
                    style={{ backgroundColor: 'var(--accent-light)' }}
                  >
                    <svg className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Secure Payment</h3>
                  <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Make secure payments using cryptocurrency with smart contracts. All transactions are transparent and immutable on the blockchain.</p>
                  <div className="flex items-center text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
                    <span>Smart Contracts</span>
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
