'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function AboutPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-24">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              About <span className="text-blue-200">PropertyFinder</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your trusted partner in finding the perfect property
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/images/property.jpg"
                  alt="Modern property"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                  priority
                />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Who We Are</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  PropertyFinder was founded with a simple mission: to make property hunting easier, faster, and more transparent. 
                  We understand that finding the right property is more than just a transaction—it's about finding a place to call home.
                </p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our platform combines powerful search tools with detailed property information to help you make informed decisions 
                  with confidence. We're committed to providing the most accurate and up-to-date listings in your area.
                </p>
                <button 
                  onClick={() => router.push(user ? '/listings' : '/auth/signin')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
                >
                  {user ? 'Browse Properties' : 'Join Now'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The principles that guide our work and define our culture
              </p>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Transparency',
                  description: 'We believe in open communication and honest information about every property.',
                  icon: '🔍',
                },
                {
                  title: 'Innovation',
                  description: 'Continuously improving our platform to provide the best user experience.',
                  icon: '💡',
                },
                {
                  title: 'Community',
                  description: 'Building strong relationships with our users and partners.',
                  icon: '🤝',
                }
              ].map((value, index) => (
                <div 
                  key={index} 
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="text-3xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to find your perfect property?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied users who found their dream home with PropertyFinder
            </p>
            <button 
              onClick={() => router.push(user ? '/listings' : '/auth/signup')}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-lg"
            >
              {user ? 'View Listings' : 'Get Started Free'}
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
