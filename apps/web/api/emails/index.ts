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
        const { userId, category, limit = '50', offset = '0' } = req.query;

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

    } catch (error: any) {
        console.error('Get emails error:', error);
        res.status(500).json({
            error: 'Failed to get emails',
            details: error.message
        });
    } finally {
        await prisma.$disconnect();
    }
}
