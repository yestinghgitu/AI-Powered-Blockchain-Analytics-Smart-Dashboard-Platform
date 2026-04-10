const axios = require('axios');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  }

  /**
   * Proxies data to Python AI service for forecasting.
   */
  async predictRevenue(data, io) {
    try {
      const response = await axios.post(`${this.baseUrl}/forecast`, data);
      
      // Real-time Update
      if (io) io.emit('AI_FORECAST_READY', response.data);
      
      return response.data;
    } catch (error) {
      logger.error(`[AIService] Forecast Error: ${error.message}`);
      return null;
    }
  }

  /**
   * Enhanced forecasting with detailed historical comparisons.
   */
  async getDetailedForecast(data) {
    try {
      const response = await axios.post(`${this.baseUrl}/forecast`, data);
      return response.data;
    } catch (error) {
      logger.error(`[AIService] Detailed Forecast Error: ${error.message}`);
      throw new Error("AI Forecasting service failed.");
    }
  }


  /**
   * Proxies data to Python AI service for ML-based anomaly detection.
   */
  async detectAnomalies(data, io) {
    try {
      const response = await axios.post(`${this.baseUrl}/anomalies`, data);
      
      // Real-time Update
      if (io && response.data.anomalies.length > 0) {
        io.emit('AI_ANOMALIES_DETECTED', response.data);
      }
      
      return response.data.anomalies || [];
    } catch (error) {
      logger.error(`[AIService] Anomaly Detection Error: ${error.message}`);
      return [];
    }
  }

  async askAi(question) { 
    // Logic moved to aiRoutes using Groq
    return { answer: "Please use the Conversational AI endpoint." }; 
  }

  /**
   * Proxies data to Python AI service for full analysis.
   */
  async analyze(data, io) {
    try {
      const response = await axios.post(`${this.baseUrl}/analyze`, data);
      
      if (io) {
          io.emit('AI_ANALYSIS_READY', response.data);
      }
      
      return response.data; // { predictions, anomalies, summary }
    } catch (error) {
      logger.error(`[AIService] Analysis Error: ${error.message}`);
      throw new Error("AI Service is unreachable or failed to process the dataset.");
    }
  }
}

module.exports = new AIService();
