const SolanaService = require('../services/SolanaService');
const Dataset = require('../models/Dataset');

/**
 * Handle Solana-based blockchain operations for dataset integrity.
 */
const storeRef = async (req, res) => {
    try {
        const { datasetId, txSignature, walletAddress } = req.body;

        if (!datasetId || !txSignature) {
            return res.status(400).json({ error: 'datasetId and txSignature are required.' });
        }

        const dataset = await Dataset.findById(datasetId);
        if (!dataset) return res.status(404).json({ error: 'Dataset not found.' });

        dataset.blockchainTxHash = txSignature;
        await dataset.save();

        res.json({ success: true, message: 'Transaction reference archived in DB.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to store blockchain reference.' });
    }
};

const verifyIntegrity = async (req, res) => {
    try {
        const { datasetId, walletAddress } = req.body;

        if (!datasetId || !walletAddress) {
            return res.status(400).json({ error: 'datasetId and walletAddress are required.' });
        }

        const dataset = await Dataset.findById(datasetId);
        if (!dataset) return res.status(404).json({ error: 'Dataset not found.' });

        const result = await SolanaService.verifyOnChain(walletAddress, dataset.datasetHash);
        
        res.json({
            success: true,
            isVerified: result.verified,
            txSignature: result.signature || null,
            message: result.verified ? 'Dataset is tamper-proof.' : 'Integrity check failed.'
        });
    } catch (error) {
        res.status(500).json({ error: 'Integrity verification failed.' });
    }
};

module.exports = {
    storeRef,
    verifyIntegrity
};
