import requests

N8N_WEBHOOK_URL = "https://racheltomasetti.app.n8n.cloud/webhook-test/ff1ad3c9-7efb-4bf2-bb4d-c3b58db50ec8"  # Replace with actual webhook

def trigger_n8n_workflow(data: dict):
    response = requests.post(N8N_WEBHOOK_URL, json=data)
    response.raise_for_status()
    return response.json()
