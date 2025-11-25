import Link from 'next/link';
import { Home, Mail, Phone, MapPin, Shield, Zap, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--surface-primary)' }}>
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <Home className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </div>
              <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                PropertyFinder
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Revolutionizing student housing with blockchain technology. Secure, transparent, and student-focused property rental platform.
            </p>
            <div className="flex space-x-4">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-elevated)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
              >
                <Globe className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-elevated)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
              >
                <Zap className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-elevated)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
              >
                <Shield className="w-4 h-4" style={{ color: 'var(--success)' }} />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Quick Links</h3>
            <nav className="space-y-2">
              <Link 
                href="/about" 
                className="block transition-colors duration-200 text-sm"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                About Us
              </Link>
              <Link 
                href="/student-housing" 
                className="block transition-colors duration-200 text-sm"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Student Housing
              </Link>
              <Link 
                href="/safety" 
                className="block transition-colors duration-200 text-sm"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Safety & Security
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Support</h3>
            <nav className="space-y-2">
              <Link 
                href="/help" 
                className="block transition-colors duration-200 text-sm"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Help Center
              </Link>
              <Link 
                href="/contact" 
                className="block transition-colors duration-200 text-sm"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Contact Us
              </Link>
              <Link 
                href="/faq" 
                className="block transition-colors duration-200 text-sm"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                FAQ
              </Link>
              <Link 
                href="/wallet-guide" 
                className="block transition-colors duration-200 text-sm"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Wallet Guide
              </Link>
              <Link 
                href="/student-support" 
                className="block transition-colors duration-200 text-sm"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Student Support
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Serving Students Nationwide</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>loyveilin@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4" style={{ color: 'var(--success)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Blockchain Secured</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div 
          className="mt-12 pt-8 border-t"
          style={{ borderTopColor: 'var(--border-default)' }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                &copy; {new Date().getFullYear()} PropertyFinder. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <Link 
                  href="/privacy" 
                  className="transition-colors duration-200 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms" 
                  className="transition-colors duration-200 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  Terms of Service
                </Link>
                <Link 
                  href="/cookies" 
                  className="transition-colors duration-200 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  Cookie Policy
                </Link>
                <Link 
                  href="/disclaimer" 
                  className="transition-colors duration-200 text-sm"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  Disclaimer
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Shield className="w-4 h-4" />
              <span>Powered by Blockchain Technology</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
