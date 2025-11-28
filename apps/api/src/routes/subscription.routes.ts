import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { classifySender } from '../services/gemini.service';

const router = Router();

// Get all subscriptions for a user
router.get('/', async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'userId is required' });
        }

        const subscriptions = await prisma.subscription.findMany({
            where: { userId },
            orderBy: { emailCount: 'desc' },
        });

        res.json({ subscriptions });
    } catch (error) {
        console.error('Get subscriptions error:', error);
        res.status(500).json({ error: 'Failed to get subscriptions' });
    }
});

// Get subscription details
router.get('/:subscriptionId', async (req: Request, res: Response) => {
    try {
        const { subscriptionId } = req.params;

        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });

        if (!subscription) {
            return res.status(404).json({ error: 'Subscription not found' });
        }

        res.json(subscription);
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({ error: 'Failed to get subscription' });
    }
});

// Get billing subscriptions
router.get('/billing/all', async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'userId is required' });
        }

        const billingSubscriptions = await prisma.subscription.findMany({
            where: {
                userId,
                isBilling: true,
            },
            orderBy: { amount: 'desc' },
        });

        const totalMonthly = billingSubscriptions
            .filter((s) => s.billingCycle === 'monthly')
            .reduce((sum: number, s) => sum + (s.amount || 0), 0);

        const totalYearly = billingSubscriptions
            .filter((s) => s.billingCycle === 'yearly')
            .reduce((sum: number, s) => sum + (s.amount || 0), 0);

        res.json({
            subscriptions: billingSubscriptions,
            summary: {
                totalMonthly,
                totalYearly,
                annualForecast: totalMonthly * 12 + totalYearly,
            },
        });
    } catch (error) {
        console.error('Get billing subscriptions error:', error);
        res.status(500).json({ error: 'Failed to get billing subscriptions' });
    }
});

// Analyze sender
router.post('/analyze-sender', async (req: Request, res: Response) => {
    try {
        const { senderEmail, userId } = req.body;

        if (!senderEmail || !userId) {
            return res.status(400).json({ error: 'senderEmail and userId are required' });
        }

        // Get recent emails from this sender
        const recentEmails = await prisma.email.findMany({
            where: {
                userId,
                from: {
                    contains: senderEmail,
                },
            },
            orderBy: { receivedAt: 'desc' },
            take: 10,
            select: { subject: true },
        });

        const emailHistory = recentEmails.map((e: { subject: string | null }) => e.subject || '');

        // Analyze with Gemini
        const analysis = await classifySender(senderEmail, emailHistory);

        res.json(analysis);
    } catch (error) {
        console.error('Analyze sender error:', error);
        res.status(500).json({ error: 'Failed to analyze sender' });
    }
});

export default router;
