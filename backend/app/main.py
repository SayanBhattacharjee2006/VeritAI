from contextlib import asynccontextmanager
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes import verify, auth, history, subscription
from app.core.config import settings
from app.core.rate_limiter import limiter
from app.services.mongodb_client import get_client, get_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup: verify MongoDB connection and create indexes ──
    try:
        client = get_client()
        await client.admin.command('ping')
        db = get_db()

        # Create indexes for performance
        await db['users'].create_index('email', unique=True)
        await db['verification_history'].create_index('user_id')
        await db['verification_history'].create_index(
            [('timestamp', -1)]
        )
        print("✓ MongoDB connected and indexes created")
    except Exception as e:
        print(f"FATAL: MongoDB connection failed: {e}", file=sys.stderr)
        print("Check MONGODB_URL in .env", file=sys.stderr)
        sys.exit(1)

    yield  # App runs here

    # ── Shutdown: close MongoDB connection ──
    get_client().close()
    print("MongoDB connection closed")


app = FastAPI(
    title='VeritAI API',
    version='1.0.0',
    description='AI-powered fact-checking backend',
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(verify.router, prefix='/api', tags=['verify'])
app.include_router(auth.router, prefix='/api', tags=['auth'])
app.include_router(history.router, prefix='/api', tags=['history'])
app.include_router(subscription.router, prefix='/api', tags=['subscription'])


@app.get('/api/health')
async def health():
    try:
        await get_client().admin.command('ping')
        db_status = 'connected'
    except Exception as e:
        db_status = f'error: {e}'
    return {
        'status': 'ok',
        'service': 'VeritAI API',
        'database': db_status,
    }
