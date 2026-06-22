import { createClient } from '@/lib/supabase/server'
import { FileText, Zap, TrendingUp, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: workspaceMember } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(name)')
    .eq('user_id', user!.id)
    .eq('role', 'owner')
    .single()

  const workspaceId = workspaceMember?.workspace_id

  const [{ count: briefCount }, { count: logCount }] = await Promise.all([
    supabase.from('briefs').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId ?? ''),
    supabase.from('performance_logs').select('*', { count: 'exact', head: true }).eq('workspace_id', workspaceId ?? ''),
  ])

  const { data: recentBriefs } = await supabase
    .from('briefs')
    .select('id, subject, content_type, status, created_at')
    .eq('workspace_id', workspaceId ?? '')
    .order('created_at', { ascending: false })
    .limit(5)

  const firstName = (user?.user_metadata?.full_name as string)?.split(' ')[0] || 'Creator'

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Good to see you, {firstName}</h1>
        <p className="text-gray-500 mt-1">What are you creating today?</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Total Briefs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{briefCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Posts Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{logCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/briefs/new"
              className={cn(buttonVariants({ size: 'sm' }), 'w-full bg-orange-600 hover:bg-orange-700 text-white justify-center')}
            >
              New Brief
            </Link>
            <Link
              href="/analytics/log"
              className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'w-full border-orange-300 text-orange-700 hover:bg-orange-100 justify-center')}
            >
              Log Performance
            </Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Briefs</h2>
          <Link href="/briefs" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'text-orange-600')}>
            View all
          </Link>
        </div>

        {recentBriefs && recentBriefs.length > 0 ? (
          <div className="space-y-3">
            {recentBriefs.map((brief) => (
              <Link key={brief.id} href={`/briefs/${brief.id}`}>
                <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between hover:border-orange-300 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{brief.content_type === 'food' ? '🍜' : '🏨'}</span>
                    <div>
                      <p className="font-medium text-gray-900">{brief.subject}</p>
                      <p className="text-xs text-gray-500 capitalize">{brief.content_type} review</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    brief.status === 'published' ? 'bg-green-100 text-green-700' :
                    brief.status === 'ready' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {brief.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl py-16 text-center">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No briefs yet. Create your first one.</p>
            <Link href="/briefs/new" className={cn(buttonVariants(), 'bg-orange-600 hover:bg-orange-700 text-white')}>
              Create Brief
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
