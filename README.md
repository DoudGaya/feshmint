# Fresh Mint Trading Bot

Advanced serverless trading bot for Solana tokens with intelligent signal processing, MEV protection, and comprehensive risk management.

## 🚀 Features

- **Multi-Source Signal Processing**: Telegram, Discord, and Solana indexer integration
- **Intelligent Risk Management**: Trailing stop-loss, position sizing, market regime awareness
- **MEV Protection**: Private mempool / stealth modes (no Jito)
- **Paper Trading**: Risk-free strategy testing with realistic simulation
- **Real-time Dashboard**: Live monitoring of trades, P&L, and risk metrics
- **Advanced Authentication**: Email/password + Google OAuth with 2FA support
- **Serverless Architecture**: Fully deployed on Vercel with Next.js API routes

## 🏗️ Architecture

### Tech Stack

- **Frontend/Backend**: Next.js 15 with App Router and TypeScript
- **Authentication**: NextAuth.js with Prisma adapter
- **Database**: Prisma ORM + NeonDB (PostgreSQL)
- **Styling**: Tailwind CSS
- **Validation**: Zod schemas
- **Email**: Google SMTP integration
- **Storage**: Amazon S3 for logs and reports
- **Hosting**: Vercel serverless deployment

### Route Structure

```
/                   - Landing page
/auth/signin        - User authentication
/auth/signup        - User registration
/dashboard          - Main trading dashboard
/api/auth/*         - NextAuth endpoints
/api/signals        - Signal processing API
/api/trades         - Trade management API
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (NeonDB recommended)
- Google OAuth credentials
- AWS S3 bucket (optional, for production)

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fresh_mint_trading_bot"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Trading Configuration
MAX_POSITION_SIZE=500
PORTFOLIO_CAP=5000
DAILY_DRAWDOWN_LIMIT=0.15
WIN_RATE_THRESHOLD=0.30
```

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Trading Logic

### Signal Processing

1. **Signal Acquisition**: Monitor Telegram, Discord, and on-chain data
2. **Scoring Algorithm**: Rate signals 0-10 based on source reputation and speed
3. **Filter Threshold**: Only process signals scoring ≥ 7

### Pre-Trade Filters

- ✅ Liquidity ≥ $20k
- ✅ Buyer confirmation ≥ 10-15 unique buyers (first 2 blocks)
- ✅ Dev wallet control ≤ 30%
- ✅ Honeypot check (sell simulation)
- ✅ Blacklist filter for scam wallets/contracts
- ✅ Price stability check (≤20% dump first 3 blocks)

### Risk Controls

- **Trailing Stop-Loss**: -10% base, trails upwards with profit
- **Position Limits**: Max $500 per position, $5000 portfolio cap
- **Daily Circuit Breakers**: Stop if >30% trades fail OR >15% daily drawdown

## 🎮 Trading Modes

### Paper Trading (Default)
- $5,000 starting virtual equity
- Realistic slippage simulation (2-5%)
- Perfect for strategy testing

### Live Trading
- Real Solana transactions
- Actual DEX execution
- Requires wallet connection and funding

## 🚦 Deployment

The application is designed for deployment on Vercel:

```bash
npm run build
```

## � Deployment

### Vercel Deployment

The application is optimized for Vercel deployment:

1. **Environment Variables**: Set up all required environment variables in Vercel dashboard
2. **Database**: Use NeonDB or another PostgreSQL provider
3. **Build Configuration**: The build process automatically runs `prisma generate`

#### Required Environment Variables for Production:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `NEXTAUTH_URL` - Your production domain
- `ENCRYPTION_KEY` - 32-character string for API key encryption

#### Deploy to Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Common Deployment Issues:
- **Prisma Client Error**: Fixed by `postinstall` script that runs `prisma generate`
- **Environment Variables**: Ensure all required vars are set in Vercel dashboard
- **Database Connection**: Use connection pooling for serverless environments

## �📋 Project Status

### ✅ Completed
- [x] Next.js 15 project setup with TypeScript
- [x] Authentication system with NextAuth
- [x] Database schema with Prisma
- [x] Basic API routes for signals and trades
- [x] Landing page and dashboard UI
- [x] Paper trading simulation

### 🚧 In Progress
- [ ] Signal source integrations
- [ ] Live trading execution
- [ ] Advanced risk management
- [ ] Real-time monitoring

---

**Fresh Mint Trading Bot** - Advanced Solana Trading Automation
