# 🔧 Google OAuth Setup Instructions

## Current Status
- ✅ Google OAuth is temporarily disabled to prevent errors
- ✅ You can still sign in using email/password (credentials)
- ✅ Pricing page is created and accessible

## To Enable Google OAuth (When Ready)

### Step 1: Get Google OAuth Credentials
1. **Visit**: https://console.cloud.google.com/
2. **Create/Select Project**: "Fresh Mint Trading Bot"
3. **Enable APIs**: 
   - Go to "APIs & Services" → "Library"
   - Search and enable "Google+ API" or "Google Identity API"
4. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: **Web application**
   - Name: "Fresh Mint Trading Bot"
   - Authorized redirect URIs: 
     ```
     http://localhost:3000/api/auth/callback/google
     https://yourdomain.com/api/auth/callback/google
     ```

### Step 2: Update Environment Variables
1. **Copy your credentials** from Google Console
2. **Update `.env.local`**:
   ```bash
   # Uncomment and add your actual values
   GOOGLE_CLIENT_ID="your-actual-google-client-id"
   GOOGLE_CLIENT_SECRET="your-actual-google-client-secret"
   ```

### Step 3: Re-enable Google Provider
1. **Uncomment in `src/lib/auth.ts`**:
   ```typescript
   GoogleProvider({
     clientId: process.env.GOOGLE_CLIENT_ID!,
     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
   }),
   ```

2. **Uncomment in `src/app/(public)/auth/signin/page.tsx`**:
   - Uncomment the Google sign-in button
   - Uncomment the `handleGoogleSignIn` function

### Step 4: Test
1. Restart your development server
2. Try signing in with Google
3. Check for any errors in the console

---

## Current Working Features
- ✅ **Landing page** with navigation
- ✅ **Email/password authentication**
- ✅ **Pricing page** with 3 tiers
- ✅ **Dashboard** with clean layout
- ✅ **Features page**
- ✅ **Documentation page**

## Quick Test
- Navigate to: http://localhost:3000/pricing
- Try signing up with email: http://localhost:3000/auth/signup
- Try signing in: http://localhost:3000/auth/signin

---

**Note**: The Google OAuth error is now resolved by temporarily disabling it. You can enable it anytime by following the steps above!
