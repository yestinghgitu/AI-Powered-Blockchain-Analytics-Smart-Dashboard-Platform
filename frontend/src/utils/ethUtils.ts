/**
 * Truncates an Ethereum address to a more readable format (e.g., 0x1234...5678)
 * 
 * @param address - The Ethereum address to truncate
 * @param chars - The number of characters to show at the start and end (default: 4)
 * @returns The truncated address
 */
export const truncateAddress = (address: string, chars = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/**
 * Maps a Chain ID to a human-readable network name
 * 
 * @param chainId - The chain ID (decimal or hex)
 * @returns The human-readable network name
 */
export const getNetworkName = (chainId: number | string): string => {
  const id = typeof chainId === 'string' ? parseInt(chainId, 16) : chainId;
  
  const networks: Record<number, string> = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    137: 'Polygon Mainnet',
    80001: 'Mumbai Testnet',
    31337: 'Hardhat Localhost',
    1337: 'Geth Localhost',
  };
  
  return networks[id] || `Unknown Chain (${id})`;
};

/**
 * Checks if the current network is the desired target network
 * 
 * @param currentChainId - The current chain ID (decimal or hex)
 * @param targetChainId - The target chain ID (decimal)
 * @returns True if they match
 */
export const isCorrectNetwork = (currentChainId: number | string, targetChainId: number): boolean => {
  const id = typeof currentChainId === 'string' ? parseInt(currentChainId, 16) : currentChainId;
  return id === targetChainId;
};
