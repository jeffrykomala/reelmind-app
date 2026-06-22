import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generate } from '@/lib/ai/generate'
import { buildHookPrompt, type ContentType } from '@/lib/ai/prompts'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contentType, subject, angle } = await req.json() as {
    contentType: ContentType
    subject: string
    angle?: string
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('claude_api_key')
    .eq('id', user.id)
    .single()

  const prompt = buildHookPrompt({ contentType, subject, angle })

  try {
    const raw = await generate(prompt, profile?.claude_api_key ?? null)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Hook generation failed', detail: String(err) }, { status: 500 })
  }
}
