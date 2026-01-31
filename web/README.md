# PHR On-Chain Frontend

Next.js frontend for PHR (Personal Health Records) On-Chain application.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- wagmi 2.x + RainbowKit 2.x (WalletConnect)
- viem (Ethereum operations)

## Setup

### 1. Install dependencies

Using pnpm (recommended):
```bash
pnpm install
```

Or using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Fill in your values:
```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Get a WalletConnect Project ID from: https://cloud.walletconnect.com/

## Development

Run the development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Features

- ✅ WalletConnect integration (Base Sepolia)
- ✅ Health data input form (steps, heart rate)
- ✅ Backend API integration
- ✅ LLM summary display
- ✅ Transaction hash display with BaseScan link

## Project Structure

```
web/
├── app/
│   ├── ClientProviders.tsx  # WalletConnect providers
│   ├── providers.tsx         # Dynamic provider wrapper
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page (health data form)
├── public/                   # Static assets
└── .env.local.example        # Environment variables template
```
