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
    あなたはヘルスデータ分析アシスタントです。
    受け取ったヘルス指標（歩数、心拍数など）を分析し、簡潔に要約してください。
    
    要約には以下を含めてください：
    - データの健康的な評価
    - 簡単なアドバイス（あれば）
    
    オンチェーンTxハッシュは別途提供されるため、要約には含めないでください。
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
