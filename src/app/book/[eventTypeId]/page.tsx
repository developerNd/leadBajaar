'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
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

  useEffect(() => {
    const fetchEventType = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/event-types/${params.eventTypeId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              // Add auth header if needed
              // 'Authorization': `Bearer ${session?.accessToken}`
            }
          }
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch event type')
        }
        const data = await response.json()
        setEventType(data)
      } catch (error) {
        console.error('Error fetching event type:', error)
        setError('Failed to fetch event type')
      }
    }

    if (params.eventTypeId) {
      fetchEventType()
    }
  }, [params.eventTypeId])

  useEffect(() => {
    // Fetch available time slots when date is selected
    if (selectedDate && eventType) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate, eventType])

  const fetchAvailableSlots = async (date: Date) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/event-types/${params.eventTypeId}/availability?date=${format(date, 'yyyy-MM-dd')}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )
      if (!response.ok) throw new Error('Failed to fetch availability')
      const data = await response.json()
      console.log(data);
      setAvailableSlots(data.slots)
    } catch (error) {
      console.error('Error fetching availability:', error)
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/bookings`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventTypeId: params.eventTypeId,
            date: format(selectedDate!, 'yyyy-MM-dd'),
            time: format(new Date(selectedTime!), 'HH:mm:ss'),
            duration: eventType?.duration,
            answers
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      const data = await response.json()
      setBookingDetails(data.booking)
      setShowSuccess(true)
      
      // Optional: Reset form
      setAnswers({})
      setSelectedDate(undefined)
      setSelectedTime(null)
      setStep(1)
      setCurrentQuestionIndex(0)
      
    } catch (error) {
      console.error('Error creating booking:', error)
      // Show error toast or message
    } finally {
      setIsSubmitting(false)
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

  if (!eventType) return <div>Loading...</div>

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Card>
        <CardContent className="p-0">
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
                <span className="text-xs">Powered by AIWhatsapp</span>
              </div>
            </div>

            {/* Right Section - Calendar & Questions */}
            <div className="p-6">
              {step === 1 ? (
                <>
                  <h3 className="text-xl font-semibold mb-6">Select a Date & Time</h3>
                  <div className="space-y-6">
                    {/* Calendar */}
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border p-4"
                      disabled={(date) => date < new Date()}
                    />

                    {/* Time Slots */}
                    {selectedDate && (
                      <div className="space-y-4">
                        <Label>Available Times</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot.startTime}
                              variant={selectedTime === slot.startTime ? "default" : "outline"}
                              className="w-full"
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.startTime)}
                            >
                              {format(new Date(slot.startTime), 'h:mm a')}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timezone Selector */}
                    <div className="flex items-center space-x-2 mt-6">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <Select defaultValue="Asia/Kolkata">
                        <SelectTrigger className="w-[240px]">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">
                            India Standard Time (10:40am)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Next Button */}
                    {selectedDate && selectedTime && (
                      <Button 
                        className="w-full mt-4"
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