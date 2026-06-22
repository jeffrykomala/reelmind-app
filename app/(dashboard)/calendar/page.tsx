import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import CalendarView from '@/components/calendar/calendar-view'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: member } = await admin
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!member) redirect('/dashboard')

  const [{ data: events }, { data: briefs }] = await Promise.all([
    admin
      .from('calendar_events')
      .select('*, briefs(subject)')
      .eq('workspace_id', member.workspace_id)
      .order('scheduled_at'),
    admin
      .from('briefs')
      .select('id, subject')
      .eq('workspace_id', member.workspace_id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <CalendarView
      workspaceId={member.workspace_id}
      events={events ?? []}
      briefs={briefs ?? []}
    />
  )
}
