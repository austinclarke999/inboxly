import { emailProcessingWorker } from './queues/email.processor';
import { emailAnalysisWorker } from './queues/analysis.processor';
import { unsubscribeWorker } from './queues/unsubscribe.processor';

console.log('🚀 Starting queue workers...');

// Log when workers are ready
emailProcessingWorker.on('ready', () => {
    console.log('✅ Email Processing Worker is ready');
});

emailAnalysisWorker.on('ready', () => {
    console.log('✅ Email Analysis Worker is ready');
});

unsubscribeWorker.on('ready', () => {
    console.log('✅ Unsubscribe Worker is ready');
});

// Log job completions
emailProcessingWorker.on('completed', (job: any) => {
    console.log(`✓ Processed email job #${job.id}`);
});

emailAnalysisWorker.on('completed', (job: any) => {
    console.log(`✓ Analyzed email job #${job.id}`);
});

unsubscribeWorker.on('completed', (job: any) => {
    console.log(`✓ Unsubscribe job #${job.id} completed`);
});

// Log errors
emailProcessingWorker.on('failed', (job: any, err: Error) => {
    console.error(`✗ Email processing job #${job?.id} failed:`, err.message);
});

emailAnalysisWorker.on('failed', (job: any, err: Error) => {
    console.error(`✗ Email analysis job #${job?.id} failed:`, err.message);
});

unsubscribeWorker.on('failed', (job: any, err: Error) => {
    console.error(`✗ Unsubscribe job #${job?.id} failed:`, err.message);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('📴 Shutting down workers...');
    await Promise.all([
        emailProcessingWorker.close(),
        emailAnalysisWorker.close(),
        unsubscribeWorker.close(),
    ]);
    console.log('👋 Workers stopped');
    process.exit(0);
});

console.log('👂 Workers are listening for jobs...');
