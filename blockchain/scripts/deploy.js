import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("Deploying AuditLog contract...");

  const AuditLog = await ethers.getContractFactory("AuditLog");
  const auditLog = await AuditLog.deploy();

  await auditLog.waitForDeployment();

  const address = await auditLog.getAddress();
  console.log(`✅ AuditLog deployed successfully!`);
  console.log(`📋 Contract Address: ${address}`);
  console.log(`\nUpdate .env with:`);
  console.log(`CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
