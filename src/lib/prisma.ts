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
  // Enhanced connection options for Neon DB
  // @ts-ignore
  __internal: {
    engine: {
      // Connection timeout
      requestTimeout: 20000,
      // Query timeout  
      queryTimeout: 15000,
    },
  },
})

// Add connection retry logic
let retryCount = 0
const maxRetries = 5 // Increased from 3
let isConnecting: Promise<boolean> | null = null

export async function connectWithRetry() {
  // De-duplicate concurrent connection attempts
  if (isConnecting) return isConnecting
  isConnecting = (async () => {
    while (retryCount < maxRetries) {
      try {
        // Force disconnect first to clear any stale connections
        await prisma.$disconnect()
        await new Promise(resolve => setTimeout(resolve, 500))
        
        await prisma.$connect()
        console.log('✅ Database connected successfully')
        retryCount = 0 // Reset on successful connection
        isConnecting = null
        return true
      } catch (error) {
        retryCount++
        console.error(`❌ Database connection attempt ${retryCount} failed:`, error)
        
        if (retryCount >= maxRetries) {
          console.error('🚨 Max database connection retries reached')
          isConnecting = null
          throw error
        }
        
        // Wait before retry (exponential backoff with jitter)
        const baseDelay = Math.pow(2, retryCount) * 1000
        const jitter = Math.random() * 1000
        const delay = baseDelay + jitter
        console.log(`⏳ Retrying in ${Math.round(delay)}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    isConnecting = null
    return false
  })()
  return isConnecting
}

// Helper function to execute queries with retry logic
export async function executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  let attempts = 0
  const maxAttempts = 5 // Increased from 3
  
  while (attempts < maxAttempts) {
    try {
      return await operation()
    } catch (error: unknown) {
      attempts++
      
      // Check if it's a connection error
      const errorObj = error as { code?: string; message?: string };
      const message = errorObj?.message || (error as Error)?.message || ''
      const isConnError =
        errorObj?.code === 'P1001' ||
        errorObj?.code === 'P1017' || // Another DB connection code
        message.includes("Can't reach database server") ||
        message.includes('Engine is not yet connected') ||
        message.includes('Connection reset') ||
        message.includes('forcibly closed') ||
        (error as any)?.code === 'GenericFailure'

      if (isConnError) {
        if (attempts >= maxAttempts) {
          console.error(`🚨 Max retry attempts (${maxAttempts}) reached for database operation`)
          throw error
        }
        
        console.log(`⚠️ Database connection error detected, attempting reconnect (${attempts}/${maxAttempts})...`)
        
        // Ensure we disconnect and reconnect before retrying
        try {
          await prisma.$disconnect()
          await new Promise(resolve => setTimeout(resolve, 500))
          await connectWithRetry()
        } catch (e) {
          console.error('Reconnection attempt failed:', e)
        }
        
        // Exponential backoff with jitter
        const baseDelay = 1000 * Math.pow(2, attempts - 1)
        const jitter = Math.random() * 1000
        const delay = baseDelay + jitter
        console.log(`⏳ Retrying operation in ${Math.round(delay)}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      // For non-connection errors, throw immediately
      throw error
    }
  }
  
  throw new Error(`Max retry attempts (${maxAttempts}) reached`)
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Optionally pre-connect in development to reduce first-request latency
if (process.env.NODE_ENV === 'development') {
  connectWithRetry().catch(() => {
    // Non-fatal in dev; APIs will retry per operation
  })
}
