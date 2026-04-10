import apiClient from '../api/client';

export interface AIChatMessage {
  message: string;
  context?: Record<string, any>;
}

export interface AIChatResponse {
  answer: string;
  meta?: {
    intent: 'casual' | 'general' | 'analytical' | 'error';
    hasData: boolean;
  };
}

/**
 * Dedicated service for AI operations.
 * Isolates the endpoint paths and provides type safety for data flowing
 * between the frontend and the AI controller in the backend.
 */
export const aiService = {
  chat: async (payload: AIChatMessage): Promise<AIChatResponse> => {
    try {
      const response = await apiClient.post<AIChatResponse>('/chat', payload);
      return response.data;
    } catch (error: any) {
      // We can add more domain-specific error handling here later if needed
      console.error('[aiService] Chat failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to connect to AI Service');
    }
  }
};
