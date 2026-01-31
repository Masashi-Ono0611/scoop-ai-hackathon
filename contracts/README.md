# PHR Registry Smart Contract

Simple smart contract to anchor Personal Health Records (PHR) data hashes on Base Sepolia.

## Setup

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add:
- `BASE_SEPOLIA_RPC_URL` - Base Sepolia RPC endpoint
- `PRIVATE_KEY` - Your deployer wallet private key
- `BASESCAN_API_KEY` - BaseScan API key for verification

## Compile

```bash
npm run compile
```

## Deploy to Base Sepolia

```bash
npm run deploy:baseSepolia
```

This will:
1. Deploy the PHRRegistry contract
2. Wait for confirmations
3. Verify the contract on BaseScan

## Contract Functions

### `anchorData(bytes32 _dataHash)`
Anchors a health data hash on-chain. Emits `HealthDataAnchored` event.

### `getUserDataHashes(address _user)`
Returns all data hashes for a given user.

### `getUserDataCount(address _user)`
Returns the number of data entries for a user.

## Integration with Backend

After deployment, update `backend/.env`:
```
USE_MOCK_BLOCKCHAIN=false
PHR_REGISTRY_ADDRESS=<deployed_contract_address>
BACKEND_WALLET_ADDRESS=<your_wallet_address>
BACKEND_PRIVATE_KEY=<your_private_key>
```

## Network Info

- **Network**: Base Sepolia
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
