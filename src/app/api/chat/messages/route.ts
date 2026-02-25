import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000/api'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_URL}/chat/messages`, {
      method: 'POST',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
} 