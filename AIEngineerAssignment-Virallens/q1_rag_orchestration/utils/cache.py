# utils/cache.py
import json
import hashlib
import re
import redis.asyncio as redis
from typing import List, Dict, Any, Optional
from unittest.mock import Mock

class CacheManager:
    """
    Redis-based cache for semantic chunks and responses.

    Uses normalized query text as cache key for stability.
    """

    def __init__(self, redis_client: Optional[Any] = None):
        """
        Initialize cache manager.

        Args:
            redis_client: Redis client (uses Mock if None for testing)
        """
        self.redis = redis_client or Mock()

    def _normalize_query(self, query: str) -> str:
        """
        Normalize query for consistent cache keys.

        Args:
            query: Raw query string

        Returns:
            Normalized query (lowercase, normalized whitespace)
        """
        # Lowercase and normalize whitespace
        normalized = re.sub(r'\s+', ' ', query.lower().strip())
        return normalized

    def _cache_key(self, query: str, prefix: str = "semantic") -> str:
        """
        Generate cache key from normalized query.

        Args:
            query: Query string
            prefix: Key prefix (semantic or response)

        Returns:
            Cache key as SHA256 hash
        """
        normalized = self._normalize_query(query)
        hash_input = f"{prefix}:{normalized}".encode()
        return hashlib.sha256(hash_input).hexdigest()

    async def get_cached_chunks(self, query: str) -> Optional[List[Dict[str, Any]]]:
        """
        Get cached chunks for a query.

        Args:
            query: Query string

        Returns:
            Cached chunks or None if miss
        """
        key = self._cache_key(query, prefix="semantic")
        cached = await self.redis.get(f"semantic:{key}")

        if cached:
            return json.loads(cached)
        return None

    async def set_cached_chunks(
        self,
        query: str,
        chunks: List[Dict[str, Any]],
        ttl: int = 3600
    ):
        """
        Cache chunks for a query.

        Args:
            query: Query string
            chunks: Retrieved chunks to cache
            ttl: Time-to-live in seconds (default: 1 hour)
        """
        key = self._cache_key(query, prefix="semantic")
        await self.redis.set(
            f"semantic:{key}",
            json.dumps(chunks),
            ex=ttl
        )

    async def get_cached_response(
        self,
        query: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get cached final answer for a query.

        Args:
            query: Query string

        Returns:
            Cached response or None if miss
        """
        key = self._cache_key(query, prefix="response")
        cached = await self.redis.get(f"response:{key}")

        if cached:
            return json.loads(cached)
        return None

    async def set_cached_response(
        self,
        query: str,
        response: Dict[str, Any],
        ttl: int = 86400
    ):
        """
        Cache final answer for a query.

        Args:
            query: Query string
            response: Response dict with answer, citations, confidence
            ttl: Time-to-live in seconds (default: 24 hours)
        """
        key = self._cache_key(query, prefix="response")
        await self.redis.set(
            f"response:{key}",
            json.dumps(response),
            ex=ttl
        )
