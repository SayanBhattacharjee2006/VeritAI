from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.models.verification import UpgradeRequest
from app.services.mongodb_client import users_col

router = APIRouter()


@router.get('/user/plan')
async def get_plan(current_user: dict = Depends(get_current_user)):
    user_id = current_user['sub']
    col = users_col()

    user = await col.find_one(
        {'id': user_id},
        {'plan': 1, 'daily_checks_used': 1, '_id': 0}
    )
    if not user:
        raise HTTPException(status_code=404, detail='User not found')

    return {
        'plan': user.get('plan', 'free'),
        'daily_checks_used': user.get('daily_checks_used', 0),
    }


@router.post('/user/upgrade')
async def upgrade_plan(
    body: UpgradeRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user['sub']
    col = users_col()

    result = await col.update_one(
        {'id': user_id},
        {'$set': {'plan': body.plan}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail='User not found')

    return {
        'plan': body.plan,
        'message': f'Plan upgraded to {body.plan}',
    }
