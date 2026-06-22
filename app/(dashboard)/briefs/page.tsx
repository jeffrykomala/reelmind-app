import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

export default async function BriefsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { data: member } = await admin
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user!.id)
    .limit(1)
    .single()

  const { data: briefs } = await admin
    .from('briefs')
    .select('id, subject, location, content_type, platforms, status, ai_provider, created_at')
    .eq('workspace_id', member?.workspace_id ?? '')
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Briefs</h1>
          <p className="text-gray-500 mt-1">{briefs?.length ?? 0} briefs</p>
        </div>
        <Link href="/briefs/new" className={cn(buttonVariants(), 'bg-orange-600 hover:bg-orange-700 text-white')}>
          <Plus className="w-4 h-4 mr-2" /> New Brief
        </Link>
      </div>

      {briefs && briefs.length > 0 ? (
        <div className="space-y-3">
          {briefs.map((brief) => (
            <Link key={brief.id} href={`/briefs/${brief.id}`}>
              <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between hover:border-orange-300 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{brief.content_type === 'food' ? '🍜' : '🏨'}</span>
                  <div>
                    <p className="font-medium text-gray-900">{brief.subject}</p>
                    <p className="text-sm text-gray-500">{brief.location} · {brief.platforms.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{brief.ai_provider}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    brief.status === 'published' ? 'bg-green-100 text-green-700' :
                    brief.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {brief.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl py-20 text-center">
          <p className="text-gray-500 mb-4">No briefs yet.</p>
          <Link href="/briefs/new" className={cn(buttonVariants(), 'bg-orange-600 hover:bg-orange-700 text-white')}>
            Create your first brief
          </Link>
        </div>
      )}
    </div>
  )
}
