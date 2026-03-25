import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const ALLOWED_TYPES = ['still_works', 'no_power', 'crowded', 'unusable'] as const

type ConfirmationType = (typeof ALLOWED_TYPES)[number]

type ConfirmationRow = {
  confirmation_type: ConfirmationType
  created_at: string
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null

    if (!token) {
      return NextResponse.json(
        { error: 'You must be signed in to confirm a location.' },
        { status: 401 }
      )
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Your session could not be verified. Please sign in again.' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const locationId = body.locationId as string | undefined
    const confirmationType = body.confirmationType as ConfirmationType | undefined

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

    const { data: existingRow, error: existingError } = await supabaseAdmin
      .from('location_confirmations')
      .select('id, confirmation_type')
      .eq('location_id', locationId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingError) {
      console.error('Lookup existing confirmation error:', existingError)
      return NextResponse.json(
        { error: 'Failed to check existing confirmation.' },
        { status: 500 }
      )
    }

    let updated = false

    if (existingRow) {
      const { error: updateConfirmationError } = await supabaseAdmin
        .from('location_confirmations')
        .update({
          confirmation_type: confirmationType,
          created_at: new Date().toISOString(),
        })
        .eq('id', existingRow.id)

      if (updateConfirmationError) {
        console.error('Update confirmation error:', updateConfirmationError)
        return NextResponse.json(
          { error: updateConfirmationError.message },
          { status: 500 }
        )
      }

      updated = true
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('location_confirmations')
        .insert({
          location_id: locationId,
          user_id: user.id,
          confirmation_type: confirmationType,
        })

      if (insertError) {
        console.error('Insert confirmation error:', insertError)
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        )
      }
    }

    const { data: confirmations, error: fetchError } = await supabaseAdmin
      .from('location_confirmations')
      .select('confirmation_type, created_at')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Fetch confirmations error:', fetchError)
      return NextResponse.json(
        { error: 'Confirmation saved, but failed to refresh location stats.' },
        { status: 500 }
      )
    }

    const rows = (confirmations ?? []) as ConfirmationRow[]
    const confirmationCount = rows.length
    const lastConfirmedAt = confirmationCount > 0 ? rows[0].created_at : null
    const reliabilityScore = calculateReliabilityScore(rows)

    const { error: updateLocationError } = await supabaseAdmin
      .from('locations')
      .update({
        confirmation_count: confirmationCount,
        last_confirmed_at: lastConfirmedAt,
        reliability_score: reliabilityScore,
        updated_at: new Date().toISOString(),
      })
      .eq('id', locationId)

    if (updateLocationError) {
      console.error('Update location error:', updateLocationError)
      return NextResponse.json(
        { error: 'Confirmation saved, but failed to update location summary.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      updated,
      confirmationCount,
      lastConfirmedAt,
      reliabilityScore,
    })
  } catch (err) {
    console.error('Route crash:', err)

    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    )
  }
}

  function calculateReliabilityScore(rows: ConfirmationRow[]): number {
  if (!rows.length) return 5 // neutral baseline

  let total = 0

  for (const row of rows) {
    switch (row.confirmation_type) {
      case 'still_works':
        total += 1.5
        break
      case 'crowded':
        total += 0.2
        break
      case 'no_power':
        total -= 1.5
        break
      case 'unusable':
        total -= 2
        break
    }
  }

  const average = total / rows.length

  // Start from neutral baseline
  const score = 5 + average * 2

  return clamp(roundToOneDecimal(score), 0, 10)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10
}