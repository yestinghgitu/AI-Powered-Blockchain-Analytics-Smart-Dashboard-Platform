const { ethers } = require('ethers');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

/**
 * BlockchainService handles cryptographic hashing and 
 * on-chain anchoring of dataset summaries.
 */
class BlockchainService {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        
        // Load Contract ABI
        const abiPath = path.join(__dirname, '../../blockchain/artifacts/contracts/AuditLog.sol/AuditLog.json');
        const contractJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        
        this.contract = new ethers.Contract(
            process.env.CONTRACT_ADDRESS,
            contractJson.abi,
            this.wallet
        );
    }

    /**
     * Generate SHA-256 hash of data
     * @param {any} data - Data to hash
     * @returns {string} - Hex hash string
     */
    generateHash(data) {
        const input = typeof data === 'string' ? data : JSON.stringify(data);
        return crypto.createHash('sha256').update(input).digest('hex');
    }

    /**
     * Anchor dataset and AI summary to the blockchain
     * @param {string} datasetHash 
     * @param {string} aiSummaryHash 
     * @param {string} action 
     * @returns {Promise<string>} - Transaction Hash
     */
    async anchorData(datasetHash, aiSummaryHash, action = 'DATA_UPLOAD') {
        try {
            console.log(`[BlockchainService] Anchoring data... Action: ${action}`);
            
            const tx = await this.contract.addRecord(
                datasetHash,
                aiSummaryHash,
                action
            );
            
            console.log(`[BlockchainService] Transaction sent: ${tx.hash}`);
            
            const receipt = await tx.wait();
            console.log(`[BlockchainService] Transaction confirmed in block: ${receipt.blockNumber}`);
            
            return tx.hash;
        } catch (error) {
            console.error(`[BlockchainService] Transaction failed: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new BlockchainService();
