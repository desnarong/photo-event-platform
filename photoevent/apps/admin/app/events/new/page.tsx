'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    date: '',
    location: '',
    description: '',
    status: 'active'
  })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

    setLoading(true)
    
    try {
      const response = await axios.post(`${apiUrl}/api/events`, formData)
      toast.success('สร้างงานเรียบร้อยแล้ว')
      router.push('/admin/events')
    } catch (error: any) {
      console.error('Error creating event:', error)
      toast.error(error.response?.data?.detail || 'ไม่สามารถสร้างงานได้')
    } finally {
      setLoading(false)
    }
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
              <h1 className="text-3xl font-bold">สร้างงานใหม่</h1>
              <p className="text-gray-600 mt-1">เพิ่มงานอีเว้นท์ใหม่เข้าสู่ระบบ</p>
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
                <p className="mt-1 text-sm text-gray-500">
                  Slug จะถูกสร้างอัตโนมัติจากชื่องาน
                </p>
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
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <Link
                href="/admin/events"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary min-w-[120px]"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังบันทึก...</span>
                  </div>
                ) : (
                  '✓ สร้างงาน'
                )}
              </button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">เคล็ดลับ</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Slug จะถูกสร้างอัตโนมัติจากชื่องานเป็นภาษาอังกฤษ</li>
                  <li>• สามารถอัพโหลดรูปภาพหลังจากสร้างงานเสร็จแล้ว</li>
                  <li>• ตั้งสถานะเป็น "เปิดใช้งาน" เพื่อให้ลูกค้าเห็นงานนี้</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
