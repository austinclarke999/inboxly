# Inboxly Backend - Setup Instructions

## Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis

## Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your credentials:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT`: Redis configuration
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- `GEMINI_API_KEY`: From Google AI Studio

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate OAuth flow
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user

### Emails
- `POST /api/emails/sync` - Sync emails from Gmail
- `GET /api/emails` - Get user's emails
- `GET /api/emails/:emailId` - Get email details
- `POST /api/emails/:emailId/analyze` - Trigger AI analysis

### Subscriptions
- `GET /api/subscriptions` - Get all subscriptions
- `GET /api/subscriptions/billing/all` - Get billing subscriptions
- `POST /api/subscriptions/analyze-sender` - Analyze sender

### Unsubscribe
- `POST /api/unsubscribe/bulk` - Bulk unsubscribe
- `POST /api/unsubscribe/:subscriptionId` - Unsubscribe from single subscription

### Gemini AI
- `POST /api/gemini/categorize` - Categorize email
- `POST /api/gemini/summarize` - Summarize email

## Workers

The following BullMQ workers run automatically:
- **Email Processor**: Fetches and stores emails from Gmail
- **Analysis Processor**: Analyzes emails with Gemini AI
- **Unsubscribe Processor**: Handles unsubscribe requests
