'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Event {
  id: number
  name: string
  slug: string
  date: string
  location: string
  status: string
}

interface Photo {
  id: number
  original_path: string
  thumbnail_path: string
  has_face: boolean
  face_count: number
  status: string
  created_at: string
}

export default function EventPhotosPage() {
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set())

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchEvent()
    fetchPhotos()
  }, [eventId, statusFilter])

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/events/${eventId}`)
      setEvent(response.data)
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('ไม่สามารถโหลดข้อมูลงานได้')
    }
  }

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${apiUrl}/api/events/${eventId}/photos`)
      let photosData = response.data
      
      // Apply status filter
      if (statusFilter !== 'all') {
        photosData = photosData.filter((p: Photo) => p.status === statusFilter)
      }
      
      setPhotos(photosData)
    } catch (error) {
      console.error('Error fetching photos:', error)
      toast.error('ไม่สามารถโหลดรูปภาพได้')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPhoto = (photoId: number) => {
    const newSelected = new Set(selectedPhotos)
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId)
    } else {
      newSelected.add(photoId)
    }
    setSelectedPhotos(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set())
    } else {
      setSelectedPhotos(new Set(photos.map(p => p.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedPhotos.size === 0) {
      toast.error('กรุณาเลือกรูปที่ต้องการลบ')
      return
    }

    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบรูป ${selectedPhotos.size} รูป?`)) {
      return
    }

    const deletePromises = Array.from(selectedPhotos).map(photoId =>
      axios.delete(`${apiUrl}/api/photos/${photoId}`)
    )

    try {
      await Promise.all(deletePromises)
      toast.success(`ลบรูปสำเร็จ ${selectedPhotos.size} รูป`)
      setSelectedPhotos(new Set())
      fetchPhotos()
    } catch (error) {
      toast.error('ไม่สามารถลบรูปได้')
    }
  }

  const handleReprocessFailed = async () => {
    const failedPhotos = photos.filter(p => p.status === 'failed')
    if (failedPhotos.length === 0) {
      toast.error('ไม่มีรูปที่ล้มเหลวต้องประมวลผลใหม่')
      return
    }

    try {
      // TODO: Implement reprocess endpoint
      toast.info('กำลังประมวลผลใหม่...')
      // await axios.post(`${apiUrl}/api/photos/reprocess`, { photo_ids: failedPhotos.map(p => p.id) })
      toast.success('เริ่มประมวลผลใหม่แล้ว')
      fetchPhotos()
    } catch (error) {
      toast.error('ไม่สามารถประมวลผลใหม่ได้')
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'รอ' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'กำลังประมวลผล' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'เสร็จสิ้น' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'ล้มเหลว' }
    }[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status }

    return (
      <span className={`px-2 py-1 ${config.bg} ${config.text} text-xs rounded-full font-semibold`}>
        {config.label}
      </span>
    )
  }

  const stats = {
    total: photos.length,
    completed: photos.filter(p => p.status === 'completed').length,
    processing: photos.filter(p => p.status === 'processing').length,
    pending: photos.filter(p => p.status === 'pending').length,
    failed: photos.filter(p => p.status === 'failed').length,
    withFaces: photos.filter(p => p.has_face).length
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/admin/events" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← กลับ
            </Link>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{event.name}</h1>
              <p className="text-gray-600 mt-1">
                📅 {new Date(event.date).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {event.location && ` • 📍 ${event.location}`}
              </p>
            </div>
            <Link 
              href={`/admin/photos/upload?event_id=${eventId}`}
              className="btn-primary"
            >
              ➕ อัพโหลดรูป
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">ทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">เสร็จสิ้น</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">กำลังประมวลผล</p>
            <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">รอประมวลผล</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">ล้มเหลว</p>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">มีใบหน้า</p>
            <p className="text-2xl font-bold text-purple-600">{stats.withFaces}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            className="bg-white border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all text-center"
          >
            <div className="text-3xl mb-2">👁️</div>
            <p className="font-semibold text-gray-900">ดูหน้าลูกค้า</p>
          </Link>

          <Link
            href={`/admin/events/${eventId}/edit`}
            className="bg-white border-2 border-purple-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition-all text-center"
          >
            <div className="text-3xl mb-2">✏️</div>
            <p className="font-semibold text-gray-900">แก้ไขงาน</p>
          </Link>

          <button
            onClick={handleReprocessFailed}
            disabled={stats.failed === 0}
            className="bg-white border-2 border-orange-200 rounded-lg p-4 hover:border-orange-400 hover:shadow-md transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-3xl mb-2">🔄</div>
            <p className="font-semibold text-gray-900">ประมวลผลใหม่</p>
          </button>

          <button
            onClick={() => {
              // TODO: Implement download all
              toast.info('ฟีเจอร์กำลังพัฒนา')
            }}
            className="bg-white border-2 border-green-200 rounded-lg p-4 hover:border-green-400 hover:shadow-md transition-all text-center"
          >
            <div className="text-3xl mb-2">📥</div>
            <p className="font-semibold text-gray-900">ดาวน์โหลดทั้งหมด</p>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ทั้งหมด ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              เสร็จสิ้น ({stats.completed})
            </button>
            <button
              onClick={() => setStatusFilter('processing')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                statusFilter === 'processing'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              กำลังประมวลผล ({stats.processing})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              รอประมวลผล ({stats.pending})
            </button>
            {stats.failed > 0 && (
              <button
                onClick={() => setStatusFilter('failed')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  statusFilter === 'failed'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ล้มเหลว ({stats.failed})
              </button>
            )}
          </div>
        </div>

        {/* Batch Actions */}
        {selectedPhotos.size > 0 && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <p className="text-primary-900 font-semibold">
                เลือก {selectedPhotos.size} รูป
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPhotos(new Set())}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  🗑️ ลบที่เลือก
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Photos Grid */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">กำลังโหลด...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">ยังไม่มีรูปภาพ</p>
              <Link 
                href={`/admin/photos/upload?event_id=${eventId}`}
                className="btn-primary mt-4 inline-block"
              >
                อัพโหลดรูปแรก
              </Link>
            </div>
          ) : (
            <div className="p-4">
              <div className="mb-4 flex justify-between items-center">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                >
                  {selectedPhotos.size === photos.length ? '☑️ ยกเลิกทั้งหมด' : '☐ เลือกทั้งหมด'}
                </button>
                <button
                  onClick={fetchPhotos}
                  className="text-sm text-gray-600 hover:text-gray-800 font-semibold"
                >
                  🔄 รีเฟรช
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {photos.map(photo => (
                  <div 
                    key={photo.id}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedPhotos.has(photo.id)
                        ? 'border-primary-500 shadow-lg'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectPhoto(photo.id)}
                  >
                    <div className="aspect-square bg-gray-200">
                      <img 
                        src={`${apiUrl}${photo.thumbnail_path || photo.original_path}`}
                        alt={`Photo ${photo.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-2 left-2">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedPhotos.has(photo.id)
                          ? 'bg-primary-600 border-primary-600'
                          : 'bg-white border-gray-300'
                      }`}>
                        {selectedPhotos.has(photo.id) && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(photo.status)}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs">
                        {photo.has_face ? `👤 ${photo.face_count} ใบหน้า` : '👤 ไม่มีใบหน้า'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
