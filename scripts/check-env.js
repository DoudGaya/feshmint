#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Run with: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parse environment variables
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim().replace(/"/g, '');
    }
  }
});

const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SMTP_USER',
  'SMTP_PASS',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'SOLANA_RPC_URL',
  'JITO_API_KEY',
  'TELEGRAM_BOT_TOKEN',
  'DISCORD_WEBHOOK_URL'
];

const placeholderValues = [
  'your-google-client-id',
  'your-google-client-secret',
  'your-gmail@gmail.com',
  'your-app-password',
  'your-aws-access-key',
  'your-aws-secret-key',
  'your-jito-api-key',
  'your-telegram-bot-token',
  'your-discord-webhook-url'
];

console.log('🔍 Environment Variables Status:\n');

let needsSetup = [];

requiredVars.forEach(varName => {
  const value = envVars[varName];
  const isConfigured = value && !placeholderValues.includes(value);
  
  if (isConfigured) {
    console.log(`✅ ${varName}: Configured`);
  } else {
    console.log(`❌ ${varName}: Needs setup`);
    needsSetup.push(varName);
  }
});

if (needsSetup.length === 0) {
  console.log('\n🎉 All environment variables are configured!');
} else {
  console.log(`\n⚠️  ${needsSetup.length} variables need setup:`);
  needsSetup.forEach(varName => {
    console.log(`   • ${varName}`);
  });
  
  console.log('\n📖 Setup guides:');
  console.log('   • Google OAuth: https://console.cloud.google.com/');
  console.log('   • Gmail SMTP: Enable 2FA + App Password');
  console.log('   • AWS: https://console.aws.amazon.com/');
  console.log('   • Jito: https://jito.wtf/');
  console.log('   • Telegram: Message @BotFather');
  console.log('   • Discord: Server Settings → Webhooks');
}
