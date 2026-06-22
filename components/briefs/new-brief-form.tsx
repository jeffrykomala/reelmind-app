'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Loader2 } from 'lucide-react'
import type { ContentType, Platform } from '@/lib/ai/prompts'

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube_shorts', label: 'YouTube Shorts' },
]

export default function NewBriefForm({ workspaceId }: { workspaceId: string }) {
  const router = useRouter()
  const [contentType, setContentType] = useState<ContentType>('food')
  const [subject, setSubject] = useState('')
  const [location, setLocation] = useState('')
  const [angle, setAngle] = useState('')
  const [platforms, setPlatforms] = useState<Platform[]>(['instagram', 'tiktok'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function togglePlatform(p: Platform) {
    setPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (platforms.length === 0) {
      setError('Select at least one platform')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/generate/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, contentType, subject, location, angle, platforms }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    router.push(`/briefs/${data.brief.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Content Type */}
      <div className="space-y-2">
        <Label>Content Type</Label>
        <div className="grid grid-cols-2 gap-3">
          {(['food', 'hotel'] as ContentType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setContentType(type)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                contentType === type
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{type === 'food' ? '🍜' : '🏨'}</span>
              <div>
                <p className="font-medium text-gray-900 capitalize">{type} Review</p>
                <p className="text-xs text-gray-500">
                  {type === 'food' ? 'Restaurant, dish, cafe' : 'Hotel, resort, stay'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject">
          {contentType === 'food' ? 'Dish / Restaurant Name' : 'Hotel / Resort Name'}
        </Label>
        <Input
          id="subject"
          placeholder={contentType === 'food' ? 'e.g. Pad Thai at Street Food Alley' : 'e.g. Capella Bangkok'}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="e.g. Bangkok, Thailand"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      {/* Angle (optional) */}
      <div className="space-y-2">
        <Label htmlFor="angle">
          Angle / Spin <span className="text-gray-400 font-normal">(optional)</span>
        </Label>
        <Textarea
          id="angle"
          placeholder={contentType === 'food'
            ? 'e.g. Hidden gem that locals love, only 50 baht'
            : 'e.g. Is this ₿200K/night hotel actually worth it?'
          }
          value={angle}
          onChange={(e) => setAngle(e.target.value)}
          rows={2}
        />
      </div>

      {/* Platforms */}
      <div className="space-y-2">
        <Label>Platforms</Label>
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => togglePlatform(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                platforms.includes(value)
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-900">AI will generate for you:</p>
              <ul className="text-sm text-orange-700 mt-1 space-y-0.5 list-disc list-inside">
                <li>Full storyline ({contentType === 'food' ? '3' : '4'}-act structure)</li>
                <li>Viral hook for the first 3 seconds</li>
                <li>Platform-specific captions & hashtags</li>
                <li>B-roll shot list</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12 text-base"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating brief...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Generate Brief
          </>
        )}
      </Button>
    </form>
  )
}
