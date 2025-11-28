const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth
    async getCurrentUser(userId: string) {
        return this.request(`/auth/me?userId=${userId}`);
    }

    // Emails
    async syncEmails(userId: string) {
        return this.request('/emails/sync', {
            method: 'POST',
            body: JSON.stringify({ userId }),
        });
    }

    async getEmails(userId: string, category?: string, limit = 50, offset = 0) {
        const params = new URLSearchParams({
            userId,
            limit: limit.toString(),
            offset: offset.toString(),
            ...(category && { category }),
        });
        return this.request(`/emails?${params}`);
    }

    async getEmailDetails(emailId: string) {
        return this.request(`/emails/${emailId}`);
    }

    async analyzeEmail(emailId: string) {
        return this.request(`/emails/${emailId}/analyze`, {
            method: 'POST',
        });
    }

    // Subscriptions
    async getSubscriptions(userId: string) {
        return this.request(`/subscriptions?userId=${userId}`);
    }

    async getBillingSubscriptions(userId: string) {
        return this.request(`/subscriptions/billing/all?userId=${userId}`);
    }

    async analyzeSender(userId: string, senderEmail: string) {
        return this.request('/subscriptions/analyze-sender', {
            method: 'POST',
            body: JSON.stringify({ userId, senderEmail }),
        });
    }

    // Unsubscribe
    async bulkUnsubscribe(userId: string, subscriptionIds: string[]) {
        return this.request('/unsubscribe/bulk', {
            method: 'POST',
            body: JSON.stringify({ userId, subscriptionIds }),
        });
    }

    async unsubscribe(userId: string, subscriptionId: string) {
        return this.request(`/unsubscribe/${subscriptionId}`, {
            method: 'POST',
            body: JSON.stringify({ userId }),
        });
    }

    // Gemini
    async categorizeEmail(content: string) {
        return this.request('/gemini/categorize', {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    }

    async summarizeEmail(content: string) {
        return this.request('/gemini/summarize', {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    }
}

export const api = new ApiClient();
export default api;
