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
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
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

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      alert('Please install MetaMask to use this feature!');
      return;
    }

    try {
      setIsConnecting(true);
      
      // Request account access
      const accounts = await window.ethereum?.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum!);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
        setChainId(Number(network.chainId));
        setIsConnected(true);
        
        // Store connection state in localStorage
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
    
    // Clear localStorage
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
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

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled() && localStorage.getItem('walletConnected') === 'true') {
        try {
          const accounts = await window.ethereum?.request({
            method: 'eth_accounts',
          });

          if (accounts && accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum!);
            const signer = await provider.getSigner();
            const network = await provider.getNetwork();
            
            setAccount(accounts[0]);
            setProvider(provider);
            setSigner(signer);
            setChainId(Number(network.chainId));
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          disconnectWallet();
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          localStorage.setItem('walletAddress', accounts[0]);
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
      };
    }
  }, []);

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnected,
    isConnecting,
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
