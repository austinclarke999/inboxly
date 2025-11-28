import { Worker, Job } from 'bullmq';
import redisConnection from '../config/redis';
import { createGmailService } from '../services/gmail.service';
import { generateUnsubscribeEmail } from '../services/gemini.service';
import prisma from '../config/database';

interface UnsubscribeJob {
    userId: string;
    subscriptionId: string;
}

export const unsubscribeWorker = new Worker(
    'unsubscribe',
    async (job: Job<UnsubscribeJob>) => {
        const { userId, subscriptionId } = job.data;

        try {
            const subscription = await prisma.subscription.findUnique({
                where: { id: subscriptionId },
            });

            if (!subscription) {
                throw new Error(`Subscription ${subscriptionId} not found`);
            }

            // Check for unsubscribe link in recent emails
            const recentEmail = await prisma.email.findFirst({
                where: {
                    userId,
                    from: {
                        contains: subscription.senderEmail,
                    },
                    hasUnsubscribe: true,
                },
                orderBy: { receivedAt: 'desc' },
            });

            if (!recentEmail?.unsubscribeLink) {
                // Generate and send unsubscribe email
                const gmailService = await createGmailService(userId);
                const unsubEmail = await generateUnsubscribeEmail(
                    subscription.senderEmail,
                    subscription.senderName || subscription.senderEmail
                );

                await gmailService.sendEmail(subscription.senderEmail, unsubEmail.subject, unsubEmail.body);
            }

            // Mark as unsubscribed
            await prisma.subscription.update({
                where: { id: subscriptionId },
                data: {
                    isUnsubscribed: true,
                    unsubscribedAt: new Date(),
                },
            });

            // Update user settings
            await prisma.userSettings.update({
                where: { userId },
                data: {
                    subscriptionsRemoved: {
                        increment: 1,
                    },
                },
            });

            console.log(`Unsubscribed from ${subscription.senderEmail}`);
        } catch (error) {
            console.error(`Error unsubscribing from ${subscriptionId}:`, error);
            throw error;
        }
    },
    {
        connection: redisConnection,
        concurrency: 2,
    }
);

unsubscribeWorker.on('completed', (job) => {
    console.log(`Unsubscribe job ${job.id} completed`);
});

unsubscribeWorker.on('failed', (job, err) => {
    console.error(`Unsubscribe job ${job?.id} failed:`, err);
});
