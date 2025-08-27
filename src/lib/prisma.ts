import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Add connection retry logic
let retryCount = 0
const maxRetries = 3

export async function connectWithRetry() {
  while (retryCount < maxRetries) {
    try {
      await prisma.$connect()
      console.log('✅ Database connected successfully')
      retryCount = 0 // Reset on successful connection
      return true
    } catch (error) {
      retryCount++
      console.error(`❌ Database connection attempt ${retryCount} failed:`, error)
      
      if (retryCount >= maxRetries) {
        console.error('🚨 Max database connection retries reached')
        throw error
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, retryCount) * 1000
      console.log(`⏳ Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  return false
}

// Helper function to execute queries with retry logic
export async function executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  let attempts = 0
  const maxAttempts = 3
  
  while (attempts < maxAttempts) {
    try {
      return await operation()
    } catch (error: unknown) {
      attempts++
      
      // Check if it's a connection error
      const errorObj = error as { code?: string; message?: string };
      if (errorObj?.code === 'P1001' || (error as Error)?.message?.includes("Can't reach database server")) {
        if (attempts >= maxAttempts) {
          throw error
        }
        
        console.log(`⏳ Database operation failed, retrying (${attempts}/${maxAttempts})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
        continue
      }
      
      // For non-connection errors, throw immediately
      throw error
    }
  }
  
  throw new Error('Max retry attempts reached')
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
