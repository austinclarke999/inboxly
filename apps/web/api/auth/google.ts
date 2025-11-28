import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

// Initialize OAuth2 client
const getOAuth2Client = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
};

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Log request for debugging
    console.log('[OAuth Google] Received request');
    console.log('[OAuth Google] Method:', req.method);
    console.log('[OAuth Google] Headers:', req.headers);

    if (req.method !== 'GET') {
        console.error('[OAuth Google] Invalid method:', req.method);
        return res.status(405).json({
            error: 'Method not allowed',
            received: req.method,
            expected: 'GET'
        });
    }

    try {
        // Check environment variables
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('[OAuth Google] Missing GOOGLE_CLIENT_ID');
            return res.status(500).json({ error: 'Server configuration error: GOOGLE_CLIENT_ID not set' });
        }

        if (!process.env.GOOGLE_CLIENT_SECRET) {
            console.error('[OAuth Google] Missing GOOGLE_CLIENT_SECRET');
            return res.status(500).json({ error: 'Server configuration error: GOOGLE_CLIENT_SECRET not set' });
        }

        if (!process.env.GOOGLE_REDIRECT_URI) {
            console.error('[OAuth Google] Missing GOOGLE_REDIRECT_URI');
            return res.status(500).json({ error: 'Server configuration error: GOOGLE_REDIRECT_URI not set' });
        }

        const oauth2Client = getOAuth2Client();

        const scopes = [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ];

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent',
        });

        console.log('[OAuth Google] Generated auth URL, redirecting...');

        // Redirect to Google OAuth
        res.redirect(authUrl);
    } catch (error: any) {
        console.error('[OAuth Google] Error:', error);
        console.error('[OAuth Google] Stack:', error.stack);
        res.status(500).json({
            error: 'Failed to initialize OAuth',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
