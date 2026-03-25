import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireAdmin } from '@/lib/is-admin'

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await requireAdmin()

    if (!adminCheck.ok) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 })
    }

    const contentType = req.headers.get('content-type') || ''
    let reportId = ''

    if (contentType.includes('application/json')) {
      const body = await req.json()
      reportId = String(body.reportId || '')
    } else {
      const formData = await req.formData()
      reportId = String(formData.get('reportId') || '')
    }

    if (!reportId) {
      return NextResponse.json({ error: 'Missing reportId' }, { status: 400 })
    }

    const { data: report, error: reportError } = await supabaseAdmin
      .from('location_attribute_reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const updateData: Record<string, string | boolean> = {}

    if (report.power) updateData.power = report.power
    if (report.usb) updateData.usb = report.usb
    if (report.table_type) updateData.table_type = report.table_type
    if (report.mobile_signal) updateData.mobile_signal = report.mobile_signal
    if (report.wifi_available !== null) {
      updateData.wifi_available = report.wifi_available
    }

    const { error: updateError } = await supabaseAdmin
      .from('locations')
      .update(updateData)
      .eq('id', report.location_id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    const { error: deleteError } = await supabaseAdmin
      .from('location_attribute_reports')
      .delete()
      .eq('id', reportId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.redirect(new URL('/admin/attribute-reports', req.url))
  } catch (err) {
    console.error('Apply attribute report error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}