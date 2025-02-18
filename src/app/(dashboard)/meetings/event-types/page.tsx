'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
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
import { eventTypeService } from '@/services/event-types'
import { EventType, EventQuestion, SchedulingSettings, TimeSlot, TeamMember } from '@/types/events'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const locationIcons = {
  video: Video,
  phone: Phone,
  'in-person': MapPin
}

export default function EventTypesPage() {
  const { toast } = useToast()
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null)

  useEffect(() => {
    const loadEventTypes = async () => {
      try {
        setLoading(true)
        const data = await eventTypeService.getAll()
        const processedData = (data || []).map(eventType => ({
          ...eventType,
          teamMembers: eventType.teamMembers || [],
          questions: eventType.questions || [],
          location: eventType.location || 'video'
        }))
        setEventTypes(processedData)
      } catch (error) {
        console.error('Error loading event types:', error)
        toast({
          title: "Error",
          description: "Failed to load event types",
          variant: "destructive",
        })
        setEventTypes([])
      } finally {
        setLoading(false)
      }
    }

    loadEventTypes()
  }, [])

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

  const deleteEventType = async (id: string) => {
    try {
      await eventTypeService.delete(id)
      setEventTypes(eventTypes.filter(et => et.id !== id))
      toast({
        title: "Success",
        description: "Event type deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event type",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <LoadingSpinner />
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

      {eventTypes.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No event types yet</h3>
          <p className="text-muted-foreground mb-4">Create your first event type to start scheduling meetings</p>
          <Link href="/meetings/event-types/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event Type
            </Button>
          </Link>
        </div>
      ) : (
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
                    {(eventType.teamMembers || []).length} team members
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    <span className="truncate">/book/{eventType.id}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {(eventType.questions || []).length > 0 && (
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
      )}

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