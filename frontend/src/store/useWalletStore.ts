import { create } from 'zustand';

interface WalletState {
  walletAddress: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  isPhantomInstalled: boolean;
  error: string | null;
  checkInstallation: () => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  walletAddress: null,
  isConnected: false,
  isConnecting: false,
  isPhantomInstalled: false,
  error: null,

  checkInstallation: () => {
    const detect = () => {
      const isInstalled = !!(window as any).solana?.isPhantom;
      set({ isPhantomInstalled: isInstalled });
      
      if (isInstalled && (window as any).solana.isConnected) {
          (window as any).solana.connect({ onlyIfTrusted: true })
              .then((res: any) => {
                  set({ 
                      walletAddress: res.publicKey.toString(), 
                      isConnected: true 
                  });
              })
              .catch(() => {});
      }
    };

    detect();
    // Also try on window load just in case
    window.addEventListener('load', detect);
    // And a fallback timeout
    setTimeout(detect, 1000);
  },

  connect: async () => {
    let solana = (window as any).solana;
    if (!solana?.isPhantom) {
      set({ error: 'Phantom not detected' });
      return;
    }

    set({ isConnecting: true, error: null });
    try {
      const resp = await (window as any).solana.connect();
      set({
        walletAddress: resp.publicKey.toString(),
        isConnected: true,
        isConnecting: false
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to connect',
        isConnecting: false
      });
    }
  },

  disconnect: async () => {
    if ((window as any).solana) {
      await (window as any).solana.disconnect();
    }
    set({
      walletAddress: null,
      isConnected: false,
      error: null
    });
  }
}));
