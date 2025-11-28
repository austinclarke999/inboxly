# Inboxly - Gemini-Powered Email Cleanup Assistant

A full-stack web application for email cleanup, bulk unsubscribe, inbox organization, subscription tracking, and AI-powered summaries using Google Gemini AI.

## Features

✨ **AI-Powered Email Analysis**
- Email classification (13 categories)
- Noise & importance scoring
- Newsletter/promo detection
- Unsubscribe link extraction
- Billing information extraction

📧 **Inbox Management**
- Bulk unsubscribe
- Smart categorization
- Email archiving & deletion
- AI-generated unsubscribe emails

💰 **Subscription Tracking**
- Billing amount extraction
- Monthly/yearly spending totals
- Renewal date tracking
- Subscription recommendations

📊 **Inbox Health Score**
- Gamification badges
- Progress tracking
- Activity feed

## Tech Stack

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Queue**: BullMQ + Redis
- **AI**: Google Gemini AI (1.5 Pro/Flash)
- **Auth**: Google OAuth 2.0
- **Email**: Gmail API

### Frontend
- **Framework**: React + Vite + TypeScript
- **Routing**: React Router
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis
- Google Cloud Console project (for OAuth & Gmail API)
- Google AI Studio API key (for Gemini)

### Backend Setup

1. Navigate to backend:
```bash
cd apps/api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT`: Redis configuration
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
- `GEMINI_API_KEY`: From Google AI Studio

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Start development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend:
```bash
cd apps/web
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser to `http://localhost:5173`

## Project Structure

```
Inboxly/
├── apps/
│   ├── api/                 # Backend (Express + TypeScript)
│   │   ├── prisma/          # Database schema
│   │   └── src/
│   │       ├── config/      # Configuration files
│   │       ├── services/    # Gemini, Gmail services
│   │       ├── routes/      # API endpoints
│   │       └── queues/      # BullMQ workers
│   └── web/                 # Frontend (React + Vite)
│       └── src/
│           ├── components/  # Reusable components
│           ├── pages/       # Page components
│           └── index.css    # Global styles
└── packages/
    └── shared/              # Shared types/utils
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

## License

MIT
