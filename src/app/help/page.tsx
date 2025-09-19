'use client';

import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { HelpCircle, BookOpen, MessageCircle, Mail, Phone, FileText, Video, Download } from 'lucide-react';

export default function HelpCenterPage() {
  const router = useRouter();

  const helpSections = [
    {
      title: "Getting Started",
      description: "Learn the basics of using PropertyFinder",
      icon: BookOpen,
      items: [
        "How to create an account",
        "Setting up your MetaMask wallet",
        "Verifying your student status",
        "Finding your first property"
      ]
    },
    {
      title: "Wallet & Payments",
      description: "Everything about blockchain transactions",
      icon: FileText,
      items: [
        "Connecting MetaMask wallet",
        "Understanding gas fees",
        "Making secure payments",
        "Managing your transaction history"
      ]
    },
    {
      title: "Renting Process",
      description: "Step-by-step rental guide",
      icon: Video,
      items: [
        "How to apply for a property",
        "Understanding smart contracts",
        "Security deposit process",
        "Moving in and out"
      ]
    },
    {
      title: "Safety & Security",
      description: "Protecting your information and funds",
      icon: HelpCircle,
      items: [
        "Wallet security best practices",
        "Recognizing scams and fraud",
        "Data privacy protection",
        "Dispute resolution process"
      ]
    }
  ];

  const quickLinks = [
    { title: "FAQ", description: "Common questions answered", href: "/faq", icon: HelpCircle },
    { title: "Contact Us", description: "Get in touch with support", href: "/contact", icon: MessageCircle },
    { title: "Privacy Policy", description: "How we protect your data", href: "/privacy", icon: FileText },
    { title: "Terms of Service", description: "Platform usage terms", href: "/terms", icon: BookOpen }
  ];

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
              <HelpCircle className="w-4 h-4 mr-2" />
              Support Center
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Help <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Center</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Find answers, get support, and learn how to make the most of our student housing platform.
            </p>
          </div>
        </div>

        {/* Help Sections */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How Can We Help You?</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Browse our help topics to find the information you need
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {helpSections.map((section, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600 mb-4">{section.description}</p>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-gray-500 flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* Contact Support */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Still Need Help?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Our support team is here to help you with any questions or issues.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-600 mb-4">Get help via email within 24 hours</p>
                <a 
                  href="mailto:loyveilin@gmail.com"
                  className="text-blue-600 font-medium hover:text-blue-700"
                >
                  loyveilin@gmail.com
                </a>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-4">Chat with our support team</p>
                <button className="text-green-600 font-medium hover:text-green-700">
                  Start Chat
                </button>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Download className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Resources</h3>
                <p className="text-gray-600 mb-4">Download guides and tutorials</p>
                <button className="text-purple-600 font-medium hover:text-purple-700">
                  View Resources
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
