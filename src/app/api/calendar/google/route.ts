import { NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export async function GET(req: Request) {
  try {
    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events'
      ]
    })
    return NextResponse.json({ url })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { code } = await req.json()
    const { tokens } = await client.getToken(code)
    
    // Store tokens securely in your database
    // Associate with the current user

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to exchange code for tokens' }, { status: 500 })
  }
} 