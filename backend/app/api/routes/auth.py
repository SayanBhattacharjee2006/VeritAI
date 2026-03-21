import uuid

from fastapi import APIRouter, HTTPException

from app.core.security import hash_password, verify_password, create_access_token
from app.models.verification import RegisterRequest, LoginRequest
from app.services.mongodb_client import users_col

router = APIRouter()


@router.post('/auth/register', status_code=201)
async def register(body: RegisterRequest):
    col = users_col()

    # Check duplicate email
    existing = await col.find_one({'email': body.email})
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')

    user_id = str(uuid.uuid4())
    hashed = hash_password(body.password)

    user_doc = {
        '_id': user_id,
        'id': user_id,
        'name': body.name,
        'email': body.email,
        'hashed_password': hashed,
        'plan': 'free',
        'daily_checks_used': 0,
    }

    try:
        await col.insert_one(user_doc)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f'User creation failed: {str(e)}'
        )

    token = create_access_token({'sub': user_id, 'email': body.email})
    return {
        'access_token': token,
        'token_type': 'bearer',
        'user': {
            'id': user_id,
            'name': body.name,
            'email': body.email,
            'plan': 'free',
        },
    }


@router.post('/auth/login')
async def login(body: LoginRequest):
    col = users_col()

    user = await col.find_one({'email': body.email})
    if not user:
        raise HTTPException(status_code=401, detail='Invalid credentials')

    if not verify_password(body.password, user['hashed_password']):
        raise HTTPException(status_code=401, detail='Invalid credentials')

    token = create_access_token(
        {'sub': user['id'], 'email': user['email']}
    )
    return {
        'access_token': token,
        'token_type': 'bearer',
        'user': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'plan': user.get('plan', 'free'),
        },
    }


@router.get('/auth/debug-db')
async def debug_db():
    """Temporary debug endpoint — remove before production"""
    try:
        col = users_col()
        count = await col.count_documents({})
        return {
            'status': 'connected',
            'users_collection': 'exists',
            'user_count': count,
        }
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e),
        }
