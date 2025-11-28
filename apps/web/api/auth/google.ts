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
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
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

        // Redirect to Google OAuth
        res.redirect(authUrl);
    } catch (error: any) {
        console.error('OAuth error:', error);
        res.status(500).json({
            error: 'Failed to initialize OAuth',
            details: error.message
        });
    }
}
