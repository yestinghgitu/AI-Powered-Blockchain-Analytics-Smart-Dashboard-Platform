import { useAppStore } from '../store/useAppStore';

/**
 * Builds a safe, trimmed context payload for CryptoIQ from the Zustand store.
 * Used by FloatingChat, ChatUI, and AIAssistantCard to ensure consistent context.
 *
 * Returns `null` if no meaningful data is loaded (signals "no data" to backend).
 */
export function buildChatContext(): Record<string, any> | null {
  const { aiAnomalies, aiForecast, detailedForecast } = useAppStore.getState();

  const anomalies = aiAnomalies?.slice(0, 10) ?? [];
  const forecast = aiForecast?.slice(0, 10) ?? [];
  const detailed = detailedForecast?.forecast?.slice(0, 8) ?? [];
  const trends = detailedForecast?.trends ?? null;
  const insights = detailedForecast?.insights ?? [];

  // If everything is empty, return null so backend knows there's no data
  const hasData = anomalies.length > 0 || forecast.length > 0 || detailed.length > 0;

  if (!hasData) return null;

  return {
    aiAnomalies: anomalies,
    aiForecast: forecast,
    forecast: detailed,
    trends,
    insights,
  };
}
