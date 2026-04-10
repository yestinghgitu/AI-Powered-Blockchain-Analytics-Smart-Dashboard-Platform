const { ethers } = require('ethers');

/**
 * Middleware to verify Ethereum signatures for secure wallet-based authentication.
 * 
 * Expected headers:
 * - x-wallet-address: The public address of the wallet
 * - x-wallet-signature: The EIP-191 signature of a known message
 */
const verifyWalletSignature = async (req, res, next) => {
  const address = req.headers['x-wallet-address'];
  const signature = req.headers['x-wallet-signature'];
  const message = req.headers['x-wallet-message'] || 'Login to Nexus OS';

  if (!address || !signature) {
    return res.status(401).json({ error: 'Missing wallet authentication headers.' });
  }

  try {
    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid wallet signature.' });
    }

    // Attach wallet info to request
    req.walletAddress = recoveredAddress;
    next();
  } catch (err) {
    console.error('Signature verification failed:', err);
    return res.status(401).json({ error: 'Signature verification failed.' });
  }
};

module.exports = { verifyWalletSignature };
