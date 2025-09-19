'use client';

import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { GraduationCap, BookOpen, Shield, Users, MessageCircle, Mail, Phone, Clock } from 'lucide-react';

export default function StudentSupportPage() {
  const router = useRouter();

  const supportServices = [
    {
      title: "Academic Verification",
      description: "Get help verifying your student status",
      icon: GraduationCap,
      features: [
        "Student ID verification",
        "Enrollment confirmation",
        "Academic year validation",
        "Institution verification"
      ]
    },
    {
      title: "Housing Guidance",
      description: "Expert advice on finding the right place",
      icon: BookOpen,
      features: [
        "Property search assistance",
        "Budget planning help",
        "Location recommendations",
        "Roommate matching"
      ]
    },
    {
      title: "Safety Resources",
      description: "Stay safe in your new home",
      icon: Shield,
      features: [
        "Safety checklists",
        "Emergency contacts",
        "Neighborhood safety info",
        "Security tips"
      ]
    },
    {
      title: "Community Support",
      description: "Connect with other students",
      icon: Users,
      features: [
        "Student forums",
        "Study groups",
        "Social events",
        "Peer support"
      ]
    }
  ];

  const quickHelp = [
    {
      title: "How to verify my student status?",
      answer: "Upload a clear photo of your student ID or enrollment letter. We'll verify it within 24 hours.",
      urgent: false
    },
    {
      title: "What if I can't afford the security deposit?",
      answer: "We offer flexible payment plans and can connect you with financial aid resources for students.",
      urgent: false
    },
    {
      title: "How do I report a safety concern?",
      answer: "Contact us immediately at loyveilin@gmail.com or use our emergency reporting system in the app.",
      urgent: true
    },
    {
      title: "Can I sublet my room?",
      answer: "Yes, with proper approval. Contact us to learn about our subletting policies and requirements.",
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
              <GraduationCap className="w-4 h-4 mr-2" />
              Student-Focused Support
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Student <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Support</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Dedicated support services designed specifically for students navigating their housing journey.
            </p>
          </div>
        </div>

        {/* Support Services */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Support Students</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive support services tailored to student needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {supportServices.map((service, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-gray-500 flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Help */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Help</h2>
              <p className="text-xl text-gray-600">
                Common questions from students like you
              </p>
            </div>

            <div className="space-y-6">
              {quickHelp.map((item, index) => (
                <div key={index} className={`bg-white rounded-xl p-6 shadow-sm ${item.urgent ? 'border-l-4 border-red-500' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.answer}</p>
                    </div>
                    {item.urgent && (
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Urgent
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Help Now</h2>
              <p className="text-xl text-gray-600">
                Multiple ways to reach our student support team
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-600 mb-4">Get help within 24 hours</p>
                <a 
                  href="mailto:loyveilin@gmail.com"
                  className="text-blue-600 font-medium hover:text-blue-700"
                >
                  loyveilin@gmail.com
                </a>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-4">Chat with support team</p>
                <button className="text-green-600 font-medium hover:text-green-700">
                  Start Chat
                </button>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Response Time</h3>
                <p className="text-gray-600 mb-4">We respond quickly</p>
                <p className="text-purple-600 font-medium">
                  Within 2 hours
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Student Resources */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Student Resources</h2>
            <p className="text-xl text-gray-600 mb-8">
              Additional resources to help you succeed in your housing journey
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Financial Aid</h3>
                <p className="text-gray-600 mb-4">
                  Information about student financial aid, payment plans, and budgeting resources.
                </p>
                <button className="text-blue-600 font-medium hover:text-blue-700">
                  Learn More
                </button>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Housing Tips</h3>
                <p className="text-gray-600 mb-4">
                  Expert tips on finding the right roommates, decorating your space, and staying safe.
                </p>
                <button className="text-blue-600 font-medium hover:text-blue-700">
                  Read Tips
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
