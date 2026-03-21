from fastapi import APIRouter, Depends, HTTPException

from app.core.security import get_current_user
from app.services.mongodb_client import history_col

router = APIRouter()


@router.get('/history')
async def get_history(
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user['sub']
    col = history_col()

    cursor = col.find(
        {'user_id': user_id},
        {
            'id': 1,
            'title': 1,
            'input_type': 1,
            'input_preview': 1,
            'timestamp': 1,
            'claim_count': 1,
            'accuracy': 1,
            '_id': 0,
        }
    ).sort('timestamp', -1).skip(offset).limit(limit)

    items = await cursor.to_list(length=limit)
    total = await col.count_documents({'user_id': user_id})

    return {'items': items, 'total': total}


@router.get('/history/{report_id}')
async def get_report(
    report_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user['sub']
    col = history_col()

    doc = await col.find_one(
        {'id': report_id, 'user_id': user_id},
        {'_id': 0}
    )

    if not doc:
        raise HTTPException(status_code=404, detail='Report not found')

    return doc.get('report_json', doc)
