interface RetryConfig {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
}

export class CalendarError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false
  ) {
    super(message)
    this.name = 'CalendarError'
  }
}

export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000
  } = config

  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (error instanceof CalendarError && !error.retryable) {
        throw error
      }
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      const delay = Math.min(
        Math.pow(2, attempt - 1) * baseDelay,
        maxDelay
      )
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

export const handleCalendarError = (error: unknown): CalendarError => {
  if (error instanceof CalendarError) {
    return error
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('invalid_grant')) {
      return new CalendarError(
        'Calendar access has expired. Please reconnect your calendar.',
        'INVALID_GRANT',
        false
      )
    }
    
    if (error.message.includes('quota')) {
      return new CalendarError(
        'Calendar API quota exceeded. Please try again later.',
        'QUOTA_EXCEEDED',
        true
      )
    }
  }

  return new CalendarError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    true
  )
} 