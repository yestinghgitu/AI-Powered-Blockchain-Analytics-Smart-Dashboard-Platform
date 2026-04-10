const { ethers } = require('ethers');

async function checkContract() {
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const address = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const code = await provider.getCode(address);
    if (code === '0x') {
        console.error('❌ Contract NOT found at address:', address);
    } else {
        console.log('✅ Contract found at address:', address);
    }
}

checkContract();
