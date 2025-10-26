'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface Event {
  id: number
  name: string
  date: string
  location: string
  description: string
}

interface Photo {
  id: number
  thumbnail_path: string
  price: number
  has_face: boolean
}

export default function EventPage() {
  const params = useParams()
  const slug = params.slug as string

  const [event, setEvent] = useState<Event | null>(null)
  const [searchResults, setSearchResults] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchEvent()
  }, [slug])

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/events/slug/${slug}`)
      setEvent(response.data)
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('ไม่พบงานอีเว้นท์นี้')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกไฟล์รูปภาพ')
        return
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error('ไฟล์ใหญ่เกินไป (สูงสุด 10MB)')
        return
      }

      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSearch = async () => {
    if (!selectedFile || !event) {
      toast.error('กรุณาเลือกรูปภาพ')
      return
    }

    setSearching(true)

    try {
      const formData = new FormData()
      formData.append('face_image', selectedFile)
      formData.append('event_id', event.id.toString())

      const response = await axios.post(
        `${apiUrl}/api/search-face`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          params: {
            event_id: event.id
          }
        }
      )

      setSearchResults(response.data.photos || [])
      
      if (response.data.results_count === 0) {
        toast.error('ไม่พบรูปภาพที่ตรงกัน')
      } else {
        toast.success(`พบ ${response.data.results_count} รูปภาพ`)
      }
    } catch (error: any) {
      console.error('Search error:', error)
      if (error.response?.status === 400) {
        toast.error('ไม่พบใบหน้าในรูปภาพ กรุณาลองใหม่')
      } else {
        toast.error('เกิดข้อผิดพลาดในการค้นหา')
      }
    } finally {
      setSearching(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">ไม่พบงานอีเว้นท์</h2>
          <p className="mt-2 text-gray-600">งานที่คุณค้นหาไม่มีในระบบ</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Event Header */}
        <div className="card mb-8">
          <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <span>📅 {new Date(event.date).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
            {event.location && <span>📍 {event.location}</span>}
          </div>
          {event.description && (
            <p className="mt-4 text-gray-700">{event.description}</p>
          )}
        </div>

        {/* Face Search Section */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">ค้นหารูปภาพของคุณ</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อัพโหลดรูปใบหน้าของคุณ
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null)
                        setPreviewUrl(null)
                      }}
                      className="btn-secondary"
                    >
                      เลือกรูปใหม่
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="mt-4">
                      <label className="cursor-pointer">
                        <span className="btn-primary">เลือกรูปภาพ</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      PNG, JPG, GIF ขนาดไม่เกิน 10MB
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleSearch}
                disabled={!selectedFile || searching}
                className="w-full mt-4 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searching ? 'กำลังค้นหา...' : '🔍 ค้นหารูป'}
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-4">
                💡 คำแนะนำสำหรับการค้นหา
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>✓ ใช้รูปที่เห็นหน้าชัดเจน</li>
                <li>✓ แสงสว่างเพียงพอ</li>
                <li>✓ ไม่ควรใส่แว่นตาหรือหมวก</li>
                <li>✓ หน้าตรงเข้ากล้อง</li>
                <li>✓ ไม่มีอุปกรณ์บังใบหน้า</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">
              ผลการค้นหา ({searchResults.length} รูป)
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {searchResults.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                >
                  <img
                    src={`${apiUrl}/photos/${photo.thumbnail_path}`}
                    alt={`Photo ${photo.id}`}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex items-center justify-center">
                    <button className="btn-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      ซื้อ ฿{photo.price}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
