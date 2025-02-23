import axios from "axios";

class WebhookService {
  static apiClient = axios.create({
    baseURL: "http://192.168.12.1:8000", // Replace with your FastAPI backend IP
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  /**
   * Trigger N8N webhook through FastAPI backend
   * @param {Object} data - The payload to send to the webhook
   * @returns {Promise} - Promise resolving with the response from the webhook
   */
  static async triggerWebhook(data: any) {
    try {
      const response = await this.apiClient.post("/trigger-n8n-webhook", data);
      return response.data;
    } catch (error: any) {
      console.error("Webhook Error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(
            error.response.data.message || "Webhook trigger failed"
          );
        } else if (error.request) {
          throw new Error("No response from server");
        }
      }

      throw new Error("Error in webhook request");
    }
  }
}

export default WebhookService;
