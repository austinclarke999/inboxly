import { google } from 'googleapis';
import { setCredentials } from '../config/google-auth';
import prisma from '../config/database';

export class GmailService {
    private gmail: any;

    constructor(accessToken: string, refreshToken: string) {
        const auth = setCredentials(accessToken, refreshToken);
        this.gmail = google.gmail({ version: 'v1', auth });
    }

    /**
     * Fetch emails from Gmail
     */
    async fetchEmails(maxResults: number = 50, pageToken?: string) {
        try {
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                maxResults,
                pageToken,
            });

            return {
                messages: response.data.messages || [],
                nextPageToken: response.data.nextPageToken,
            };
        } catch (error) {
            console.error('Error fetching emails:', error);
            throw error;
        }
    }

    /**
     * Get full email details
     */
    async getEmailDetails(messageId: string) {
        try {
            const response = await this.gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full',
            });

            return response.data;
        } catch (error) {
            console.error('Error getting email details:', error);
            throw error;
        }
    }

    /**
     * Parse email headers
     */
    parseHeaders(headers: any[]) {
        const headerMap: any = {};
        headers.forEach((header: any) => {
            headerMap[header.name.toLowerCase()] = header.value;
        });
        return headerMap;
    }

    /**
     * Extract email body
     */
    extractBody(payload: any): string {
        let body = '';

        if (payload.body?.data) {
            body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
        } else if (payload.parts) {
            for (const part of payload.parts) {
                if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
                    if (part.body?.data) {
                        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
                        break;
                    }
                }
                if (part.parts) {
                    body = this.extractBody(part);
                    if (body) break;
                }
            }
        }

        return body;
    }

    /**
     * Send an email (for unsubscribe requests)
     */
    async sendEmail(to: string, subject: string, body: string) {
        try {
            const message = [
                `To: ${to}`,
                `Subject: ${subject}`,
                '',
                body,
            ].join('\n');

            const encodedMessage = Buffer.from(message)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            const response = await this.gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    /**
     * Modify email labels (archive, delete, etc.)
     */
    async modifyLabels(messageId: string, addLabels: string[] = [], removeLabels: string[] = []) {
        try {
            const response = await this.gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                requestBody: {
                    addLabelIds: addLabels,
                    removeLabelIds: removeLabels,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error modifying labels:', error);
            throw error;
        }
    }

    /**
     * Archive an email
     */
    async archiveEmail(messageId: string) {
        return this.modifyLabels(messageId, [], ['INBOX']);
    }

    /**
     * Delete an email
     */
    async deleteEmail(messageId: string) {
        try {
            await this.gmail.users.messages.trash({
                userId: 'me',
                id: messageId,
            });
        } catch (error) {
            console.error('Error deleting email:', error);
            throw error;
        }
    }
}

/**
 * Create Gmail service instance for a user
 */
export async function createGmailService(userId: string): Promise<GmailService> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { accessToken: true, refreshToken: true },
    });

    if (!user || !user.accessToken || !user.refreshToken) {
        throw new Error('User not found or not authenticated');
    }

    // Decrypt tokens if they're encrypted
    let accessToken = user.accessToken;
    let refreshToken = user.refreshToken;

    try {
        // Try to decrypt - if it fails, assume tokens are not encrypted (dev mode)
        const { decrypt } = await import('../utils/encryption');
        accessToken = decrypt(user.accessToken);
        refreshToken = decrypt(user.refreshToken);
    } catch (error) {
        // Tokens are not encrypted (development mode)
        console.log('Using unencrypted tokens (development mode)');
    }

    return new GmailService(accessToken, refreshToken);
}
