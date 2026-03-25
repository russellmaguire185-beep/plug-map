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

    const { error } = await supabaseAdmin
      .from('location_attribute_reports')
      .delete()
      .eq('id', reportId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.redirect(new URL('/admin/attribute-reports', req.url))
  } catch (err) {
    console.error('Delete attribute report error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}