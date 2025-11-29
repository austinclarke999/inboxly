import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to decrypt tokens (matches callback.ts encryption)
function decrypt(encryptedText: string): string {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) return encryptedText;

    // Simple base64 decoding (matches the encryption in callback.ts)
    return Buffer.from(encryptedText, 'base64').toString('utf-8');
}

// Initialize Gmail API client
function createGmailClient(accessToken: string, refreshToken: string) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
}

// Parse email headers
function parseHeaders(headers: any[]): any {
    const headerMap: any = {};
    headers.forEach((header: any) => {
        headerMap[header.name.toLowerCase()] = header.value;
    });
    return headerMap;
}

// Extract email body
function extractBody(payload: any): string {
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
                body = extractBody(part);
                if (body) break;
            }
        }
    }

    return body;
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        // Get user tokens from database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { accessToken: true, refreshToken: true },
        });

        if (!user || !user.accessToken) {
            return res.status(401).json({ error: 'User not authenticated with Gmail' });
        }

        // Decrypt tokens
        const accessToken = decrypt(user.accessToken);
        const refreshToken = user.refreshToken ? decrypt(user.refreshToken) : '';

        // Create Gmail client
        const gmail = createGmailClient(accessToken, refreshToken);

        // Fetch messages (limited to 20 for serverless timeout constraints)
        const listResponse = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 20,
        });

        const messages = listResponse.data.messages || [];
        let processedCount = 0;

        // Process each message
        for (const message of messages) {
            try {
                // Check if we already have this email
                const existing = await prisma.email.findUnique({
                    where: { messageId: message.id! },
                });

                if (existing) continue;

                // Get full email details
                const emailData = await gmail.users.messages.get({
                    userId: 'me',
                    id: message.id!,
                    format: 'full',
                });

                const payload = emailData.data.payload;
                const headers = parseHeaders(payload?.headers || []);
                const body = extractBody(payload);

                // Save to database
                await prisma.email.create({
                    data: {
                        userId,
                        messageId: message.id!,
                        threadId: emailData.data.threadId || null,
                        subject: headers.subject || '(No Subject)',
                        from: headers.from || '',
                        to: headers.to || null,
                        body: body || null,
                        snippet: emailData.data.snippet || null,
                        receivedAt: new Date(parseInt(emailData.data.internalDate || '0')),
                    },
                });

                processedCount++;
            } catch (error) {
                console.error(`Failed to process message ${message.id}:`, error);
                // Continue with next message
            }
        }

        // Update user's last sync time
        await prisma.user.update({
            where: { id: userId },
            data: { lastSyncedAt: new Date() },
        });

        res.json({
            success: true,
            message: `Synced ${processedCount} new emails`,
            total: messages.length,
            processed: processedCount,
        });

    } catch (error: any) {
        console.error('Email sync error:', error);
        res.status(500).json({
            error: 'Failed to sync emails',
            details: error.message,
        });
    } finally {
        await prisma.$disconnect();
    }
}
