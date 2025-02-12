import { CalendarError } from './error-handling'

interface ApiError {
  error: string
  code: number
}

export async function fetchWithErrorHandling<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error: ApiError = await response.json()
      
      switch (error.code) {
        case 401:
          throw new CalendarError('Authentication required', 'UNAUTHORIZED', false)
        case 403:
          throw new CalendarError('Access denied', 'FORBIDDEN', false)
        case 404:
          throw new CalendarError('Calendar not found', 'NOT_FOUND', false)
        case 422:
          throw new CalendarError('Invalid request data', 'VALIDATION_ERROR', false)
        case 429:
          throw new CalendarError('Too many requests', 'RATE_LIMIT', true)
        default:
          throw new CalendarError(error.error, 'API_ERROR', true)
      }
    }

    return response.json()
  } catch (error) {
    if (error instanceof CalendarError) {
      throw error
    }
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new CalendarError('Network error', 'NETWORK_ERROR', true)
    }

    throw new CalendarError('Unexpected error', 'UNKNOWN_ERROR', true)
  }
} 