import React from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TimeSlotManager } from './TimeSlotManager'

interface Props {
  eventType: any
  updateScheduling: (field: string, value: any) => void
}

export const SchedulingTab = ({ eventType, updateScheduling }: Props) => {
  return (
    <TabsContent value="scheduling">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Buffer Time Before</Label>
              <Select
                value={eventType.scheduling.bufferBefore.toString()}
                onValueChange={(value) => updateScheduling('bufferBefore', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select buffer time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Buffer Time After</Label>
              <Select
                value={eventType.scheduling.bufferAfter.toString()}
                onValueChange={(value) => updateScheduling('bufferAfter', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select buffer time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <TimeSlotManager
              slots={eventType.scheduling.timeSlots || []}
              onSlotsChange={(slots) => updateScheduling('timeSlots', slots)}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Available Hours</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Start Time</Label>
                  <Input
                    type="time"
                    value={eventType.scheduling.startTime}
                    onChange={(e) => updateScheduling('startTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm">End Time</Label>
                  <Input
                    type="time"
                    value={eventType.scheduling.endTime}
                    onChange={(e) => updateScheduling('endTime', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <Button
                    key={day}
                    variant={eventType.scheduling.availableDays.includes(day) ? 'default' : 'outline'}
                    onClick={() => {
                      const updatedDays = eventType.scheduling.availableDays.includes(day)
                        ? eventType.scheduling.availableDays.filter((d: string) => d !== day)
                        : [...eventType.scheduling.availableDays, day]
                      updateScheduling('availableDays', updatedDays)
                    }}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Recurring Availability</Label>
                <Switch
                  checked={!!eventType.scheduling.recurring}
                  onCheckedChange={(checked) => {
                    updateScheduling('recurring', checked ? {
                      frequency: 'weekly',
                      interval: 1,
                      timeslots: []
                    } : undefined)
                  }}
                />
              </div>

              {eventType.scheduling.recurring && (
                <div className="space-y-4 mt-4">
                  <Select
                    value={eventType.scheduling.recurring.frequency}
                    onValueChange={(value) => updateScheduling('recurring', {
                      ...eventType.scheduling.recurring,
                      frequency: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="space-y-2">
                    <Label>Repeat every</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={eventType.scheduling.recurring.interval}
                        onChange={(e) => updateScheduling('recurring', {
                          ...eventType.scheduling.recurring,
                          interval: parseInt(e.target.value)
                        })}
                        className="w-20"
                      />
                      <span>{eventType.scheduling.recurring.frequency === 'daily' ? 'days' : 
                            eventType.scheduling.recurring.frequency === 'weekly' ? 'weeks' : 'months'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Minimum Notice Period</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={eventType.scheduling.minimumNotice}
                  onChange={(e) => updateScheduling('minimumNotice', parseInt(e.target.value))}
                  className="w-20"
                />
                <span>hours</span>
              </div>
              <p className="text-sm text-muted-foreground">
                How far in advance can people book?
              </p>
            </div>

            <div className="space-y-2">
              <Label>Maximum Booking Period</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={eventType.scheduling.dateRange}
                  onChange={(e) => updateScheduling('dateRange', parseInt(e.target.value))}
                  className="w-20"
                />
                <span>days</span>
              </div>
              <p className="text-sm text-muted-foreground">
                How far in the future can people book?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Daily Booking Limit</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={eventType.scheduling.dailyLimit || ''}
                  onChange={(e) => updateScheduling('dailyLimit', parseInt(e.target.value))}
                  className="w-20"
                  placeholder="No limit"
                />
                <span>meetings per day</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Weekly Booking Limit</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={eventType.scheduling.weeklyLimit || ''}
                  onChange={(e) => updateScheduling('weeklyLimit', parseInt(e.target.value))}
                  className="w-20"
                  placeholder="No limit"
                />
                <span>meetings per week</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Time Zone</Label>
            <Select
              value={eventType.scheduling.timezone}
              onValueChange={(value) => updateScheduling('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time zone" />
              </SelectTrigger>
              <SelectContent>
                {Intl.supportedValuesOf('timeZone').map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              All times will be displayed in this time zone
            </p>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
} 