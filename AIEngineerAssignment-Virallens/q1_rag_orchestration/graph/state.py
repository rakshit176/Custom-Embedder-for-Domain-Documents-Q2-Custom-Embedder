# graph/state.py
from typing import TypedDict, List, Optional, Dict, Any

class RAGState(TypedDict):
    """Shared state flowing through all agents in the RAG workflow."""

    # Input fields
    query: str
    chat_history: List[Dict[str, Any]]

    # Router outputs
    query_type: str  # "factual" | "conversational" | "ambiguous"
    sub_queries: List[str]
    route: str  # "retriever" | "reasoner" | "clarify"

    # Retriever outputs
    retrieved_chunks: List[Dict[str, Any]]
    retrieval_metadata: Dict[str, Any]

    # Reasoning outputs
    answer: str
    citations: List[str]
    confidence: str  # "low" | "medium" | "high"
    reasoning_trace: str

    # Critic outputs
    verdict: str  # "approve" | "retry" | "escalate"
    critique: str
    final_answer: Optional[str]

    # Flow control
    retry_count: int
