"""
Baseline MCP + Tool demo: Agent -> SpoonOS -> MCP tool -> LLM

Requirements:
- OPENAI_API_KEY (for LLM)
- TAVILY_API_KEY (for Tavily MCP tool)

Run:
    uv run python examples/baseline_mcp_demo.py
"""

import asyncio
import logging
import os
from typing import List

from dotenv import load_dotenv

from spoon_ai.agents.spoon_react_mcp import SpoonReactMCP
from spoon_ai.chat import ChatBot
from spoon_ai.tools.mcp_tool import MCPTool
from spoon_ai.tools.tool_manager import ToolManager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BaselineMCPAgent(SpoonReactMCP):
    name: str = "baseline_mcp_agent"
    system_prompt: str = """
    You are a concise assistant. When asked, call the available tools if useful,
    summarize briefly, and avoid long prose.
    """

    async def initialize(self) -> None:
        """Load MCP tools (Tavily) into the ToolManager."""
        tavily_key = os.getenv("TAVILY_API_KEY")
        if not tavily_key:
            raise ValueError("TAVILY_API_KEY is not set. Please export it or add to .env")

        tavily_tool = MCPTool(
            name="tavily-search",
            description="Web search via Tavily MCP server",
            mcp_config={
                "command": "npx",
                "args": ["--yes", "tavily-mcp"],
                "env": {"TAVILY_API_KEY": tavily_key},
            },
        )

        self.available_tools = ToolManager([tavily_tool])
        logger.info("Loaded tools: %s", list(self.available_tools.tool_map.keys()))


async def main() -> None:
    load_dotenv(override=True)

    agent = BaselineMCPAgent(
        llm=ChatBot(llm_provider="openai", model_name="gpt-4.1"),
        available_tools=ToolManager([]),
    )

    await agent.initialize()

    try:
        response = await agent.run("Search the latest news about Bitcoin price and summarize in 3 bullet points.")
    except Exception as exc:
        logger.error("MCP demo failed: %s", exc)
        return

    print("Agent response:\n", response)


if __name__ == "__main__":
    asyncio.run(main())
