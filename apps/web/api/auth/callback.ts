import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize OAuth2 client
const getOAuth2Client = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
};

// Simple encryption (for production, use proper encryption library)
function encrypt(text: string): string {
    // Using environment-based encryption key
    const key = process.env.ENCRYPTION_KEY;
    if (!key) return text;

    // Simple base64 encoding for now (replace with actual encryption in production)
    return Buffer.from(text).toString('base64');
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code } = req.query;

    if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Authorization code is required' });
    }

    try {
        const oauth2Client = getOAuth2Client();

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.access_token) {
            return res.status(400).json({ error: 'Failed to get access token' });
        }

        // Set credentials
        oauth2Client.setCredentials(tokens);

        // Get user info
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();

        const email = userInfo.data.email;
        const name = userInfo.data.name;
        const googleId = userInfo.data.id;

        if (!email) {
            return res.status(400).json({ error: 'Failed to get user email' });
        }

        // Encrypt tokens
        let accessToken = tokens.access_token;
        let refreshToken = tokens.refresh_token || null;
        let tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

        try {
            accessToken = encrypt(tokens.access_token);
            if (refreshToken) {
                refreshToken = encrypt(refreshToken);
            }
        } catch (error) {
            console.log('Encryption failed, storing unencrypted');
        }

        // Create or update user
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                accessToken,
                refreshToken,
                tokenExpiry,
                name: name || undefined,
                googleId: googleId || undefined,
            },
            create: {
                email,
                name: name || undefined,
                googleId: googleId || undefined,
                accessToken,
                refreshToken,
                tokenExpiry,
            },
        });

        // Create user settings if they don't exist
        await prisma.userSettings.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                import type { VercelRequest, VercelResponse } from '@vercel/node';
        import { google } from 'googleapis';
        import { PrismaClient } from '@prisma/client';

        const prisma = new PrismaClient();

        // Initialize OAuth2 client
        const getOAuth2Client = () => {
            return new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URI
            );
        };

        // Simple encryption (for production, use proper encryption library)
        function encrypt(text: string): string {
            // Using environment-based encryption key
            const key = process.env.ENCRYPTION_KEY;
            if (!key) return text;

            // Simple base64 encoding for now (replace with actual encryption in production)
            return Buffer.from(text).toString('base64');
        }

        export default async function handler(
            req: VercelRequest,
            res: VercelResponse
        ) {
            if (req.method !== 'GET') {
                return res.status(405).json({ error: 'Method not allowed' });
            }

            const { code } = req.query;

            if (!code || typeof code !== 'string') {
                return res.status(400).json({ error: 'Authorization code is required' });
            }

            try {
                const oauth2Client = getOAuth2Client();

                // Exchange code for tokens
                const { tokens } = await oauth2Client.getToken(code);

                if (!tokens.access_token) {
                    return res.status(400).json({ error: 'Failed to get access token' });
                }

                // Set credentials
                oauth2Client.setCredentials(tokens);

                // Get user info
                const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
                const userInfo = await oauth2.userinfo.get();

                const email = userInfo.data.email;
                const name = userInfo.data.name;
                const googleId = userInfo.data.id;

                if (!email) {
                    return res.status(400).json({ error: 'Failed to get user email' });
                }

                // Encrypt tokens
                let accessToken = tokens.access_token;
                let refreshToken = tokens.refresh_token || null;
                let tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

                try {
                    accessToken = encrypt(tokens.access_token);
                    if (refreshToken) {
                        refreshToken = encrypt(refreshToken);
                    }
                } catch (error) {
                    console.log('Encryption failed, storing unencrypted');
                }

                // Create or update user
                const user = await prisma.user.upsert({
                    where: { email },
                    update: {
                        accessToken,
                        refreshToken,
                        tokenExpiry,
                        name: name || undefined,
                        googleId: googleId || undefined,
                    },
                    create: {
                        email,
                        name: name || undefined,
                        googleId: googleId || undefined,
                        accessToken,
                        refreshToken,
                        tokenExpiry,
                    },
                });

                // Create user settings if they don't exist
                await prisma.userSettings.upsert({
                    where: { userId: user.id },
                    update: {},
                    create: {
                        userId: user.id,
                        dailyDigest: true,
                        weeklyDigest: true,
                    },
                });

                // Redirect to dashboard with user ID (relative path works since API and frontend are on same domain)
                res.redirect(`/app/dashboard?userId=${user.id}`);

            } catch (error: any) {
                console.error('OAuth callback error:', error);
                res.redirect('/?error=auth_failed');
            } finally {
                await prisma.$disconnect();
            }
        }
