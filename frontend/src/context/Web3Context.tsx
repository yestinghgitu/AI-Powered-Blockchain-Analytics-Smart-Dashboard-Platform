import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (targetId: number) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(localStorage.getItem('web3_account'));
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider and state
  const initialize = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install it to use this app.');
      return;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      const network = await browserProvider.getNetwork();
      setChainId(Number(network.chainId));

      // Check if already connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        const connectedAccount = accounts[0];
        setAccount(connectedAccount);
        const newSigner = await browserProvider.getSigner();
        setSigner(newSigner);
        localStorage.setItem('web3_account', connectedAccount);
      }
    } catch (err: any) {
      console.error('Initialization error:', err);
      setError('Failed to initialize Web3 provider.');
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle Event Listeners
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // Disconnected
        setAccount(null);
        setSigner(null);
        localStorage.removeItem('web3_account');
      } else {
        setAccount(accounts[0]);
        localStorage.setItem('web3_account', accounts[0]);
        if (provider) {
          const newSigner = await provider.getSigner();
          setSigner(newSigner);
        }
      }
    };

    const handleChainChanged = (hexId: string) => {
      setChainId(parseInt(hexId, 16));
      // Re-initialize provider on chain change (recommended by ethers v6)
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [provider]);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask Extension');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Create provider if not already there
      const tempProvider = provider || new ethers.BrowserProvider(window.ethereum);
      if (!provider) setProvider(tempProvider);

      // Trigger popup
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const currentAccount = accounts[0];
      
      setAccount(currentAccount);
      localStorage.setItem('web3_account', currentAccount);

      const newSigner = await tempProvider.getSigner();
      setSigner(newSigner);

      const network = await tempProvider.getNetwork();
      setChainId(Number(network.chainId));

    } catch (err: any) {
      console.error('Connection error:', err);
      if (err.code === 4001) {
        setError('User rejected the connection request.');
      } else {
        setError(err.message || 'An unexpected error occurred during connection.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setSigner(null);
    localStorage.removeItem('web3_account');
    // Note: MetaMask doesn't have a formal disconnect via API, 
    // it's mostly a client-side state cleared operation.
  };

  const switchNetwork = async (targetId: number) => {
    if (typeof window.ethereum === 'undefined') return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        setError('Please add the required network to your MetaMask.');
      } else {
        setError('Failed to switch network.');
      }
    }
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        provider,
        signer,
        isConnecting,
        error,
        connectWallet,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
