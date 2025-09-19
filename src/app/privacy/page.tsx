'use client';

import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
              <Shield className="w-4 h-4 mr-2" />
              Your Privacy Matters
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Privacy <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              We are committed to protecting your privacy and ensuring the security of your personal information while using our blockchain-powered student housing platform.
            </p>
            <p className="text-sm text-blue-200 mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              
              {/* Introduction */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <FileText className="w-8 h-8 text-blue-600 mr-3" />
                  Introduction
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  PropertyFinder ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our student housing platform.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  By using our service, you agree to the collection and use of information in accordance with this policy.
                </p>
              </div>

              {/* Information We Collect */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Database className="w-8 h-8 text-blue-600 mr-3" />
                  Information We Collect
                </h2>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
                  <li>Name and contact information (email address)</li>
                  <li>Student identification and academic information</li>
                  <li>Property preferences and rental history</li>
                  <li>Wallet addresses and blockchain transaction data</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-4">Technical Information</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Usage patterns and interaction data</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              {/* How We Use Information */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Eye className="w-8 h-8 text-blue-600 mr-3" />
                  How We Use Your Information
                </h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>To provide and maintain our student housing platform</li>
                  <li>To process rental transactions and payments</li>
                  <li>To verify student status and eligibility</li>
                  <li>To improve our services and user experience</li>
                  <li>To communicate with you about your account and services</li>
                  <li>To ensure platform security and prevent fraud</li>
                </ul>
              </div>

              {/* Blockchain and Data Security */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Lock className="w-8 h-8 text-blue-600 mr-3" />
                  Blockchain and Data Security
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our platform uses blockchain technology to ensure the security and transparency of rental transactions. While blockchain transactions are public, we take measures to protect your personal information.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Wallet addresses are pseudonymous and not directly linked to personal identity</li>
                  <li>Smart contracts handle rental agreements securely</li>
                  <li>All sensitive data is encrypted and stored securely</li>
                  <li>We use industry-standard security measures to protect your information</li>
                </ul>
              </div>

              {/* Your Rights */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <UserCheck className="w-8 h-8 text-blue-600 mr-3" />
                  Your Rights
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
              </div>

              {/* Contact Information */}
              <div className="mb-12 bg-gray-50 p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
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

              {/* Updates */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
                <p className="text-gray-600">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
