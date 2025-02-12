import { NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:8000/api'

export async function GET(request: Request) {
  try {
    const response = await fetch(`${API_URL}/chatbot/flows`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching flows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flows' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${API_URL}/chatbot/flows`, {
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
    console.error('Error creating flow:', error)
    return NextResponse.json(
      { error: 'Failed to create flow' },
      { status: 500 }
    )
  }
} 