import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import NewBriefForm from '@/components/briefs/new-brief-form'

export default async function NewBriefPage() {
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

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Content Brief</h1>
        <p className="text-gray-500 mt-1">Generate a full reel script and strategy with AI</p>
      </div>
      <NewBriefForm workspaceId={member.workspace_id} />
    </div>
  )
}
