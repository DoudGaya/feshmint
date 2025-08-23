# 🔐 Fresh Mint Trading Bot - Environment Setup Guide

## 📊 Setup Priority

### 🚨 **HIGH PRIORITY** (Required for MVP)
1. **Google OAuth** - For user authentication
2. **Gmail SMTP** - For email notifications

### 🔶 **MEDIUM PRIORITY** (For trading features)
3. **Jito API** - For MEV protection
4. **Telegram Bot** - For trading signals

### 🔵 **LOW PRIORITY** (For advanced features)
5. **AWS S3** - For logging and file storage
6. **Discord Webhook** - For notifications

---

## 🚀 **STEP 1: Google OAuth Setup** (HIGH PRIORITY)

### Quick Setup:
1. **Visit**: https://console.cloud.google.com/
2. **Create Project**: "Fresh Mint Trading Bot"
3. **Enable API**: APIs & Services → Library → "Google+ API"
4. **Create Credentials**:
   - APIs & Services → Credentials
   - Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

### Copy these values to your `.env.local`:
```bash
GOOGLE_CLIENT_ID="your-actual-client-id-here"
GOOGLE_CLIENT_SECRET="your-actual-client-secret-here"
```

---

## 📧 **STEP 2: Gmail SMTP Setup** (HIGH PRIORITY)

### Quick Setup:
1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Google Account → Security → 2-Step Verification
   - App passwords → Select "Mail" → Generate

### Update your `.env.local`:
```bash
SMTP_USER="youremail@gmail.com"
SMTP_PASS="your-16-char-app-password"
```

---

## ⚡ **STEP 3: Jito MEV Protection** (MEDIUM PRIORITY)

### Quick Setup:
1. **Visit**: https://jito.wtf/
2. **Sign up** for API access
3. **Get API key** from dashboard

### Update your `.env.local`:
```bash
JITO_API_KEY="your-jito-api-key-here"
```

---

## 🤖 **STEP 4: Telegram Bot** (MEDIUM PRIORITY)

### Quick Setup:
1. **Open Telegram** and message `@BotFather`
2. **Create bot**: `/newbot`
3. **Follow prompts** and get your token

### Update your `.env.local`:
```bash
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
```

---

## ☁️ **STEP 5: AWS S3 Setup** (LOW PRIORITY)

### Quick Setup:
1. **Create AWS Account**: https://aws.amazon.com/
2. **Create IAM User**:
   - IAM → Users → Create user
   - Attach policy: `AmazonS3FullAccess`
3. **Generate Access Keys**:
   - User → Security credentials → Create access key
4. **Create S3 Bucket**: "fresh-mint-trading-logs"

### Update your `.env.local`:
```bash
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
```

---

## 💬 **STEP 6: Discord Webhook** (LOW PRIORITY)

### Quick Setup:
1. **Open Discord** server settings
2. **Integrations** → Webhooks → Create Webhook
3. **Copy webhook URL**

### Update your `.env.local`:
```bash
DISCORD_WEBHOOK_URL="your-discord-webhook-url"
```

---

## 🎯 **Quick Start Recommendation**

**Start with Steps 1-2** (Google OAuth + Gmail) to get authentication working:

1. Set up Google OAuth (5 minutes)
2. Set up Gmail SMTP (3 minutes)
3. Test authentication in your app
4. Add trading features later (Steps 3-6)

---

## 🔧 **Testing Your Setup**

Run the environment checker anytime:
```bash
node scripts/check-env.js
```

## ⚠️ **Security Notes**

- Never commit `.env.local` to version control
- Use test/development keys during development
- Rotate keys regularly in production
- Keep private keys secure (especially trading wallet)

---

## 📞 **Need Help?**

If you get stuck on any step, let me know which service you're setting up and I'll provide more detailed guidance!
