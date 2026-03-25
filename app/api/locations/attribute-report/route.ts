import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const POWER_VALUES = ['yes', 'no', 'limited', 'unknown'] as const
const USB_VALUES = ['yes', 'no', 'unknown'] as const
const TABLE_VALUES = ['full_table', 'small_table', 'lap_only', 'unknown'] as const
const SIGNAL_VALUES = ['fast', 'medium', 'slow', 'nothing', 'unknown'] as const

type PowerValue = (typeof POWER_VALUES)[number]
type UsbValue = (typeof USB_VALUES)[number]
type TableValue = (typeof TABLE_VALUES)[number]
type SignalValue = (typeof SIGNAL_VALUES)[number]

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null

    if (!token) {
      return NextResponse.json(
        { error: 'You must be signed in to suggest details.' },
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

    const locationId = String(body.locationId || '').trim()
    const power = normalizeOptionalEnum<PowerValue>(body.power, POWER_VALUES)
    const usb = normalizeOptionalEnum<UsbValue>(body.usb, USB_VALUES)
    const tableType = normalizeOptionalEnum<TableValue>(body.table_type, TABLE_VALUES)
    const mobileSignal = normalizeOptionalEnum<SignalValue>(body.mobile_signal, SIGNAL_VALUES)
    const wifiAvailable = normalizeOptionalBoolean(body.wifi_available)
    const notes = normalizeOptionalText(body.notes)

    if (!locationId) {
      return NextResponse.json(
        { error: 'Missing locationId.' },
        { status: 400 }
      )
    }

    const hasAtLeastOneField =
      power !== null ||
      usb !== null ||
      tableType !== null ||
      mobileSignal !== null ||
      wifiAvailable !== null ||
      notes !== null

    if (!hasAtLeastOneField) {
      return NextResponse.json(
        { error: 'Please provide at least one detail.' },
        { status: 400 }
      )
    }

    const { data: existingRow, error: existingError } = await supabaseAdmin
      .from('location_attribute_reports')
      .select('id')
      .eq('location_id', locationId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingError) {
      console.error('Lookup existing attribute report error:', existingError)
      return NextResponse.json(
        { error: 'Failed to check existing suggestion.' },
        { status: 500 }
      )
    }

    let updated = false

    if (existingRow) {
      const { error: updateError } = await supabaseAdmin
        .from('location_attribute_reports')
        .update({
          power,
          usb,
          table_type: tableType,
          wifi_available: wifiAvailable,
          mobile_signal: mobileSignal,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingRow.id)

      if (updateError) {
        console.error('Update attribute report error:', updateError)
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        )
      }

      updated = true
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('location_attribute_reports')
        .insert({
          location_id: locationId,
          user_id: user.id,
          power,
          usb,
          table_type: tableType,
          wifi_available: wifiAvailable,
          mobile_signal: mobileSignal,
          notes,
        })

      if (insertError) {
        console.error('Insert attribute report error:', insertError)
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      updated,
    })
  } catch (err) {
    console.error('Attribute report route crash:', err)

    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    )
  }
}

function normalizeOptionalEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T
): T[number] | null {
  if (value === undefined || value === null || value === '') return null

  const normalized = String(value).trim().toLowerCase()
  return (allowed as readonly string[]).includes(normalized)
    ? (normalized as T[number])
    : null
}

function normalizeOptionalBoolean(value: unknown): boolean | null {
  if (value === undefined || value === null || value === '') return null
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return null
}

function normalizeOptionalText(value: unknown): string | null {
  if (value === undefined || value === null) return null
  const normalized = String(value).trim()
  return normalized ? normalized : null
}