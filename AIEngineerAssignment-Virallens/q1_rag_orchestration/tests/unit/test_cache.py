# tests/unit/test_cache.py
import pytest
import redis
from unittest.mock import Mock, patch, AsyncMock
from utils.cache import CacheManager

@pytest.fixture
def mock_redis():
    """Mock Redis client."""
    redis_mock = Mock()
    redis_mock.get = AsyncMock()
    redis_mock.set = AsyncMock()
    return redis_mock

@pytest.mark.asyncio
async def test_get_cached_chunks_returns_none_on_miss(mock_redis):
    """Should return None when cache miss."""
    mock_redis.get.return_value = None

    cache = CacheManager(redis_client=mock_redis)
    result = await cache.get_cached_chunks("test query")

    assert result is None
    mock_redis.get.assert_called_once()

@pytest.mark.asyncio
async def test_get_cached_chunks_returns_chunks_on_hit(mock_redis):
    """Should return chunks on cache hit."""
    import json

    chunks = [{"text": "sample", "source": "doc1"}]
    mock_redis.get.return_value = json.dumps(chunks)

    cache = CacheManager(redis_client=mock_redis)
    result = await cache.get_cached_chunks("test query")

    assert result == chunks

@pytest.mark.asyncio
async def test_set_cached_chunks_stores_with_ttl(mock_redis):
    """Should store chunks with 1 hour TTL."""
    import json

    chunks = [{"text": "sample"}]
    mock_redis.set.return_value = True

    cache = CacheManager(redis_client=mock_redis)
    await cache.set_cached_chunks("test query", chunks)

    # Verify key format and TTL
    call_args = mock_redis.set.call_args
    assert "semantic:" in call_args[0][0]
    assert call_args[1]["ex"] == 3600  # 1 hour

@pytest.mark.asyncio
async def test_normalize_query_for_cache_key():
    """Should normalize query for consistent cache keys."""
    cache = CacheManager(redis_client=Mock())

    # These should produce the same normalized query
    key1 = cache._normalize_query("  Hello   WORLD  ")
    key2 = cache._normalize_query("hello world")

    assert key1 == key2
