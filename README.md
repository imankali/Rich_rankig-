# RICH / RANK

A polished interactive landing page and leaderboard prototype for a dynamic wealth-ranking NFT protocol.

## Run locally

This is a dependency-free static prototype. From the repository root:

```bash
python3 -m http.server 4173 --bind 0.0.0.0
```

Then open `http://localhost:4173`.

## Included

- Luxury dark / gold visual system with responsive mobile layout
- Live leaderboard with rank filters
- Countdown ticker, simulated wallet connection, and refresh interactions
- Takeover modal with calculated 20% premium
- Protocol explainer and private members lounge sections

## Base Sepolia contract scaffold

The repository now includes a tested-first Hardhat scaffold for the Genesis contract:

```bash
npm install
cp .env.example .env
# Add a deployer key to .env, then:
npx hardhat compile
npm run deploy:sepolia
# Put the printed address into CONTRACT_ADDRESS in .env
npm run seed:sepolia
```

The contract is configured for Base Sepolia (`84532`) and supports 100 numbered ranks, a 20% takeover premium, configurable holder prices, ownership history, and transparent protocol/rewards fee accounting. It is not ready for mainnet until it is tested, funded with test ETH, and independently audited.

The wallet and takeover flows in the static website remain simulation-only until the deployed contract address and ABI are wired into the frontend. Never put a seed phrase or private key in the repository.
