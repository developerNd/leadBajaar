import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth' // Ensure you have the correct path to your auth options

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions) // Use authOptions to get the session
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') as 'google' | 'outlook' | 'apple'
    
    // Call Laravel backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/calendars`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`, // Ensure you have the correct token
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch calendars from Laravel backend')
    }

    const calendars = await response.json()
    return NextResponse.json(calendars)

  } catch (error) {
    console.error('Error fetching calendars:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendars' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions) // Use authOptions to get the session
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, selectedCalendars } = await req.json()

    // Call Laravel backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/calendars`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`, // Ensure you have the correct token
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, selectedCalendars })
    })

    if (!response.ok) {
      throw new Error('Failed to update calendar selection')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating calendar selection:', error)
    return NextResponse.json(
      { error: 'Failed to update calendar selection' }, 
      { status: 500 }
    )
  }
} 