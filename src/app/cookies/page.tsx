'use client';

import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Cookie, Settings, Shield, Eye, Database } from 'lucide-react';

export default function CookiePolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white py-24 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-8">
              <Cookie className="w-4 h-4 mr-2" />
              Cookie Transparency
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Cookie <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Learn how we use cookies and similar technologies to enhance your experience on our student housing platform.
            </p>
            <p className="text-sm text-blue-200 mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Cookie Policy Content */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              
              {/* Introduction */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Cookie className="w-8 h-8 text-blue-600 mr-3" />
                  What Are Cookies?
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  This Cookie Policy explains how PropertyFinder uses cookies and similar technologies on our student housing platform.
                </p>
              </div>

              {/* Types of Cookies We Use */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Database className="w-8 h-8 text-blue-600 mr-3" />
                  Types of Cookies We Use
                </h2>
                
                <div className="space-y-8">
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Shield className="w-6 h-6 text-blue-600 mr-2" />
                      Essential Cookies
                    </h3>
                    <p className="text-gray-600 mb-3">
                      These cookies are necessary for the website to function properly and cannot be disabled.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Authentication and login status</li>
                      <li>Security and fraud prevention</li>
                      <li>Basic website functionality</li>
                      <li>Wallet connection status</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Settings className="w-6 h-6 text-green-600 mr-2" />
                      Functional Cookies
                    </h3>
                    <p className="text-gray-600 mb-3">
                      These cookies enhance your experience by remembering your preferences.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Language preferences</li>
                      <li>Theme and display settings</li>
                      <li>Property search filters</li>
                      <li>User interface preferences</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Eye className="w-6 h-6 text-purple-600 mr-2" />
                      Analytics Cookies
                    </h3>
                    <p className="text-gray-600 mb-3">
                      These cookies help us understand how you use our platform to improve our services.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Page views and navigation patterns</li>
                      <li>Feature usage and engagement</li>
                      <li>Performance monitoring</li>
                      <li>Error tracking and debugging</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Third-Party Cookies */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Third-Party Cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may use third-party services that place cookies on your device:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Google Analytics:</strong> To analyze website traffic and usage patterns</li>
                  <li><strong>MetaMask:</strong> For blockchain wallet integration and transaction management</li>
                  <li><strong>Firebase:</strong> For authentication and real-time database functionality</li>
                  <li><strong>Vercel:</strong> For website hosting and performance optimization</li>
                </ul>
              </div>

              {/* Managing Cookies */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Managing Your Cookie Preferences</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You can control and manage cookies in several ways:
                </p>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Browser Settings</h3>
                    <p className="text-gray-600 mb-3">
                      Most web browsers allow you to control cookies through their settings preferences. You can:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      <li>Block all cookies</li>
                      <li>Block third-party cookies only</li>
                      <li>Delete existing cookies</li>
                      <li>Set preferences for specific websites</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Our Cookie Banner</h3>
                    <p className="text-gray-600">
                      When you first visit our website, you'll see a cookie banner where you can choose which types of cookies to accept. You can change your preferences at any time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Impact of Disabling Cookies */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Impact of Disabling Cookies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you choose to disable cookies, please note that:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Some features of our platform may not function properly</li>
                  <li>You may need to re-enter information more frequently</li>
                  <li>Your preferences may not be saved</li>
                  <li>Wallet connections may not persist between sessions</li>
                  <li>We may not be able to provide personalized recommendations</li>
                </ul>
              </div>

              {/* Updates to Cookie Policy */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Updates to This Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website.
                </p>
              </div>

              {/* Contact Information */}
              <div className="mb-8 bg-gray-50 p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <strong>Email:</strong> loyveilin@gmail.com
                  </p>
                  <p className="text-gray-700">
                    <strong>Founder:</strong> Sri Ram Swaminathan
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
