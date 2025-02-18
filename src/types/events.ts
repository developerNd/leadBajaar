export interface EventType {
  id: string | number
  title: string
  description: string
  duration: number
  location: string
  questions: Array<{
    id: string
    question: string
    type: string
    required: boolean
    description?: string
    placeholder?: string
  }>
  scheduling: {
    bufferBefore: number
    bufferAfter: number
    minimumNotice: number
    dailyLimit: number
    weeklyLimit: number
    availableDays: string[]
    dateRange: number
    timezone: string
    timeSlots: any[]
    startTime: string
    endTime: string
    recurring?: {
      frequency: string
      interval: number
      timeslots: any[]
    } | null
  }
  teamMembers: Array<{
    id: number
    name: string
    email: string
    avatar?: string
  }>
}

export interface EventQuestion {
  id: string
  question: string
  type: 'text' | 'select' | 'multiselect'
  required: boolean
  options?: string[]
}

export interface SchedulingSettings {
  bufferBefore: number
  bufferAfter: number
  minimumNotice: number
  availableDays: string[]
  dateRange: number
  timezone: string
}

export interface TimeSlot {
  day: string
  startTime: string
  endTime: string
}

export interface TeamMember {
  id: number
  name: string
  email: string
  avatar: string
  role: string
} 