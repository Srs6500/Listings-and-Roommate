'use client';

import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { FileText, Shield, AlertTriangle, Users, CreditCard, Scale } from 'lucide-react';

export default function TermsOfServicePage() {
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
              <Scale className="w-4 h-4 mr-2" />
              Legal Terms
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Terms of <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Service</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Please read these terms carefully before using our blockchain-powered student housing platform.
            </p>
            <p className="text-sm text-blue-200 mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Terms Content */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              
              {/* Introduction */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <FileText className="w-8 h-8 text-blue-600 mr-3" />
                  Agreement to Terms
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  These Terms of Service ("Terms") govern your use of PropertyFinder, a blockchain-powered student housing platform operated by Sri Ram Swaminathan ("we," "our," or "us").
                </p>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using our platform, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the service.
                </p>
              </div>

              {/* Service Description */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  Service Description
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  PropertyFinder is a student-focused housing platform that connects students with safe, affordable rental properties using blockchain technology for secure transactions.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Property listings and search functionality</li>
                  <li>Blockchain-based rental agreements and payments</li>
                  <li>Student verification and eligibility checking</li>
                  <li>Secure wallet integration for transactions</li>
                  <li>Transparent rental history and reviews</li>
                </ul>
              </div>

              {/* User Eligibility */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Shield className="w-8 h-8 text-blue-600 mr-3" />
                  User Eligibility
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To use our service, you must:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Be at least 18 years old</li>
                  <li>Be a current or prospective student</li>
                  <li>Have a valid email address</li>
                  <li>Provide accurate and complete information</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </div>

              {/* Blockchain and Cryptocurrency */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="w-8 h-8 text-blue-600 mr-3" />
                  Blockchain and Cryptocurrency
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our platform uses blockchain technology and cryptocurrency for secure transactions. By using our service, you acknowledge:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Cryptocurrency transactions are irreversible</li>
                  <li>You are responsible for the security of your wallet</li>
                  <li>Blockchain transactions may be subject to network fees</li>
                  <li>Cryptocurrency values can be volatile</li>
                  <li>We are not responsible for wallet security or lost funds</li>
                </ul>
              </div>

              {/* Prohibited Uses */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                  Prohibited Uses
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You may not use our service:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                  <li>To upload or transmit viruses or any other type of malicious code</li>
                </ul>
              </div>

              {/* Limitation of Liability */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  In no event shall PropertyFinder, nor its founder, directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
                </p>
              </div>

              {/* Disclaimer */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Disclaimer</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  The information on this platform is provided on an "as is" basis. To the fullest extent permitted by law, this Company:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Excludes all representations and warranties relating to this platform and its contents</li>
                  <li>Does not warrant that the platform will be constantly available or available at all</li>
                  <li>Does not guarantee the accuracy, completeness, or timeliness of information</li>
                </ul>
              </div>

              {/* Contact Information */}
              <div className="mb-12 bg-gray-50 p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
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

              {/* Changes to Terms */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
                <p className="text-gray-600">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
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
