import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/is-admin'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin()

  if (!adminCheck.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const locationId = body?.locationId
  const status = body?.status

  if (!locationId || !['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('locations')
    .update({ status })
    .eq('id', locationId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}