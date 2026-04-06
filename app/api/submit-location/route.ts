import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { error: insertError } = await supabaseAdmin
      .from('locations')
      .insert([body])

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    await resend.emails.send({
      from: 'Work Spots <onboarding@resend.dev>',
      to: process.env.ADMIN_NOTIFICATION_EMAIL!,
      subject: 'New location pending review',
      html: `
        <h2>New location submitted</h2>
        <p><strong>Name:</strong> ${body.name ?? 'N/A'}</p>
        <p><strong>Category:</strong> ${body.category ?? 'N/A'}</p>
        <p><strong>City:</strong> ${body.city ?? 'N/A'}</p>
        <p><strong>Status:</strong> ${body.status ?? 'pending'}</p>
        <p>Please review it in the admin page.</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Submit location route error:', error)
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    )
  }
}