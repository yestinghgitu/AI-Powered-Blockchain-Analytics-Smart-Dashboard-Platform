const { Connection, PublicKey, clusterApiUrl } = require('@solana/web3.js');
const crypto = require('crypto');

/**
 * SolanaService handles SHA-256 fingerprinting and Devnet verification.
 */
class SolanaService {
    constructor() {
        this.connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        // Solana Memo Program ID
        this.memoProgramId = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
    }

    /**
     * Generate SHA-256 hash for any data object
     */
    generateHash(data) {
        const stringData = typeof data === 'string' ? data : JSON.stringify(data);
        return '0x' + crypto.createHash('sha256').update(stringData).digest('hex');
    }

    /**
     * Verify a hash against Solana Devnet Memo history for a given wallet
     * Note: This is an advanced feature that scans the user's transactions for the hash.
     */
    async verifyOnChain(walletAddress, expectedHash) {
        try {
            const publicKey = new PublicKey(walletAddress);
            const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit: 10 });
            
            for (const sig of signatures) {
                const tx = await this.connection.getTransaction(sig.signature, {
                    maxSupportedTransactionVersion: 0
                });
                
                // Check if transaction contains the memo with our hash
                if (tx && tx.meta && !tx.meta.err) {
                    const logMessages = tx.meta.logMessages || [];
                    const found = logMessages.some(msg => msg.includes(expectedHash));
                    if (found) return { verified: true, signature: sig.signature };
                }
            }
            return { verified: false, message: 'Hash not found in recent transactions.' };
        } catch (error) {
            console.error('[SolanaService] Verification Error:', error.message);
            throw new Error('Failed to verify on-chain: ' + error.message);
        }
    }
}

module.exports = new SolanaService();
