'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

interface EventFormData {
  name: string
  date: string
  location: string
  description: string
  status: string
}

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    date: '',
    location: '',
    description: '',
    status: 'active'
  })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${apiUrl}/api/events/${eventId}`)
      const event = response.data
      
      // Format date for datetime-local input
      const dateStr = new Date(event.date).toISOString().slice(0, 16)
      
      setFormData({
        name: event.name || '',
        date: dateStr,
        location: event.location || '',
        description: event.description || '',
        status: event.status || 'active'
      })
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('ไม่สามารถโหลดข้อมูลงานได้')
      router.push('/admin/events')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('กรุณากรอกชื่องาน')
      return
    }
    if (!formData.date) {
      toast.error('กรุณาเลือกวันที่')
      return
    }
    if (!formData.location.trim()) {
      toast.error('กรุณากรอกสถานที่')
      return
    }

    setSaving(true)
    
    try {
      await axios.put(`${apiUrl}/api/events/${eventId}`, formData)
      toast.success('บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว')
      router.push('/admin/events')
    } catch (error: any) {
      console.error('Error updating event:', error)
      toast.error(error.response?.data?.detail || 'ไม่สามารถบันทึกการเปลี่ยนแปลงได้')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบงานนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      return
    }

    try {
      await axios.delete(`${apiUrl}/api/events/${eventId}`)
      toast.success('ลบงานเรียบร้อยแล้ว')
      router.push('/admin/events')
    } catch (error) {
      toast.error('ไม่สามารถลบงานได้')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/events" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← กลับ
            </Link>
            <div>
              <h1 className="text-3xl font-bold">แก้ไขงาน</h1>
              <p className="text-gray-600 mt-1">แก้ไขข้อมูลงานอีเว้นท์</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
            <div className="p-6 space-y-6">
              {/* Event Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่องาน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="เช่น งานวิ่งมาราธอน 2024"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
              </div>

              {/* Event Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                  วันที่จัดงาน <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                  สถานที่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="เช่น สนามกีฬาแห่งชาติ กรุงเทพฯ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  รายละเอียด
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับงาน..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                  สถานะ
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="active">เปิดใช้งาน</option>
                  <option value="processing">กำลังประมวลผล</option>
                  <option value="completed">เสร็จสิ้น</option>
                  <option value="archived">เก็บถาวร</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-3 border border-red-300 rounded-lg text-red-700 font-semibold hover:bg-red-50 transition-colors"
              >
                🗑️ ลบงาน
              </button>
              <div className="flex gap-3">
                <Link
                  href="/admin/events"
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                >
                  ยกเลิก
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary min-w-[140px]"
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>กำลังบันทึก...</span>
                    </div>
                  ) : (
                    '✓ บันทึกการเปลี่ยนแปลง'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Quick Links */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <Link
              href={`/admin/events/${eventId}/photos`}
              className="bg-white border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">📸</span>
                <div>
                  <h3 className="font-semibold text-gray-900">จัดการรูปภาพ</h3>
                  <p className="text-sm text-gray-600">อัพโหลดและจัดการรูปของงานนี้</p>
                </div>
              </div>
            </Link>

            <Link
              href={`/events/${eventId}`}
              target="_blank"
              className="bg-white border-2 border-green-200 rounded-lg p-4 hover:border-green-400 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">👁️</span>
                <div>
                  <h3 className="font-semibold text-gray-900">ดูหน้าลูกค้า</h3>
                  <p className="text-sm text-gray-600">ดูงานนี้ในมุมมองของลูกค้า</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
