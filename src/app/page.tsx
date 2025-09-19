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
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow">
        {/* Hero Section with Quote */}
        <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
          <div className="absolute inset-0">
            <img
              className="w-full h-full object-cover opacity-20"
              src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
              alt="Beautiful home exterior"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
          
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Powered by Blockchain Technology
              </div>
              
              <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Find Your Perfect
                </span>
                <br />
                <span className="text-white">Property</span>
              </h1>
              
              <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Discover your dream home with our blockchain-powered platform. Secure payments, transparent transactions, and verified listings in New York and New Jersey.
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleNavigation(user ? '/listings' : '/auth/signin')}
                  className="group inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl text-blue-700 bg-white hover:bg-blue-50 shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span>Browse Properties</span>
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                
                {user && (
                  <button
                    onClick={() => handleNavigation('/mailbox')}
                    className="group inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-lg font-semibold rounded-xl text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 shadow-2xl hover:shadow-white/25 transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <span>My Saved Properties</span>
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Stats */}
              <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">500+</div>
                  <div className="text-blue-200 text-sm">Properties Listed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">$2.5M+</div>
                  <div className="text-blue-200 text-sm">Secure Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">99.9%</div>
                  <div className="text-blue-200 text-sm">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                How It Works
              </div>
              <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
                Find Your Perfect Home with
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Blockchain Technology</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our platform combines traditional real estate with cutting-edge blockchain technology for secure, transparent transactions.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1 */}
              <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="absolute -top-4 left-8">
                  <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl shadow-lg">
                    1
                  </div>
                </div>
                <div className="pt-8">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors duration-300">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Browse & Discover</h3>
                  <p className="text-gray-600 mb-4">Explore verified properties with detailed information, high-quality photos, and transparent pricing in New York and New Jersey.</p>
                  <div className="flex items-center text-sm text-blue-600 font-medium">
                    <span>Verified Listings</span>
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="absolute -top-4 left-8">
                  <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl shadow-lg">
                    2
                  </div>
                </div>
                <div className="pt-8">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-200 transition-colors duration-300">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Connect Wallet</h3>
                  <p className="text-gray-600 mb-4">Connect your MetaMask wallet to access secure payments, save favorites, and manage your rental history on the blockchain.</p>
                  <div className="flex items-center text-sm text-purple-600 font-medium">
                    <span>Blockchain Security</span>
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="absolute -top-4 left-8">
                  <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold text-xl shadow-lg">
                    3
                  </div>
                </div>
                <div className="pt-8">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors duration-300">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Secure Payment</h3>
                  <p className="text-gray-600 mb-4">Make secure payments using cryptocurrency with smart contracts. All transactions are transparent and immutable on the blockchain.</p>
                  <div className="flex items-center text-sm text-green-600 font-medium">
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
