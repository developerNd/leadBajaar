'use client'

import React from 'react'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { BasicInfoTab } from './components/BasicInfoTab'
import { QuestionsTab } from './components/QuestionsTab'
import { SchedulingTab } from './components/SchedulingTab'
import { TeamTab } from './components/TeamTab'

// Add interfaces for form state
interface Question {
  id: string
  question: string
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'dropdown' | 'date' | 'time' | 'phone' | 'email'
  required: boolean
  options?: string[]
  placeholder?: string
  description?: string
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
  }
  conditional?: {
    dependsOn: string // Question ID
    showIf: {
      value: string | string[]
      operator: 'equals' | 'contains' | 'not_equals' | 'not_contains'
    }
  }
}

interface TimeSlot {
  day: string
  startTime: string
  endTime: string
}

interface SchedulingSettings {
  bufferBefore: number
  bufferAfter: number
  minimumNotice: number
  dailyLimit: number
  weeklyLimit: number
  availableDays: string[]
  dateRange: number
  timezone: string
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: string
    daysOfWeek?: number[]
    timeslots: {
      startTime: string
      endTime: string
    }[]
  }
}

interface TeamMember {
  id: number
  name: string
  email: string
  avatar: string
  role: string
}

// Dummy team members data
const teamMembers = [
  {
    id: 1,
    name: "Alex Thompson",
    email: "alex@example.com",
    avatar: "https://www.svgrepo.com/show/65453/avatar.svg",
    role: "Sales Representative"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "https://www.svgrepo.com/show/65453/avatar.svg",
    role: "Senior Sales Executive"
  },
  // Add more team members...
]

// Add this new component for sortable question items
const SortableQuestion = ({ question, index, updateQuestion, removeQuestion }: {
  question: Question
  index: number
  updateQuestion: (index: number, field: keyof Question, value: any) => void
  removeQuestion: (index: number) => void
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const questionTypes = [
    { value: 'text', label: 'Short Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'email', label: 'Email' }
  ]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-muted p-4 rounded-lg mb-4"
    >
      <div className="flex items-center gap-4">
        <div {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Input
                value={question.question}
                onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                placeholder="Enter your question"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={question.type}
                onValueChange={(value: Question['type']) => updateQuestion(index, 'type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question type" />
                </SelectTrigger>
                <SelectContent>
                  {questionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Input
              value={question.description || ''}
              onChange={(e) => updateQuestion(index, 'description', e.target.value)}
              placeholder="Add a description or help text"
            />
          </div>

          {question.type === 'text' && (
            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input
                value={question.placeholder || ''}
                onChange={(e) => updateQuestion(index, 'placeholder', e.target.value)}
                placeholder="Enter placeholder text"
              />
            </div>
          )}

          {question.type === 'textarea' && (
            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input
                value={question.placeholder || ''}
                onChange={(e) => updateQuestion(index, 'placeholder', e.target.value)}
                placeholder="Enter placeholder text"
              />
            </div>
          )}

          {(question.type === 'radio' || question.type === 'checkbox' || question.type === 'dropdown') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <p className="text-sm text-muted-foreground">One option per line</p>
              </div>
              <Textarea
                placeholder={`Option 1\nOption 2\nOption 3`}
                value={question.options?.join('\n') || ''}
                onChange={(e) => updateQuestion(index, 'options', e.target.value.split('\n').filter(Boolean))}
                className="min-h-[100px]"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              checked={question.required}
              onCheckedChange={(checked) => updateQuestion(index, 'required', checked)}
            />
            <Label>Required</Label>
          </div>

          {/* Preview section */}
          <div className="mt-4 border-t pt-4">
            <Label className="text-sm text-muted-foreground">Preview:</Label>
            <div className="mt-2 p-4 bg-background rounded-lg">
              <p className="font-medium mb-1">
                {question.question}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </p>
              {question.description && (
                <p className="text-sm text-muted-foreground mb-2">{question.description}</p>
              )}
              
              {question.type === 'text' && (
                <Input placeholder={question.placeholder || 'Enter your answer'} disabled />
              )}
              
              {question.type === 'textarea' && (
                <Textarea placeholder={question.placeholder || 'Enter your answer'} disabled />
              )}
              
              {question.type === 'radio' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input type="radio" disabled />
                      <Label>{option}</Label>
                    </div>
                  ))}
                </div>
              )}
              
              {question.type === 'checkbox' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input type="checkbox" disabled />
                      <Label>{option}</Label>
                    </div>
                  ))}
                </div>
              )}
              
              {question.type === 'dropdown' && (
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options?.map((option, i) => (
                      <SelectItem key={i} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {question.type === 'date' && (
                <Input type="date" disabled />
              )}
              
              {question.type === 'time' && (
                <Input type="time" disabled />
              )}
              
              {question.type === 'phone' && (
                <Input type="tel" placeholder="Enter phone number" disabled />
              )}
              
              {question.type === 'email' && (
                <Input type="email" placeholder="Enter email address" disabled />
              )}
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeQuestion(index)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Add new interface for sections
interface QuestionSection {
  id: string
  title: string
  description?: string
  questions: Question[]
}

export default function EventTypeForm() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === 'new'

  const [eventType, setEventType] = useState({
    title: '',
    description: '',
    duration: 30,
    location: 'video',
    questions: [] as Question[],
    scheduling: {
      bufferBefore: 0,
      bufferAfter: 0,
      minimumNotice: 24,
      dailyLimit: 0,
      weeklyLimit: 0,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      dateRange: 60,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timeSlots: [],
      recurring: undefined as any
    },
    slots: [] as TimeSlot[],
    teamMembers: [] as TeamMember[],
    sections: [] as QuestionSection[],
  })

  // Questions tab handlers
  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      type: 'text',
      required: false,
      description: '',
      placeholder: ''
    }
    setEventType({
      ...eventType,
      questions: [...eventType.questions, newQuestion]
    })
  }

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...eventType.questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    }
    setEventType({
      ...eventType,
      questions: updatedQuestions
    })
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = eventType.questions.filter((_, i) => i !== index)
    setEventType({
      ...eventType,
      questions: updatedQuestions
    })
  }

  const handleQuestionDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setEventType((prev) => {
        const oldIndex = prev.questions.findIndex((q) => q.id === active.id)
        const newIndex = prev.questions.findIndex((q) => q.id === over.id)

        return {
          ...prev,
          questions: arrayMove(prev.questions, oldIndex, newIndex),
        }
      })
    }
  }

  // Scheduling tab handlers
  const updateScheduling = (field: keyof SchedulingSettings, value: any) => {
    setEventType({
      ...eventType,
      scheduling: {
        ...eventType.scheduling,
        [field]: value
      }
    })
  }

  // Team members tab handlers
  const toggleTeamMember = (member: TeamMember) => {
    const isSelected = eventType.teamMembers.some(m => m.id === member.id)
    const updatedMembers = isSelected
      ? eventType.teamMembers.filter(m => m.id !== member.id)
      : [...eventType.teamMembers, member]
    
    setEventType({
      ...eventType,
      teamMembers: updatedMembers
    })
  }

  // Add section management functions
  const addSection = () => {
    const newSection: QuestionSection = {
      id: Date.now().toString(),
      title: '',
      questions: []
    }
    setEventType(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
  }

  const updateSection = (sectionId: string, field: keyof QuestionSection, value: any) => {
    setEventType(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    }))
  }

  const removeSection = (sectionId: string) => {
    setEventType(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }))
  }

  const handleSave = () => {
    // Implementation for saving event type
    console.log('Saving event type:', eventType)
    router.push('/meetings/event-types')
  }

  // Add sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <React.Fragment>
      <div className="container mx-auto py-10 p-2 h-full overflow-y-scroll">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">
              {isNew ? 'Create Event Type' : 'Edit Event Type'}
            </h1>
            <p className="text-muted-foreground">
              Configure your scheduling event type
            </p>
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="team">Team Members</TabsTrigger>
          </TabsList>

          <BasicInfoTab eventType={eventType} setEventType={setEventType} />
          
          <QuestionsTab 
            eventType={eventType}
            addQuestion={addQuestion}
            updateQuestion={(index: number, field: string, value: any) => updateQuestion(index, field as keyof Question, value)}
            removeQuestion={removeQuestion}
            handleQuestionDragEnd={handleQuestionDragEnd}
            sensors={sensors}
          />
          
          <SchedulingTab 
            eventType={eventType} 
            updateScheduling={(field: string, value: any) => updateScheduling(field as keyof SchedulingSettings, value)}
          />
          
          <TeamTab 
            eventType={eventType} 
            toggleTeamMember={toggleTeamMember} 
          />
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Event Type
          </Button>
        </div>
      </div>
    </React.Fragment>
  )
}