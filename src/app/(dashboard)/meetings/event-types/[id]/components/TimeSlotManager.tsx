import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Plus, Trash2 } from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Break {
  id: string
  startTime: string
  endTime: string
  label: string
}

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  daysOfWeek: number[] // 0 = Sunday, 1 = Monday, etc.
  breaks: Break[] // Add breaks to TimeSlot
}

interface Props {
  slots: TimeSlot[]
  onSlotsChange: (slots: TimeSlot[]) => void
}

export const TimeSlotManager = ({ slots, onSlotsChange }: Props) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const addSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: '09:00',
      endTime: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday by default
      breaks: []
    }
    onSlotsChange([...slots, newSlot])
  }

  const updateSlot = (id: string, field: keyof TimeSlot, value: any) => {
    onSlotsChange(
      slots.map(slot => 
        slot.id === id ? { ...slot, [field]: value } : slot
      )
    )
  }

  const removeSlot = (id: string) => {
    onSlotsChange(slots.filter(slot => slot.id !== id))
  }

  const toggleDay = (slotId: string, day: number) => {
    const slot = slots.find(s => s.id === slotId)
    if (!slot) return

    const newDays = slot.daysOfWeek.includes(day)
      ? slot.daysOfWeek.filter(d => d !== day)
      : [...slot.daysOfWeek, day]

    updateSlot(slotId, 'daysOfWeek', newDays)
  }

  const addBreak = (slotId: string) => {
    const newBreak: Break = {
      id: Date.now().toString(),
      startTime: '12:00',
      endTime: '13:00',
      label: 'Lunch Break'
    }

    onSlotsChange(
      slots.map(slot => 
        slot.id === slotId 
          ? { ...slot, breaks: [...(slot.breaks || []), newBreak] }
          : slot
      )
    )
  }

  const updateBreak = (slotId: string, breakId: string, field: keyof Break, value: any) => {
    onSlotsChange(
      slots.map(slot => 
        slot.id === slotId 
          ? {
              ...slot,
              breaks: slot.breaks?.map(b => 
                b.id === breakId ? { ...b, [field]: value } : b
              )
            }
          : slot
      )
    )
  }

  const removeBreak = (slotId: string, breakId: string) => {
    onSlotsChange(
      slots.map(slot => 
        slot.id === slotId 
          ? { ...slot, breaks: slot.breaks?.filter(b => b.id !== breakId) }
          : slot
      )
    )
  }

  const validateBreakTime = (slotId: string, breakId: string, field: 'startTime' | 'endTime', value: string) => {
    const slot = slots.find(s => s.id === slotId)
    if (!slot) return false

    const breakItem = slot.breaks?.find(b => b.id === breakId)
    if (!breakItem) return false

    const breakStart = field === 'startTime' ? value : breakItem.startTime
    const breakEnd = field === 'endTime' ? value : breakItem.endTime

    // Check if break is within slot time range
    return breakStart >= slot.startTime && breakEnd <= slot.endTime
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Available Time Slots</Label>
        <Button onClick={addSlot} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Time Slot
        </Button>
      </div>

      {slots.map((slot) => (
        <Card key={slot.id} className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateSlot(slot.id, 'startTime', e.target.value)}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(slot.id, 'endTime', e.target.value)}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeSlot(slot.id)}
                className="mt-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day, index) => (
                  <Button
                    key={day}
                    size="sm"
                    variant={slot.daysOfWeek.includes(index) ? "default" : "outline"}
                    onClick={() => toggleDay(slot.id, index)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Breaks</Label>
                <Button onClick={() => addBreak(slot.id)} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Break
                </Button>
              </div>

              <div className="space-y-2">
                {slot.breaks?.map((breakItem) => (
                  <Dialog key={breakItem.id}>
                    <DialogTrigger asChild>
                      <div className="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-muted">
                        <div>
                          <p className="font-medium">{breakItem.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {breakItem.startTime} - {breakItem.endTime}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Trash2 
                            className="h-4 w-4" 
                            onClick={(e) => {
                              e.stopPropagation()
                              removeBreak(slot.id, breakItem.id)
                            }}
                          />
                        </Button>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Break</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Label</Label>
                          <Input
                            value={breakItem.label}
                            onChange={(e) => updateBreak(slot.id, breakItem.id, 'label', e.target.value)}
                            placeholder="e.g., Lunch Break"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input
                              type="time"
                              value={breakItem.startTime}
                              onChange={(e) => {
                                if (validateBreakTime(slot.id, breakItem.id, 'startTime', e.target.value)) {
                                  updateBreak(slot.id, breakItem.id, 'startTime', e.target.value)
                                }
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input
                              type="time"
                              value={breakItem.endTime}
                              onChange={(e) => {
                                if (validateBreakTime(slot.id, breakItem.id, 'endTime', e.target.value)) {
                                  updateBreak(slot.id, breakItem.id, 'endTime', e.target.value)
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}

                {(!slot.breaks || slot.breaks.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No breaks added. Click "Add Break" to create a break time.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {slots.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No time slots added. Click "Add Time Slot" to create your first availability window.
        </p>
      )}
    </div>
  )
} 