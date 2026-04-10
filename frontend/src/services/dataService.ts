import apiClient from '../api/client';

export interface AnalyticsData {
  totalRevenue: number;
  avgRevenue: number;
  recordCount: number;
  data: any[];
}

/**
 * Service to handle data communication with the base system.
 */
class DataService {
  /**
   * Fetches the latest analytics stats from the backend.
   */
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      const response = await apiClient.get('/analytics');
      return response.data;
    } catch (error) {
      console.error('[DataService] Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Uploads a CSV file for ingestion.
   */
  async uploadDataset(file: File, onProgress?: (pct: number) => void) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token') || '';
      const response = await apiClient.post('/upload', formData, {
        headers: {
          // IMPORTANT: Do NOT set Content-Type manually for multipart/form-data.
          // Axios/browser must set it automatically to include the correct boundary.
          'Content-Type': undefined,
          'Authorization': `Bearer ${token}`
        },
        timeout: 60000, // Override: AI processing can take >15s
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(pct);
          }
        }
      });
      return response.data;
    } catch (error) {
      console.error('[DataService] Error uploading dataset:', error);
      throw error;
    }
  }

  /**
   * Fetches detailed AI sales forecasting results.
   */
  async getForecast() {
    try {
      const response = await apiClient.get('/forecast');
      return response.data;
    } catch (error) {
      console.error('[DataService] Error fetching forecast:', error);
      throw error;
    }
  }

  /**
   * Helper to check backend health status.
   */
  async getHealth() {

    return (await apiClient.get('/health')).data;
  }
}

export default new DataService();
