'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { format, addDays, isBefore, isAfter, startOfDay, endOfDay, isWithinInterval } from "date-fns"
import { ChevronLeft, ChevronRight, Clock, Globe, CheckCircle2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { validateQuestionResponse } from '@/lib/validations/questions'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface EventType {
  id: string
  title: string
  description: string
  duration: number
  questions: any[]
  scheduling: any
  teamMembers: any[]
}

interface TimeSlot {
  startTime: string
  endTime: string
  available: boolean
}

const isDateAvailable = (date: Date, eventType: EventType) => {
  const today = startOfDay(new Date());
  const maxDate = addDays(today, eventType.scheduling.dateRange);
  
  // Check if date is within allowed range
  if (isBefore(date, today) || isAfter(date, maxDate)) {
    return false;
  }

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = format(date, 'EEEE');
  
  // Check if day is in available days
  return eventType.scheduling.availableDays.includes(dayOfWeek);
};

function CalendarSkeleton() {
  return (
    <div className="space-y-8">
      {/* Calendar Grid Skeleton */}
      <div className="p-6 bg-muted/20 rounded-lg">
        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex justify-between items-center pb-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="flex gap-1">
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Week days */}
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded animate-pulse" />
            ))}
            {/* Date cells */}
            {[...Array(35)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Time Slots Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [eventType, setEventType] = useState<EventType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [error, setError] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    message: ''
  });

  useEffect(() => {
    const fetchEventType = async () => {
      try {
        console.log('Fetching event type with ID:', params.eventTypeId);
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}api/event-types/${params.eventTypeId}`,
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          throw new Error('Failed to fetch event type');
        }

        const data = await response.json();
        console.log('Event Type Data:', data);
        
        // Map API response to frontend model with proper scheduling data
        const mappedEventType = {
          id: data.id,
          title: data.title,
          description: data.description,
          duration: data.duration,
          location: data.location,
          questions: data.questions || [],
          scheduling: {
            bufferBefore: data.scheduling?.bufferBefore || data.buffer_before || 0,
            bufferAfter: data.scheduling?.bufferAfter || data.buffer_after || 0,
            minimumNotice: data.scheduling?.minimumNotice || data.minimum_notice_time || 24,
            dailyLimit: data.scheduling?.dailyLimit || data.daily_meeting_limit || 0,
            weeklyLimit: data.scheduling?.weeklyLimit || data.weekly_meeting_limit || 0,
            availableDays: data.scheduling?.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            dateRange: data.scheduling?.dateRange || data.date_range_booking || 60,
            timezone: data.scheduling?.timezone || data.timezone || 'UTC',
            timeSlots: data.scheduling?.timeSlots || [],
            startTime: data.scheduling?.startTime || '09:00',
            endTime: data.scheduling?.endTime || '17:00',
            recurring: data.scheduling?.recurring || null
          },
          teamMembers: data.team_members ? 
            (Array.isArray(data.team_members) ? data.team_members : [data.team_members]) 
            : []
        };

        console.log('Mapped Event Type:', mappedEventType);
        setEventType(mappedEventType);
      } catch (error) {
        console.error('Error fetching event type:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch event type');
      }
    };

    if (params.eventTypeId) {
      fetchEventType();
    }
  }, [params.eventTypeId]);

  useEffect(() => {
    // Fetch available time slots when date is selected
    if (selectedDate && eventType) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate, eventType])

  const fetchAvailableSlots = async (date: Date) => {
    try {
      console.log('Fetching slots for date:', format(date, 'yyyy-MM-dd'));
      
      const queryParams = new URLSearchParams({
        date: format(date, 'yyyy-MM-dd'),
        timezone: eventType?.scheduling.timezone || 'UTC',
        duration: eventType?.duration.toString() || '30',
        buffer_before: eventType?.scheduling.bufferBefore.toString() || '0',
        buffer_after: eventType?.scheduling.bufferAfter.toString() || '0'
      });
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}api/event-types/${params.eventTypeId}/availability?${queryParams.toString()}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error('Failed to fetch availability');
      }

      const data = await response.json();
      console.log('Available Slots:', data);

      // Ensure slots are in the correct format and filtered for availability
      const formattedSlots = (data.slots || []).map((slot: any) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        available: slot.available !== false // default to true if not specified
      }));

      setAvailableSlots(formattedSlots);
    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailableSlots([]);
    }
  }

  const formatTimeSlot = (slot: TimeSlot) => {
    return format(new Date(slot.startTime), 'h:mm a')
  }

  const handleAnswerChange = (questionId: string, value: any, type: string) => {
    const validation = validateQuestionResponse(type, value)
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))

    setErrors(prev => ({
      ...prev,
      [questionId]: validation.error || ''
    }))
  }

  const renderQuestion = (question: any) => {
    switch (question.type) {
      case 'text':
      case 'email':
        return (
          <Input
            type={question.type}
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.type)}
            placeholder={`Enter your ${question.question.toLowerCase()}`}
          />
        )

      case 'phone':
        return (
          <Input
            type="tel"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, 'phone')}
            placeholder="Enter your phone number"
          />
        )

      case 'textarea':
        return (
          <Textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, 'text')}
            placeholder={`Enter your response`}
          />
        )

      case 'select':
        return (
          <Select
            value={answers[question.id] || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value, 'select')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            {question.options.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={(answers[question.id] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = answers[question.id] || []
                    const newAnswers = checked
                      ? [...currentAnswers, option]
                      : currentAnswers.filter((a: string) => a !== option)
                    handleAnswerChange(question.id, newAnswers, 'multiselect')
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      case 'radio':
        return (
          <RadioGroup
            value={answers[question.id] || ''}
            onValueChange={(value) => handleAnswerChange(question.id, value, 'radio')}
          >
            {question.options.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={(answers[question.id] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = answers[question.id] || []
                    const newAnswers = checked
                      ? [...currentAnswers, option]
                      : currentAnswers.filter((a: string) => a !== option)
                    handleAnswerChange(question.id, newAnswers, 'checkbox')
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const bookingData = {
        eventTypeId: params.eventTypeId,
        date: format(selectedDate!, 'yyyy-MM-dd'),
        time: format(new Date(selectedTime!), 'HH:mm:ss'),
        duration: eventType?.duration,
        answers
      };

      console.log('Submitting booking with data:', bookingData);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}api/bookings`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData)
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        if (data.message === "This time slot is no longer available") {
          setErrorDialog({
            isOpen: true,
            message: data.message
          });
          return;
        }
        throw new Error(data.message || 'Failed to create booking');
      }

      console.log('Booking Response:', data);

      if (!data.booking) {
        throw new Error('Invalid booking response');
      }

      setBookingDetails(data.booking);
      setShowSuccess(true);
      
      // Reset form
      setAnswers({});
      setSelectedDate(undefined);
      setSelectedTime(null);
      setStep(1);
      setCurrentQuestionIndex(0);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      setErrorDialog({
        isOpen: true,
        message: error instanceof Error ? error.message : 'Failed to create booking'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleNextQuestion = () => {
    const currentQuestion = eventType?.questions[currentQuestionIndex]
    
    // Validate current question
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      setErrors({
        ...errors,
        [currentQuestion.id]: 'This field is required'
      })
      return
    }
    
    if (answers[currentQuestion.id]) {
      const validation = validateQuestionResponse(currentQuestion.type, answers[currentQuestion.id])
      if (!validation.isValid) {
        setErrors({
          ...errors,
          [currentQuestion.id]: validation.error || 'Invalid input'
        })
        return
      }
    }

    // Clear error if validation passes
    setErrors({
      ...errors,
      [currentQuestion.id]: ''
    })

    // Move to next question or submit if last question
    if (eventType && currentQuestionIndex < eventType.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else {
      setStep(1) // Go back to calendar view
    }
  }

  if (!eventType) return (
    <div className="container max-w-4xl mx-auto py-10">
      <Card>
        <CardContent className="p-0 relative overflow-hidden">
          <div className="grid md:grid-cols-[300px,1fr]">
            {/* Left Section Skeleton */}
            <div className="p-6 border-r">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-20 w-full bg-muted rounded animate-pulse" />
              </div>
            </div>
            
            {/* Right Section Skeleton */}
            <div className="p-6">
              <CalendarSkeleton />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Card>
        <CardContent className="p-0 relative overflow-hidden">
          <div className="grid md:grid-cols-[300px,1fr]">
            {/* Left Section - Event Info */}
            <div className="p-6 border-r">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="w-16 h-16 mb-4">
                  <AvatarImage src={eventType?.teamMembers?.[0]?.avatar} />
                  <AvatarFallback>AT</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold mb-1">{eventType?.title}</h2>
                <div className="flex items-center text-muted-foreground mb-4">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{eventType?.duration} min</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {eventType?.description}
                </p>
              </div>

              {/* Meeting Summary - Add null checks */}
              {selectedDate && selectedTime && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-medium mb-2">Meeting Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span>{selectedTime ? format(new Date(selectedTime), 'h:mm a') : ''}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span>{eventType?.duration} minutes</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Powered by Badge */}
              <div className="absolute top-0 right-0 bg-gray-700 text-white py-1 px-3 transform rotate-45 translate-x-12 translate-y-6">
                <span className="text-xs">Powered by LeadBajaar</span>
              </div>
            </div>

            {/* Right Section - Calendar & Questions */}
            <div className="p-6">
              {step === 1 ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Select Date & Time</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <span>{eventType.scheduling.timezone}</span>
                    </div>
                  </div>
                  
                  <div className="grid gap-8">
                    {/* Calendar Section */}
                    <div className="space-y-4">
                      <div className="p-6 bg-muted/20 rounded-lg">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => !isDateAvailable(date, eventType)}
                          modifiers={{
                            available: (date) => isDateAvailable(date, eventType)
                          }}
                          modifiersClassNames={{
                            available: "bg-primary/10 hover:bg-primary/15 font-medium hover:text-blue-900",
                            selected: "bg-blue-900 !text-primary-foreground font-medium",
                            today: "bg-muted font-medium"
                          }}
                          fromDate={new Date()}
                          toDate={addDays(new Date(), eventType.scheduling.dateRange)}
                          className="rounded-md w-full"
                          classNames={{
                            months: "flex flex-col space-y-4",
                            month: "space-y-4",
                            caption: "flex justify-between items-center pt-1 pb-4 px-2",
                            caption_label: "text-base font-medium text-center",
                            nav: "flex items-center gap-1",
                            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse",
                            head_row: "flex w-full",
                            head_cell: "text-muted-foreground font-normal text-[0.875rem] w-[14.28%] h-8 text-center",
                            row: "flex w-full mt-2",
                            cell: cn(
                              "relative w-[14.28%] h-9 text-center text-sm p-4",
                              "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                              "focus-within:relative focus-within:z-20"
                            ),
                            day: cn(
                              "h-9 w-9 p-0 font-normal",
                              "aria-selected:opacity-100",
                              "hover:bg-primary/10 hover:text-primary-foreground",
                              "focus:bg-primary focus:text-primary-foreground",
                              "mx-auto rounded-full transition-all text-center"
                            ),
                            day_selected: "bg-primary text-red-500 hover:bg-primary hover:text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground",
                            day_outside: "text-muted-foreground opacity-50",
                            day_disabled: "text-muted-foreground opacity-30",
                            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                            day_hidden: "invisible",
                          }}
                          components={{
                            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                            IconRight: () => <ChevronRight className="h-4 w-4" />,
                          }}
                        />
                      </div>
                      
                      {/* Legend */}
                      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-primary/10" />
                          <span>Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                          <span>Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-muted" />
                          <span>Today</span>
                        </div>
                      </div>
                    </div>

                    {/* Time Slots Section */}
                    {selectedDate ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            Available Times ({format(selectedDate, 'EEEE, MMMM d')})
                          </h4>
                          {availableSlots.length > 0 && (
                            <span className="text-sm text-muted-foreground">
                              {availableSlots.length} slots available
                            </span>
                          )}
                        </div>
                        
                        {availableSlots.length > 0 ? (
                          <div className="grid grid-cols-3 gap-2">
                            {availableSlots.map((slot) => (
                              <Button
                                key={slot.startTime}
                                variant={selectedTime === slot.startTime ? "default" : "outline"}
                                className={cn(
                                  "w-full transition-all",
                                  !slot.available && "opacity-50 cursor-not-allowed",
                                  selectedTime === slot.startTime && "ring-2 ring-primary ring-offset-2"
                                )}
                                onClick={() => slot.available && setSelectedTime(slot.startTime)}
                                disabled={!slot.available}
                              >
                                {format(new Date(slot.startTime), 'h:mm a')}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <div className="py-8 text-center">
                            <p className="text-muted-foreground">No available slots for this date</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-8 text-center border rounded-lg">
                        <p className="text-muted-foreground">Select a date to view available times</p>
                      </div>
                    )}

                    {/* Next Button */}
                    {selectedDate && selectedTime && (
                      <Button 
                        className="w-full"
                        size="lg"
                        onClick={() => setStep(2)}
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center mb-6">
                    <Button variant="ghost" onClick={handlePreviousQuestion} className="mr-2">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-xl font-semibold">Enter Details</h3>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300 ease-in-out"
                        style={{ 
                          width: `${((currentQuestionIndex + 1) / eventType.questions.length) * 100}%` 
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Question {currentQuestionIndex + 1} of {eventType.questions.length}
                    </p>
                  </div>

                  {/* Current Question */}
                  <div className="space-y-6">
                    <div 
                      key={eventType.questions[currentQuestionIndex].id} 
                      className="space-y-4 min-h-[200px]"
                    >
                      <div className="space-y-2">
                        <Label className="text-lg">
                          {eventType.questions[currentQuestionIndex].question}
                          {eventType.questions[currentQuestionIndex].required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </Label>
                        {eventType.questions[currentQuestionIndex].description && (
                          <p className="text-sm text-muted-foreground">
                            {eventType.questions[currentQuestionIndex].description}
                          </p>
                        )}
                      </div>

                      {renderQuestion(eventType.questions[currentQuestionIndex])}
                      
                      {errors[eventType.questions[currentQuestionIndex].id] && (
                        <p className="text-sm text-destructive">
                          {errors[eventType.questions[currentQuestionIndex].id]}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button 
                        variant="outline" 
                        onClick={handlePreviousQuestion}
                        className="w-[120px]"
                      >
                        Previous
                      </Button>
                      <Button 
                        onClick={currentQuestionIndex === eventType.questions.length - 1 ? handleSubmit : handleNextQuestion}
                        className="w-[120px]"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <span className="animate-spin mr-2">⏳</span> 
                            Scheduling...
                          </div>
                        ) : (
                          currentQuestionIndex === eventType.questions.length - 1 ? 'Schedule' : 'Next'
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Dialog */}
      <Dialog 
        open={errorDialog.isOpen} 
        onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Booking Error</DialogTitle>
            <DialogDescription>
              {errorDialog.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="secondary" 
              onClick={() => {
                setErrorDialog({ isOpen: false, message: '' });
                // Refresh available slots if time slot is no longer available
                if (selectedDate) {
                  fetchAvailableSlots(selectedDate);
                }
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your meeting has been scheduled successfully.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted p-4 rounded-lg w-full mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {bookingDetails?.start_time ? 
                    format(new Date(bookingDetails.start_time), 'EEEE, MMMM d, yyyy') : 
                    ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">
                  {bookingDetails?.start_time ? 
                    format(new Date(bookingDetails.start_time), 'h:mm a') : 
                    ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{eventType?.duration} minutes</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-center gap-4">
            {/* <Button 
              variant="outline" 
              onClick={() => {
                setShowSuccess(false)
                router.push('/') // or wherever you want to redirect
              }}
            >
              Close
            </Button> */}
            <Button
              onClick={() => {
                window.open(bookingDetails?.calendar_link, '_blank')
              }}
            >
              Add to Calendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 