import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generate } from '@/lib/ai/generate'
import { buildBriefPrompt, type ContentType, type Platform } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { workspaceId, contentType, subject, location, angle, platforms } = body as {
    workspaceId: string
    contentType: ContentType
    subject: string
    location: string
    angle?: string
    platforms: Platform[]
  }

  const admin = createAdminClient()

  // Check workspace membership
  const { data: member } = await admin
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!member || !['owner', 'editor'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get user's Claude API key if set
  const { data: profile } = await admin
    .from('profiles')
    .select('claude_api_key')
    .eq('id', user.id)
    .single()

  const prompt = buildBriefPrompt({ contentType, subject, location, angle, platforms })

  let output: object
  let aiProvider: 'gemini' | 'claude' = 'gemini'

  try {
    const raw = await generate(prompt, profile?.claude_api_key ?? null)
    aiProvider = profile?.claude_api_key ? 'claude' : 'gemini'
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    output = JSON.parse(jsonMatch[0])
  } catch (err) {
    return NextResponse.json({ error: 'AI generation failed', detail: String(err) }, { status: 500 })
  }

  const { data: brief, error } = await admin
    .from('briefs')
    .insert({
      workspace_id: workspaceId,
      created_by: user.id,
      content_type: contentType,
      subject,
      location,
      angle,
      platforms,
      ai_provider: aiProvider,
      output,
      status: 'draft',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ brief })
}
