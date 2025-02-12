import { NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const response = await fetch(`${API_BASE_URL}/event-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming you store JWT in localStorage
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        duration: data.duration,
        location: data.location,
        questions: data.questions.map((q: any) => ({
          question: q.question,
          type: q.type,
          required: q.required,
          options: q.options,
          placeholder: q.placeholder,
          description: q.description,
          validation: q.validation,
          conditional: q.conditional
        })),
        scheduling: {
          buffer_before: data.scheduling.bufferBefore,
          buffer_after: data.scheduling.bufferAfter,
          minimum_notice: data.scheduling.minimumNotice,
          available_days: data.scheduling.availableDays,
          date_range: data.scheduling.dateRange,
          timezone: data.scheduling.timezone,
          recurring: data.scheduling.recurring
        },
        team_members: data.teamMembers.map((m: any) => m.id)
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create event type')
    }

    const eventType = await response.json()
    return NextResponse.json(eventType.data)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating event type' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const response = await fetch(`${API_BASE_URL}/event-types`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch event types')
    }

    const data = await response.json()
    return NextResponse.json(data.data)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching event types' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json()
    const response = await fetch(`${API_BASE_URL}/event-types/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        duration: data.duration,
        location: data.location,
        questions: data.questions,
        scheduling: data.scheduling,
        team_members: data.teamMembers.map((m: any) => m.id)
      })
    })

    if (!response.ok) {
      throw new Error('Failed to update event type')
    }

    const eventType = await response.json()
    return NextResponse.json(eventType.data)
  } catch (error) {
    return NextResponse.json({ error: 'Error updating event type' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    const response = await fetch(`${API_BASE_URL}/event-types/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to delete event type')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting event type' }, { status: 500 })
  }
} 