"""
Baseline LLM call flow: Agent -> SpoonOS -> LLM

Requirements:
- OPENAI_API_KEY (or other provider keys) in environment/.env

Run:
    uv run python examples/baseline_llm_demo.py
"""

import asyncio
import logging
from dotenv import load_dotenv

from spoon_ai.chat import ChatBot
from spoon_ai.schema import Message


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main() -> None:
    load_dotenv(override=True)

    # ChatBot will use the LLM manager and auto-select provider from env.
    chatbot = ChatBot(llm_provider="openai", model_name="gpt-4.1")

    messages = [
        Message(role="system", content="You are a concise assistant."),
        Message(role="user", content="Say hello in one short sentence."),
    ]

    try:
        response = await chatbot.llm_manager.chat(
            messages=messages,
            provider=chatbot.llm_provider,
        )
    except Exception as exc:  # Basic error handling for demo
        logger.error("LLM call failed: %s", exc)
        return

    print("LLM response:\n", response.content)


if __name__ == "__main__":
    asyncio.run(main())
