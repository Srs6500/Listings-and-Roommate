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
  const [balance, setBalance] = useState<string | null>(null);
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
    // If user is not authenticated, redirect to login first
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    
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
    if (pathname === path) {
      return `${buttonClass}`;
    }
    return `${buttonClass}`;
  };

  const buttonClass = 'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2';
  const primaryButtonClass = `${buttonClass}`;
  const outlineButtonClass = `${buttonClass} border`;

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
      <nav 
        className="backdrop-blur-md shadow-lg sticky top-0 z-50 border-b transition-all duration-200"
        style={{ 
          backgroundColor: 'var(--surface-primary)', 
          borderBottomColor: 'var(--border-default)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  <Home className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                </div>
                <span 
                  className="text-xl font-bold transition-colors duration-200"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                >
                  PropertyFinder
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={getNavLinkClass(item.path)}
                    style={{
                      backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
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
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200"
                        style={{ 
                          backgroundColor: 'var(--surface-secondary)', 
                          color: 'var(--success)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-elevated)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
                      >
                        <Wallet className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connected'}
                        </span>
                      </button>

                      {/* Wallet Dropdown */}
                      {showWalletDropdown && (
                        <div 
                          className="absolute right-0 mt-2 w-64 rounded-lg shadow-xl border py-2 z-50"
                          style={{ 
                            backgroundColor: 'var(--surface-elevated)', 
                            borderColor: 'var(--border-default)'
                          }}
                        >
                          <div className="px-4 py-2 border-b" style={{ borderBottomColor: 'var(--border-default)' }}>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Wallet Connected</p>
                            <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{account}</p>
                          </div>
                          

                          <div className="px-4 py-2 space-y-2">
                            <button
                              onClick={copyAddress}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors duration-200"
                              style={{ color: 'var(--text-primary)' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <Copy className="w-4 h-4" />
                              <span>Copy Address</span>
                            </button>
                            
                            <button
                              onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors duration-200"
                              style={{ color: 'var(--text-primary)' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>View on Etherscan</span>
                            </button>
                            
                            <button
                              onClick={handleWalletDisconnect}
                              disabled={isDisconnecting}
                              className="w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors duration-200"
                              style={{ 
                                color: isDisconnecting ? 'var(--text-muted)' : 'var(--error)',
                                cursor: isDisconnecting ? 'not-allowed' : 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                if (!isDisconnecting) {
                                  e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isDisconnecting) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              {isDisconnecting ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent" style={{ borderColor: 'var(--text-muted)' }}></div>
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
                      style={{ 
                        backgroundColor: 'var(--accent-primary)', 
                        color: 'var(--text-primary)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isConnecting) {
                          e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isConnecting) {
                          e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                        }
                      }}
                    >
                      {isConnecting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent" style={{ borderColor: 'var(--text-primary)' }}></div>
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
                <div 
                  className="flex items-center space-x-2 pl-3 border-l"
                  style={{ borderLeftColor: 'var(--border-default)' }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    <User className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                  </div>
                  <button 
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className={outlineButtonClass}
                    style={{ 
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-secondary)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSigningOut) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                        e.currentTarget.style.color = 'var(--error)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSigningOut) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link 
                  href="/auth/signin" 
                  className={primaryButtonClass}
                  style={{ 
                    backgroundColor: 'var(--accent-primary)', 
                    color: 'var(--text-primary)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
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
                className="p-2 rounded-lg transition-colors duration-200"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div 
              className="md:hidden border-t py-4"
              style={{ borderTopColor: 'var(--border-default)' }}
            >
              <div className="space-y-2">
                {mobileNavItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      href={item.path}
                      className={`${getNavLinkClass(item.path)} w-full justify-center`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      style={{
                        backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                {/* Mobile Wallet Section - Only show if user is signed in */}
                {isMounted && user && (
                  <div 
                    className="pt-4 border-t"
                    style={{ borderTopColor: 'var(--border-default)' }}
                  >
                    {isConnected ? (
                      <div className="space-y-2">
                        <div 
                          className="px-4 py-2 rounded-lg"
                          style={{ backgroundColor: 'var(--surface-secondary)' }}
                        >
                          <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>Wallet Connected</p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{account}</p>
                        </div>
                        
                        <button
                          onClick={handleWalletDisconnect}
                          disabled={isDisconnecting}
                          className={`${outlineButtonClass} w-full justify-center ${
                            isDisconnecting ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          style={{ 
                            borderColor: 'var(--border-default)',
                            color: isDisconnecting ? 'var(--text-muted)' : 'var(--error)',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (!isDisconnecting) {
                              e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isDisconnecting) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {isDisconnecting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent" style={{ borderColor: 'var(--text-muted)' }}></div>
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
                        style={{ 
                          backgroundColor: 'var(--accent-primary)', 
                          color: 'var(--text-primary)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
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
                    style={{ 
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-secondary)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSigningOut) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                        e.currentTarget.style.color = 'var(--error)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSigningOut) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link 
                    href="/auth/signin" 
                    className={`${primaryButtonClass} w-full justify-center`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ 
                      backgroundColor: 'var(--accent-primary)', 
                      color: 'var(--text-primary)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
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