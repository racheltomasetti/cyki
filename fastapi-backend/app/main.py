from fastapi import FastAPI, Request
import httpx
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
N8N_WEBHOOK_URL = "https://racheltomasetti.app.n8n.cloud/webhook-test/ff1ad3c9-7efb-4bf2-bb4d-c3b58db50ec8"  # Replace with actual webhook



# Load environment variables
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporarily for debugging
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/trigger-n8n-webhook")
async def trigger_n8n_webhook(data: dict):
    """
    Handle webhook trigger with simple JSON payload
    """
    try:
        # Extract data from payload
        chatInput = data.get('chatInput')
        
        # Your N8N webhook forwarding logic here
        async with httpx.AsyncClient() as client:
            n8n_response = await client.post(
                N8N_WEBHOOK_URL, 
                json={
                    'chatInput': chatInput,
                }
            )
        
        return {
            "status": "success",
            "n8n_response": n8n_response.json()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }