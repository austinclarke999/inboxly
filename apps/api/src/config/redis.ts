import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Railway provides REDIS_URL, parse it for connection
const redisUrl = process.env.REDIS_URL;

let redisConnection: Redis;

if (redisUrl) {
    // Production: Use Railway's REDIS_URL
    redisConnection = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true, // Don't connect immediately
    });
} else {
    // Development: Use individual parameters
    redisConnection = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        lazyConnect: true,
    });
}

// Handle connection errors gracefully
redisConnection.on('error', (err) => {
    console.warn('⚠️  Redis connection error:', err.message);
    console.warn('Queue workers will not function without Redis');
});

redisConnection.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

// Try to connect
redisConnection.connect().catch((err) => {
    console.warn('⚠️  Could not connect to Redis:', err.message);
    console.warn('API will work, but background jobs disabled');
});

export default redisConnection;
