const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with ${deployer.address}`);

  const Factory = await ethers.getContractFactory('RichRank');
  const contract = await Factory.deploy(
    deployer.address,
    process.env.BASE_TOKEN_URI || 'ipfs://REPLACE_AFTER_UPLOAD/'
  );
  await contract.waitForDeployment();
  console.log(`RichRank deployed to ${await contract.getAddress()}`);
  console.log('Next: mint ranks 1-100, then call openMarket().');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
