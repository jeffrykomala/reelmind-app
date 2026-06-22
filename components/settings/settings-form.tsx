'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Check, Eye, EyeOff } from 'lucide-react'

interface Props {
  userId: string
  initialName: string
  hasClaudeKey: boolean
}

export default function SettingsForm({ userId, initialName, hasClaudeKey }: Props) {
  const [name, setName] = useState(initialName)
  const [claudeKey, setClaudeKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)
  const [keySaved, setKeySaved] = useState(false)
  const [keyActive, setKeyActive] = useState(hasClaudeKey)
  const [loading, setLoading] = useState(false)

  async function saveName() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ full_name: name }).eq('id', userId)
    setLoading(false)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 2000)
  }

  async function saveClaudeKey() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ claude_api_key: claudeKey || null }).eq('id', userId)
    setLoading(false)
    setKeySaved(true)
    setKeyActive(!!claudeKey)
    setClaudeKey('')
    setTimeout(() => setKeySaved(false), 2000)
  }

  async function removeClaudeKey() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ claude_api_key: null }).eq('id', userId)
    setLoading(false)
    setKeyActive(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              <Button onClick={saveName} disabled={loading} variant="outline" className="shrink-0">
                {nameSaved ? <Check className="w-4 h-4 text-green-600" /> : 'Save'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI Provider</CardTitle>
          <CardDescription>
            By default, ReelMind uses <strong>Gemini Flash</strong> (free). Add your Claude API key for higher-quality output.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
            <div>
              <p className="text-sm font-medium text-gray-900">Gemini Flash</p>
              <p className="text-xs text-gray-500">Default · Free · Always active</p>
            </div>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Active</span>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Claude API Key (Optional)</p>
                <p className="text-xs text-gray-500">Uses Claude Sonnet for richer, more nuanced output</p>
              </div>
              {keyActive && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Connected</span>
              )}
            </div>

            {keyActive ? (
              <div className="flex items-center gap-2">
                <Input value="sk-ant-••••••••••••••••••" disabled className="font-mono text-sm" />
                <Button variant="outline" onClick={removeClaudeKey} disabled={loading} className="shrink-0 text-red-600 hover:text-red-700 hover:border-red-300">
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showKey ? 'text' : 'password'}
                      placeholder="sk-ant-..."
                      value={claudeKey}
                      onChange={(e) => setClaudeKey(e.target.value)}
                      className="font-mono text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button onClick={saveClaudeKey} disabled={loading || !claudeKey} className="bg-orange-600 hover:bg-orange-700 text-white shrink-0">
                    {keySaved ? <Check className="w-4 h-4" /> : 'Save'}
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Get your key at <span className="font-mono">console.anthropic.com</span>. Stored securely, never shared.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
