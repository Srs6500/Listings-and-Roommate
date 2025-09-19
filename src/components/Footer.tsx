import Link from 'next/link';
import { Home, Mail, Phone, MapPin, Shield, Zap, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                PropertyFinder
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Revolutionizing student housing with blockchain technology. Secure, transparent, and student-focused property rental platform.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center hover:bg-blue-600/30 transition-colors duration-200 cursor-pointer">
                <Globe className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center hover:bg-purple-600/30 transition-colors duration-200 cursor-pointer">
                <Zap className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center hover:bg-green-600/30 transition-colors duration-200 cursor-pointer">
                <Shield className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <nav className="space-y-2">
              <Link href="/about" className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                About Us
              </Link>
              <Link href="/student-housing" className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                Student Housing
              </Link>
              <Link href="/safety" className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                Safety & Security
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <nav className="space-y-2">
              <Link href="/help" className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                Help Center
              </Link>
              <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                Contact Us
              </Link>
              <Link href="/faq" className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                FAQ
              </Link>
              <Link href="/wallet-guide" className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                Wallet Guide
              </Link>
              <Link href="/student-support" className="block text-gray-300 hover:text-white transition-colors duration-200 text-sm">
                Student Support
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">Serving Students Nationwide</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">loyveilin@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300 text-sm">Blockchain Secured</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} PropertyFinder. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Cookie Policy
                </Link>
                <Link href="/disclaimer" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Disclaimer
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Powered by Blockchain Technology</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
