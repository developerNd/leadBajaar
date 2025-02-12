import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startTime = searchParams.get('start')
    const endTime = searchParams.get('end')
    const timezone = searchParams.get('timezone')

    if (!startTime || !endTime || !timezone) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Call Laravel backend API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/calendar/availability?start=${startTime}&end=${endTime}&timezone=${timezone}`,
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to check availability')
    }

    const availability = await response.json()
    return NextResponse.json(availability)
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 })
  }
} 