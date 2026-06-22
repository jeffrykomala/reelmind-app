import { createClient } from '@/lib/supabase/server'
import SettingsForm from '@/components/settings/settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, claude_api_key')
    .eq('id', user!.id)
    .single()

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile and AI preferences</p>
      </div>
      <SettingsForm
        userId={user!.id}
        initialName={profile?.full_name ?? ''}
        hasClaudeKey={!!profile?.claude_api_key}
      />
    </div>
  )
}
