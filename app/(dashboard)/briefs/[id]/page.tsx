import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import BriefDetail from '@/components/briefs/brief-detail'

export default async function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const admin = createAdminClient()
  const { data: brief } = await admin
    .from('briefs')
    .select('*')
    .eq('id', id)
    .single()

  if (!brief) notFound()

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <BriefDetail brief={brief} />
    </div>
  )
}
