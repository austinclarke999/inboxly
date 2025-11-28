import { Queue } from 'bullmq';
import redisConnection from '../config/redis';

export const emailProcessingQueue = new Queue('email-processing', {
    connection: redisConnection,
});

export const emailAnalysisQueue = new Queue('email-analysis', {
    connection: redisConnection,
});

export const unsubscribeQueue = new Queue('unsubscribe', {
    connection: redisConnection,
});
