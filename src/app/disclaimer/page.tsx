'use client';

import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { AlertTriangle, Shield, Info, FileText, Users } from 'lucide-react';

export default function DisclaimerPage() {
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
              <AlertTriangle className="w-4 h-4 mr-2" />
              Important Notice
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Disclaimer</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Please read this disclaimer carefully before using our blockchain-powered student housing platform.
            </p>
            <p className="text-sm text-blue-200 mt-4">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Disclaimer Content */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              
              {/* General Disclaimer */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <FileText className="w-8 h-8 text-blue-600 mr-3" />
                  General Disclaimer
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  The information contained on PropertyFinder is for general information purposes only. While we endeavor to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Any reliance you place on such information is therefore strictly at your own risk.
                </p>
              </div>

              {/* Blockchain and Cryptocurrency Disclaimer */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Shield className="w-8 h-8 text-blue-600 mr-3" />
                  Blockchain and Cryptocurrency Disclaimer
                </h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
                  <div className="flex">
                    <AlertTriangle className="w-6 h-6 text-yellow-400 mr-3 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Warning</h3>
                      <p className="text-yellow-700">
                        Our platform uses blockchain technology and cryptocurrency. Please understand the risks involved.
                      </p>
                    </div>
                  </div>
                </div>
                
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Cryptocurrency Volatility:</strong> Cryptocurrency values can be extremely volatile and may result in significant losses</li>
                  <li><strong>Irreversible Transactions:</strong> Blockchain transactions are generally irreversible once confirmed</li>
                  <li><strong>Wallet Security:</strong> You are solely responsible for the security of your cryptocurrency wallet and private keys</li>
                  <li><strong>Network Fees:</strong> Blockchain transactions may incur network fees (gas fees) that vary based on network congestion</li>
                  <li><strong>Technical Risks:</strong> Blockchain technology is still evolving and may have technical limitations or vulnerabilities</li>
                  <li><strong>Regulatory Changes:</strong> Cryptocurrency regulations may change and could affect the use of our platform</li>
                </ul>
              </div>

              {/* Property Information Disclaimer */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  Property Information Disclaimer
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  PropertyFinder provides a platform for property listings, but we do not:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Verify the accuracy of all property information provided by landlords</li>
                  <li>Guarantee the condition, safety, or legality of listed properties</li>
                  <li>Endorse or recommend specific properties or landlords</li>
                  <li>Provide legal, financial, or real estate advice</li>
                  <li>Guarantee the availability of listed properties</li>
                  <li>Verify the identity or credentials of all users</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Users are responsible for conducting their own due diligence before entering into any rental agreements.
                </p>
              </div>

              {/* Student Housing Disclaimer */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Student Housing Disclaimer</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  While PropertyFinder is designed for students, we do not:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Verify student status or enrollment at any educational institution</li>
                  <li>Guarantee that properties meet specific student housing requirements</li>
                  <li>Ensure compliance with local student housing regulations</li>
                  <li>Provide academic or educational advice</li>
                  <li>Guarantee proximity to specific schools or universities</li>
                </ul>
              </div>

              {/* Limitation of Liability */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  In no event shall PropertyFinder, its founder Sri Ram Swaminathan, or any of its affiliates be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Your use or inability to use the service</li>
                  <li>Any unauthorized access to or alteration of your transmissions or data</li>
                  <li>Any conduct or content of any third party on the service</li>
                  <li>Any content obtained from the service</li>
                  <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                </ul>
              </div>

              {/* No Professional Advice */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Info className="w-8 h-8 text-blue-600 mr-3" />
                  No Professional Advice
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  The information provided on PropertyFinder is not intended to constitute:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Legal advice</li>
                  <li>Financial advice</li>
                  <li>Real estate advice</li>
                  <li>Tax advice</li>
                  <li>Investment advice</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  You should consult with appropriate professionals before making any decisions based on information from our platform.
                </p>
              </div>

              {/* Third-Party Links */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Third-Party Links</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our platform may contain links to third-party websites or services that are not owned or controlled by PropertyFinder. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
                </p>
              </div>

              {/* Contact Information */}
              <div className="mb-8 bg-gray-50 p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this disclaimer, please contact us:
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
