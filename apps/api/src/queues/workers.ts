import { emailProcessingWorker } from './email.processor';
import { emailAnalysisWorker } from './analysis.processor';
import { unsubscribeWorker } from './unsubscribe.processor';

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
emailProcessingWorker.on('completed', (job) => {
    console.log(`✓ Processed email job #${job.id}`);
});

emailAnalysisWorker.on('completed', (job) => {
    console.log(`✓ Analyzed email job #${job.id}`);
});

unsubscribeWorker.on('completed', (job) => {
    console.log(`✓ Unsubscribe job #${job.id} completed`);
});

// Log errors
emailProcessingWorker.on('failed', (job, err) => {
    console.error(`✗ Email processing job #${job?.id} failed:`, err.message);
});

emailAnalysisWorker.on('failed', (job, err) => {
    console.error(`✗ Email analysis job #${job?.id} failed:`, err.message);
});

unsubscribeWorker.on('failed', (job, err) => {
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
