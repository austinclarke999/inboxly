import { Router, Request, Response } from 'express';
import { unsubscribeFromSender, recordUnsubscribeAttempt } from '../services/unsubscribe.service';
import prisma from '../config/database';

const router = Router();

// Unsubscribe from a single subscription
router.post('/:subscriptionId', async (req: Request, res: Response) => {
    try {
        const { subscriptionId } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        if (subscription.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Attempt to unsubscribe
        const result = await unsubscribeFromSender(
            userId,
            subscription.senderEmail,
            subscriptionId
        );

        // Record the attempt
        await recordUnsubscribeAttempt(
            userId,
            subscription.senderEmail,
            result,
            subscriptionId
        );

        res.json({
            success: result.success,
            method: result.method,
            message: result.message,
            requiresManual: result.requiresManual,
        });
    } catch (error) {
        console.error('Unsubscribe error:', error);
        res.status(500).json({ error: 'Failed to unsubscribe' });
    }
});

// Bulk unsubscribe
router.post('/bulk', async (req: Request, res: Response) => {
    try {
        const { userId, subscriptionIds } = req.body;

        if (!userId || !subscriptionIds || !Array.isArray(subscriptionIds)) {
            return res.status(400).json({ error: 'userId and subscriptionIds array are required' });
        }

        const results = [];

        for (const subscriptionId of subscriptionIds) {
            const subscription = await prisma.subscription.findUnique({
                where: { id: subscriptionId },
            });

            if (subscription && subscription.userId === userId) {
                const result = await unsubscribeFromSender(
                    userId,
                    subscription.senderEmail,
                    subscriptionId
                );

                await recordUnsubscribeAttempt(
                    userId,
                    subscription.senderEmail,
                    result,
                    subscriptionId
                );

                results.push({
                    subscriptionId,
                    senderEmail: subscription.senderEmail,
                    ...result,
                });
            }
        }

        res.json({
            success: true,
            message: `Processed ${results.length} unsubscribe requests`,
            results,
        });
    } catch (error) {
        console.error('Bulk unsubscribe error:', error);
        res.status(500).json({ error: 'Failed to process bulk unsubscribe' });
    }
});

// Get unsubscribe attempts for a user
router.get('/attempts', async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'userId is required' });
        }

        const attempts = await prisma.unsubscribeAttempt.findMany({
            where: { userId },
            orderBy: { attemptedAt: 'desc' },
            take: 50,
        });

        res.json({ attempts });
    } catch (error) {
        console.error('Get attempts error:', error);
        res.status(500).json({ error: 'Failed to get unsubscribe attempts' });
    }
});

// Get unsubscribe status for a subscription
router.get('/status/:subscriptionId', async (req: Request, res: Response) => {
    try {
        const { subscriptionId } = req.params;

        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
            select: {
                isUnsubscribed: true,
                unsubscribedAt: true,
            },
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        // Get latest attempt
        const latestAttempt = await prisma.unsubscribeAttempt.findFirst({
            where: { subscriptionId },
            orderBy: { attemptedAt: 'desc' },
        });

        res.json({
            ...subscription,
            latestAttempt,
        });
    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({ error: 'Failed to get status' });
    }
});

export default router;
