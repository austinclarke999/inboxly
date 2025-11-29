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
        const { id } = req.query;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'Email ID is required' });
        }

        const email = await prisma.email.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });

        if (!email) {
            return res.status(404).json({ error: 'Email not found' });
        }

        res.json(email);

    } catch (error: any) {
        console.error('Get email details error:', error);
        res.status(500).json({
            error: 'Failed to get email details',
            details: error.message
        });
    } finally {
        await prisma.$disconnect();
    }
}
