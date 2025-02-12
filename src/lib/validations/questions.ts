export const validateQuestionResponse = (type: string, value: any): { isValid: boolean; error?: string } => {
  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return {
        isValid: emailRegex.test(value),
        error: emailRegex.test(value) ? undefined : 'Please enter a valid email address'
      }

    case 'phone':
      const phoneRegex = /^\+?[\d\s-]{10,}$/
      return {
        isValid: phoneRegex.test(value),
        error: phoneRegex.test(value) ? undefined : 'Please enter a valid phone number'
      }

    case 'date':
      const date = new Date(value)
      return {
        isValid: !isNaN(date.getTime()),
        error: !isNaN(date.getTime()) ? undefined : 'Please enter a valid date'
      }

    case 'time':
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      return {
        isValid: timeRegex.test(value),
        error: timeRegex.test(value) ? undefined : 'Please enter a valid time (HH:MM)'
      }

    default:
      return { isValid: true }
  }
} 