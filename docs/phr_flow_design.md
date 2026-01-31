# PHR Webapp 全体フロー設計

## アーキテクチャ概要

```
[ユーザー] → [Next.js Web UI] → [FastAPI Backend] → [SpoonOS Agent] → [LLM]
                    ↓                                        ↓
              [WalletConnect]                          [Base Sepolia]
              (Base Sepolia)                         (オンチェーンアンカー)
```

## 1. フロントエンド層（Next.js + WalletConnect）

### 技術スタック
- **Next.js 14** (App Router)
- **wagmi 2.x** + **RainbowKit 2.x** (WalletConnect統合)
- **viem** (Ethereum操作)
- **TailwindCSS** + **shadcn/ui** (UI)

### WalletConnect 設定（nexus-widgets-demo パターン）
```typescript
// app/ClientProviders.tsx
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";

const config = getDefaultConfig({
  appName: "PHR On-Chain",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  chains: [baseSepolia],
  ssr: false,
});

export default function ClientProviders({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 主要コンポーネント
1. **ウォレット接続ボタン** (`ConnectButton` from RainbowKit)
2. **ヘルスデータ入力フォーム** (歩数/心拍/睡眠などJSON/CSV形式)
3. **送信ボタン** → バックエンドAPIへPOST
4. **結果表示エリア** (LLM要約 + Txハッシュリンク)

## 2. バックエンド層（FastAPI）

### エンドポイント設計
```python
# main.py (FastAPI)
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio

app = FastAPI()

class HealthDataRequest(BaseModel):
    wallet_address: str
    data: dict  # {"steps": 8200, "heart_rate": 72, ...}

@app.post("/api/phr/submit")
async def submit_health_data(req: HealthDataRequest):
    try:
        # 1. Agent初期化
        agent = PHRAgent(llm=ChatBot(llm_provider="openai", model_name="gpt-4.1"))
        await agent.initialize()
        
        # 2. データをプロンプトに埋め込み
        prompt = f"ユーザー {req.wallet_address} のヘルスデータ: {req.data} を要約してください。"
        
        # 3. Agent実行（LLM呼び出し + MCP検索）
        summary = await agent.run(prompt)
        
        # 4. オンチェーンアンカー
        tx_hash = await anchor_to_base_sepolia(req.wallet_address, req.data)
        
        # 5. 結果返却
        return {
            "summary": summary,
            "tx_hash": tx_hash,
            "explorer_url": f"https://sepolia.basescan.org/tx/{tx_hash}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Agent実装（SpoonOS統合）
```python
# phr_agent.py
from spoon_ai.agents.spoon_react_mcp import SpoonReactMCP
from spoon_ai.chat import ChatBot
from spoon_ai.tools.mcp_tool import MCPTool
from spoon_ai.tools.tool_manager import ToolManager
import os

class PHRAgent(SpoonReactMCP):
    name = "phr_agent"
    system_prompt = """
    あなたはヘルスデータ分析アシスタントです。
    受け取ったヘルス指標を要約し、オンチェーンTxハッシュを報告してください。
    """
    
    async def initialize(self):
        tavily_key = os.getenv("TAVILY_API_KEY")
        if not tavily_key:
            raise ValueError("TAVILY_API_KEY not set")
        
        self.available_tools = ToolManager([
            MCPTool(
                name="tavily-search",
                description="Web検索でヘルス関連情報を補強",
                mcp_config={
                    "command": "tavily-mcp",
                    "args": [],
                    "env": {"TAVILY_API_KEY": tavily_key}
                }
            )
        ])
```

## 3. オンチェーン層（Base Sepolia）

### スマートコントラクト（最小実装）
```solidity
// PHRRegistry.sol
pragma solidity ^0.8.0;

contract PHRRegistry {
    event HealthDataAnchored(
        address indexed user,
        bytes32 dataHash,
        uint256 timestamp
    );
    
    mapping(address => bytes32[]) public userDataHashes;
    
    function anchorData(bytes32 _dataHash) external {
        userDataHashes[msg.sender].push(_dataHash);
        emit HealthDataAnchored(msg.sender, _dataHash, block.timestamp);
    }
    
    function getUserDataCount(address _user) external view returns (uint256) {
        return userDataHashes[_user].length;
    }
}
```

### アンカー処理（Python + viem/web3.py）
```python
# anchor.py
from web3 import Web3
import json
import hashlib

async def anchor_to_base_sepolia(wallet_address: str, data: dict) -> str:
    # 1. データハッシュ生成
    data_json = json.dumps(data, sort_keys=True)
    data_hash = hashlib.sha256(data_json.encode()).hexdigest()
    
    # 2. Base Sepolia接続
    w3 = Web3(Web3.HTTPProvider(os.getenv("BASE_SEPOLIA_RPC_URL")))
    
    # 3. コントラクト呼び出し
    contract = w3.eth.contract(
        address=os.getenv("PHR_REGISTRY_ADDRESS"),
        abi=PHR_REGISTRY_ABI
    )
    
    # 4. トランザクション送信（バックエンドの秘密鍵で署名）
    tx = contract.functions.anchorData(bytes.fromhex(data_hash)).build_transaction({
        'from': os.getenv("BACKEND_WALLET_ADDRESS"),
        'nonce': w3.eth.get_transaction_count(os.getenv("BACKEND_WALLET_ADDRESS")),
        'gas': 100000,
        'gasPrice': w3.eth.gas_price
    })
    
    signed_tx = w3.eth.account.sign_transaction(tx, os.getenv("BACKEND_PRIVATE_KEY"))
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    
    return tx_hash.hex()
```

## 4. データフロー詳細

### ステップバイステップ
1. **ユーザー操作**
   - ウォレット接続（RainbowKit経由でBase Sepoliaに接続）
   - ヘルスデータ入力（例: `{"steps": 8200, "heart_rate": 72}`)
   - 送信ボタンクリック

2. **フロントエンド → バックエンド**
   - `POST /api/phr/submit` にJSON送信
   - `{ "wallet_address": "0x...", "data": {...} }`

3. **バックエンド処理**
   - PHRAgent初期化
   - プロンプト構築: `"ユーザー 0x... のデータ {...} を要約"`
   - `agent.run(prompt)` 実行
     - ChatBot → LLM Manager → OpenAI (gpt-4.1)
     - Tavily MCP で関連情報検索（オプション）
   - LLM応答取得（例: "歩数8200歩、心拍72bpmは健康的です"）

4. **オンチェーンアンカー**
   - データハッシュ生成（SHA256）
   - Base Sepolia の PHRRegistry コントラクトに `anchorData(hash)` 呼び出し
   - Txハッシュ取得

5. **バックエンド → フロントエンド**
   - JSON返却: `{ "summary": "...", "tx_hash": "0x...", "explorer_url": "..." }`

6. **フロントエンド表示**
   - LLM要約をカードで表示
   - Txハッシュをリンク化（BaseScan）

## 5. エラーハンドリング

### フロントエンド
- ウォレット未接続: モーダル表示
- ネットワーク不一致: Base Sepoliaへ切り替え促す
- API エラー: トースト通知

### バックエンド
- LLM呼び出し失敗: try/except でキャッチ、500エラー返却
- MCP ツール不良: ログ記録、ツールなしで続行
- オンチェーンTx失敗: リトライ3回、失敗時はエラーメッセージ

## 6. 環境変数

### フロントエンド (.env.local)
```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wc_project_id
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### バックエンド (.env)
```bash
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PHR_REGISTRY_ADDRESS=0x...
BACKEND_WALLET_ADDRESS=0x...
BACKEND_PRIVATE_KEY=0x...
```

## 7. デプロイ構成（最小）

### ローカル開発
- フロントエンド: `npm run dev` (localhost:3000)
- バックエンド: `uvicorn main:app --reload` (localhost:8000)

### 本番（時間があれば）
- フロントエンド: Vercel
- バックエンド: Railway / Render
- コントラクト: Base Sepolia (Hardhat/Foundry)

## 8. 実装優先度

### P0（必須）
1. WalletConnect統合（RainbowKit + Base Sepolia）
2. バックエンドAPI (`/api/phr/submit`)
3. PHRAgent実装（Agent → SpoonOS → LLM）
4. 最小コントラクト + アンカー処理
5. 基本UI（入力フォーム + 結果表示）

### P1（時間があれば）
- Tavily MCP 検索統合
- エラーハンドリング強化
- UI/UX改善（ローディング、アニメーション）
- BaseScan リンク表示

### P2（スコープ外）
- World ID 統合
- 複数データ履歴表示
- Dune Analytics 的な分析ビュー
