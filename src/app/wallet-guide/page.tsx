'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Wallet, Download, Shield, Key, Copy, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

export default function WalletGuidePage() {
  const router = useRouter();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const steps = [
    {
      step: 1,
      title: "Download MetaMask",
      description: "Install the MetaMask browser extension",
      icon: Download,
      details: [
        "Go to metamask.io",
        "Click 'Download' for your browser",
        "Add the extension to your browser",
        "Pin it to your toolbar for easy access"
      ]
    },
    {
      step: 2,
      title: "Create Your Wallet",
      description: "Set up your new MetaMask wallet",
      icon: Wallet,
      details: [
        "Click 'Create a new wallet'",
        "Create a strong password",
        "Write down your seed phrase",
        "Confirm your seed phrase"
      ]
    },
    {
      step: 3,
      title: "Secure Your Wallet",
      description: "Keep your wallet safe and secure",
      icon: Shield,
      details: [
        "Never share your seed phrase",
        "Store it in a safe place",
        "Enable auto-lock feature",
        "Keep your password private"
      ]
    },
    {
      step: 4,
      title: "Connect to PropertyFinder",
      description: "Link your wallet to our platform",
      icon: Key,
      details: [
        "Click 'Connect Wallet' on our site",
        "Select MetaMask from the options",
        "Approve the connection",
        "Start using blockchain features"
      ]
    }
  ];

  const securityTips = [
    {
      title: "Never Share Your Seed Phrase",
      description: "Your 12-word seed phrase is like your wallet's master key. Never share it with anyone, not even our support team.",
      icon: AlertTriangle,
      urgent: true
    },
    {
      title: "Use Strong Passwords",
      description: "Create a unique, strong password for your MetaMask wallet. Use a combination of letters, numbers, and symbols.",
      icon: Shield,
      urgent: false
    },
    {
      title: "Enable Auto-Lock",
      description: "Set MetaMask to lock automatically after a few minutes of inactivity to protect your wallet.",
      icon: Key,
      urgent: false
    },
    {
      title: "Verify Website URLs",
      description: "Always check that you're on the official PropertyFinder website before connecting your wallet.",
      icon: CheckCircle,
      urgent: false
    }
  ];

  const faq = [
    {
      question: "What is a seed phrase?",
      answer: "A seed phrase is a 12-24 word backup that can restore your wallet. It's like a master key that gives access to all your funds. Keep it safe and never share it."
    },
    {
      question: "What are gas fees?",
      answer: "Gas fees are small charges for processing blockchain transactions. They're usually very low (a few cents) and go to the network, not to us."
    },
    {
      question: "Can I use my wallet on multiple devices?",
      answer: "Yes! You can import your wallet on multiple devices using your seed phrase. Just make sure to keep your seed phrase secure."
    },
    {
      question: "What if I lose my password?",
      answer: "You can restore your wallet using your seed phrase. However, if you lose both your password and seed phrase, you'll lose access to your funds permanently."
    }
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
              <Wallet className="w-4 h-4 mr-2" />
              Complete Guide
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Wallet <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Guide</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Learn how to set up and use MetaMask wallet with our blockchain-powered student housing platform.
            </p>
          </div>
        </div>

        {/* Setup Steps */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Set Up Your Wallet</h2>
              <p className="text-xl text-gray-600">
                Follow these simple steps to get started
              </p>
            </div>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-8">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        {step.step}
                      </span>
                      <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-lg text-gray-600 mb-4">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="text-gray-600 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Tips */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Best Practices</h2>
              <p className="text-xl text-gray-600">
                Keep your wallet and funds safe
              </p>
            </div>

            <div className="space-y-6">
              {securityTips.map((tip, index) => (
                <div key={index} className={`bg-white rounded-2xl p-6 shadow-sm ${tip.urgent ? 'border-l-4 border-red-500' : ''}`}>
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${tip.urgent ? 'bg-red-100' : 'bg-blue-100'}`}>
                      <tip.icon className={`w-5 h-5 ${tip.urgent ? 'text-red-600' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{tip.title}</h3>
                        {tip.urgent && (
                          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Critical
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">
                Common questions about using MetaMask with PropertyFinder
              </p>
            </div>

            <div className="space-y-6">
              {faq.map((item, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.question}</h3>
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Download MetaMask and start using our platform
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Download MetaMask
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
              
              <button
                onClick={() => router.push('/listings')}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect Your Wallet
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
