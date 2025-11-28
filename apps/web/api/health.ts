import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    console.log('[Health Check] API is running');
    console.log('[Health Check] Environment:', process.env.NODE_ENV);
    console.log('[Health Check] Vercel Region:', process.env.VERCEL_REGION);

    const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        region: process.env.VERCEL_REGION || 'unknown',
        apiVersion: '1.0.0',
        endpoints: {
            auth: {
                google: '/api/auth/google',
                callback: '/api/auth/callback',
                me: '/api/auth/me'
            }
        },
        environmentVariables: {
            googleClientId: !!process.env.GOOGLE_CLIENT_ID,
            googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
            googleRedirectUri: !!process.env.GOOGLE_REDIRECT_URI,
            databaseUrl: !!process.env.DATABASE_URL,
            frontendUrl: !!process.env.FRONTEND_URL
        }
    };

    res.json(healthData);
}
