# Vercel Serverless Functions - Quick Reference

## Created API Endpoints

### Auth Routes (`/api/auth/*`)

**1. `/api/auth/google`** - Initiates Google OAuth flow

- Method: GET
- Returns: Redirects to Google login

**2. `/api/auth/callback`** - Handles OAuth callback  

- Method: GET
- Query: `code` (from Google)
- Returns: Redirects to dashboard with userId

**3. `/api/auth/me`** - Get current user

- Method: GET
- Query: `userId`
- Returns: User object

## Testing Locally

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to web app
cd apps/web

# Start local development
vercel dev
```

This starts a local server that emulates Vercel's serverless environment.

## Accessing Endpoints

When running `vercel dev`:

- Auth: <http://localhost:3000/api/auth/google>
- Callback: <http://localhost:3000/api/auth/callback>  
- Me: <http://localhost:3000/api/auth/me?userId=123>

## Next Steps

1. Copy Prisma schema to `apps/web/prisma`
2. Set up database (Neon/Supabase)
3. Add environment variables to Vercel
4. Deploy to production
5. Update frontend to use `/api/*` endpoints
