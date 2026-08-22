const { ethers } = require('hardhat');

async function main() {
  const address = process.env.CONTRACT_ADDRESS;
  if (!address) throw new Error('Set CONTRACT_ADDRESS in .env');
  const [deployer] = await ethers.getSigners();
  const contract = await ethers.getContractAt('RichRank', address);
  const ids = Array.from({ length: 100 }, (_, i) => i + 1);
  // Genesis prices descend from 12.40 ETH to 0.25 ETH.
  const prices = ids.map((id) => ethers.parseEther((12.4 - ((id - 1) * 12.15) / 99).toFixed(4)));
  console.log(`Seeding ${ids.length} ranks from ${deployer.address}...`);
  const tx = await contract.mintRanks(ids, prices);
  await tx.wait();
  console.log('Genesis ranks minted. Call openMarket() when ready.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
