export interface CalendarCredential {
  id: number
  userId: number
  type: 'google' | 'outlook' | 'apple'
  accessToken: string
  refreshToken?: string
  tokenExpiresAt: string
  calendarId?: string
  calendarEmail?: string
  selectedCalendars?: string[]
  settings?: {
    checkForConflicts?: boolean
    defaultDuration?: number
    defaultReminders?: {
      method: 'email' | 'popup'
      minutes: number
    }[]
  }
}

export interface Calendar {
  id: string
  name: string
  primary: boolean
  selected: boolean
  email?: string
  timezone?: string
  backgroundColor?: string
}

export interface CalendarEvent {
  id: string
  calendarId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  timezone: string
  attendees: string[]
  location?: string
  meetingLink?: string
  status: 'confirmed' | 'tentative' | 'cancelled'
  recurringEventId?: string
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
}

export interface SchedulingSettings {
  minimumNotice: number;
  dateRange: number;
  dailyLimit: number;
  weeklyLimit: number;
  timeSlots: TimeSlot[];
  bufferBefore: number;
  bufferAfter: number;
  timezone: string;
}

export interface Question {
  id: string;
  question: string;
  type: string;
  required: boolean;
  description?: string;
  placeholder?: string;
  options?: string[];
  order?: number;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  stage: string;
  status: string;
  source: string;
  last_contact: string;
  created_at: string;
  updated_at: string;
}

export interface LeadsResponse {
  data: Lead[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
} 