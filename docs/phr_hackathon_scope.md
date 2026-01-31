# PHR On-Chain Hackathon Scope

## Concept
- Personal Health Records (PHR) as open, on-chain, open-source data for research and verifiable use.

## Problems
- Health data lives in local DBs; open research access is limited.
- Insurance or third parties can process data privately and may bias/alter results to their advantage.

## Proposed Solution (high level)
- Collect health metrics from iOS/Android (e.g., steps, HR, sleep, weight) and anchor to an EVM L2 (e.g., Base) for integrity and openness.
- Optionally link with World ID (or similar) for Sybil resistance / uniqueness.
- Make anchored data queryable (Dune-like) so anyone can analyze/visualize it.

## Hackathon Scope (time-boxed core experience)
- Minimal end-to-end flow: **Device data → Agent → SpoonOS → LLM → On-chain anchor → Query/summary**
- Small slice of data (e.g., daily steps/heart rate) to avoid overbuild.
- Basic UI/CLI to trigger flow and display on-chain tx hash + summarized insight.

## Mandatory Requirements (from event)
1. **LLM invocation via SpoonOS**
   - Flow: Agent → SpoonOS → LLM (already validated in examples; reuse pattern).
2. **Official Spoon tool or MCP use**
   - Use MCP tool(s) or official tool modules.
   - Full invocation flow + basic error handling.
   - References: `spoon_ai/llm`, `spoon_ai/tools`.

## Nice-to-have (judging optics / sponsor alignment)
- Use a sponsor stack where possible (e.g., Supabase for metadata storage, Zilliz for vector search if we do retrieval, Lovable/SHISA.AI for language features).
- Provide a simple analytics view (charts/table) akin to Dune.
- World ID integration toggle for uniqueness.

## Out of Scope (for this short hack)
- Full mobile app; instead, use mocked device export or small sample JSON/CSV for ingestion.
- Large-scale data pipeline or HIPAA-grade privacy controls.
- Complex insurance premium logic.

## Technical plan (minimal)
- **Data ingest**: accept small JSON/CSV of health metrics (steps/HR).
- **On-chain anchor**: hash + minimal payload to Base (or testnet) via simple contract or existing client.
- **Query & summarize**: agent asks LLM to summarize anchored data; provide tx hash link.
- **MCP/tool use**: Tavily MCP for quick info lookup or logging/crypto tool from Spoon toolkit.
- **Error handling**: try/except around LLM/tool calls, clear error message to user.

## Milestones
1) Scaffold data ingest + mock sample file.
2) Wire Agent → SpoonOS → LLM (reuse baseline_llm_demo pattern).
3) Add MCP/tool call (reuse baseline_mcp_demo pattern) for enrichment/logging.
4) On-chain anchor minimal payload; return tx hash.
5) Present summary and tx link in UI/CLI.

## Open Questions
- Which chain/network (Base mainnet vs testnet)?
- World ID integration: mandatory or optional toggle?
- Sponsor tie-in priority (Supabase/Zilliz/etc.).
