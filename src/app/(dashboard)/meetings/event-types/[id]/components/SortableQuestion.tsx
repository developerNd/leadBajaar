import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
}

interface Props {
  question: Question
  index: number
  updateQuestion: (index: number, field: keyof Question, value: any) => void
  removeQuestion: (index: number) => void
}

export const SortableQuestion = ({ question, index, updateQuestion, removeQuestion }: Props) => {
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

  const renderPreview = () => {
    switch (question.type) {
      case 'text':
      case 'phone':
      case 'email':
        return (
          <Input 
            type={question.type === 'phone' ? 'tel' : question.type}
            placeholder={question.placeholder || `Enter your ${question.type}`}
            disabled
          />
        )
      case 'textarea':
        return (
          <Textarea
            placeholder={question.placeholder || 'Enter your answer'}
            disabled
          />
        )
      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input type="radio" disabled />
                <Label>{option}</Label>
              </div>
            ))}
          </div>
        )
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input type="checkbox" disabled />
                <Label>{option}</Label>
              </div>
            ))}
          </div>
        )
      case 'dropdown':
        return (
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
        )
      case 'date':
        return <Input type="date" disabled />
      case 'time':
        return <Input type="time" disabled />
      default:
        return null
    }
  }

  const handleOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    const options = text
      .replace(/\r\n/g, '\n')
      .split('\n')
      .filter(line => line.trim() !== '')
    updateQuestion(index, 'options', options)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const textarea = e.currentTarget
      const cursorPosition = textarea.selectionStart ?? 0
      const currentValue = textarea.value
      
      const newValue = 
        currentValue.slice(0, cursorPosition) + 
        '\n' + 
        currentValue.slice(cursorPosition)
      
      textarea.value = newValue
      
      const options = newValue.split(/\r?\n/).filter(line => line.trim() !== '')
      updateQuestion(index, 'options', options)
      
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1
      })
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-muted p-4 rounded-lg mb-4"
    >
      <div className="flex items-start gap-4">
        <div {...attributes} {...listeners} className="mt-2">
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

          {(question.type === 'text' || question.type === 'textarea') && (
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
                <p className="text-sm text-muted-foreground">Press Enter for new option</p>
              </div>
              <Textarea
                placeholder={`Option 1\nOption 2\nOption 3`}
                value={question.options?.join('\n') || ''}
                onChange={handleOptionsChange}
                onKeyDown={handleKeyDown}
                className="min-h-[100px]"
              />
              <div className="space-y-2 mt-2">
                <Label className="text-sm text-muted-foreground">Current Options:</Label>
                <div className="space-y-1">
                  {question.options?.map((option, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm">{i + 1}.</span>
                      <span className="text-sm">{option}</span>
                    </div>
                  ))}
                </div>
              </div>
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
              {renderPreview()}
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeQuestion(index)}
          className="mt-2"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 