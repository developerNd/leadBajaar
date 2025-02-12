'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Clock, Video, MapPin, Phone, Users, 
  Link as LinkIcon, Plus, Calendar, Copy, ExternalLink 
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Add TypeScript interfaces
interface EventType {
  id: string
  title: string
  description?: string
  duration: number
  location: 'video' | 'phone' | 'in-person'
  questions: EventQuestion[]
  scheduling: SchedulingSettings
  redirectUrl?: string
  slots: TimeSlot[]
  teamMembers: TeamMember[]
  createdAt: string
  updatedAt: string
}

interface EventQuestion {
  id: string
  question: string
  type: 'text' | 'select' | 'multiselect'
  required: boolean
  options?: string[]
}

interface SchedulingSettings {
  bufferBefore: number
  bufferAfter: number
  minimumNotice: number
  availableDays: string[]
  dateRange: number
  timezone: string
}

interface TimeSlot {
  day: string
  startTime: string
  endTime: string
}

interface TeamMember {
  id: number
  name: string
  email: string
  avatar: string
  role: string
}

const dummyTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    role: "Sales Representative"
  },
  {
    id: 2,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    role: "Product Specialist"
  }
]

// Update the dummy event type with more realistic data
const dummyEventTypes: EventType[] = [
  {
    id: '1',
    title: 'Product Demo',
    description: '30-minute product demonstration and Q&A session to understand your needs and show you how our product can help.',
    duration: 30,
    location: 'video',
    questions: [
      {
        id: '1',
        question: 'What specific features are you interested in?',
        type: 'text',
        required: true
      },
      {
        id: '2',
        question: 'Company Size',
        type: 'select',
        required: true,
        options: ['1-10', '11-50', '51-200', '201-500', '500+']
      },
      {
        id: '3',
        question: 'Current challenges you want to solve?',
        type: 'text',
        required: false
      }
    ],
    scheduling: {
      bufferBefore: 5,
      bufferAfter: 5,
      minimumNotice: 24,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      dateRange: 60,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    slots: [
      {
        day: 'Monday',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        day: 'Tuesday',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        day: 'Wednesday',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        day: 'Thursday',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        day: 'Friday',
        startTime: '09:00',
        endTime: '17:00'
      }
    ],
    teamMembers: dummyTeamMembers,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Discovery Call',
    description: '15-minute introductory call to understand your needs and see if we\'re a good fit.',
    duration: 15,
    location: 'phone',
    questions: [
      {
        id: '1',
        question: 'What is your phone number?',
        type: 'text',
        required: true
      },
      {
        id: '2',
        question: 'How did you hear about us?',
        type: 'select',
        required: true,
        options: ['Google', 'LinkedIn', 'Referral', 'Other']
      }
    ],
    scheduling: {
      bufferBefore: 5,
      bufferAfter: 5,
      minimumNotice: 1,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      dateRange: 30,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    slots: [
      {
        day: 'Monday',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        day: 'Tuesday',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        day: 'Wednesday',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        day: 'Thursday',
        startTime: '09:00',
        endTime: '17:00'
      },
      {
        day: 'Friday',
        startTime: '09:00',
        endTime: '17:00'
      }
    ],
    teamMembers: [dummyTeamMembers[0]], // Only John Smith handles discovery calls
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const locationIcons = {
  video: Video,
  phone: Phone,
  'in-person': MapPin
}

export default function EventTypesPage() {
  const { toast } = useToast()
  const [eventTypes, setEventTypes] = useState<EventType[]>(dummyEventTypes)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null)

  const copyBookingLink = (eventType: EventType) => {
    const bookingLink = `${window.location.origin}/book/${eventType.id}`
    navigator.clipboard.writeText(bookingLink)
    toast({
      title: "Link Copied",
      description: "Booking link has been copied to clipboard",
    })
  }

  const openPreview = (eventType: EventType) => {
    window.open(`/book/${eventType.id}`, '_blank')
  }

  return (
    <div className="container mx-auto py-10 p-2 h-full overflow-y-scroll">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Event Types</h1>
          <p className="text-muted-foreground">Create and manage your scheduling event types</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.href = '/api/auth/google'}>
            <Calendar className="mr-2 h-4 w-4" />
            Connect Google Calendar
          </Button>
          <Link href="/meetings/event-types/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Event Type
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventTypes.map((eventType) => (
          <Card key={eventType.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{eventType.title}</h3>
                  <p className="text-sm text-muted-foreground">{eventType.description}</p>
                </div>
                {React.createElement(locationIcons[eventType.location], {
                  className: "h-5 w-5 text-muted-foreground"
                })}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {eventType.duration} minutes
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  {eventType.teamMembers.length} team members
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <LinkIcon className="mr-2 h-4 w-4" />
                  <span className="truncate">/book/{eventType.id}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {eventType.questions.length > 0 && (
                  <Badge variant="secondary">
                    {eventType.questions.length} Questions
                  </Badge>
                )}
                <Badge variant="outline">
                  {eventType.location}
                </Badge>
              </div>

              <div className="mt-4 flex justify-between items-center border-t pt-4">
                <Link href={`/meetings/event-types/${eventType.id}`}>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </Link>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyBookingLink(eventType)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openPreview(eventType)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Booking Link</DialogTitle>
            <DialogDescription>
              Share this link with others to let them book meetings with you
            </DialogDescription>
          </DialogHeader>
          {selectedEventType && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-mono break-all">
                  {`${window.location.origin}/book/${selectedEventType.id}`}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => copyBookingLink(selectedEventType)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button
                  onClick={() => openPreview(selectedEventType)}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 