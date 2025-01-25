'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Send, Phone, Video, Search } from 'lucide-react'

const initialChats = [
  {
    id: 1,
    user: { 
      name: 'John Doe', 
      email: 'john@example.com', 
      avatar: 'https://cdn-icons-png.flaticon.com/512/924/924915.png',
      company: 'Tech Corp',
      location: 'New York, USA'
    },
    messages: [
      { id: 1, content: 'Hi, I need help with your enterprise plan', sender: 'user', time: '10:00 AM' },
      { id: 2, content: 'Hello John! I\'d be happy to assist you with our enterprise plan. What specific information are you looking for?', sender: 'agent', time: '10:02 AM' },
      { id: 3, content: 'I\'m interested in the pricing and features for a team of 50', sender: 'user', time: '10:05 AM' },
      { id: 4, content: 'For a team of 50, our enterprise plan offers customized pricing. It includes advanced collaboration tools, priority support, and enhanced security features. Would you like me to arrange a call with our sales team to discuss this further?', sender: 'agent', time: '10:07 AM' },
    ],
    status: 'active',
    lastActive: 'Just now',
    priority: 'high'
  },
  {
    id: 2,
    user: { 
      name: 'Sarah Wilson', 
      email: 'sarah@example.com', 
      avatar: 'https://cdn-icons-png.flaticon.com/512/924/924915.png',
      company: 'Design Co',
      location: 'London, UK'
    },
    messages: [
      { id: 1, content: 'Is there a free trial available for the pro plan?', sender: 'user', time: '9:45 AM' },
      { id: 2, content: 'Hello Sarah! Yes, we offer a 14-day free trial for our pro plan. Would you like me to set that up for you?', sender: 'agent', time: '9:47 AM' },
      { id: 3, content: 'That would be great, thank you!', sender: 'user', time: '9:50 AM' },
      { id: 4, content: 'Excellent! I\'ve just activated your 14-day pro trial. You should receive an email shortly with login details and a quick start guide. Is there anything else you\'d like to know about the features?', sender: 'agent', time: '9:52 AM' },
    ],
    status: 'active',
    lastActive: '5m ago',
    priority: 'medium'
  },
  {
    id: 3,
    user: { 
      name: 'Alex Johnson', 
      email: 'alex@example.com', 
      avatar: 'https://cdn-icons-png.flaticon.com/512/924/924915.png',
      company: 'Dev Solutions',
      location: 'Toronto, Canada'
    },
    messages: [
      { id: 1, content: 'I\'m having trouble integrating your API', sender: 'user', time: '11:30 AM' },
      { id: 2, content: 'I\'m sorry to hear that, Alex. Can you provide more details about the specific issue you\'re encountering?', sender: 'agent', time: '11:32 AM' },
    ],
    status: 'active',
    lastActive: '30m ago',
    priority: 'high'
  }
]

export default function LiveChatPage() {
  const [activeChat, setActiveChat] = useState(initialChats[0])
  const [message, setMessage] = useState('')
  const [chats] = useState(initialChats)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSend = () => {
    if (!message.trim()) return
    console.log('Sending message:', message)
    setMessage('')
  }

  const filteredChats = chats.filter(chat => 
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.user.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex gap-4 p-2">
      <Card className="w-80 flex flex-col">
        <CardHeader className="p-4 pb-2 flex-shrink-0">
          <div className="space-y-2">
            <CardTitle>Active Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="space-y-1 w-full">
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  className={cn(
                    "w-full p-3 text-left transition-colors block",
                    activeChat.id === chat.id
                      ? "bg-gray-100 dark:bg-gray-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-900"
                  )}
                  onClick={() => setActiveChat(chat)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="flex-shrink-0">
                      <AvatarImage src={chat.user.avatar} alt={chat.user.name} />
                      <AvatarFallback>{chat.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate pr-2">{chat.user.name}</p>
                        <Badge 
                          variant={chat.priority === 'high' ? 'destructive' : 'secondary'}
                          className="flex-shrink-0"
                        >
                          {chat.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.user.company}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.messages[chat.messages.length - 1].content}
                        </p>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-auto">
                          {chat.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={activeChat.user.avatar} alt={activeChat.user.name} />
                <AvatarFallback>{activeChat.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>{activeChat.user.name}</CardTitle>
                  <Badge 
                    variant={activeChat.priority === 'high' ? 'destructive' : 'secondary'}
                  >
                    {activeChat.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <p>{activeChat.user.company}</p>
                  <span>•</span>
                  <p>{activeChat.user.location}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Video className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="space-y-4 p-4">
              {activeChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 max-w-[80%] shadow-sm",
                      message.sender === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">{message.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <Separator />
        <CardContent className="p-4 flex-shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

