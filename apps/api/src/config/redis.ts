import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConnection = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
});

export default redisConnection;
