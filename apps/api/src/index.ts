import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.routes';
import emailRoutes from './routes/email.routes';
import geminiRoutes from './routes/gemini.routes';
import subscriptionRoutes from './routes/subscription.routes';
import unsubscribeRoutes from './routes/unsubscribe.routes';

// Workers
import './queues/email.processor';
import './queues/analysis.processor';
import './queues/unsubscribe.processor';

// Config
import redisConnection from './config/redis';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL || 'http://localhost:5173'
    ],
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/unsubscribe', unsubscribeRoutes);

// Health check - Railway uses this endpoint
app.get('/', async (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Inboxly API is running',
        timestamp: new Date().toISOString(),
    });
});

// Detailed health check with Redis status
app.get('/health', async (req, res) => {
    try {
        const redisPing = await redisConnection.ping();
        res.json({
            status: 'ok',
            message: 'Inboxly API is running',
            redis: redisPing === 'PONG' ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Health check failed', error);
        res.status(500).json({
            status: 'error',
            message: 'API is running, but some services might be down',
            redis: 'disconnected',
        });
    }
});

const server = app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`📧 Email workers are active`);
    console.log(`🤖 Gemini AI integration enabled`);
});

// Graceful shutdown
const shutdown = async () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('HTTP server closed');
    });
    await redisConnection.quit();
    console.log('Redis connection closed');
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

