'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
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

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await axios.get(`${apiUrl}/api/events?status=active`)
      setEvents(response.data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            ค้นหารูปภาพของคุณจากงานอีเว้นท์
          </h1>
          <p className="text-xl mb-8 text-primary-100">
            อัพโหลดรูปหน้าของคุณ และให้ AI ช่วยค้นหารูปที่คุณอยู่ในงาน
          </p>
          <Link href="#events" className="btn-primary inline-block text-lg">
            เริ่มค้นหารูป
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">วิธีการใช้งาน</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">เลือกงานอีเว้นท์</h3>
              <p className="text-gray-600">เลือกงานที่คุณเข้าร่วมจากรายการด้านล่าง</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">อัพโหลดรูปหน้า</h3>
              <p className="text-gray-600">อัพโหลดรูปใบหน้าของคุณเพื่อค้นหา</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">ดาวน์โหลดรูป</h3>
              <p className="text-gray-600">เลือกซื้อและดาวน์โหลดรูปที่ต้องการ</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section id="events" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">งานอีเว้นท์ทั้งหมด</h2>
          
          {loading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">กำลังโหลด...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center text-gray-600">
              <p>ยังไม่มีงานอีเว้นท์</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="card hover:shadow-xl transition-shadow"
                >
                  {event.thumbnail_url ? (
                    <img
                      src={event.thumbnail_url}
                      alt={event.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                  <p className="text-gray-600 mb-2">
                    📅 {new Date(event.date).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {event.location && (
                    <p className="text-gray-600">📍 {event.location}</p>
                  )}
                  <div className="mt-4">
                    <span className="btn-primary text-sm">ค้นหารูป →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
