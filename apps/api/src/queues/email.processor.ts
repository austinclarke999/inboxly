import { Worker, Job } from 'bullmq';
import redisConnection from '../config/redis';
import { createGmailService } from '../services/gmail.service';
import { analyzeEmail } from '../services/gemini.service';
import { extractUnsubscribeLinks } from '../services/unsubscribe.service';
import prisma from '../config/database';

interface EmailProcessingJob {
    userId: string;
    messageId: string;
}

export const emailProcessingWorker = new Worker(
    'email-processing',
    async (job: Job<EmailProcessingJob>) => {
        const { userId, messageId } = job.data;

        try {
            // Get Gmail service
            const gmailService = await createGmailService(userId);

            // Fetch email details
            const emailData = await gmailService.getEmailDetails(messageId);

            // Parse headers
            const headers = gmailService.parseHeaders(emailData.payload?.headers || []);

            // Extract body
            const body = gmailService.extractBody(emailData.payload || {});
            const snippet = emailData.snippet || '';

            // Extract unsubscribe links
            const unsubscribeInfo = extractUnsubscribeLinks(headers, body);
            const hasUnsubscribe = Boolean(unsubscribeInfo.headerLink || unsubscribeInfo.bodyLinks.length > 0);
            const unsubscribeLink = unsubscribeInfo.headerLink || unsubscribeInfo.bodyLinks[0] || null;

            // Analyze email with Gemini AI
            let analysis;
            try {
                analysis = await analyzeEmail(
                    headers['subject'] || '',
                    headers['from'] || '',
                    body,
                    snippet
                );
            } catch (error) {
                console.error('AI analysis failed, using defaults:', error);
                // Fallback to basic categorization
                analysis = {
                    category: 'Other',
                    noiseScore: 50,
                    importanceScore: 50,
                    isNewsletter: hasUnsubscribe,
                    isPromo: false,
                    summary: snippet,
                    reasoning: 'AI analysis unavailable',
                };
            }

            // Store email in database with AI analysis
            const email = await prisma.email.create({
                data: {
                    userId,
                    messageId: emailData.id || messageId,
                    threadId: emailData.threadId || null,
                    subject: headers['subject'] || null,
                    from: headers['from'] || 'unknown',
                    to: headers['to'] || null,
                    body,
                    snippet,
                    receivedAt: new Date(parseInt(emailData.internalDate || '0')),

                    // AI analysis results
                    category: analysis.category,
                    noiseScore: analysis.noiseScore,
                    importanceScore: analysis.importanceScore,
                    isNewsletter: analysis.isNewsletter,
                    isPromo: analysis.isPromo,
                    summary: analysis.summary,
                    geminiAnalysis: {
                        reasoning: analysis.reasoning,
                        analyzedAt: new Date().toISOString(),
                    },

                    // Unsubscribe info
                    hasUnsubscribe,
                    unsubscribeLink,
                },
            });

            // Track subscription if it's a newsletter
            if (analysis.isNewsletter || analysis.isPromo) {
                const senderEmail = extractEmailAddress(headers['from'] || '');
                const senderName = extractSenderName(headers['from'] || '');

                if (senderEmail) {
                    await prisma.subscription.upsert({
                        where: {
                            userId_senderEmail: {
                                userId,
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
                            userId,
                            senderEmail,
                            senderName,
                            lastEmailAt: email.receivedAt,
                            emailCount: 1,
                        },
                    });
                }
            }

            console.log(`✅ Processed email ${messageId} - Category: ${analysis.category}, Noise: ${analysis.noiseScore}`);
        } catch (error) {
            console.error(`❌ Error processing email ${messageId}:`, error);
            throw error;
        }
    },
    {
        connection: redisConnection,
        concurrency: 5,
    }
);

emailProcessingWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

emailProcessingWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
});

/**
 * Extract email address from "Name <email@example.com>" format
 */
function extractEmailAddress(from: string): string | null {
    const match = from.match(/<([^>]+)>/);
    if (match) {
        return match[1];
    }
    // If no angle brackets, assume the whole string is an email
    if (from.includes('@')) {
        return from.trim();
    }
    return null;
}

/**
 * Extract sender name from "Name <email@example.com>" format
 */
function extractSenderName(from: string): string | null {
    const match = from.match(/^([^<]+)</);
    if (match) {
        return match[1].trim();
    }
    return null;
}
