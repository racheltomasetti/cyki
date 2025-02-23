from fastapi import APIRouter, HTTPException
from app.services.n8n_service import trigger_n8n_workflow

router = APIRouter()

@router.post("/trigger-workflow/")
async def trigger_workflow(payload: dict):
    try:
        response = trigger_n8n_workflow(payload)
        return {"status": "success", "data": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
