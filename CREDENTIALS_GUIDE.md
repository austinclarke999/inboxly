# Getting API Credentials for Inboxly

This guide will help you get the necessary API credentials to make Inboxly production-ready.

---

## 1. Google OAuth Credentials (Required for Gmail Sync)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `Inboxly` (or your preferred name)
4. Click "Create"

### Step 2: Enable Gmail API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on it and click "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (unless you have Google Workspace)
3. Click "Create"
4. Fill in the form:
   - **App name**: Inboxly
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click "Save and Continue"
6. **Scopes**: Click "Add or Remove Scopes"
   - Add: `https://www.googleapis.com/auth/gmail.readonly`
   - Add: `https://www.googleapis.com/auth/gmail.modify`
   - Add: `https://www.googleapis.com/auth/userinfo.email`
   - Add: `https://www.googleapis.com/auth/userinfo.profile`
7. Click "Save and Continue"
8. **Test users**: Add your email for testing
9. Click "Save and Continue"

### Step 4: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Inboxly Web Client"
5. **Authorized JavaScript origins**:
   - `http://localhost:5173` (for development)
   - Your production domain (e.g., `https://inboxly.com`)
6. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/google/callback` (for development)
   - `https://your-domain.com/api/auth/google/callback` (for production)
7. Click "Create"
8. **Copy the Client ID and Client Secret** - you'll need these!

---

## 2. Gemini API Key (Required for AI Analysis)

### Step 1: Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Select your Google Cloud project (the one you created above)
4. Click "Create API Key"
5. **Copy the API key** - you'll need this!

### Free Tier Limits

- 15 requests per minute
- 1,500 requests per day
- Perfect for getting started!

---

## 3. Update Your .env File

Open `apps/api/.env` and update these values:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Environment
NODE_ENV=development
```

---

## 4. For Production Deployment

When deploying to production, update these in your production environment:

```env
# Production URLs
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
FRONTEND_URL=https://your-domain.com

# Environment
NODE_ENV=production

# Add encryption key for tokens
ENCRYPTION_KEY=generate_a_random_32_character_string_here
```

### Generate Encryption Key

Run this in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Verification

Once you've added the credentials to `.env`:

1. Restart the backend server
2. The app will automatically use real OAuth instead of dev bypass
3. Test by clicking "Start for free" on the landing page
4. You should see the Google OAuth consent screen

---

## Troubleshooting

### "redirect_uri_mismatch" Error

- Make sure the redirect URI in Google Cloud Console exactly matches the one in your `.env`
- Include the protocol (`http://` or `https://`)
- No trailing slashes

### "Access blocked: This app's request is invalid"

- Make sure you've added your email as a test user in OAuth consent screen
- The app is in "Testing" mode by default - this is fine for development

### Gemini API Not Working

- Verify the API key is correct
- Check you haven't exceeded the free tier limits
- Make sure there are no extra spaces in the `.env` file

---

## Next Steps

After adding credentials:

1. I'll implement the real OAuth flow
2. I'll implement Gmail sync
3. I'll implement AI analysis
4. I'll implement unsubscribe functionality
5. We'll test everything end-to-end

**Ready? Let me know when you've added the credentials to `.env` and I'll continue with the implementation!**
