"""
PHR Agent - SpoonOS Agent for health data analysis
"""
import os
from spoon_ai.agents.spoon_react_mcp import SpoonReactMCP
from spoon_ai.chat import ChatBot
from spoon_ai.tools.mcp_tool import MCPTool
from spoon_ai.tools.tool_manager import ToolManager


class PHRAgent(SpoonReactMCP):
    name: str = "phr_agent"
    system_prompt: str = """
    You are a health data analysis assistant.
    Analyze the received health metrics (weight, blood pressure, steps, etc.) and provide a concise summary.
    
    Your summary should include:
    - Health assessment of the data
    - Brief advice (if applicable)
    
    Do not include the on-chain transaction hash in your summary as it will be provided separately.
    
    IMPORTANT: You must respond in English only. Do not use any other language.
    Keep the entire response concise (target 80-100 words max).
    """
    
    async def initialize(self):
        """Initialize MCP tools (Tavily for health info search)"""
        tavily_key = os.getenv("TAVILY_API_KEY")
        if not tavily_key:
            raise ValueError("TAVILY_API_KEY is not set")
        
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
