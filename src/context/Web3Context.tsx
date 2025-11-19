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

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  // Restore wallet state from localStorage on component mount
  const restoreWalletState = async () => {
    if (typeof window === 'undefined') return;
    
    const walletConnected = localStorage.getItem('walletConnected');
    const walletAddress = localStorage.getItem('walletAddress');
    const currentUser = localStorage.getItem('currentUser');
    const walletConnectedUser = localStorage.getItem('walletConnectedUser');
    
    console.log('🔍 Checking wallet restoration:', {
      walletConnected,
      walletAddress,
      currentUser,
      walletConnectedUser
    });
    
    // Only restore if wallet was connected and it's for the same user
    if (walletConnected === 'true' && walletAddress && currentUser === walletConnectedUser) {
      try {
        console.log('🔄 Restoring wallet state for user:', currentUser);
        await updateWalletState(walletAddress);
        console.log('✅ Wallet state restored successfully');
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

  // Connect to MetaMask wallet - always requires user interaction
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      alert('🔧 MetaMask Required\n\nPlease install MetaMask browser extension to connect your wallet and access our platform features.');
      return;
    }

    try {
      setIsConnecting(true);
      
      // First, force disconnect from MetaMask to ensure fresh popup
      console.log('🔄 Preparing fresh wallet connection...');
      await forceDisconnectFromMetaMask();
      disconnectWalletInternal();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Longer delay to ensure disconnect
      
      // Now request fresh connection - this should always show popup
      console.log('🔗 Requesting fresh wallet connection...');
      await new Promise(resolve => setTimeout(resolve, 800)); // Realistic delay
      
      // Force MetaMask to show popup by using wallet_requestPermissions first
      try {
        // First try to request permissions explicitly
        await window.ethereum?.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
      } catch (e) {
        // If permissions already exist, this will fail, which is fine
        console.log('Permissions already exist or not supported');
      }
      
      // Now request accounts - this should show popup
      const requestedAccounts = await window.ethereum?.request({
        method: 'eth_requestAccounts'
      });

      if (requestedAccounts && requestedAccounts.length > 0) {
        console.log('🎉 Wallet access granted, connecting...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Realistic delay
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
      const provider = new ethers.BrowserProvider(window.ethereum!);
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
      window.ethereum?.on('accountsChanged', handleAccountsChanged);
      window.ethereum?.on('chainChanged', handleChainChanged);
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
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
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
      // Try to disconnect using MetaMask's disconnect method if available
      if (window.ethereum && typeof window.ethereum.disconnect === 'function') {
        await window.ethereum.disconnect();
      }
      
      // Also try to revoke permissions
      if (window.ethereum && typeof window.ethereum.request === 'function') {
        try {
          await window.ethereum.request({
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
