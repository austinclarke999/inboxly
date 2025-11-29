import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId } = req.query;

        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'userId is required' });
        }

        // Get user settings (contains tracked stats)
        const settings = await prisma.userSettings.findUnique({
            where: { userId },
        });

        // Count emails
        const emailCount = await prisma.email.count({
            where: { userId },
        });

        // Count unsubscribed subscriptions
        const unsubscribedCount = await prisma.subscription.count({
            where: { userId, isUnsubscribed: true },
        });

        // Calculate money saved from billing subscriptions
        const billingSubscriptions = await prisma.subscription.findMany({
            where: {
                userId,
                isUnsubscribed: true,
                isBilling: true,
                amount: { not: null }
            },
            select: { amount: true },
        });

        const moneySaved = billingSubscriptions.reduce((total, sub) => total + (sub.amount || 0), 0);

        // Calculate noise reduction percentage
        const noiseReduction = emailCount > 0
            ? Math.min(Math.round((unsubscribedCount / emailCount) * 100), 100)
            : 0;

        // Calculate inbox health score
        const healthScore = settings?.inboxHealthScore || 0;

        // Determine achievements
        const achievements = [
            {
                id: 'inbox-ninja',
                name: 'Inbox Ninja',
                status: emailCount >= 100 ? 'Unlocked!' : 'Locked',
                unlocked: emailCount >= 100,
            },
            {
                id: 'signal-saver',
                name: 'Signal Saver',
                status: unsubscribedCount >= 10 ? 'Unlocked!' : 'Locked',
                unlocked: unsubscribedCount >= 10,
            },
            {
                id: 'zero-inbox-hero',
                name: 'Zero Inbox Hero',
                status: healthScore >= 90 ? 'Unlocked!' : 'Locked',
                unlocked: healthScore >= 90,
            },
            {
                id: 'subscription-samurai',
                name: 'Subscription Samurai',
                status: unsubscribedCount >= 25 ? 'Unlocked!' : 'Locked',
                unlocked: unsubscribedCount >= 25,
            },
        ];

        res.json({
            emailsProcessed: emailCount,
            subscriptionsRemoved: unsubscribedCount,
            moneySaved: moneySaved.toFixed(2),
            noiseReduced: noiseReduction,
            healthScore: healthScore,
            achievements,
        });

    } catch (error: any) {
        console.error('Get stats error:', error);
        res.status(500).json({
            error: 'Failed to get stats',
            details: error.message
        });
    } finally {
        await prisma.$disconnect();
    }
}
