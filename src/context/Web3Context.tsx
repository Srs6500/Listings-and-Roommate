'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchToEthereum: () => Promise<void>;
  getBalance: () => Promise<string>;
}

const Web3Context = createContext<Web3ContextType>({} as Web3ContextType);

export function useWeb3() {
  return useContext(Web3Context);
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Check if MetaMask is installed - improved detection
  const isMetaMaskInstalled = () => {
    if (typeof window === 'undefined') return false;
    
    // Check for window.ethereum (standard)
    if (window.ethereum) {
      // Check if it's MetaMask specifically
      if (window.ethereum.isMetaMask) {
        return true;
      }
      // Some versions might not have isMetaMask flag, but still be MetaMask
      // Check for MetaMask-specific properties
      if (window.ethereum.providers) {
        // Check if any provider in the array is MetaMask
        const providers = Array.isArray(window.ethereum.providers) 
          ? window.ethereum.providers 
          : [window.ethereum];
        return providers.some((provider: any) => provider.isMetaMask);
      }
      // Additional MetaMask detection: check for MetaMask-specific methods/properties
      // MetaMask often has these even if isMetaMask flag is missing
      if (window.ethereum._metamask || 
          (window.ethereum as any).isMetaMask !== false || 
          window.ethereum.request) {
        // Likely MetaMask, return true to allow connection attempt
        return true;
      }
    }
    
    // Fallback: check for legacy web3 (very old MetaMask versions)
    if ((window as any).web3 && (window as any).web3.currentProvider) {
      return true;
    }
    
    return false;
  };

  // Restore wallet state from localStorage on component mount
  const restoreWalletState = async () => {
    if (typeof window === 'undefined') return;
    
    // Wait a bit for MetaMask to inject
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const walletConnected = localStorage.getItem('walletConnected');
    const walletAddress = localStorage.getItem('walletAddress');
    const currentUser = localStorage.getItem('currentUser');
    const walletConnectedUser = localStorage.getItem('walletConnectedUser');
    
    console.log('🔍 Checking wallet restoration:', {
      walletConnected,
      walletAddress,
      currentUser,
      walletConnectedUser,
      hasEthereum: !!window.ethereum
    });
    
    // Only restore if wallet was connected and it's for the same user
    if (walletConnected === 'true' && walletAddress && currentUser === walletConnectedUser) {
      // Check if MetaMask is available before trying to restore
      const provider = getMetaMaskProvider();
      if (!provider) {
        console.log('❌ MetaMask not available, skipping wallet restoration');
        return;
      }
      
      try {
        // Verify the account is still connected in MetaMask
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0 && accounts[0].toLowerCase() === walletAddress.toLowerCase()) {
          console.log('🔄 Restoring wallet state for user:', currentUser);
          await updateWalletState(accounts[0]);
          console.log('✅ Wallet state restored successfully');
        } else {
          console.log('❌ Account mismatch, clearing wallet state');
          localStorage.removeItem('walletConnected');
          localStorage.removeItem('walletAddress');
          localStorage.removeItem('walletConnectedUser');
        }
      } catch (error) {
        console.error('❌ Failed to restore wallet state:', error);
        // Clear invalid state
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletConnectedUser');
      }
    } else {
      console.log('❌ Wallet restoration skipped - conditions not met');
    }
  };

  // Get the MetaMask provider (handles multiple providers)
  const getMetaMaskProvider = () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return null;
    }
    
    // If it's directly MetaMask (best case - safest)
    if (window.ethereum.isMetaMask) {
      console.log('✅ MetaMask detected with isMetaMask flag');
      return window.ethereum;
    }
    
    // Check if there are multiple providers (e.g., MetaMask + other wallets)
    if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
      const metaMaskProvider = window.ethereum.providers.find((provider: any) => provider.isMetaMask);
      if (metaMaskProvider) {
        console.log('✅ MetaMask found in providers array');
        return metaMaskProvider;
      }
      // If no MetaMask in providers, log warning but continue
      console.warn('⚠️ Multiple wallets detected but MetaMask not found in providers array');
    }
    
    // Fallback: use window.ethereum even if we can't confirm it's MetaMask
    // This handles edge cases where isMetaMask flag might not be set
    // Additional safety: check for MetaMask-like properties
    if (window.ethereum._metamask || 
        (window.ethereum as any).isMetaMask !== false ||
        typeof window.ethereum.request === 'function') {
      console.log('⚠️ Using window.ethereum as MetaMask (isMetaMask flag not set, but appears to be MetaMask)');
      return window.ethereum;
    }
    
    // Last resort: return window.ethereum if nothing else works
    // User will see the connection prompt and can verify it's MetaMask
    console.log('⚠️ Using window.ethereum as fallback provider');
    return window.ethereum;
  };

  // Connect to MetaMask wallet - always requires user interaction
  const connectWallet = async () => {
    console.log('🔌 Starting wallet connection process...');
    
    // Wait for MetaMask to inject (can take a moment on page load)
    // Increased attempts to handle slower page loads
    let attempts = 0;
    let provider = null;
    const maxAttempts = 15; // 1.5 seconds total wait time
    
    while (attempts < maxAttempts && !provider) {
      await new Promise(resolve => setTimeout(resolve, 100));
      provider = getMetaMaskProvider();
      attempts++;
      
      if (provider) {
        console.log(`✅ MetaMask provider found after ${attempts} attempts`);
        break;
      }
    }
    
    // Final check - if window.ethereum exists, use it even if isMetaMask flag isn't set
    // This ensures connection works even if MetaMask doesn't set the flag properly
    if (!provider && typeof window !== 'undefined' && window.ethereum) {
      console.log('⚠️ Primary detection failed, attempting fallback detection...');
      
      // Additional safety: Check if there are multiple providers
      if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
        console.log(`📦 Found ${window.ethereum.providers.length} wallet provider(s)`);
        // Try to find MetaMask in the providers array one more time
        const metaMaskInProviders = window.ethereum.providers.find((p: any) => p.isMetaMask);
        if (metaMaskInProviders) {
          console.log('✅ MetaMask found in providers array (fallback)');
          provider = metaMaskInProviders;
        } else {
          // If no MetaMask found but providers exist, prefer the first one
          // User will see the connection prompt and can verify
          console.log('⚠️ Using first available provider from providers array');
          provider = window.ethereum.providers[0];
        }
      } else {
        // Single provider - likely MetaMask even without flag
        console.log('✅ Using window.ethereum as single provider (likely MetaMask)');
        provider = window.ethereum;
      }
    }
    
    if (!provider) {
      console.error('❌ No Ethereum provider found');
      alert('🔧 MetaMask Required\n\nPlease install MetaMask browser extension to connect your wallet and access our platform features.\n\nIf you already have MetaMask installed, please:\n1. Refresh the page\n2. Make sure MetaMask is unlocked\n3. Try connecting again');
      return;
    }
    
    console.log('✅ Provider confirmed, proceeding with connection...');

    try {
      setIsConnecting(true);
      
      // First, force disconnect from MetaMask to ensure fresh popup
      console.log('🔄 Preparing fresh wallet connection...');
      await forceDisconnectFromMetaMask();
      disconnectWalletInternal();
      await new Promise(resolve => setTimeout(resolve, 500)); // Shorter delay
      
      // Now request fresh connection - this should always show popup
      console.log('🔗 Requesting fresh wallet connection...');
      
      // Force MetaMask to show popup by using wallet_requestPermissions first
      try {
        // First try to request permissions explicitly
        await provider.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
      } catch (e) {
        // If permissions already exist, this will fail, which is fine
        console.log('Permissions already exist or not supported');
      }
      
      // Now request accounts - this should show popup
      const requestedAccounts = await provider.request({
        method: 'eth_requestAccounts'
      });

      if (requestedAccounts && requestedAccounts.length > 0) {
        console.log('🎉 Wallet access granted, connecting...');
        await updateWalletState(requestedAccounts[0]);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      
      // Handle specific error cases with better UX
      if (error.code === 4001) {
        alert('🚫 Connection Cancelled\n\nYou cancelled the MetaMask connection request. Please try again and approve the connection to continue.');
      } else if (error.code === -32002) {
        alert('⏳ Connection Pending\n\nA MetaMask connection request is already pending. Please check your MetaMask extension and approve or reject the request.');
      } else if (error.code === -32602) {
        alert('⚠️ Connection Error\n\nThere was an issue with the connection request. Please try again.');
      } else if (error.message?.includes('User rejected') || error.message?.includes('rejected')) {
        alert('🚫 Connection Rejected\n\nYou rejected the MetaMask connection request. Please try again and approve the connection to access our platform.');
      } else if (error.message?.includes('Already processing')) {
        alert('⏳ Please Wait\n\nMetaMask is already processing a request. Please wait a moment and try again.');
      } else {
        alert(`❌ Connection Failed\n\nUnable to connect to MetaMask: ${error.message || 'Unknown error occurred'}\n\nPlease make sure MetaMask is unlocked and try again.`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Update wallet state after successful connection
  const updateWalletState = async (account: string) => {
    try {
      // Try to get MetaMask provider, fallback to window.ethereum if not found
      let ethereumProvider = getMetaMaskProvider();
      if (!ethereumProvider && typeof window !== 'undefined' && window.ethereum) {
        console.log('⚠️ Using window.ethereum as fallback');
        ethereumProvider = window.ethereum;
      }
      
      if (!ethereumProvider) {
        throw new Error('MetaMask provider not available');
      }
      
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      
      setAccount(account);
      setProvider(provider);
      setSigner(signer);
      setChainId(Number(network.chainId));
      setIsConnected(true);
      
      // Store connection state in localStorage with user ID
      const currentUser = localStorage.getItem('currentUser') || 'anonymous';
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', account);
      localStorage.setItem('walletConnectedUser', currentUser);

      // Listen for account changes
      ethereumProvider.on('accountsChanged', handleAccountsChanged);
      ethereumProvider.on('chainChanged', handleChainChanged);
    } catch (error) {
      console.error('Error updating wallet state:', error);
      throw error;
    }
  };

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      disconnectWalletInternal();
    } else if (accounts[0] !== account) {
      // User switched accounts
      updateWalletState(accounts[0]);
    }
  };

  // Handle chain changes
  const handleChainChanged = (chainId: string) => {
    setChainId(Number(chainId));
    // Optionally show a notification about chain change
    console.log('Chain changed to:', chainId);
  };

  // Internal disconnect function (synchronous)
  const disconnectWalletInternal = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
    
    // Remove event listeners
    const ethereumProvider = getMetaMaskProvider();
    if (ethereumProvider) {
      try {
        ethereumProvider.removeListener('accountsChanged', handleAccountsChanged);
        ethereumProvider.removeListener('chainChanged', handleChainChanged);
      } catch (e) {
        console.log('Error removing listeners:', e);
      }
    }
    
    // Clear localStorage
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletConnectedUser');
    
    console.log('🔌 Wallet disconnected');
  };

  // Force disconnect from MetaMask's side to ensure fresh popup
  const forceDisconnectFromMetaMask = async () => {
    try {
      const ethereumProvider = getMetaMaskProvider();
      if (!ethereumProvider) {
        return;
      }
      
      // Try to disconnect using MetaMask's disconnect method if available
      if (typeof ethereumProvider.disconnect === 'function') {
        await ethereumProvider.disconnect();
      }
      
      // Also try to revoke permissions
      if (typeof ethereumProvider.request === 'function') {
        try {
          await ethereumProvider.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }]
          });
        } catch (e) {
          // Ignore errors - this method might not be supported
          console.log('Permission revocation not supported');
        }
      }
    } catch (error) {
      console.log('MetaMask disconnect not available:', error);
    }
  };

  // Public disconnect function with loading state (for UI)
  const disconnectWallet = async () => {
    try {
      setIsDisconnecting(true);
      
      // Simulate realistic disconnect delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      disconnectWalletInternal();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Switch to Ethereum mainnet
  const switchToEthereum = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Ethereum mainnet
      });
    } catch (error: any) {
      // If the chain doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x1',
              chainName: 'Ethereum Mainnet',
              rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY'],
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: ['https://etherscan.io'],
            }],
          });
        } catch (addError) {
          console.error('Error adding Ethereum chain:', addError);
        }
      } else {
        console.error('Error switching to Ethereum:', error);
      }
    }
  };

  // Get wallet balance
  const getBalance = async (): Promise<string> => {
    if (!provider || !account) return '0';

    try {
      const balance = await provider.getBalance(account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  };

  // Restore wallet state on component mount
  useEffect(() => {
    if (!isMetaMaskInstalled()) {
      console.log('MetaMask not installed');
    } else {
      console.log('MetaMask detected - ready for connection');
      // Restore wallet state if previously connected
      restoreWalletState();
    }
  }, []);

  // Listen for user changes and account changes
  useEffect(() => {
    const handleUserChange = () => {
      const currentUser = localStorage.getItem('currentUser');
      const walletConnected = localStorage.getItem('walletConnected');
      
      console.log('User change detected:', { currentUser, walletConnected });
      
      // If user signed out (no currentUser) but wallet is still connected, disconnect it
      if (!currentUser && walletConnected === 'true' && isConnected) {
        console.log('🔒 User signed out, disconnecting wallet for security');
        disconnectWalletInternal();
      }
      // If user signed in and wallet is connected, bind it to the user
      else if (currentUser && isConnected) {
        localStorage.setItem('walletConnectedUser', currentUser);
        console.log('✅ Wallet bound to user:', currentUser);
      }
    };

    // Listen for localStorage changes (user login/logout)
    window.addEventListener('storage', handleUserChange);
    
    // Also check periodically for user changes
    const intervalId = setInterval(handleUserChange, 1000);

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected from MetaMask
          disconnectWalletInternal();
        } else if (accounts[0] !== account) {
          // User switched accounts in MetaMask
          updateWalletState(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(Number(chainId));
        // Reload the page to ensure proper state
        window.location.reload();
      };

      window.ethereum?.on('accountsChanged', handleAccountsChanged);
      window.ethereum?.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
        window.removeEventListener('storage', handleUserChange);
        clearInterval(intervalId);
      };
    }

    return () => {
      window.removeEventListener('storage', handleUserChange);
      clearInterval(intervalId);
    };
  }, [account, isConnected]);

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnected,
    isConnecting,
    isDisconnecting,
    connectWallet,
    disconnectWallet,
    switchToEthereum,
    getBalance,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
