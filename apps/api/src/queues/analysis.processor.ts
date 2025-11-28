import { Worker, Job } from 'bullmq';
import redisConnection from '../config/redis';
import { analyzeEmail } from '../services/gemini.service';
import prisma from '../config/database';

interface EmailAnalysisJob {
    emailId: string;
}

export const emailAnalysisWorker = new Worker(
    'email-analysis',
    async (job: Job<EmailAnalysisJob>) => {
        const { emailId } = job.data;

        try {
            // Get email from database
            const email = await prisma.email.findUnique({
                where: { id: emailId },
            });

            if (!email) {
                throw new Error(`Email ${emailId} not found`);
            }

            // Analyze email with Gemini
            const analysis = await analyzeEmail(
                email.subject || '',
                email.from,
                email.body || '',
                email.snippet || ''
            );

            // Update email with analysis results
            await prisma.email.update({
                where: { id: emailId },
                data: {
                    category: analysis.category,
                    noiseScore: analysis.noiseScore,
                    importanceScore: analysis.importanceScore,
                    isNewsletter: analysis.isNewsletter,
                    isPromo: analysis.isPromo,
                    hasUnsubscribe: false, // analyzeEmail doesn't return this, handled in email.processor
                    unsubscribeLink: null, // analyzeEmail doesn't return this
                    summary: analysis.summary,
                    geminiAnalysis: analysis as any,
                },
            });

            // Update or create subscription if it's a newsletter
            if (analysis.isNewsletter || analysis.isPromo) {
                const senderEmail = email.from.match(/<(.+)>/)?.[1] || email.from;

                await prisma.subscription.upsert({
                    where: {
                        userId_senderEmail: {
                            userId: email.userId,
                            senderEmail,
                        },
                    },
                    update: {
                        lastEmailAt: email.receivedAt,
                        emailCount: {
                            increment: 1,
                        },
                    },
                    create: {
                        userId: email.userId,
                        senderEmail,
                        senderName: email.from.split('<')[0].trim(),
                        lastEmailAt: email.receivedAt,
                        emailCount: 1,
                    },
                });
            }

            console.log(`Analyzed email ${emailId}`);
        } catch (error) {
            console.error(`Error analyzing email ${emailId}:`, error);
            throw error;
        }
    },
    {
        connection: redisConnection,
        concurrency: 3,
    }
);

emailAnalysisWorker.on('completed', (job) => {
    console.log(`Analysis job ${job.id} completed`);
});

emailAnalysisWorker.on('failed', (job, err) => {
    console.error(`Analysis job ${job?.id} failed:`, err);
});
