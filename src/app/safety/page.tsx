'use client';

import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Users, Home, Phone } from 'lucide-react';

export default function SafetyPage() {
  const router = useRouter();

  const safetyFeatures = [
    {
      title: "Blockchain Security",
      description: "Your transactions are secured by blockchain technology",
      icon: Lock,
      features: [
        "Immutable transaction records",
        "Smart contract protection",
        "Decentralized security",
        "Cryptographic encryption"
      ]
    },
    {
      title: "Identity Verification",
      description: "All users are verified before joining our platform",
      icon: Users,
      features: [
        "Student ID verification",
        "Background checks for landlords",
        "Photo ID confirmation",
        "Academic institution validation"
      ]
    },
    {
      title: "Property Verification",
      description: "Every property is thoroughly vetted for safety",
      icon: Home,
      features: [
        "Safety inspection reports",
        "Property ownership verification",
        "Neighborhood safety assessment",
        "Emergency contact verification"
      ]
    },
    {
      title: "24/7 Monitoring",
      description: "Continuous monitoring of platform activity",
      icon: Eye,
      features: [
        "Real-time fraud detection",
        "Suspicious activity alerts",
        "Automated safety checks",
        "Emergency response system"
      ]
    }
  ];

  const safetyTips = [
    {
      category: "Before Moving In",
      icon: CheckCircle,
      tips: [
        "Visit the property in person before signing",
        "Meet your landlord and roommates",
        "Check all locks and security features",
        "Verify emergency exits and fire safety",
        "Take photos of the property condition"
      ]
    },
    {
      category: "During Your Stay",
      icon: Shield,
      tips: [
        "Keep doors and windows locked",
        "Don't share your wallet private keys",
        "Report any safety concerns immediately",
        "Keep emergency contacts handy",
        "Trust your instincts about safety"
      ]
    },
    {
      category: "Online Safety",
      icon: Lock,
      tips: [
        "Never share your MetaMask seed phrase",
        "Use strong passwords for all accounts",
        "Be cautious of phishing attempts",
        "Verify all transactions before confirming",
        "Keep your wallet software updated"
      ]
    }
  ];

  const emergencyContacts = [
    {
      name: "PropertyFinder Emergency",
      number: "loyveilin@gmail.com",
      description: "24/7 emergency support",
      urgent: true
    },
    {
      name: "Local Police",
      number: "911",
      description: "For immediate safety threats",
      urgent: true
    },
    {
      name: "Campus Security",
      number: "Check your university",
      description: "University security services",
      urgent: false
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
              <Shield className="w-4 h-4 mr-2" />
              Your Safety Matters
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Safety & <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Security</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Your safety is our top priority. Learn about our comprehensive security measures and safety resources.
            </p>
          </div>
        </div>

        {/* Safety Features */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Security Measures</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Multiple layers of protection to keep you safe
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {safetyFeatures.map((feature, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-gray-500 flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Tips */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Safety Tips for Students</h2>
              <p className="text-xl text-gray-600">
                Important safety guidelines to follow
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {safetyTips.map((category, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{category.category}</h3>
                  </div>
                  <ul className="space-y-3">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-gray-600 flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Contacts */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Emergency Contacts</h2>
              <p className="text-xl text-gray-600">
                Keep these numbers handy for emergencies
              </p>
            </div>

            <div className="space-y-6">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm ${contact.urgent ? 'border-l-4 border-red-500' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${contact.urgent ? 'bg-red-100' : 'bg-blue-100'}`}>
                        <Phone className={`w-6 h-6 ${contact.urgent ? 'text-red-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                        <p className="text-gray-600">{contact.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-medium ${contact.urgent ? 'text-red-600' : 'text-blue-600'}`}>
                        {contact.number}
                      </p>
                      {contact.urgent && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Resources */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Additional Safety Resources</h2>
            <p className="text-xl text-gray-600 mb-8">
              More resources to help you stay safe
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Report Safety Issues</h3>
                <p className="text-gray-600 mb-4">
                  If you encounter any safety concerns, report them immediately through our secure reporting system.
                </p>
                <button className="text-red-600 font-medium hover:text-red-700">
                  Report Issue
                </button>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Safety Checklist</h3>
                <p className="text-gray-600 mb-4">
                  Download our comprehensive safety checklist to ensure your new home meets all safety standards.
                </p>
                <button className="text-blue-600 font-medium hover:text-blue-700">
                  Download Checklist
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
