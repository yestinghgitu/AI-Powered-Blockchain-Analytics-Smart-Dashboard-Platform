const { processCSV } = require('../services/csvProcessor');
const Dataset = require('../models/Dataset');
const AIService = require('../services/AIService');
const BlockchainService = require('../services/BlockchainService');

/**
 * Handle CSV Upload, AI Analysis, and Blockchain Anchoring
 */
const uploadDataset = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No CSV file uploaded.' });
        }

        // 1. Process CSV with Intelligent Mapping & KPIs
        const dataset = await processCSV(req.file.path, req.file.originalname);
        
        // 2. Generate Dataset Hash (SHA-256 for Auditing)
        const datasetHash = BlockchainService.generateHash(dataset.records);
        dataset.datasetHash = datasetHash;
        await dataset.save();

        const io = req.app.get('io');
        if (io) {
            io.emit('DATASET_PROCESSED', {
                id: dataset._id,
                filename: dataset.filename,
                rowCount: dataset.rowCount,
                metadata: dataset.metadata
            });
        }

        // 3. AI Analysis (Forecast & Anomalies)
        let aiResult = { predictions: [], anomalies: [], summary: {} };
        try {
            // Normalize records for Python AI (map inferred fields to standard 'date' and 'sales')
            const aiPayload = dataset.records.map(r => ({
                ...r,
                date: r[dataset.fieldMapping.date],
                sales: r[dataset.fieldMapping.revenue],
                product: r[dataset.fieldMapping.category]
            }));

            // We analyze the sampled records which is statistically significant (up to 5,000)
            aiResult = await AIService.analyze(aiPayload, io);

            dataset.aiForecast = aiResult.predictions;
            dataset.aiAnomalies = aiResult.anomalies;
            await dataset.save();
            
        } catch (aiError) {
            console.error('[DataController] AI Error:', aiError.message);
            // Non-blocking AI failure
        }

        // 4. Blockchain Verification (Anchoring)
        let blockchainData = { status: 'PENDING', txHash: null };
        try {
            const aiSummaryHash = BlockchainService.generateHash(aiResult.summary);
            
            // Anchor to local Hardhat node
            const txHash = await BlockchainService.anchorData(
                datasetHash,
                aiSummaryHash,
                'DATA_UPLOAD'
            );
            
            blockchainData = { status: 'VERIFIED', txHash };
            dataset.blockchainTxHash = txHash;
            await dataset.save();
            
            console.log(`[DataController] Blockchain transaction success: ${txHash}`);
        } catch (bcError) {
            console.error('[DataController] Blockchain Error:', bcError.message);
            blockchainData.status = 'FAILED';
            blockchainData.error = bcError.message;
        }

        // 5. Emit Final Real-Time Update
        if (io) {
            io.emit('AI_ANALYSIS_READY', {
                id: dataset._id,
                filename: dataset.filename,
                revenue: dataset.metadata.totalRevenue,
                predictions: aiResult.predictions || [],
                anomalies: aiResult.anomalies || [],
                summary: aiResult.summary || {},
                datasetHash: dataset.datasetHash,
                transactionHash: blockchainData.txHash,
                status: blockchainData.status
            });
        }

        // 6. Return Enhanced Response
        let initialForecast = null;
        try {
            const aiPayload = dataset.records.map(r => ({
                ...r,
                date: r[dataset.fieldMapping.date],
                sales: r[dataset.fieldMapping.revenue]
            }));
            initialForecast = await AIService.getDetailedForecast(aiPayload);
        } catch (fErr) {
            console.warn(`[Upload] Forecast generation failed: ${fErr.message}`);
        }

        res.status(201).json({
            success: true,
            predictions: aiResult.predictions || [],
            anomalies: aiResult.anomalies || [],
            summary: aiResult.summary,
            blockchain: blockchainData,
            detailedForecast: initialForecast,
            analytics: {
                totalRevenue: dataset.metadata.totalRevenue,
                avgRevenue: dataset.metadata.avgRevenue,
                recordCount: dataset.rowCount,
                data: dataset.records.slice(0, 100)
            },
            dataset: {
                id: dataset._id,
                filename: dataset.filename,
                hash: dataset.datasetHash,
                mapping: dataset.fieldMapping
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Data integration pipeline failed: ' + error.message });
    }
};

/**
 * Get Data Analytics (Legacy & Dashboard compatible)
 */
const getAnalytics = async (req, res) => {
    try {
        const latest = await Dataset.findOne().sort({ createdAt: -1 });
        if (!latest) return res.status(404).json({ error: 'No data found.' });

        res.json({
            totalRevenue: latest.metadata.totalRevenue,
            avgRevenue: latest.metadata.avgRevenue,
            recordCount: latest.rowCount,
            data: latest.records.slice(0, 100)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics.' });
    }
};

/**
 * Get All Datasets
 */
const getAllDatasets = async (req, res) => {
    try {
        const datasets = await Dataset.find({}, '-records').sort({ createdAt: -1 });
        res.status(200).json(datasets);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching datasets.' });
    }
};

/**
 * Get Detailed Sales Forecast
 */
const getForecast = async (req, res) => {
    try {
        const latest = await Dataset.findOne().sort({ createdAt: -1 });
        if (!latest) return res.status(404).json({ error: 'No data found.' });

        // Extract and normalize records for Python AI
        const aiPayload = latest.records.map(r => ({
            ...r,
            date: r[latest.fieldMapping.date],
            sales: r[latest.fieldMapping.revenue]
        }));

        const forecast = await AIService.getDetailedForecast(aiPayload);
        
        res.json({
            success: true,
            filename: latest.filename,
            datasetId: latest._id,
            forecast: forecast
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate forecast: ' + error.message });
    }
};

module.exports = {
    upload: uploadDataset,
    uploadDataset,
    getAnalytics,
    getAllDatasets,
    getForecast,
    getAuditLogs: (req, res) => res.json([]) // Placeholder
};

