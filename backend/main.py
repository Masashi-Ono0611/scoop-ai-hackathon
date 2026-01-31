"""
FastAPI backend for PHR On-Chain application
"""
import sys
import os
from pathlib import Path

# Add parent directory to path to import spoon_ai
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
from dotenv import load_dotenv

from phr_agent import PHRAgent
from anchor import anchor_to_base_sepolia
from spoon_ai.chat import ChatBot

# Load environment variables
load_dotenv(override=True)

app = FastAPI(title="PHR On-Chain API")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthDataRequest(BaseModel):
    wallet_address: str
    data: Dict[str, Any]


class HealthDataResponse(BaseModel):
    summary: str
    tx_hash: str
    explorer_url: str


@app.get("/")
async def root():
    return {"message": "PHR On-Chain API", "status": "running"}


@app.post("/api/phr/submit", response_model=HealthDataResponse)
async def submit_health_data(req: HealthDataRequest):
    """
    Submit health data for LLM analysis and on-chain anchoring
    
    Flow:
    1. Initialize PHRAgent
    2. Run LLM analysis (Agent → SpoonOS → LLM)
    3. Anchor data hash to Base Sepolia
    4. Return summary + tx hash
    """
    try:
        # 1. Initialize Agent
        agent = PHRAgent(
            llm=ChatBot(llm_provider="openai", model_name="gpt-4.1")
        )
        await agent.initialize()
        
        # 2. Build prompt with health data
        prompt = f"""
        Please analyze the health data for user {req.wallet_address}:
        - Weight: {req.data.get('weight', 'N/A')} kg
        - Blood Pressure: {req.data.get('blood_pressure', 'N/A')}
        - Steps: {req.data.get('steps', 'N/A')}

        Provide a concise summary with health assessment and advice.
        
        IMPORTANT: Respond in English only.
        """
        
        # 3. Run Agent (LLM call + optional MCP search)
        summary = await agent.run(prompt)
        
        # 4. Anchor to Base Sepolia
        tx_hash = await anchor_to_base_sepolia(req.wallet_address, req.data)
        
        # 5. Build explorer URL
        explorer_url = f"https://sepolia.basescan.org/tx/{tx_hash}"
        
        return HealthDataResponse(
            summary=summary,
            tx_hash=tx_hash,
            explorer_url=explorer_url
        )
        
    except ValueError as e:
        print(f"ValueError: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))
    except ConnectionError as e:
        print(f"ConnectionError: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=503, detail=f"Blockchain connection error: {str(e)}")
    except Exception as e:
        print(f"Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
