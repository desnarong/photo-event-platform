'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'

interface Event {
  id: number
  name: string
  slug: string
  date: string
  location: string
  thumbnail_url?: string
  status: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchEvents()
  }, [filter])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${apiUrl}/api/events?status=active`)
      let filteredEvents = response.data

      const now = new Date()
      if (filter === 'upcoming') {
        filteredEvents = filteredEvents.filter((e: Event) => new Date(e.date) >= now)
      } else if (filter === 'past') {
        filteredEvents = filteredEvents.filter((e: Event) => new Date(e.date) < now)
      }

      setEvents(filteredEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">งานอีเว้นท์ทั้งหมด</h1>
          <p className="text-gray-600">เลือกงานที่คุณเข้าร่วมเพื่อค้นหารูปภาพ</p>
        </div>

        {/* Filter */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'upcoming'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            งานที่กำลังจะมา
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'past'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            งานที่ผ่านมา
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">กำลังโหลด...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">ไม่พบงานอีเว้นท์</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="card hover:shadow-xl transition-shadow cursor-pointer"
              >
                {event.thumbnail_url ? (
                  <img
                    src={event.thumbnail_url}
                    alt={event.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-4xl">📸</span>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {event.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-1">
                  📅 {new Date(event.date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                
                {event.location && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                    📍 {event.location}
                  </p>
                )}
                
                <div className="mt-auto">
                  <span className="text-primary-600 font-semibold text-sm hover:text-primary-700">
                    ค้นหารูป →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
