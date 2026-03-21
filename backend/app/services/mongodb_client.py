import sys

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

# Module-level client and db — initialized on first import
_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        try:
            _client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=5000,
            )
        except Exception as e:
            print(f"FATAL: Could not create MongoDB client: {e}", file=sys.stderr)
            raise
    return _client


def get_db() -> AsyncIOMotorDatabase:
    global _db
    if _db is None:
        _db = get_client()[settings.MONGODB_DB_NAME]
    return _db


# Convenience accessors for collections
def users_col():
    return get_db()['users']


def history_col():
    return get_db()['verification_history']
