/**
 * dataService.js
 * Shared ingestion pipeline — used by both the JSON upload route
 * and the raw CSV multipart upload route.
 *
 * Steps:
 *  1. Validate & normalize rows (via validateAndNormalize)
 *  2. Persist to MongoDB
 *  3. Run AI predictions in parallel
 *  4. Anchor hash on blockchain (awaited — returns txHash)
 *  5. Return unified result object
 */
const SalesRepository = require('../repositories/SalesRepository');
const AIService = require('./AIService');
const BlockchainService = require('./BlockchainService');
const { processDataset } = require('../utils/validateAndNormalize');
const logger = require('../utils/logger');

class DataService {
  /**
   * Run the full ingestion pipeline on an array of raw row objects.
   * @param {Object[]} rawRows - Parsed CSV rows or JSON payload
   * @param {Object} [io] - Socket.io instance for real-time push
   * @returns {Object} - { summary, invalidSamples, aiPrediction, aiAnomalies, blockchain }
   */
  async ingest(rawRows, io) {
    // 1. Validate & normalize
    const { valid: salesDocs, invalid, summary } = processDataset(rawRows);

    logger.info(
      `[DataService] Parsed ${summary.totalRows} rows: ` +
      `${summary.validRows} valid, ${summary.invalidRows} invalid (${summary.validationRate})`
    );

    if (salesDocs.length === 0) {
      const err = new Error('No valid rows found in uploaded dataset.');
      err.status = 422;
      err.summary = summary;
      err.invalidSamples = invalid.slice(0, 5).map(i => ({ errors: i.errors }));
      throw err;
    }

    // 2. Persist to MongoDB
    await SalesRepository.insertMany(salesDocs);

    // 3. AI predictions — run in parallel, fail-soft
    const [aiPrediction, aiAnomalies] = await Promise.all([
      AIService.predictRevenue(salesDocs, io),
      AIService.detectAnomalies(salesDocs, io)
    ]);

    // 4. Blockchain anchor — AWAITED so txHash reaches the caller
    let blockchainRecord = null;
    try {
      const aiSummary = { prediction: aiPrediction, anomalies: aiAnomalies };
      blockchainRecord = await BlockchainService.addRecord('DATA_UPLOAD', salesDocs, aiSummary);
      if (blockchainRecord) {
        blockchainRecord.timestamp = new Date().toISOString();
        logger.info(`[DataService] On-chain anchor: ${blockchainRecord.txHash}`);
      }
    } catch (bcErr) {
      logger.warn(`[DataService] Blockchain anchor failed (non-fatal): ${bcErr.message}`);
    }

    return {
      message: `Dataset processed: ${summary.validRows}/${summary.totalRows} rows stored.`,
      summary,
      invalidSamples: invalid.slice(0, 3).map(i => ({ errors: i.errors })),
      aiPrediction,
      aiAnomalies,
      blockchain: blockchainRecord // { txHash, datasetHash, aiSummaryHash, timestamp }
    };
  }
}

module.exports = new DataService();
