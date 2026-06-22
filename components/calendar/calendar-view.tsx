'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import EventForm, { type CalendarEvent, type Brief } from './event-form'

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const PLATFORM_CHIP: Record<string, string> = {
  instagram: 'bg-orange-100 text-orange-700',
  tiktok: 'bg-purple-100 text-purple-700',
  youtube_shorts: 'bg-red-100 text-red-700',
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getMonthCells(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = Array(firstDay.getDay()).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function getWeekDays(ref: Date): Date[] {
  const start = new Date(ref)
  start.setDate(ref.getDate() - ref.getDay())
  start.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function dayEvents(events: CalendarEvent[], day: Date) {
  return events
    .filter(e => sameDay(new Date(e.scheduled_at), day))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
}

interface Props {
  workspaceId: string
  events: CalendarEvent[]
  briefs: Brief[]
}

export default function CalendarView({ workspaceId, events, briefs }: Props) {
  const today = useMemo(() => new Date(), [])
  const [view, setView] = useState<'month' | 'week'>('month')
  const [refDate, setRefDate] = useState(new Date())
  const [showForm, setShowForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [formDate, setFormDate] = useState<Date | null>(null)

  function openCreate(date?: Date) {
    setSelectedEvent(null)
    setFormDate(date ?? null)
    setShowForm(true)
  }

  function openEdit(e: CalendarEvent, ev: React.MouseEvent) {
    ev.stopPropagation()
    setSelectedEvent(e)
    setFormDate(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setSelectedEvent(null)
    setFormDate(null)
  }

  function navigate(dir: -1 | 1) {
    setRefDate(d => {
      const n = new Date(d)
      if (view === 'month') n.setMonth(d.getMonth() + dir)
      else n.setDate(d.getDate() + dir * 7)
      return n
    })
  }

  const monthCells = useMemo(() => getMonthCells(refDate.getFullYear(), refDate.getMonth()), [refDate])
  const weekDays = useMemo(() => getWeekDays(refDate), [refDate])

  const headerLabel = view === 'month'
    ? `${MONTHS[refDate.getMonth()]} ${refDate.getFullYear()}`
    : (() => {
        const days = getWeekDays(refDate)
        const s = days[0], e = days[6]
        return s.getMonth() === e.getMonth()
          ? `${MONTHS[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${s.getFullYear()}`
          : `${MONTHS[s.getMonth()]} ${s.getDate()} – ${MONTHS[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`
      })()

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setRefDate(new Date())}>Today</Button>
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className="p-1 rounded hover:bg-gray-100">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={() => navigate(1)} className="p-1 rounded hover:bg-gray-100">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{headerLabel}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {(['month', 'week'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 font-medium capitalize transition-colors ${view === v ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <Button onClick={() => openCreate()} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="w-4 h-4 mr-1" /> New Event
          </Button>
        </div>
      </div>

      {/* Month View */}
      {view === 'month' && (
        <div className="flex-1 px-8 pb-8 flex flex-col min-h-0">
          <div className="grid grid-cols-7 mb-px">
            {DAYS.map(d => (
              <div key={d} className="text-xs font-medium text-gray-400 py-2 text-center tracking-wide">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-l border-t border-gray-200 flex-1">
            {monthCells.map((day, i) => {
              const de = day ? dayEvents(events, day) : []
              const isToday = day ? sameDay(day, today) : false
              return (
                <div
                  key={i}
                  onClick={() => day && openCreate(day)}
                  className={`border-r border-b border-gray-200 p-1.5 cursor-pointer hover:bg-gray-50 transition-colors min-h-[110px] ${!day ? 'bg-gray-50/60' : 'bg-white'}`}
                >
                  {day && (
                    <>
                      <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-orange-600 text-white' : 'text-gray-700'}`}>
                        {day.getDate()}
                      </span>
                      <div className="space-y-0.5">
                        {de.slice(0, 3).map(ev => (
                          <div
                            key={ev.id}
                            onClick={e => openEdit(ev, e)}
                            className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer font-medium ${ev.platform ? PLATFORM_CHIP[ev.platform] : 'bg-gray-100 text-gray-600'}`}
                          >
                            {fmt(ev.scheduled_at)} {ev.title}
                          </div>
                        ))}
                        {de.length > 3 && (
                          <p className="text-xs text-gray-400 px-1">+{de.length - 3} more</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="flex-1 px-8 pb-8 overflow-auto">
          <div className="grid grid-cols-7 border-l border-t border-gray-200">
            {weekDays.map((day, i) => {
              const de = dayEvents(events, day)
              const isToday = sameDay(day, today)
              return (
                <div key={i} className="border-r border-gray-200">
                  <div
                    onClick={() => openCreate(day)}
                    className={`text-center py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${isToday ? 'bg-orange-50' : ''}`}
                  >
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{DAYS[day.getDay()]}</p>
                    <span className={`text-xl font-semibold w-9 h-9 flex items-center justify-center rounded-full mx-auto mt-0.5 ${isToday ? 'bg-orange-600 text-white' : 'text-gray-900'}`}>
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="p-1.5 space-y-1.5 min-h-[300px]">
                    {de.map(ev => (
                      <div
                        key={ev.id}
                        onClick={e => openEdit(ev, e)}
                        className={`text-xs p-2 rounded-lg cursor-pointer ${ev.platform ? PLATFORM_CHIP[ev.platform] : 'bg-gray-100 text-gray-700'}`}
                      >
                        <p className="font-semibold truncate">{ev.title}</p>
                        <p className="opacity-70 mt-0.5">{fmt(ev.scheduled_at)}</p>
                        {ev.creator_name && <p className="opacity-70 truncate">{ev.creator_name}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {showForm && (
        <EventForm
          workspaceId={workspaceId}
          briefs={briefs}
          event={selectedEvent}
          defaultDate={formDate}
          onClose={closeForm}
        />
      )}
    </div>
  )
}
