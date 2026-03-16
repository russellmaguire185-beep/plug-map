import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ALLOWED_TYPES = ['still_works', 'no_power', 'crowded', 'unusable']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const locationId = body.locationId
    const confirmationType = body.confirmationType

    if (!locationId || !confirmationType) {
      return NextResponse.json(
        { error: 'Missing parameters' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(confirmationType)) {
      return NextResponse.json(
        { error: 'Invalid confirmation type' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('location_confirmations')
      .insert({
        location_id: locationId,
        confirmation_type: confirmationType
      })

    if (error) {
      console.error('Insert error:', error)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Route crash:', err)

    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    )
  }
}