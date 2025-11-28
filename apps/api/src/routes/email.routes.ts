import { Router, Request, Response } from 'express';
import { createGmailService } from '../services/gmail.service';
import { emailProcessingQueue, emailAnalysisQueue } from '../queues/queues';
import prisma from '../config/database';

const router = Router();

// Sync emails from Gmail
router.post('/sync', async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        // Create Gmail service
        const gmailService = await createGmailService(userId);

        // Fetch emails
        const { messages } = await gmailService.fetchEmails(50);

        // Queue emails for processing
        const jobs = messages.map((msg: any) => ({
            name: `process-${msg.id}`,
            data: { userId, messageId: msg.id },
        }));

        await emailProcessingQueue.addBulk(jobs);

        res.json({
            success: true,
            message: `Queued ${messages.length} emails for processing`,
            count: messages.length,
        });
    } catch (error: any) {
        console.error('Email sync error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Failed to sync emails',
            details: error.message
        });
    }
});

// Get user's emails
router.get('/', async (req: Request, res: Response) => {
    try {
        const { userId, category, limit = 50, offset = 0 } = req.query;

        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({ error: 'userId is required' });
        }

        const where: any = { userId };
        if (category && typeof category === 'string') {
            where.category = category;
        }

        const emails = await prisma.email.findMany({
            where,
            orderBy: { receivedAt: 'desc' },
            take: parseInt(limit as string),
            skip: parseInt(offset as string),
            select: {
                id: true,
                subject: true,
                from: true,
                snippet: true,
                receivedAt: true,
                category: true,
                noiseScore: true,
                importanceScore: true,
                isNewsletter: true,
                isPromo: true,
            },
        });

        const total = await prisma.email.count({ where });

        res.json({
            emails,
            total,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
        });
    } catch (error) {
        console.error('Get emails error:', error);
        res.status(500).json({ error: 'Failed to get emails' });
    }
});

// Get email details
router.get('/:emailId', async (req: Request, res: Response) => {
    try {
        const { emailId } = req.params;

        const email = await prisma.email.findUnique({
            where: { id: emailId },
        });

        if (!email) {
            return res.status(404).json({ error: 'Email not found' });
        }

        res.json(email);
    } catch (error) {
        console.error('Get email error:', error);
        res.status(500).json({ error: 'Failed to get email' });
    }
});

// Trigger analysis for an email
router.post('/:emailId/analyze', async (req: Request, res: Response) => {
    try {
        const { emailId } = req.params;

        await emailAnalysisQueue.add('analyze', { emailId });

        res.json({ success: true, message: 'Email queued for analysis' });
    } catch (error) {
    }
});

// Development only: Generate mock emails for testing
if (process.env.NODE_ENV === 'development') {
    router.post('/dev/generate-mock-emails', async (req: Request, res: Response) => {
        try {
            const { userId, count = 10 } = req.body;

            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            // Verify user exists
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const mockEmails = [];
            const categories = ['Work', 'Personal', 'Newsletter', 'Promotion', 'Social', 'Finance', 'Travel', 'Shopping'];
            const senders = [
                { name: 'GitHub', email: 'noreply@github.com' },
                { name: 'LinkedIn', email: 'messages@linkedin.com' },
                { name: 'Amazon', email: 'shipment-tracking@amazon.com' },
                { name: 'Netflix', email: 'info@netflix.com' },
                { name: 'Stripe', email: 'receipts@stripe.com' },
                { name: 'Google Cloud', email: 'noreply@google.com' },
                { name: 'Airbnb', email: 'automated@airbnb.com' },
                { name: 'Medium', email: 'noreply@medium.com' },
            ];

            for (let i = 0; i < count; i++) {
                const sender = senders[Math.floor(Math.random() * senders.length)];
                const category = categories[Math.floor(Math.random() * categories.length)];
                const isNewsletter = category === 'Newsletter';
                const isPromo = category === 'Promotion';

                const email = await prisma.email.create({
                    data: {
                        userId,
                        messageId: `mock_${Date.now()}_${i}`,
                        threadId: `thread_${i}`,
                        subject: `${category}: Mock Email ${i + 1}`,
                        from: `${sender.name} <${sender.email}>`,
                        to: user.email,
                        body: `This is a mock email for testing purposes. Category: ${category}`,
                        snippet: `Mock email snippet for ${category} category...`,
                        receivedAt: new Date(Date.now() - i * 3600000), // Spread over hours
                        category,
                        noiseScore: Math.floor(Math.random() * 100),
                        importanceScore: Math.floor(Math.random() * 100),
                        isNewsletter,
                        isPromo,
                        hasUnsubscribe: isNewsletter || isPromo,
                        unsubscribeLink: (isNewsletter || isPromo) ? `https://example.com/unsubscribe/${i}` : null,
                    },
                });

                mockEmails.push(email);
            }

            res.json({
                success: true,
                message: `Generated ${count} mock emails`,
                count: mockEmails.length,
                emails: mockEmails.map(e => ({
                    id: e.id,
                    subject: e.subject,
                    from: e.from,
                    category: e.category,
                })),
            });
        } catch (error) {
            console.error('Generate mock emails error:', error);
            res.status(500).json({ error: 'Failed to generate mock emails' });
        }
    });
}

export default router;
