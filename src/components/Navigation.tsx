'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Navigation = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navLinkClass = (path: string) => 
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
      pathname === path 
        ? 'bg-blue-600 text-white' 
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  const buttonClass = 'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200';
  const primaryButtonClass = `${buttonClass} bg-blue-600 text-white hover:bg-blue-700`;
  const outlineButtonClass = `${buttonClass} border border-gray-300 text-gray-700 hover:bg-gray-50`;

  // Navigation items
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              PropertyFinder
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex sm:space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={navLinkClass(item.path)}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <Link
                  href="/listings"
                  className={navLinkClass('/listings')}
                >
                  Browse Listings
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  <Link 
                    href="/mailbox" 
                    className={`${outlineButtonClass} hidden sm:inline-flex items-center`}
                  >
                    <span className="mr-1">📬</span> Mailbox
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className={outlineButtonClass}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link 
                  href="/auth/signin" 
                  className={primaryButtonClass}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
