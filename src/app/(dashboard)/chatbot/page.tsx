'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Edit2, Copy, Trash } from 'lucide-react'

interface ChatbotFlow {
  id: string
  name: string
  description: string
  trigger: string
  updatedAt: string
}

const mockFlows: ChatbotFlow[] = [
  {
    id: 'welcome',
    name: 'Welcome Flow',
    description: 'Main welcome flow for new users',
    trigger: 'Message Received',
    updatedAt: '2024-03-15'
  },
  {
    id: 'pricing',
    name: 'Pricing Flow',
    description: 'Handle pricing related queries',
    trigger: 'Button Clicked',
    updatedAt: '2024-03-14'
  }
]

export default function ChatbotFlowsPage() {
  const router = useRouter()
  const [flows] = useState<ChatbotFlow[]>(mockFlows)

  return (
    <div className="container mx-auto py-8 p-2">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Chatbot Flows</h1>
          <p className="text-muted-foreground">Manage your chatbot conversation flows</p>
        </div>
        <Button onClick={() => router.push('/chatbot/builder/new')}>
          <PlusCircle className="w-4 h-4 mr-2" /> Create New Flow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flows.map((flow) => (
          <Card key={flow.id}>
            <CardHeader>
              <CardTitle>{flow.name}</CardTitle>
              <CardDescription>{flow.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Trigger:</span> {flow.trigger}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {flow.updatedAt}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/chatbot/builder/${flow.id}`)}
              >
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" /> Duplicate
              </Button>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash className="w-4 h-4 mr-2" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
