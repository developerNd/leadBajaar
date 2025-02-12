import React from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface TeamMember {
  id: number
  name: string
  email: string
  avatar: string
  role: string
}

interface Props {
  eventType: any
  toggleTeamMember: (member: TeamMember) => void
}

export const TeamTab = ({ eventType, toggleTeamMember }: Props) => {
  return (
    <TabsContent value="team">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assign Team Members</h3>
            <p className="text-sm text-muted-foreground">
              Select team members who can manage and receive bookings for this event type.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eventType.teamMembers.map((member: TeamMember) => (
                <div
                  key={member.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    eventType.teamMembers.some(m => m.id === member.id)
                      ? 'bg-primary/5 border-primary'
                      : 'bg-background hover:bg-muted/50'
                  }`}
                  onClick={() => toggleTeamMember(member)}
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.email}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
} 