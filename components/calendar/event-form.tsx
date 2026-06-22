'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'

export interface CalendarEvent {
  id: string
  workspace_id: string
  brief_id: string | null
  title: string
  creator_name: string | null
  platform: string | null
  scheduled_at: string
  notes: string | null
  briefs?: { subject: string } | null
}

export interface Brief {
  id: string
  subject: string
}

interface Props {
  workspaceId: string
  briefs: Brief[]
  event?: CalendarEvent | null
  defaultDate?: Date | null
  onClose: () => void
}

function toDateTimeInputs(iso: string) {
  const d = new Date(iso)
  const date = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
  const time = [String(d.getHours()).padStart(2, '0'), String(d.getMinutes()).padStart(2, '0')].join(':')
  return { date, time }
}

export default function EventForm({ workspaceId, briefs, event, defaultDate, onClose }: Props) {
  const router = useRouter()
  const isEdit = !!event

  const initDate = event
    ? toDateTimeInputs(event.scheduled_at).date
    : defaultDate
    ? [defaultDate.getFullYear(), String(defaultDate.getMonth() + 1).padStart(2, '0'), String(defaultDate.getDate()).padStart(2, '0')].join('-')
    : new Date().toISOString().slice(0, 10)

  const initTime = event ? toDateTimeInputs(event.scheduled_at).time : '09:00'

  const [title, setTitle] = useState(event?.title ?? '')
  const [date, setDate] = useState(initDate)
  const [time, setTime] = useState(initTime)
  const [platform, setPlatform] = useState(event?.platform ?? '')
  const [creatorName, setCreatorName] = useState(event?.creator_name ?? '')
  const [briefId, setBriefId] = useState(event?.brief_id ?? '')
  const [notes, setNotes] = useState(event?.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const scheduled_at = new Date(`${date}T${time}`).toISOString()
    const body = {
      workspace_id: workspaceId,
      title,
      scheduled_at,
      platform: platform || null,
      creator_name: creatorName || null,
      brief_id: briefId || null,
      notes: notes || null,
    }

    const url = isEdit ? `/api/calendar/events/${event!.id}` : '/api/calendar/events'
    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    router.refresh()
    onClose()
  }

  async function handleDelete() {
    if (!event || !confirm('Delete this event?')) return
    setLoading(true)
    await fetch(`/api/calendar/events/${event.id}`, { method: 'DELETE' })
    router.refresh()
    onClose()
  }

  return (
    <Dialog open onOpenChange={(open: boolean) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Event' : 'New Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="ev-title">Title</Label>
            <Input id="ev-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Post Pad Thai Reel" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ev-date">Date</Label>
              <Input id="ev-date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-time">Time</Label>
              <Input id="ev-time" type="time" value={time} onChange={e => setTime(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-platform">Platform</Label>
            <select
              id="ev-platform"
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">No platform</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube_shorts">YouTube Shorts</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ev-creator">Content Creator</Label>
            <Input id="ev-creator" value={creatorName} onChange={e => setCreatorName(e.target.value)} placeholder="Creator name (optional)" />
          </div>

          {briefs.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="ev-brief">Linked Brief</Label>
              <select
                id="ev-brief"
                value={briefId}
                onChange={e => setBriefId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">No brief</option>
                {briefs.map(b => (
                  <option key={b.id} value={b.id}>{b.subject}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="ev-notes">Notes</Label>
            <Textarea id="ev-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" rows={2} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-between pt-1">
            {isEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
                {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Event'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
