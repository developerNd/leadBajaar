"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CustomCalendarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  availableDates?: Date[]
  disabledDates?: Date[]
  minDate?: Date
  maxDate?: Date
  className?: string
  isDateAvailable?: (date: Date) => boolean
}

export function CustomCalendar({
  selectedDate,
  onDateSelect,
  availableDates = [],
  disabledDates = [],
  minDate,
  maxDate,
  className,
  isDateAvailable
}: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    return selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : new Date()
  })

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const checkDateAvailable = (date: Date) => {
    // Use custom function if provided
    if (isDateAvailable) {
      return isDateAvailable(date)
    }
    
    // Fallback to availableDates array
    if (availableDates.length === 0) return true
    return availableDates.some(availableDate => 
      availableDate.getDate() === date.getDate() &&
      availableDate.getMonth() === date.getMonth() &&
      availableDate.getFullYear() === date.getFullYear()
    )
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check if date is in the past
    if (date < today) return true
    
    // Check if date is in disabled dates
    if (disabledDates.some(disabledDate => 
      disabledDate.getDate() === date.getDate() &&
      disabledDate.getMonth() === date.getMonth() &&
      disabledDate.getFullYear() === date.getFullYear()
    )) return true
    
    // Check min/max date constraints
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    
    return false
  }

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date) && onDateSelect) {
      onDateSelect(date)
    }
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const generateCalendarDays = () => {
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
             const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
       const isAvailable = checkDateAvailable(date)
       const isDisabled = isDateDisabled(date)
       const isSelected = isDateSelected(date)
       const isTodayDate = isToday(date)
      
      days.push(
        <div
          key={day}
          className={cn(
            "h-9 w-9 flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-200",
            "hover:bg-primary/10 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            "mx-auto rounded-full",
            isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            isTodayDate && !isSelected && "bg-accent text-accent-foreground",
            isAvailable && !isDisabled && !isSelected && !isTodayDate && "bg-primary/10 hover:bg-primary/15 text-foreground",
            isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed hover:bg-transparent",
            !isAvailable && !isDisabled && !isSelected && !isTodayDate && "text-muted-foreground opacity-30 cursor-not-allowed hover:bg-transparent"
          )}
          onClick={() => handleDateClick(date)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleDateClick(date)
            }
          }}
        >
          {day}
        </div>
      )
    }
    
    return days
  }

  return (
    <div className={cn("p-4 bg-background border rounded-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-lg font-semibold">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextMonth}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="h-9 flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {generateCalendarDays()}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary/10" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-accent" />
          <span>Today</span>
        </div>
      </div>
    </div>
  )
}
