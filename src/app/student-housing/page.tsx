'use client';

import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { GraduationCap, Home, Users, DollarSign, MapPin, Star, CheckCircle, ArrowRight } from 'lucide-react';

export default function StudentHousingPage() {
  const router = useRouter();

  const housingTypes = [
    {
      title: "Shared Apartments",
      description: "Split costs with roommates in spacious apartments",
      icon: Users,
      features: [
        "2-4 bedroom apartments",
        "Shared common areas",
        "Individual bedrooms",
        "Split utilities and rent"
      ],
      popular: true
    },
    {
      title: "Private Studios",
      description: "Your own space with complete privacy",
      icon: Home,
      features: [
        "Private bathroom",
        "Kitchenette included",
        "Furnished options",
        "No roommate sharing"
      ],
      popular: false
    },
    {
      title: "Dorm-Style Housing",
      description: "Traditional student housing experience",
      icon: GraduationCap,
      features: [
        "Single or double rooms",
        "Shared bathrooms",
        "Common study areas",
        "Meal plans available"
      ],
      popular: true
    }
  ];

  const benefits = [
    {
      title: "Student-Friendly Pricing",
      description: "Affordable rates designed for student budgets",
      icon: DollarSign
    },
    {
      title: "Prime Locations",
      description: "Close to universities and public transportation",
      icon: MapPin
    },
    {
      title: "Verified Properties",
      description: "All properties are safety-checked and verified",
      icon: CheckCircle
    },
    {
      title: "Flexible Leases",
      description: "Short-term and semester-based rental options",
      icon: Star
    }
  ];

  const locations = [
    { name: "Near NYU", distance: "5 min walk", properties: "25+ available" },
    { name: "Columbia Area", distance: "10 min walk", properties: "18+ available" },
    { name: "Brooklyn Heights", distance: "15 min subway", properties: "32+ available" },
    { name: "Queens Campus", distance: "20 min subway", properties: "15+ available" }
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
              Student-Focused Housing
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Student <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Housing</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Find safe, affordable, and student-friendly housing options near your university.
            </p>
          </div>
        </div>

        {/* Housing Types */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Types of Student Housing</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the housing option that best fits your needs and budget
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {housingTypes.map((type, index) => (
                <div key={index} className={`bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-200 relative ${type.popular ? 'ring-2 ring-blue-500' : ''}`}>
                  {type.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                    <type.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{type.title}</h3>
                  <p className="text-gray-600 mb-6">{type.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Features:</h4>
                    <ul className="space-y-2">
                      {type.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-gray-600 flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center">
                      View Options
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Student Housing?</h2>
              <p className="text-xl text-gray-600">
                Designed specifically for students by students
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Locations */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Student Locations</h2>
              <p className="text-xl text-gray-600">
                Find housing near your university
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {locations.map((location, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                    <MapPin className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-gray-600 mb-2">{location.distance}</p>
                  <p className="text-sm text-blue-600 font-medium">{location.properties}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Find Student Housing</h2>
              <p className="text-xl text-gray-600">
                Simple steps to secure your perfect student home
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Your Profile</h3>
                  <p className="text-gray-600">Sign up and verify your student status to access student-only housing options.</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse & Filter</h3>
                  <p className="text-gray-600">Use our advanced filters to find housing by location, price, room type, and amenities.</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Wallet</h3>
                  <p className="text-gray-600">Connect your MetaMask wallet to make secure payments and sign rental agreements.</p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Your Home</h3>
                  <p className="text-gray-600">Pay security deposit and first month's rent through our secure blockchain system.</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => router.push('/listings')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Your Search
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
