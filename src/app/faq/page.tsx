'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { HelpCircle, ChevronDown, ChevronUp, Wallet, Shield, Home, CreditCard } from 'lucide-react';

export default function FAQPage() {
  const router = useRouter();
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      category: "Getting Started",
      icon: Home,
      questions: [
        {
          question: "What is PropertyFinder?",
          answer: "PropertyFinder is a blockchain-powered student housing platform that connects students with safe, affordable rental properties. We use smart contracts to ensure transparent and secure rental transactions."
        },
        {
          question: "How do I get started?",
          answer: "Simply sign up with your email, connect your MetaMask wallet, and start browsing available properties. You can filter by location, price range, and property type to find your perfect student housing."
        },
        {
          question: "Do I need to be a student to use this platform?",
          answer: "Yes, PropertyFinder is specifically designed for students. You'll need to verify your student status during the registration process to access our platform and properties."
        }
      ]
    },
    {
      category: "Wallet & Blockchain",
      icon: Wallet,
      questions: [
        {
          question: "What is MetaMask and why do I need it?",
          answer: "MetaMask is a cryptocurrency wallet that allows you to interact with blockchain applications. You need it to make secure payments, sign rental agreements, and manage your rental history on our platform."
        },
        {
          question: "Is it safe to connect my wallet?",
          answer: "Yes, connecting your wallet is safe. We only request permission to view your wallet address and send transactions. We never have access to your private keys or funds. All transactions require your explicit approval."
        },
        {
          question: "What if I don't have any cryptocurrency?",
          answer: "You can start with testnet (free test cryptocurrency) to explore our platform. For real transactions, you'll need to purchase cryptocurrency from exchanges like Coinbase or Binance."
        },
        {
          question: "What are gas fees?",
          answer: "Gas fees are small charges for processing blockchain transactions. They're usually very low (a few cents) and go to the network, not to us. Think of them like transaction fees for using a credit card."
        }
      ]
    },
    {
      category: "Renting Process",
      icon: CreditCard,
      questions: [
        {
          question: "How does the rental process work?",
          answer: "1) Browse and find a property you like, 2) Connect your wallet, 3) Pay security deposit and first month's rent through smart contract, 4) Move in! The entire process is automated and secure."
        },
        {
          question: "What is a smart contract?",
          answer: "A smart contract is like a digital rental agreement that automatically executes when conditions are met. It ensures your security deposit is held safely and rent payments are processed automatically."
        },
        {
          question: "Can I get my security deposit back?",
          answer: "Yes! Your security deposit is held in a smart contract and automatically returned when your lease ends, minus any damages. This eliminates disputes and ensures fair treatment."
        },
        {
          question: "What if I need to break my lease early?",
          answer: "Our smart contracts include flexible terms. You can break your lease early with proper notice, and the security deposit will be returned according to the terms you agreed to."
        }
      ]
    },
    {
      category: "Safety & Security",
      icon: Shield,
      questions: [
        {
          question: "How do you verify properties and landlords?",
          answer: "We verify landlord identities and property ownership through blockchain records. All properties are required to meet safety standards, and we conduct background checks on participating landlords."
        },
        {
          question: "Is my personal information safe?",
          answer: "Absolutely. We use industry-standard encryption and blockchain technology to protect your data. Your personal information is never shared without your consent, and all transactions are transparent and secure."
        },
        {
          question: "What if there's a dispute with my landlord?",
          answer: "Our smart contracts include dispute resolution mechanisms. If issues arise, we have a mediation process, and all interactions are recorded on the blockchain for transparency."
        },
        {
          question: "Can I see my rental history?",
          answer: "Yes! Your rental history is stored on the blockchain and can be viewed anytime. This creates a permanent, verifiable record that can help with future rentals."
        }
      ]
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
              <HelpCircle className="w-4 h-4 mr-2" />
              Get Help
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Frequently Asked <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Questions</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about our blockchain-powered student housing platform.
            </p>
          </div>
        </div>

        {/* FAQ Content */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {faqData.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {category.questions.map((item, itemIndex) => {
                      const globalIndex = categoryIndex * 100 + itemIndex;
                      const isOpen = openItems.includes(globalIndex);
                      
                      return (
                        <div key={itemIndex} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                          <button
                            onClick={() => toggleItem(globalIndex)}
                            className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-xl"
                          >
                            <span className="text-lg font-semibold text-gray-900 pr-4">
                              {item.question}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            )}
                          </button>
                          
                          {isOpen && (
                            <div className="px-6 pb-4">
                              <div className="border-t border-gray-100 pt-4">
                                <p className="text-gray-600 leading-relaxed">
                                  {item.answer}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Section */}
            <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h3>
                <p className="text-gray-600 mb-6">
                  Can't find what you're looking for? We're here to help!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/contact')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Contact Us
                  </button>
                  <button
                    onClick={() => router.push('/help')}
                    className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200"
                  >
                    Help Center
                  </button>
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
