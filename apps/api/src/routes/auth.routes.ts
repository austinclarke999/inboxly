import { Router, Request, Response } from 'express';
import { getAuthUrl, getTokensFromCode } from '../config/google-auth';
import oauth2Client from '../config/google-auth';
import { google } from 'googleapis';
import prisma from '../config/database';

const router = Router();

// Initiate OAuth flow
router.get('/google', (req: Request, res: Response) => {
    const authUrl = getAuthUrl();
    res.redirect(authUrl);
});

// OAuth callback
router.get('/google/callback', async (req: Request, res: Response) => {
    try {
        const { code } = req.query;

        if (!code || typeof code !== 'string') {
            return res.status(400).json({ error: 'Authorization code is required' });
        }

        // Exchange code for tokens
        const tokens = await getTokensFromCode(code);

        if (!tokens.access_token || !tokens.refresh_token) {
            return res.status(400).json({ error: 'Failed to obtain tokens' });
        }

        // Get user info from Google
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2',
        });

        const userInfo = await oauth2.userinfo.get();
        const { email, name, id: googleId } = userInfo.data;

        if (!email) {
            return res.status(400).json({ error: 'Failed to get user email' });
        }

        // Encrypt tokens before storing (production security)
        let accessToken = tokens.access_token;
        let refreshToken = tokens.refresh_token;
        let tokenExpiry = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

        try {
            const { encrypt } = await import('../utils/encryption');
            accessToken = encrypt(tokens.access_token);
            refreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : tokens.refresh_token;
        } catch (error) {
            console.log('Token encryption unavailable, storing unencrypted (development mode)');
        }

        // Create or update user in database
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
            create: { userId: user.id },
        });

        // In production, you'd set a session/JWT here
        // For now, redirect to frontend with user ID
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/dashboard.html?userId=${user.id}`);
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Get current user info
router.get('/me', async (req: Request, res: Response) => {
    try {
        // In production, get userId from session/JWT
        const { userId } = req.query;

        if (!userId || typeof userId !== 'string') {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// Development only: Create test user (bypass OAuth)
if (process.env.NODE_ENV === 'development') {
    router.post('/dev/create-test-user', async (req: Request, res: Response) => {
        try {
            const { email, name } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }

            // Create or get test user
            const user = await prisma.user.upsert({
                where: { email },
                update: {
                    name: name || 'Test User',
                },
                create: {
                    email,
                    name: name || 'Test User',
                    googleId: `test_${Date.now()}`,
                },
            });

            // Create user settings if they don't exist
            await prisma.userSettings.upsert({
                where: { userId: user.id },
                update: {},
                create: { userId: user.id },
            });

            res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                redirectUrl: `${process.env.FRONTEND_URL}/dashboard.html?userId=${user.id}`,
            });
        } catch (error) {
            console.error('Create test user error:', error);
            res.status(500).json({ error: 'Failed to create test user' });
        }
    });
}

export default router;
