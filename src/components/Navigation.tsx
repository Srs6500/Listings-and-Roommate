'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWeb3 } from '@/context/Web3Context';
import LoadingOverlay from '@/components/LoadingOverlay';
import { Wallet, Menu, X, Home, Info, Search, Mail, LogOut, User, Copy, ExternalLink } from 'lucide-react';

const Navigation = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { user, signOut } = useAuth();
  const { 
    account, 
    isConnected, 
    isConnecting, 
    isDisconnecting,
    connectWallet, 
    disconnectWallet, 
    getBalance 
  } = useWeb3();
  const router = useRouter();
  const pathname = usePathname() || '';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected && getBalance) {
        try {
          const balanceValue = await getBalance();
          setBalance(balanceValue);
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance(null);
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
  }, [isConnected, getBalance]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    try {
      setIsSigningOut(true);
      setLoadingMessage('Signing you out...');
      setShowLoadingOverlay(true);
      
      // Disconnect wallet first for security
      try {
        await disconnectWallet();
        console.log('🔒 Wallet disconnected during sign out');
      } catch (walletError) {
        console.log('Wallet disconnect failed (may not be connected):', walletError);
      }
      
      await signOut();
      
      // Keep loading overlay for smooth transition
      setTimeout(() => {
        setShowLoadingOverlay(false);
        setIsSigningOut(false);
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error('Error signing out:', error);
      setShowLoadingOverlay(false);
      setIsSigningOut(false);
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

  const handleWalletDisconnect = async () => {
    try {
      await disconnectWallet();
      setShowWalletDropdown(false);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const getNavLinkClass = (path: string) => {
    const buttonClass = 'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2';
    return `${buttonClass} ${
      pathname === path 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`;
  };

  const buttonClass = 'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2';
  const primaryButtonClass = `${buttonClass} bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`;
  const outlineButtonClass = `${buttonClass} border-2 border-red-300 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-400 hover:shadow-lg transform hover:-translate-y-0.5`;

  // Navigation items
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
  ];

  const mobileNavItems = [
    ...navItems,
    ...(user ? [{ name: 'Browse Listings', path: '/listings', icon: Search }] : []),
  ];

  return (
    <div>
      <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  PropertyFinder
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={getNavLinkClass(item.path)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Right side - Auth & Wallet */}
            <div className="flex items-center space-x-4">
              {/* Wallet Connection - Only show if user is signed in */}
              {isMounted && user && (
                <>
                  {isConnected ? (
                    <div className="relative">
                      <button
                        onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200"
                      >
                        <Wallet className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connected'}
                        </span>
                      </button>

                      {/* Wallet Dropdown */}
                      {showWalletDropdown && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">Wallet Connected</p>
                            <p className="text-xs text-gray-500 truncate">{account}</p>
                          </div>
                          

                          <div className="px-4 py-2 space-y-2">
                            <button
                              onClick={copyAddress}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                            >
                              <Copy className="w-4 h-4" />
                              <span>Copy Address</span>
                            </button>
                            
                            <button
                              onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>View on Etherscan</span>
                            </button>
                            
                            <button
                              onClick={handleWalletDisconnect}
                              disabled={isDisconnecting}
                              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                                isDisconnecting 
                                  ? 'text-gray-500 cursor-not-allowed' 
                                  : 'text-red-600 hover:bg-red-50'
                              }`}
                            >
                              {isDisconnecting ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                                  <span>Disconnecting...</span>
                                </>
                              ) : (
                                <>
                                  <Wallet className="w-4 h-4" />
                                  <span>Disconnect</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={handleWalletConnect}
                      disabled={isConnecting}
                      className={`${primaryButtonClass} ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isConnecting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Opening MetaMask...</span>
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4" />
                          <span>Connect MetaMask</span>
                        </>
                      )}
                    </button>
                  )}
                </>
              )}

              {/* Auth Section */}
              {user ? (
                <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <button 
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className={outlineButtonClass}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
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
                    key={item.name}
                    href={item.path}
                    className={`${getNavLinkClass(item.path)} w-full justify-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                {/* Mobile Wallet Section - Only show if user is signed in */}
                {isMounted && user && (
                  <div className="pt-4 border-t border-gray-200">
                    {isConnected ? (
                      <div className="space-y-2">
                        <div className="px-4 py-2 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-800">Wallet Connected</p>
                          <p className="text-xs text-green-600 truncate">{account}</p>
                        </div>
                        
                        <button
                          onClick={handleWalletDisconnect}
                          disabled={isDisconnecting}
                          className={`${outlineButtonClass} w-full justify-center ${
                            isDisconnecting ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isDisconnecting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                              <span>Disconnecting...</span>
                            </>
                          ) : (
                            <>
                              <Wallet className="w-4 h-4" />
                              <span>Disconnect Wallet</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          handleWalletConnect();
                          setIsMobileMenuOpen(false);
                        }}
                        className={`${primaryButtonClass} w-full justify-center`}
                      >
                        <Wallet className="w-4 h-4" />
                        <span>Connect MetaMask</span>
                      </button>
                    )}
                  </div>
                )}
                
                {user ? (
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isSigningOut}
                    className={`${outlineButtonClass} w-full justify-center`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
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
          )}
        </div>
      </nav>
      
      {/* Loading Overlay */}
      {showLoadingOverlay && (
        <LoadingOverlay 
          isVisible={showLoadingOverlay} 
          message={loadingMessage}
          type="signout"
        />
      )}
    </div>
  );
};

export default Navigation;