'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  CalendarDays, 
  Clock, 
  Video,
  MapPin,
  Phone,
  RefreshCw,
  FileText,
  Edit,
  Save,
  X
} from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from "@/components/ui/skeleton"
import { format } from 'date-fns'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Add TypeScript interfaces
interface Lead {
  name: string
  email: string
  phone: string
  profession: string
  company: string
  state: string
  requirements: string
  avatar: string
}

interface TeamMember {
  id: number
  name: string
  email: string
  avatar: string
  role: string
}

interface QuestionnaireItem {
  question: string
  answer: string
}

interface Meeting {
  id: number
  title: string
  date: string
  time: string
  duration: string
  lead: Lead
  assignedTo: TeamMember
  type: 'video' | 'phone' | 'in-person'
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'rescheduled'
  meetingLink?: string
  agenda?: string[]
  questionnaire?: QuestionnaireItem[]
  source: string
  notes?: string
  outcome?: string
  followUpDate?: string
  start_time?: string
}


const meetingTypes = {
  video: { icon: Video, color: "text-blue-500" },
  phone: { icon: Phone, color: "text-green-500" },
  "in-person": { icon: MapPin, color: "text-purple-500" }
}

const statusColors = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  rescheduled: "bg-purple-100 text-purple-800"
}

// Add team members data at the top with other constants
const teamMembers = [
  {
    id: 1,
    name: "Alex Thompson",
    email: "alex@leadbajar.com",
    avatar: "https://www.svgrepo.com/show/65453/avatar.svg",
    role: "Sales Representative"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@leadbajar.com",
    avatar: "https://www.svgrepo.com/show/65453/avatar.svg",
    role: "Senior Sales Executive"
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael@leadbajar.com",
    avatar: "https://www.svgrepo.com/show/65453/avatar.svg",
    role: "Account Manager"
  },
  {
    id: 4,
    name: "Emily Wilson",
    email: "emily@leadbajar.com",
    avatar: "https://www.svgrepo.com/show/65453/avatar.svg",
    role: "Sales Manager"
  }
]

function MeetingDetails({ meeting, onUpdate }: { meeting: Meeting, onUpdate?: (updatedData: Meeting) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState(meeting.notes || '')
  const [outcome, setOutcome] = useState(meeting.outcome || '')
  const [assignedTo, setAssignedTo] = useState(meeting.assignedTo)

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...meeting,
        notes,
        outcome,
        assignedTo
      })
    }
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Lead Information */}
      <div className="border-b pb-4">
        <h4 className="font-semibold mb-2">Lead Information</h4>
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={meeting.lead.avatar} />
            <AvatarFallback>{meeting.lead.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{meeting.lead.name}</p>
            <p className="text-sm text-muted-foreground">{meeting.lead.profession} at {meeting.lead.company}</p>
          </div>
        </div>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <p>Email: {meeting.lead.email}</p>
          <p>Phone: {meeting.lead.phone}</p>
          <p>State: {meeting.lead.state}</p>
          <p>Source: {meeting.source}</p>
        </div>
      </div>

      {/* Assigned To */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold mb-2">Assigned Representative</h4>
          {onUpdate && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-4">
            <Select
              value={assignedTo.email}
              onValueChange={(value) => {
                const selectedMember = teamMembers.find(member => member.email === value)
                if (selectedMember) {
                  setAssignedTo(selectedMember)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.email}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={assignedTo.avatar} />
              <AvatarFallback>{assignedTo.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{assignedTo.name}</p>
              <p className="text-sm text-muted-foreground">{assignedTo.role}</p>
              <p className="text-sm text-muted-foreground">{assignedTo.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Meeting Details */}
      <div className="grid grid-cols-2 gap-4 border-b pb-4">
        <div>
          <h4 className="font-semibold mb-2">Meeting Details</h4>
          <div className="space-y-2 text-sm">
            <p>Date: {meeting.date}</p>
            <p>Time: {meeting.time}</p>
            <p>Duration: {meeting.duration}</p>
            {meeting.meetingLink && (
              <p>Link: <a href={meeting.meetingLink} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{meeting.meetingLink}</a></p>
            )}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Type & Status</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              {React.createElement(meetingTypes[meeting.type as keyof typeof meetingTypes].icon, {
                className: `h-4 w-4 mr-2 ${meetingTypes[meeting.type as keyof typeof meetingTypes].color}`
              })}
              {meeting.type}
            </div>
            <Badge variant="secondary" className={statusColors[meeting.status as keyof typeof statusColors]}>
              {meeting.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Agenda */}
      {meeting.agenda && (
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-2">Agenda</h4>
          <ul className="list-disc list-inside space-y-1">
            {meeting.agenda.map((item: string, index: number) => (
              <li key={index} className="text-sm text-muted-foreground">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Questionnaire Responses */}
      {meeting.questionnaire && meeting.questionnaire.length > 0 ? (
        <div className="border-b pb-4">
          <h4 className="font-semibold mb-2">Questionnaire Responses</h4>
          <div className="space-y-2">
            {meeting.questionnaire.map((qa: { question: string; answer: string }, index: number) => (
              <div key={index} className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium">{qa.question}</p>
                <p className="text-sm text-muted-foreground">{qa.answer}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Notes & Outcome */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold mb-2">Notes</h4>
            {onUpdate && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
            )}
          </div>
          {isEditing ? (
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add meeting notes..."
              className="min-h-[100px]"
            />
          ) : (
            <p className="text-sm text-muted-foreground">{notes || 'No notes added'}</p>
          )}
        </div>

        <div>
          <h4 className="font-semibold mb-2">Outcome</h4>
          {isEditing ? (
            <Textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="Add meeting outcome..."
            />
          ) : (
            <p className="text-sm text-muted-foreground">{outcome || 'No outcome recorded'}</p>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Add this component for the skeleton loading
function MeetingsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-[160px]" />
                    <Skeleton className="h-3 w-[140px]" />
                    <Skeleton className="h-3 w-[120px]" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Add this helper function at the top of the file
const groupMeetingsByDate = (meetings: Meeting[]) => {
  // Sort meetings by start_time in ascending order (earliest first)
  const sortedMeetings = [...meetings].sort((a, b) => {
    const timeA = new Date(a.start_time!).getTime()
    const timeB = new Date(b.start_time!).getTime()
    return timeA - timeB  // Changed from timeB - timeA
  })

  // Group by date using start_time
  const groups = sortedMeetings.reduce((groups, meeting) => {
    const dateKey = format(new Date(meeting.start_time!), 'yyyy-MM-dd')
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(meeting)
    return groups
  }, {} as Record<string, Meeting[]>)

  // Sort groups by date keys in ascending order
  return Object.entries(groups)
    .sort(([dateA], [dateB]) => {
      return new Date(dateA).getTime() - new Date(dateB).getTime()  // Changed from dateB - dateA
    })
    .reduce((obj, [key, value]) => {
      obj[key] = value
      return obj
    }, {} as Record<string, Meeting[]>)
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<{ upcoming: Meeting[]; history: Meeting[] }>({
    upcoming: [],
    history: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState({
    upcoming: 1,
    history: 1
  })
  const itemsPerPage = 10

  // Pagination helper functions
  const paginateData = (data: Meeting[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  const totalPages = {
    upcoming: Math.ceil(meetings.upcoming.length / itemsPerPage),
    history: Math.ceil(meetings.history.length / itemsPerPage)
  }

  // Paginated data
  const paginatedMeetings = {
    upcoming: paginateData(meetings.upcoming, currentPage.upcoming),
    history: paginateData(meetings.history, currentPage.history)
  }

  // Pagination component
  const PaginationControls = ({ 
    type, 
    currentPage, 
    totalPages 
  }: { 
    type: 'upcoming' | 'history'
    currentPage: number
    totalPages: number 
  }) => {
    if (totalPages <= 1) return null

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage > 1) {
                  setCurrentPage(prev => ({
                    ...prev,
                    [type]: currentPage - 1
                  }))
                }
              }}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i + 1}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setCurrentPage(prev => ({
                    ...prev,
                    [type]: i + 1
                  }))
                }}
                isActive={currentPage === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext 
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage < totalPages) {
                  setCurrentPage(prev => ({
                    ...prev,
                    [type]: currentPage + 1
                  }))
                }
              }}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}api/bookings`,
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch meetings')
        }
        
        const data = await response.json()
        console.log('API Response:', data) // Debug log
        
        // Add this inside fetchMeetings before mapping
        console.log('Raw booking data:', data[0]); // Log first booking
        console.log('Raw answers:', data[0]?.answers); // Log first booking's answers
        
        // Split bookings into upcoming and history
        const now = new Date()
        const upcoming = data.filter((booking: any) => {
          if (!booking?.start_time) return false
          return new Date(booking.start_time) > now
        }).map((booking: any) => {
          // Find name, email and mobile from answers
          const nameAnswer = booking.answers?.find((a: any) => a.question === 'NAME')
          const emailAnswer = booking.answers?.find((a: any) => a.question === 'EMAIL')
          const mobileAnswer = booking.answers?.find((a: any) => a.question === 'MOBILE NUMBER')

          return {
            id: booking.id,
            title: `Meeting with ${nameAnswer?.answer || 'Guest'}`,
            date: format(new Date(booking.start_time), 'EEEE, MMMM d, yyyy'),
            time: format(new Date(booking.start_time), 'h:mm a'),
            duration: `${booking.eventType?.duration || 30} minutes`,
            type: booking.eventType?.location || 'video',
            status: booking.status || 'confirmed',
            lead: {
              name: nameAnswer?.answer || 'Guest',
              email: emailAnswer?.answer || '',
              phone: mobileAnswer?.answer || '',
              profession: '',
              company: '',
              requirements: '',
              avatar: ''
            },
            assignedTo: {
              id: booking.user_id,
              name: 'Host',
              email: '',
              role: 'Host',
              avatar: ''
            },
            meetingLink: booking.meeting_link || '',
            source: 'Website',
            questionnaire: booking.answers?.map((answer: any) => ({
              question: answer.question,
              answer: answer.answer
            })) || [],
            start_time: booking.start_time
          }
        })

        const history = data.filter((booking: any) => {
          if (!booking?.start_time) return false
          return new Date(booking.start_time) <= now
        }).map((booking: any) => {
          const nameAnswer = booking.answers?.find((a: any) => a.question === 'NAME')
          const emailAnswer = booking.answers?.find((a: any) => a.question === 'EMAIL')
          const mobileAnswer = booking.answers?.find((a: any) => a.question === 'MOBILE NUMBER')

          return {
            id: booking.id,
            title: `Meeting with ${nameAnswer?.answer || 'Guest'}`,
            date: format(new Date(booking.start_time), 'EEEE, MMMM d, yyyy'),
            time: format(new Date(booking.start_time), 'h:mm a'),
            duration: `${booking.eventType?.duration || 30} minutes`,
            type: booking.eventType?.location || 'video',
            status: booking.status || 'completed',
            lead: {
              name: nameAnswer?.answer || 'Guest',
              email: emailAnswer?.answer || '',
              phone: mobileAnswer?.answer || '',
              profession: '',
              company: '',
              requirements: '',
              avatar: ''
            },
            assignedTo: {
              id: booking.user_id,
              name: 'Host',
              email: '',
              role: 'Host',
              avatar: ''
            },
            meetingLink: booking.meeting_link || '',
            source: 'Website',
            questionnaire: booking.answers?.map((answer: any) => ({
              question: answer.question,
              answer: answer.answer
            })) || [],
            start_time: booking.start_time
          }
        })

        // Add this after mapping
        console.log('Processed questionnaire:', upcoming[0]?.questionnaire); // Log first processed booking

        setMeetings({ upcoming, history })
      } catch (error) {
        console.error('Error fetching meetings:', error)
        setError('Failed to fetch meetings')
        // Keep using dummy data if API fails
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeetings()
  }, [])

  const handleMeetingUpdate = (updatedMeeting: Meeting) => {
    setMeetings(prev => ({
      upcoming: prev.upcoming.map(m => m.id === updatedMeeting.id ? updatedMeeting : m),
      history: prev.history.map(m => m.id === updatedMeeting.id ? updatedMeeting : m)
    }))
  }

  return (
    <div className="container mx-auto py-10 p-2 overflow-y-scroll h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Meetings</h1>
          <p className="text-muted-foreground">Manage your meetings and appointments</p>
        </div>
        <div className="flex gap-4">
          <Link href="/meetings/event-types">
            <Button variant="outline">
              Manage Event Types
            </Button>
          </Link>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="video">Video Call</SelectItem>
              <SelectItem value="phone">Phone Call</SelectItem>
              <SelectItem value="in-person">In Person</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Meeting Questions
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Meetings</CardTitle>
                  <CardDescription>Your scheduled meetings for the next 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <MeetingsSkeleton />
                  ) : (
                    <>
                      <div className="space-y-6">
                        {Object.entries(groupMeetingsByDate(paginatedMeetings.upcoming)).map(([date, meetings]) => (
                          <div key={date} className="space-y-4">
                            <h3 className="font-medium text-muted-foreground">
                              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                            </h3>
                            <div className="space-y-4">
                              {meetings.map((meeting) => (
                                <Card key={meeting.id}>
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-4">
                                        <Avatar>
                                          <AvatarImage src={meeting.lead.avatar} />
                                          <AvatarFallback>{meeting.lead.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <h3 className="font-semibold">{meeting.title}</h3>
                                          <p className="text-sm text-muted-foreground">{meeting.lead.name} - {meeting.lead.company}</p>
                                          <div className="flex items-center text-sm text-muted-foreground">
                                            <CalendarDays className="mr-2 h-4 w-4" />
                                            {meeting.date} at {meeting.time}
                                          </div>
                                          <div className="flex items-center text-sm text-muted-foreground">
                                            <Clock className="mr-2 h-4 w-4" />
                                            {meeting.duration}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex flex-col items-end space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <Badge variant="outline" className="text-sm">
                                            {meeting.source}
                                          </Badge>
                                          <Avatar className="h-8 w-8 border-2 border-background">
                                            <AvatarImage src={meeting.assignedTo.avatar} />
                                            <AvatarFallback>{meeting.assignedTo.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                                          </Avatar>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button variant="outline" size="sm">
                                                <FileText className="h-4 w-4 mr-2" />
                                                Details
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                              <div className="fixed top-0 right-0 left-0 bg-background border-b p-4 z-50 flex justify-between items-start">
                                                <DialogHeader>
                                                  <DialogTitle>Meeting Details</DialogTitle>
                                                  <DialogDescription>
                                                    Lead meeting information and details
                                                  </DialogDescription>
                                                </DialogHeader>
                                                <DialogClose className="absolute right-4 top-4">
                                                  <X className="h-4 w-4" />
                                                </DialogClose>
                                              </div>
                                              <div className="mt-16 max-h-[calc(90vh-8rem)] overflow-y-auto p-4">
                                                <MeetingDetails meeting={meeting} onUpdate={handleMeetingUpdate} />
                                              </div>
                                            </DialogContent>
                                          </Dialog>
                                          <Button variant="outline" size="sm" className="text-blue-600">
                                            <RefreshCw className="h-4 w-4" />
                                          </Button>
                                          {React.createElement(meetingTypes[meeting.type as keyof typeof meetingTypes].icon, {
                                            className: `h-4 w-4 ${meetingTypes[meeting.type as keyof typeof meetingTypes].color}`
                                          })}
                                          <Badge variant="secondary" className={statusColors[meeting.status as keyof typeof statusColors]}>
                                            {meeting.status}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <PaginationControls 
                        type="upcoming"
                        currentPage={currentPage.upcoming}
                        totalPages={totalPages.upcoming}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Meeting History</CardTitle>
                  <CardDescription>Past meetings and their outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-8 w-full" />
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {Object.entries(groupMeetingsByDate(paginatedMeetings.history)).map(([date, meetings]) => (
                        <div key={date} className="mb-6">
                          <h3 className="font-medium text-muted-foreground mb-4">
                            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                          </h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Meeting</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Attendee</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Outcome</TableHead>
                                <TableHead>Follow-up</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {meetings.map((meeting) => (
                                <TableRow key={meeting.id}>
                                  <TableCell className="font-medium">{meeting.title}</TableCell>
                                  <TableCell>{meeting.time}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={meeting.lead.avatar} />
                                        <AvatarFallback>{meeting.lead.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <span className="font-medium">{meeting.lead.name}</span>
                                        <p className="text-sm text-muted-foreground">{meeting.lead.company}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center">
                                      {React.createElement(meetingTypes[meeting.type as keyof typeof meetingTypes].icon, {
                                        className: `h-4 w-4 mr-2 ${meetingTypes[meeting.type as keyof typeof meetingTypes].color}`
                                      })}
                                      {meeting.type}
                                    </div>
                                  </TableCell>
                                  <TableCell>{meeting.outcome || 'No outcome recorded'}</TableCell>
                                  <TableCell>{meeting.followUpDate}</TableCell>
                                  <TableCell>
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <FileText className="h-4 w-4" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <div className="fixed top-0 right-0 left-0 bg-background border-b p-4 z-50 flex justify-between items-start">
                                          <DialogHeader>
                                            <DialogTitle>Meeting History Details</DialogTitle>
                                          </DialogHeader>
                                          <DialogClose className="absolute right-4 top-4">
                                            <X className="h-4 w-4" />
                                          </DialogClose>
                                        </div>
                                        <div className="mt-16 max-h-[calc(90vh-8rem)] overflow-y-auto p-4">
                                          <MeetingDetails meeting={meeting} onUpdate={handleMeetingUpdate} />
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                      <PaginationControls 
                        type="history"
                        currentPage={currentPage.history}
                        totalPages={totalPages.history}
                      />
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 