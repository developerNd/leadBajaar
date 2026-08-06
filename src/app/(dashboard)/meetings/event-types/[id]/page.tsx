'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
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
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  AlertCircle,
  XCircle,
  Info,
  MapPin,
  CalendarClock,
  Clock,
  ClipboardList,
  Users,
  Eye,
} from 'lucide-react'
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
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"

import { eventTypeService } from '@/services/event-types'
import { useUser } from '@/contexts/UserContext'
import { teamApi } from '@/lib/api'
import { WIZARD_DRAFT_STORAGE_KEY } from '@/lib/eventTypeWizard'
import { cn } from '@/lib/utils'

import { EventType, Question, QuestionSection, SchedulingSettings, TimeSlot, TeamMember } from '@/types/events'

type SectionId = 'basic' | 'location' | 'availability' | 'limits' | 'questions' | 'team'

const SECTIONS: { id: SectionId; label: string; icon: any }[] = [
  { id: 'basic', label: 'Basic', icon: Info },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'availability', label: 'Availability', icon: CalendarClock },
  { id: 'limits', label: 'Limits', icon: Clock },
  { id: 'questions', label: 'Questions', icon: ClipboardList },
  { id: 'team', label: 'Team', icon: Users },
]

export default function EventTypeForm() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const { toast } = useToast()
  const isNew = params.id === 'new'
  const defaultType = searchParams.get('type') === 'group' ? 'group' : 'one_on_one'

  const [loading, setLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [isTogglingActive, setIsTogglingActive] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [availableMembers, setAvailableMembers] = useState<TeamMember[]>([])
  const [activeSection, setActiveSection] = useState<SectionId>('basic')

  const [eventType, setEventType] = useState<EventType>(() => {
    const base: EventType = {
      id: isNew ? 'new' : '', // Satisfy interface
      title: '',
      description: isNew ? 'A quick meeting to discuss your needs.' : '',
      duration: 30,
      slot_interval: 30,
      location: 'video',
      video_platform: '',
      location_details: '',
      active: true,
      type: isNew ? defaultType : 'one_on_one',
      max_invitees: (isNew && defaultType === 'group') ? 2 : null,
      questions: isNew ? [
        { id: 'invitee_name', question: 'Name', type: 'text', required: true, isLocked: true },
        { id: 'invitee_email', question: 'Email', type: 'email', required: true, isLocked: true },
        { id: 'invitee_phone', question: 'Phone Number', type: 'phone', required: true, isLocked: true },
      ] as Question[] : [] as Question[],
      scheduling: {
        bufferBefore: 0,
        bufferAfter: 0,
        minimumNotice: 24,
        dailyLimit: 0,
        weeklyLimit: 0,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        dateRange: 60,
        timezone: 'Asia/Kolkata',
        timeSlots: [
          {
            id: 'default-1',
            startTime: '09:00',
            endTime: '17:00',
            daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
            breaks: []
          }
        ],
        recurring: null
      },
      slots: [] as TimeSlot[],
      teamMembers: [] as TeamMember[],
      sections: [] as QuestionSection[],
      redirect_url: '',
    }

    // If the guided wizard just handed us a pre-filled draft, use it instead of
    // the plain defaults above — the user still reviews everything here before saving.
    if (isNew && typeof window !== 'undefined') {
      const raw = sessionStorage.getItem(WIZARD_DRAFT_STORAGE_KEY)
      if (raw) {
        sessionStorage.removeItem(WIZARD_DRAFT_STORAGE_KEY)
        try {
          const draft = JSON.parse(raw)
          return {
            ...base,
            ...draft,
            scheduling: { ...base.scheduling, ...draft.scheduling },
          }
        } catch {
          // Malformed/stale draft — fall through to the plain defaults.
        }
      }
    }

    return base
  })

  // ... (sensors, useEffect remain same)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    if (isNew) {
      setLoading(false)
      return
    }

    const loadEventType = async () => {
      try {
        setLoading(true)
        const data = await eventTypeService.getById(params.id as string)
        const newEventType: EventType = {
          id: data.id,
          title: data.title || '',
          description: data.description || '',
          duration: data.duration || 30,
          slot_interval: data.slot_interval || data.duration || 30,
          location: data.location || 'video',
          video_platform: data.video_platform || '',
          location_details: data.location_details || '',
          active: data.active ?? true,
          type: data.type || 'one_on_one',
          max_invitees: data.max_invitees || null,
          max_bookings_per_invitee: data.max_bookings_per_invitee || null,
          invitee_booking_limit_timeframe: data.invitee_booking_limit_timeframe || 'ACTIVE',
          questions: data.questions || [],
          scheduling: {
            bufferBefore: data.scheduling?.bufferBefore || 0,
            bufferAfter: data.scheduling?.bufferAfter || 0,
            minimumNotice: data.scheduling?.minimumNotice || 24,
            dailyLimit: data.scheduling?.dailyLimit || 0,
            weeklyLimit: data.scheduling?.weeklyLimit || 0,
            availableDays: data.scheduling?.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            dateRange: data.scheduling?.dateRange || 60,
            timezone: data.scheduling?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            timeSlots: data.scheduling?.timeSlots || [],
            recurring: data.scheduling?.recurring || null
          },
          slots: data.slots || [],
          teamMembers: data.teamMembers || [],
          sections: data.sections || [],
          redirect_url: data.redirect_url || '',
        }
        setEventType(newEventType)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load event type",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadEventType()
  }, [isNew, params.id])

  useEffect(() => {
    const loadTeamRoster = async () => {
      try {
        const members = await teamApi.getMembers()
        setAvailableMembers(members || [])
      } catch (error) {
        // Non-fatal: the Team tab just shows an empty roster if this fails.
        setAvailableMembers([])
      }
    }
    loadTeamRoster()
  }, [])

  // Use specific skeletons instead of a full-page loading spinner
  // if (loading) return <LoadingSpinner />

  // Handlers (Questions, Scheduling, Team - unchanged logic but omitted for brevity in chunk)
  const addQuestion = () => {
    const newQuestion: Question = { id: Date.now().toString(), question: '', type: 'text', required: false }
    setEventType({ ...eventType, questions: [...eventType.questions, newQuestion] })
  }
  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...eventType.questions]; updated[index] = { ...updated[index], [field]: value }
    setEventType({ ...eventType, questions: updated })
  }
  const removeQuestion = (index: number) => {
    const question = eventType.questions[index]
    if (question.isLocked) {
      toast({
        title: "Action Denied",
        description: "This mandatory question cannot be deleted.",
        variant: "destructive",
      })
      return
    }
    setEventType({ ...eventType, questions: eventType.questions.filter((_, i) => i !== index) })
  }
  const handleQuestionDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setEventType((prev) => {
        const oldIndex = prev.questions.findIndex((q) => q.id === active.id)
        const newIndex = prev.questions.findIndex((q) => q.id === over.id)
        return { ...prev, questions: arrayMove(prev.questions, oldIndex, newIndex) }
      })
    }
  }
  const updateScheduling = (field: keyof SchedulingSettings, value: any) => {
    setEventType({ ...eventType, scheduling: { ...eventType.scheduling, [field]: value } })
  }
  const toggleTeamMember = (member: TeamMember) => {
    const members = eventType.teamMembers || []; const isSelected = members.some(m => m.id === member.id)
    setEventType({ ...eventType, teamMembers: isSelected ? members.filter(m => m.id !== member.id) : [...members, member] })
  }

  // Fires immediately — EventTypeController::update() does a partial Eloquent
  // update with `active` fillable and no validation blocking it, so this
  // doesn't need to wait for "Save changes."
  const handleToggleActive = async () => {
    if (isNew) {
      setEventType(prev => ({ ...prev, active: !prev.active }))
      return
    }
    const nextActive = !eventType.active
    setEventType(prev => ({ ...prev, active: nextActive }))
    try {
      setIsTogglingActive(true)
      await eventTypeService.update(params.id as string, { active: nextActive })
    } catch (error) {
      setEventType(prev => ({ ...prev, active: !nextActive }))
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
    } finally {
      setIsTogglingActive(false)
    }
  }

  const openPreview = () => {
    const username = user?.name?.toLowerCase().replace(/\s+/g, '-')
    if (!username || typeof window === 'undefined') return
    const identifier = eventType.slug || eventType.id
    window.open(`${window.location.origin}/${username}/${identifier}`, '_blank')
  }

  const handleSave = async () => {
    // Basic frontend validation
    const errors: Record<string, string> = {}
    
    if (isNew && !user?.name) {
      toast({ title: "Error", description: "User profile name is required to create an event type.", variant: "destructive" })
      return
    }

    if (!eventType.title?.trim()) errors.title = 'Title is required'
    if (!eventType.duration) errors.duration = 'Duration is required'
    if (!eventType.description?.trim()) errors.description = 'Description is required'
    if (eventType.type === 'group' && (!eventType.max_invitees || eventType.max_invitees < 2)) {
      errors.max_invitees = 'Minimum 2 invitees required for a group event'
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setErrorMessage("Please fill in all mandatory fields highlighted in red (Title, Description, Duration).")
      setShowErrorDialog(true)
      return
    }

    try {
      setIsSaving(true)
      setFormErrors({})
      if (isNew) {
        await eventTypeService.create(eventType)
      } else {
        await eventTypeService.update(params.id as string, eventType)
      }
      toast({ title: "Success", description: "Event type saved successfully" })
      router.push('/meetings/event-types')
    } catch (error: any) {
      if (error.response?.status === 422) {
        const beErrors = error.response.data.errors || {}
        setFormErrors(beErrors)
        setErrorMessage(error.response.data.message || "The data provided is invalid.")
        setShowErrorDialog(true)
      } else {
        toast({ title: "Error", description: "A system error occurred.", variant: "destructive" })
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[var(--crm-border)] bg-[var(--crm-surface-1)] shadow-sm z-50">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-full shrink-0 border-[var(--crm-border)] bg-[var(--crm-surface-2)] hover:bg-[var(--crm-surface-3)]">
              <ArrowLeft className="h-3.5 w-3.5 text-[var(--crm-text-secondary)]" />
            </Button>
            <div className="min-w-0">
              <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-bold text-[var(--crm-text-secondary)] uppercase tracking-widest mb-0.5">
                <span>Meetings</span> <span className="h-0.5 w-0.5 rounded-full bg-[var(--crm-border)]" /> <span>Event Config</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                {!loading && !isNew && (
                  <span className={cn('h-2 w-2 rounded-full shrink-0', eventType.active !== false ? 'bg-emerald-500' : 'bg-slate-400')} />
                )}
                <h1 className="text-base sm:text-lg font-bold text-[var(--crm-text-primary)] leading-none truncate">
                  {loading ? <Skeleton className="h-4 w-32" /> : (isNew ? 'Create Event Type' : eventType.title || 'Edit Event')}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isNew && !loading && (
              <button
                type="button"
                onClick={handleToggleActive}
                disabled={isTogglingActive}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface-2)] text-xs font-semibold text-[var(--crm-text-secondary)] disabled:opacity-60"
              >
                {eventType.active !== false ? 'On' : 'Off'}
                <span className={cn('relative inline-flex h-4 w-7 items-center rounded-full transition-colors', eventType.active !== false ? 'bg-[var(--crm-accent)]' : 'bg-[var(--crm-surface-4)]')}>
                  <span className={cn('inline-block h-3 w-3 transform rounded-full bg-white transition-transform', eventType.active !== false ? 'translate-x-3.5' : 'translate-x-0.5')} />
                </span>
              </button>
            )}
            <Button variant="outline" size="sm" onClick={openPreview} disabled={isNew} className="h-8 gap-1.5 border-[var(--crm-border)] bg-[var(--crm-surface-2)] text-xs">
              <Eye className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="h-8 bg-[var(--crm-accent)] hover:opacity-90 text-white rounded-lg font-bold text-xs px-4 gap-2 transition-all active:scale-95 shadow-sm">
              {isSaving ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save changes'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Left nav + content */}
      <div className="flex-1 flex overflow-hidden bg-[var(--crm-bg)]">
        <div className="w-48 sm:w-56 shrink-0 border-r border-[var(--crm-border)] bg-[var(--crm-surface-1)] p-3 space-y-1 overflow-y-auto">
          {SECTIONS.map(section => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-left transition-colors',
                  isActive ? 'bg-[var(--crm-accent-soft)] text-[var(--crm-accent)]' : 'text-[var(--crm-text-secondary)] hover:bg-[var(--crm-surface-2)] hover:text-[var(--crm-text-primary)]'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {section.label}
              </button>
            )
          })}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
            {loading ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : (
              <Card className="border-[var(--crm-border)] shadow-sm rounded-xl overflow-hidden bg-[var(--crm-surface-1)]">
                <CardContent className="p-6">
                  <p className="text-sm font-semibold text-[var(--crm-text-primary)] mb-1">
                    {SECTIONS.find(s => s.id === activeSection)?.label}
                  </p>
                  <p className="text-sm text-[var(--crm-text-secondary)]">
                    Section content lands here in the next phase.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl overflow-hidden p-0 gap-0 border-none bg-white dark:bg-slate-900 shadow-2xl">
          <div className="bg-[var(--crm-red-soft)] p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
              <XCircle className="h-7 w-7 text-[var(--crm-red)]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-[var(--crm-red)] uppercase tracking-tighter">Configuration Failure</DialogTitle>
              <DialogDescription className="text-[var(--crm-red)]/80 font-medium text-xs">Some fields require your immediate attention.</DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-[var(--crm-surface-2)] rounded-xl p-4 border border-[var(--crm-border)]">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-[var(--crm-red)] mt-0.5" />
                <p className="text-xs font-bold text-[var(--crm-text-primary)] leading-relaxed uppercase tracking-wide">{errorMessage}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowErrorDialog(false)} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-widest h-11 rounded-xl shadow-lg hover:opacity-90 transition-all">
                Review Fields
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
