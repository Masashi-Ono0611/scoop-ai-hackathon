# Onchain Life (PHR On-Chain)

Personal Health Records anchored to Base Sepolia with an LLM summary.

## Overview
- Collect Weight / Blood Pressure / Steps
- Generate a concise English summary via OpenAI GPT-4.1
- Anchor the health data hash to Base Sepolia (PHRRegistry)
- Display tx hash + BaseScan link on the frontend

## Tech Stack
- Frontend: Next.js 14 (App Router), TypeScript, TailwindCSS, RainbowKit + wagmi, Recharts, Framer Motion
- Backend: FastAPI (Python), spoon-ai-sdk (PHRAgent + ChatBot), Web3.py
- Chain: Base Sepolia, Hardhat (Solidity) with PHRRegistry

## Project Structure
- `backend/` FastAPI + PHRAgent + anchor logic
- `web/` Next.js frontend (WalletConnect, charts, UI)
- `contracts/` Hardhat project (PHRRegistry + scripts)

## Environment Variables

### Frontend (`web/.env.local`)
```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
USE_MOCK_BLOCKCHAIN=false
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PHR_REGISTRY_ADDRESS=0xE31DF5c55d0603e4685e3881c8e693dCCe745D94
BACKEND_WALLET_ADDRESS=0x08D811A358850892029251CcC8a565a32fd2dCB8
BACKEND_PRIVATE_KEY=0x1b45cb70a4fe00bf71898a82ec646f78c234034b296d4d827e87655b495b4da2
```

### Contracts (`contracts/.env`)
```
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=0x1b45cb70a4fe00bf71898a82ec646f78c234034b296d4d827e87655b495b4da2
BASESCAN_API_KEY=your_basescan_api_key_here
```

## Setup

### Backend
```bash
cd backend
python -m venv ../.venv
source ../.venv/bin/activate
pip install -r requirements.txt
python main.py
# Runs at http://localhost:8000
```

### Frontend
```bash
cd web
pnpm install
pnpm dev
# Runs at http://localhost:3000
```

### Contracts
```bash
cd contracts
npm install
npm run compile
npm run deploy:baseSepolia   # deploys PHRRegistry
# Deployed address (current): 0xE31DF5c55d0603e4685e3881c8e693dCCe745D94
```

## Usage Flow
1) Connect wallet (RainbowKit)
2) Enter Weight / Blood Pressure / Steps (defaults: 65, 120/80, 8000)
3) Submit → FastAPI calls LLM (GPT-4.1) for a short English summary
4) Backend hashes the data and calls `anchorData` on PHRRegistry (Base Sepolia)
5) Frontend shows the summary + tx hash + BaseScan link, charts update

## Contract
- `contracts/contracts/PHRRegistry.sol`
- Function: `anchorData(bytes32 _dataHash)` emits `HealthDataAnchored`
- Explorer: https://sepolia.basescan.org/address/0xE31DF5c55d0603e4685e3881c8e693dCCe745D94

## Testing
- Frontend/Backend: manual E2E via http://localhost:3000 → http://localhost:8000
- Ensure Base Sepolia wallet has test ETH for gas

## Notes
- LLM responses are forced to English and concise (system prompt enforced)
- `USE_MOCK_BLOCKCHAIN=true` will bypass chain writes and return a fake tx hash
- UI theme: light/clean (Telegram/iOS-like), charts via Recharts
for log in logs:
    print(f"{log.timestamp}: {log.provider} - {log.method}")

```python
from spoon_ai.chat import ChatBot
from spoon_ai.agents import SpoonReactAI

# Using OpenAI's GPT-4
openai_agent = SpoonReactAI(
    llm=ChatBot(model_name="gpt-4.1", llm_provider="openai")
)

# Using Anthropic's Claude
claude_agent = SpoonReactAI(
    llm=ChatBot(model_name="claude-sonnet-4-20250514", llm_provider="anthropic")
)

# Using OpenRouter (OpenAI-compatible API)
# Uses OPENAI_API_KEY environment variable with your OpenRouter API key
openrouter_agent = SpoonReactAI(
    llm=ChatBot(
        model_name="anthropic/claude-sonnet-4",     # Model name from OpenRouter
        llm_provider="openai",                      # MUST be "openai"
        base_url="https://openrouter.ai/api/v1"     # OpenRouter API endpoint
)
)
```

## 📊 Graph System

SpoonOS includes a powerful graph-based workflow orchestration system, designed for building complex AI agent workflows with state management, multi-agent coordination, and human-in-the-loop patterns.

### Key Features

- **StateGraph Architecture** - Build workflows using nodes, edges, and conditional routing
- **Multi-Agent Coordination** - Supervisor patterns and agent routing capabilities
- **Human-in-the-Loop** - Interrupt/resume mechanisms for human approval workflows
- **Streaming Execution** - Real-time monitoring with values, updates, and debug modes
- **LLM Integration** - Seamless integration with SpoonOS LLM Manager
- **State Persistence** - Checkpointing and workflow resumption capabilities

### Quick Example

```python
from spoon_ai.graph import StateGraph
from typing import TypedDict

class WorkflowState(TypedDict):
    counter: int
    completed: bool

def increment(state: WorkflowState):
    return {"counter": state["counter"] + 1}

def complete(state: WorkflowState):
    return {"completed": True}

# Build and execute workflow
graph = StateGraph(WorkflowState)
graph.add_node("increment", increment)
graph.add_node("complete", complete)
graph.add_edge("increment", "complete")
graph.set_entry_point("increment")

compiled = graph.compile()
result = await compiled.invoke({"counter": 0, "completed": False})
# Result: {"counter": 1, "completed": True}
```

📖 **[Complete Graph System Guide](doc/graph_agent.md)**

🎯 **[Comprehensive Demo](examples/llm_integrated_graph_demo.py)**

## 🧩 Build Your Own Agent

### 1. Define Your Own Tool

```python
from spoon_ai.tools.base import BaseTool

class MyCustomTool(BaseTool):
    name: str = "my_tool"
    description: str = "Description of what this tool does"
    parameters: dict = {
        "type": "object",
        "properties": {
            "param1": {"type": "string", "description": "Parameter description"}
        },
        "required": ["param1"]
    }

    async def execute(self, param1: str) -> str:
        # Tool implementation
        return f"Result: {param1}"

```

### 2. Define Your Own Agent

```python
from spoon_ai.agents import ToolCallAgent
from spoon_ai.tools import ToolManager

class MyAgent(ToolCallAgent):
    name: str = "my_agent"
    description: str = "Agent description"
    system_prompt: str = "You are a helpful assistant..."
    max_steps: int = 5

    available_tools: ToolManager = Field(
        default_factory=lambda: ToolManager([MyCustomTool()])
    )
```

#### 3. Run the Agent and Interact via Prompt

```python
import asyncio

async def main():
    agent = MyCustomAgent(llm=ChatBot())
    result = await agent.run("Say hello to Scarlett")
    print("Result:", result)

if __name__ == "__main__":
    asyncio.run(main())
```

Register your own tools, override run(), or extend with MCP integrations. See docs/agent.md or docs/mcp_mode_usage.md

📖 [Full guide](/doc/agent.md)

📁 [Example agent](/examples/agent/my_agent_demo)

## 🔌 Advanced: Use Web3 Tools via MCP

SpoonOS supports runtime pluggable agents using the MCP (Model Context Protocol) — allowing your agent to connect to a live tool server (via SSE/WebSocket/HTTP) and call tools like get_contract_events or get_wallet_activity with no extra code.

Two ways to build MCP-powered agents:

Built-in Agent Mode: Build and run your own MCP server (e.g., mcp_thirdweb_collection.py) and connect to it using an MCPClientMixin agent.

Community Agent Mode: Use mcp-proxy to connect to open-source agents hosted on GitHub.

📁 [Full guide](/doc/mcp_mode_usage.md)

📁 [Example mcp](/examples/mcp/)

## ⚡ Prompt Caching

SpoonOS supports prompt caching for Anthropic models to reduce costs and improve performance. Enable/disable globally:

```python
from spoon_ai.chat import ChatBot

# Enable prompt caching (default: True)
chatbot = ChatBot(
    llm_provider="anthropic",
    enable_prompt_cache=True
)
```

## 🗂️ Project Structure

```text
spoon-core/
├── 📄 README.md                    # This file
├── 🔧 main.py                      # CLI entry point
├── ⚙️ config.json                  # Runtime configuration
├── 🔐 .env.example                 # Environment template
├── 📦 requirements.txt             # Python dependencies
│
├── 📁 spoon_ai/                    # Core framework
│   ├── 🤖 agents/                  # Agent implementations
│   ├── 🛠️ tools/                   # Built-in tools
│   ├── 🧠 llm/                     # LLM providers & management
│   ├── 📊 graph.py                 # Graph workflow system
│   └── 💬 chat.py                  # Chat interface
│
├── 📁 examples/                    # Usage examples
│   ├── 🤖 agent/                   # Custom agent demos
│   ├── 🔌 mcp/                     # MCP tool examples
│   └── 📊 graph_demo.py            # Graph system demo
│
├── 📁 doc/                         # Documentation
│   ├── 📖 configuration.md         # Setup & config guide
│   ├── 🤖 agent.md                 # Agent development
│   ├── 📊 graph_agent.md           # Graph workflows
│   ├── 🔌 mcp_mode_usage.md        # MCP integration
│   └── 💻 cli.md                   # CLI reference
│
└── 📁 tests/                       # Test suite
    ├── 🧪 test_agents.py
    ├── 🧪 test_tools.py
    └── 🧪 test_graph.py
```

### Key Files

- **`main.py`** - Start here! CLI entry point
- **`config.json`** - Main configuration file (auto-generated)
- **`doc/configuration.md`** - Complete setup guide
- **`examples/`** - Ready-to-run examples

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=XSpoonAi/spoon-core&type=Date)](https://www.star-history.com/#XSpoonAi/spoon-core&Date)
