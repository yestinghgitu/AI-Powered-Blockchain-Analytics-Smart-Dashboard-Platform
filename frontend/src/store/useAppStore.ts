import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface AIAnomaly {
  rowIndex: number;
  details: string;
  severity: string;
  timestamp: string;
}

interface AIForecast {
  day?: number;
  predictedRevenue?: number;
  confidence?: number;
  period?: string;
  value?: number;
}

interface DetailedForecast {
  forecast: Array<{ date: string, actual?: number, predicted: number }>;
  trends: {
    growth_rate_pct: number;
    momentum: string;
    volatility: string;
    confidence_score: number;
  };
  insights: string[];
}


interface LastAnalysis {
  id?: string;
  filename?: string;
  predictions: AIForecast[];
  anomalies: AIAnomaly[];
  summary: Record<string, any>;
  datasetHash: string;
  transactionHash: string;
  status: 'VERIFIED' | 'FAILED' | 'PENDING';
}

interface AppState {
  theme: 'dark' | 'light';
  walletConnected: boolean;
  walletAddress: string;
  activeDatasetId: string | null;
  sidebarOpen: boolean;
  aiAnomalies: AIAnomaly[];
  aiForecast: AIForecast[];
  detailedForecast: DetailedForecast | null;
  lastAnalysis: LastAnalysis | null; // Real-time full analysis from socket
  socket: Socket | null;
  setTheme: (theme: 'dark' | 'light') => void;
  setWallet: (connected: boolean, address?: string) => void;
  setActiveDataset: (id: string | null) => void;
  setDetailedForecast: (data: DetailedForecast | null) => void;
  toggleSidebar: () => void;
  initSocket: () => void;
}


const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'dark',
  walletConnected: false,
  walletAddress: '',
  activeDatasetId: null,
  sidebarOpen: true,
  aiAnomalies: [],
  aiForecast: [],
  detailedForecast: null,
  lastAnalysis: null,
  socket: null,
  setTheme: (theme) => set({ theme }),
  setWallet: (connected, address = '') => set({ walletConnected: connected, walletAddress: address }),
  setActiveDataset: (id) => set({ activeDatasetId: id }),
  setDetailedForecast: (data) => {
    console.log('[Store] Updating DetailedForecast:', data);
    set({ detailedForecast: data });
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  
  initSocket: () => {
    if (get().socket) return;
    
    const socket = io(SOCKET_URL);
    
    socket.on('connect', () => console.log('[Socket] Connected to realtime backend'));

    // Backend emits this after full AI pipeline completes (predictions + anomalies)
    socket.on('AI_ANALYSIS_READY', (data: LastAnalysis) => {
      console.log('[Socket] AI_ANALYSIS_READY received:', data);
      set({
        aiForecast: data.predictions || [],
        aiAnomalies: data.anomalies || [],
        lastAnalysis: data,
      });
    });

    // Legacy events (kept for backward compat with other routes)
    socket.on('AI_ANOMALIES_DETECTED', (data: any) => {
      console.log('[Socket] AI Anomalies Detected:', data);
      set({ aiAnomalies: data.anomalies || [] });
    });

    socket.on('AI_FORECAST_READY', (data: any) => {
      console.log('[Socket] AI Forecast Ready:', data);
      set({ aiForecast: data.forecast || data.predictions || [] });
    });

    // Emitted right after CSV is saved (before AI runs)
    socket.on('DATASET_PROCESSED', (data: any) => {
      console.log('[Socket] Dataset processed:', data);
    });
    
    set({ socket });
  }
}));
