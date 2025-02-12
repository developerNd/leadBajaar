import { NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  }

  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    const { tokens } = await client.getToken(code)
    
    // Store tokens securely
    // Redirect to success page
    return NextResponse.redirect('/settings/calendar?status=success')
  } catch (error) {
    return NextResponse.redirect('/settings/calendar?status=error')
  }
} 