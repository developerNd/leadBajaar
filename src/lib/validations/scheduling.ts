interface ValidationResult {
  isValid: boolean
  error?: string
}

interface TimeSlot {
  startTime: string
  endTime: string
  daysOfWeek: number[]
}

interface SchedulingSettings {
  minimumNotice: number
  dateRange: number
  dailyLimit: number
  weeklyLimit: number
  timeSlots: TimeSlot[]
  bufferBefore: number
  bufferAfter: number
  timezone: string
}

export const validateSchedulingSettings = (settings: SchedulingSettings): Record<string, ValidationResult> => {
  const errors: Record<string, ValidationResult> = {}

  // Minimum notice period
  if (settings.minimumNotice < 0) {
    errors.minimumNotice = {
      isValid: false,
      error: "Minimum notice cannot be negative"
    }
  }

  // Maximum booking period
  if (settings.dateRange < 1) {
    errors.dateRange = {
      isValid: false,
      error: "Booking period must be at least 1 day"
    }
  }

  // Daily limit
  if (settings.dailyLimit < 0) {
    errors.dailyLimit = {
      isValid: false,
      error: "Daily limit cannot be negative"
    }
  }

  // Weekly limit
  if (settings.weeklyLimit < 0) {
    errors.weeklyLimit = {
      isValid: false,
      error: "Weekly limit cannot be negative"
    }
  }

  // Check if weekly limit is consistent with daily limit
  if (settings.dailyLimit > 0 && settings.weeklyLimit > 0 && 
      settings.weeklyLimit < settings.dailyLimit) {
    errors.weeklyLimit = {
      isValid: false,
      error: "Weekly limit cannot be less than daily limit"
    }
  }

  // Time slots validation
  if (settings.timeSlots?.length === 0) {
    errors.timeSlots = {
      isValid: false,
      error: "At least one time slot is required"
    }
  }

  // Buffer time validations
  if (settings.bufferBefore < 0) {
    errors.bufferBefore = {
      isValid: false,
      error: "Buffer time cannot be negative"
    }
  }

  if (settings.bufferAfter < 0) {
    errors.bufferAfter = {
      isValid: false,
      error: "Buffer time cannot be negative"
    }
  }

  // Time slot validations
  if (settings.timeSlots) {
    settings.timeSlots.forEach((slot, index) => {
      // Check if end time is after start time
      if (slot.endTime <= slot.startTime) {
        errors[`timeSlots.${index}`] = {
          isValid: false,
          error: "End time must be after start time"
        }
      }

      // Check if at least one day is selected
      if (slot.daysOfWeek.length === 0) {
        errors[`timeSlots.${index}.days`] = {
          isValid: false,
          error: "At least one day must be selected"
        }
      }

      // Check for overlapping time slots on same days
      settings.timeSlots.forEach((otherSlot, otherIndex) => {
        if (index !== otherIndex) {
          const hasOverlappingDays = slot.daysOfWeek.some(day => 
            otherSlot.daysOfWeek.includes(day)
          )

          if (hasOverlappingDays) {
            const overlaps = (
              (slot.startTime <= otherSlot.endTime && slot.endTime >= otherSlot.startTime) ||
              (otherSlot.startTime <= slot.endTime && otherSlot.endTime >= slot.startTime)
            )

            if (overlaps) {
              errors[`timeSlots.${index}.overlap`] = {
                isValid: false,
                error: "Time slots cannot overlap on the same days"
              }
            }
          }
        }
      })
    })
  }

  // Timezone validation
  if (!settings.timezone) {
    errors.timezone = {
      isValid: false,
      error: "Timezone is required"
    }
  } else {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: settings.timezone })
    } catch (e) {
      errors.timezone = {
        isValid: false,
        error: "Invalid timezone"
      }
    }
  }

  // Validate minimum notice against buffer times
  const totalBuffer = settings.bufferBefore + settings.bufferAfter
  if (settings.minimumNotice * 60 < totalBuffer) {
    errors.minimumNotice = {
      isValid: false,
      error: "Minimum notice must be greater than total buffer time"
    }
  }

  return errors
}

export const validateBookingRequest = (
  request: any,
  settings: SchedulingSettings
): ValidationResult => {
  const now = new Date()
  const requestDate = new Date(request.date)
  const requestTime = request.time.split(':')
  requestDate.setHours(parseInt(requestTime[0]), parseInt(requestTime[1]))

  // Check minimum notice period
  const noticeInHours = (requestDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  if (noticeInHours < settings.minimumNotice) {
    return {
      isValid: false,
      error: `Booking must be made at least ${settings.minimumNotice} hours in advance`
    }
  }

  // Check maximum booking period
  const daysInFuture = (requestDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (daysInFuture > settings.dateRange) {
    return {
      isValid: false,
      error: `Cannot book more than ${settings.dateRange} days in advance`
    }
  }

  return { isValid: true }
} 