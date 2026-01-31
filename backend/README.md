# PHR Backend

FastAPI backend for PHR On-Chain application.

## Setup

1. Create virtual environment and install dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required environment variables for **local testing (mock mode)**:
- `OPENAI_API_KEY`: OpenAI API key
- `TAVILY_API_KEY`: Tavily API key (for MCP search)
- `USE_MOCK_BLOCKCHAIN=true`: Enable mock blockchain (no real transactions)

Additional variables for **production (real blockchain)**:
- `USE_MOCK_BLOCKCHAIN=false`: Disable mock mode
- `BASE_SEPOLIA_RPC_URL`: Base Sepolia RPC endpoint (default: https://sepolia.base.org)
- `PHR_REGISTRY_ADDRESS`: Deployed PHRRegistry contract address
- `BACKEND_WALLET_ADDRESS`: Backend wallet address for signing transactions
- `BACKEND_PRIVATE_KEY`: Backend wallet private key (keep secret!)

## Run

```bash
# Development mode
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using Python directly
python main.py
```

API will be available at: http://localhost:8000

## API Endpoints

### `GET /`
Health check endpoint.

### `POST /api/phr/submit`
Submit health data for analysis and on-chain anchoring.

Request body:
```json
{
  "wallet_address": "0x...",
  "data": {
    "steps": 8200,
    "heart_rate": 72
  }
}
```

Response:
```json
{
  "summary": "LLM analysis summary...",
  "tx_hash": "0x...",
  "explorer_url": "https://sepolia.basescan.org/tx/0x..."
}
```

## Architecture

- `main.py`: FastAPI application and endpoints
- `phr_agent.py`: SpoonOS Agent for LLM analysis
- `anchor.py`: On-chain anchoring logic (Base Sepolia)
