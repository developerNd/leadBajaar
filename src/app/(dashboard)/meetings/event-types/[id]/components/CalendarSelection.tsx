import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { fetchWithErrorHandling } from '@/lib/utils/api-helpers'
import { CalendarError } from '@/lib/utils/error-handling'

interface Calendar {
  id: string
  name: string
  primary: boolean
  selected: boolean
}

interface Props {
  type: 'google' | 'outlook' | 'apple'
  isConnected: boolean
}

export const CalendarSelection = ({ type, isConnected }: Props) => {
  const { toast } = useToast()
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchCalendars = async (retry = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await fetchWithErrorHandling<Calendar[]>(
        `/api/calendar/calendars?type=${type}`
      )
      setCalendars(data)
    } catch (error) {
      if (error instanceof CalendarError) {
        setError(error.message)
        
        if (error.retryable && retry && retryCount < 3) {
          const timeout = Math.pow(2, retryCount) * 1000
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
            fetchCalendars(true)
          }, timeout)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected) {
      fetchCalendars(true)
    }
  }, [isConnected])

  const handleCalendarToggle = async (calendarId: string) => {
    try {
      const updatedCalendars = calendars.map(cal => 
        cal.id === calendarId ? { ...cal, selected: !cal.selected } : cal
      )
      
      const response = await fetch('/api/calendar/calendars', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          selectedCalendars: updatedCalendars
            .filter(cal => cal.selected)
            .map(cal => cal.id)
        })
      })

      if (!response.ok) throw new Error('Failed to update calendar selection')
      
      setCalendars(updatedCalendars)
      toast({
        title: "Calendars Updated",
        description: "Your calendar selection has been saved"
      })
    } catch (error) {
      console.error('Error updating calendars:', error)
      toast({
        title: "Error",
        description: "Failed to update calendar selection",
        variant: "destructive"
      })
    }
  }

  if (!isConnected) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Calendars to Check</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchCalendars(true)}
              className="ml-2"
            >
              Retry
            </Button>
          </Alert>
        ) : (
          <div className="space-y-4">
            {calendars.map(calendar => (
              <div key={calendar.id} className="flex items-center space-x-2">
                <Checkbox
                  id={calendar.id}
                  checked={calendar.selected}
                  onCheckedChange={() => handleCalendarToggle(calendar.id)}
                  disabled={calendar.primary}
                />
                <label
                  htmlFor={calendar.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {calendar.name}
                  {calendar.primary && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Primary)
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 