'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWeb3 } from '@/context/Web3Context';
import { Wallet, Menu, X, Home, Info, Search, Mail, LogOut, User, Copy, ExternalLink } from 'lucide-react';

const Navigation = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const { user, signOut } = useAuth();
  const { 
    account, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet, 
    getBalance 
  } = useWeb3();
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

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      // You could add a toast notification here
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navLinkClass = (path: string) => 
    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
      pathname === path 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const buttonClass = 'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2';
  const primaryButtonClass = `${buttonClass} bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`;
  const outlineButtonClass = `${buttonClass} border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400`;

  // Navigation items
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
  ];

  const mobileNavItems = [
    ...navItems,
    ...(user ? [{ name: 'Browse Listings', path: '/listings', icon: Search }] : []),
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                PropertyFinder
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={navLinkClass(item.path)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            {user && (
              <Link
                href="/listings"
                className={navLinkClass('/listings')}
              >
                <Search className="w-4 h-4" />
                <span>Browse Listings</span>
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Wallet Connection */}
            {isConnected ? (
              <div className="relative">
                <button 
                  onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-green-100 text-green-700 border-2 border-green-300 hover:shadow-md"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{formatAddress(account!)}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showWalletDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Connected Wallet</p>
                      <p className="text-xs text-gray-500 font-mono">{account}</p>
                    </div>
                    <button
                      onClick={copyAddress}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Address</span>
                    </button>
                    <a
                      href={`https://etherscan.io/address/${account}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View on Etherscan</span>
                    </a>
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setShowWalletDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={handleWalletConnect}
                disabled={isConnecting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                  isConnecting 
                    ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed' 
                    : 'bg-orange-100 text-orange-700 border-orange-300 hover:shadow-md'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}

            {user ? (
              <>
                <Link 
                  href="/mailbox" 
                  className={`${outlineButtonClass} hover:shadow-md`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Mailbox</span>
                </Link>
                <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className={`${outlineButtonClass} hover:bg-red-50 hover:border-red-300 hover:text-red-700`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <Link 
                href="/auth/signin" 
                className={primaryButtonClass}
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {mobileNavItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={navLinkClass(item.path)}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {isConnected ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">Wallet Connected</span>
                      </div>
                      <p className="text-xs text-green-600 font-mono mt-1">{formatAddress(account!)}</p>
                    </div>
                    <button
                      onClick={() => {
                        disconnectWallet();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 border-red-300 text-red-700 hover:bg-red-50 flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleWalletConnect}
                    disabled={isConnecting}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 flex items-center justify-center space-x-2 ${
                      isConnecting 
                        ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed' 
                        : 'bg-orange-100 text-orange-700 border-orange-300 hover:shadow-md'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                  </button>
                )}
                
                {user ? (
                  <>
                    <Link 
                      href="/mailbox" 
                      className={`${outlineButtonClass} w-full justify-center`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Mail className="w-4 h-4" />
                      <span>Mailbox</span>
                    </Link>
                    <button 
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className={`${outlineButtonClass} w-full justify-center hover:bg-red-50 hover:border-red-300 hover:text-red-700`}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/auth/signin" 
                    className={`${primaryButtonClass} w-full justify-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
