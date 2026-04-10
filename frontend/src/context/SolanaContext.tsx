import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Phantom Provider type definition
interface PhantomProvider {
  isPhantom: boolean;
  publicKey: { toString: () => string } | null;
  isConnected: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signTransaction: (tx: any) => Promise<any>;
  signAllTransactions: (txs: any[]) => Promise<any[]>;
  signMessage: (msg: Uint8Array) => Promise<{ signature: Uint8Array }>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
}

interface SolanaContextType {
  phantomInstalled: boolean;
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectPhantom: () => Promise<void>;
  disconnectPhantom: () => Promise<void>;
  getProvider: () => PhantomProvider | null;
}

const SolanaContext = createContext<SolanaContextType | undefined>(undefined);

const getPhantomProvider = (): PhantomProvider | null => {
  if (typeof window !== 'undefined' && 'solana' in window) {
    const provider = (window as any).solana;
    if (provider?.isPhantom) return provider as PhantomProvider;
  }
  return null;
};

export const SolanaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [phantomInstalled, setPhantomInstalled] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect Phantom on mount
  useEffect(() => {
    const provider = getPhantomProvider();
    setPhantomInstalled(!!provider);

    if (provider) {
      // Auto-connect if previously connected (silent)
      provider.connect({ onlyIfTrusted: true })
        .then(({ publicKey }) => {
          const addr = publicKey.toString();
          setWalletAddress(addr);
          setIsConnected(true);
        })
        .catch(() => {
          // Not previously trusted – silently ignore
        });

      // Account change listener
      const handleAccountChange = (publicKey: any) => {
        if (publicKey) {
          setWalletAddress(publicKey.toString());
          setIsConnected(true);
        } else {
          setWalletAddress(null);
          setIsConnected(false);
        }
      };

      const handleDisconnect = () => {
        setWalletAddress(null);
        setIsConnected(false);
      };

      provider.on('accountChanged', handleAccountChange);
      provider.on('disconnect', handleDisconnect);

      return () => {
        provider.off('accountChanged', handleAccountChange);
        provider.off('disconnect', handleDisconnect);
      };
    }
  }, []);

  const connectPhantom = useCallback(async () => {
    const provider = getPhantomProvider();
    if (!provider) {
      setError('Phantom wallet not found. Please install the Phantom browser extension.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const { publicKey } = await provider.connect();
      const addr = publicKey.toString();
      setWalletAddress(addr);
      setIsConnected(true);
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Connection rejected by user.');
      } else {
        setError(err.message || 'Failed to connect Phantom wallet.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectPhantom = useCallback(async () => {
    const provider = getPhantomProvider();
    if (provider) {
      await provider.disconnect();
    }
    setWalletAddress(null);
    setIsConnected(false);
  }, []);

  const getProvider = useCallback(() => getPhantomProvider(), []);

  return (
    <SolanaContext.Provider value={{
      phantomInstalled,
      walletAddress,
      isConnected,
      isConnecting,
      error,
      connectPhantom,
      disconnectPhantom,
      getProvider,
    }}>
      {children}
    </SolanaContext.Provider>
  );
};

export const useSolana = () => {
  const ctx = useContext(SolanaContext);
  if (!ctx) throw new Error('useSolana must be used within a SolanaProvider');
  return ctx;
};
