'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface BriefOutput {
  concept: string
  hook: string
  storyline: Record<string, string>
  talkingPoints: string[]
  cta: string
  captions: Record<string, string>
  hashtags: Record<string, string[]>
  b_roll_shots: string[]
}

interface Brief {
  id: string
  content_type: 'food' | 'hotel'
  subject: string
  location: string
  angle: string | null
  platforms: string[]
  ai_provider: string
  output: BriefOutput
  status: string
  created_at: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  )
}

export default function BriefDetail({ brief }: { brief: Brief }) {
  const output = brief.output

  const platformLabels: Record<string, string> = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube_shorts: 'YouTube Shorts',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{brief.content_type === 'food' ? '🍜' : '🏨'}</span>
            <h1 className="text-2xl font-bold text-gray-900">{brief.subject}</h1>
          </div>
          <p className="text-gray-500">{brief.location}</p>
          {brief.angle && <p className="text-sm text-gray-400 mt-1 italic">"{brief.angle}"</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="outline" className="capitalize">{brief.status}</Badge>
          <span className="text-xs text-gray-400">via {brief.ai_provider}</span>
        </div>
      </div>

      {/* Concept */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Concept</p>
              <p className="text-gray-900 font-medium">{output.concept}</p>
            </div>
            <CopyButton text={output.concept} />
          </div>
        </CardContent>
      </Card>

      {/* Hook */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Hook (first 3 seconds)</p>
              <p className="text-gray-900 text-lg font-semibold">"{output.hook}"</p>
            </div>
            <CopyButton text={output.hook} />
          </div>
        </CardContent>
      </Card>

      {/* Storyline */}
      <Section title="Storyline">
        <Card>
          <CardContent className="pt-4 pb-4 space-y-3">
            {Object.entries(output.storyline).map(([act, desc]) => (
              <div key={act} className="flex gap-3">
                <span className="text-xs font-bold text-orange-600 uppercase mt-0.5 shrink-0 w-10">{act}</span>
                <p className="text-sm text-gray-700">{desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>

      {/* Talking Points */}
      <Section title="Key Talking Points">
        <Card>
          <CardContent className="pt-4 pb-4">
            <ul className="space-y-2">
              {output.talkingPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-orange-500 font-bold shrink-0">{i + 1}.</span>
                  {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Section>

      {/* CTA */}
      <Section title="Call to Action">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-gray-700">{output.cta}</p>
              <CopyButton text={output.cta} />
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Captions & Hashtags by platform */}
      <Section title="Captions & Hashtags">
        <Tabs defaultValue={brief.platforms[0] || 'instagram'}>
          <TabsList>
            {brief.platforms.map(p => (
              <TabsTrigger key={p} value={p}>{platformLabels[p] || p}</TabsTrigger>
            ))}
          </TabsList>
          {brief.platforms.map(p => (
            <TabsContent key={p} value={p} className="space-y-3 mt-3">
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-gray-500">Caption</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{output.captions[p]}</p>
                    <CopyButton text={output.captions[p]} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-gray-500">Hashtags</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {(output.hashtags[p] || []).map((tag, i) => (
                        <span key={i} className="text-sm text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{tag}</span>
                      ))}
                    </div>
                    <CopyButton text={(output.hashtags[p] || []).join(' ')} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </Section>

      {/* B-Roll */}
      <Section title="B-Roll Shot List">
        <Card>
          <CardContent className="pt-4 pb-4">
            <ul className="space-y-2">
              {output.b_roll_shots.map((shot, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-gray-400 shrink-0">#{i + 1}</span>
                  {shot}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Section>
    </div>
  )
}
