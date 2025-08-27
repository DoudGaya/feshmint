#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function checkDatabaseConnection() {
  const prisma = new PrismaClient();
  
  console.log('🔍 Checking database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('💡 Please set your DATABASE_URL in .env.local file');
    process.exit(1);
  }

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    console.log('📋 Available tables:');
    console.log(tables);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check if your database server is running');
      console.log('2. Verify DATABASE_URL is correct');
      console.log('3. Check if your IP is whitelisted (for cloud databases)');
      console.log('4. Ensure database credentials are valid');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection().catch(console.error);
