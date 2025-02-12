import React from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  eventType: any
  setEventType: (eventType: any) => void
}

export const BasicInfoTab = ({ eventType, setEventType }: Props) => {
  return (
    <TabsContent value="basic">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={eventType.title}
              onChange={(e) => setEventType({ ...eventType, title: e.target.value })}
              placeholder="e.g., Product Demo Call"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={eventType.description}
              onChange={(e) => setEventType({ ...eventType, description: e.target.value })}
              placeholder="Add a description for your event"
            />
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <Select
              value={eventType.duration.toString()}
              onValueChange={(value) => setEventType({ ...eventType, duration: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="custom">Custom Length</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Select
              value={eventType.location}
              onValueChange={(value: 'video' | 'phone' | 'in-person') => 
                setEventType({ ...eventType, location: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video Call</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="in-person">In Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {eventType.location === 'video' && (
            <div className="space-y-2">
              <Label>Video Platform</Label>
              <Select
                value={eventType.videoPlatform}
                onValueChange={(value) => setEventType({ ...eventType, videoPlatform: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select video platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Meet</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="custom">Custom Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {eventType.location === 'in-person' && (
            <div className="space-y-2">
              <Label>Location Details</Label>
              <Textarea
                value={eventType.locationDetails}
                onChange={(e) => setEventType({ ...eventType, locationDetails: e.target.value })}
                placeholder="Enter the meeting location details"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  )
} 