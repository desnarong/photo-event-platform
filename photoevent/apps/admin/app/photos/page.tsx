'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Photo {
  id: number
  event_id: number
  original_path: string
  thumbnail_path: string
  watermark_path: string
  has_face: boolean
  face_count: number
  status: string
  price: number
  created_at: string
}

interface Event {
  id: number
  name: string
}

export default function PhotoManagementPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPhotos, setSelectedPhotos] = useState<Set<number>>(new Set())

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchEvents()
    fetchPhotos()
  }, [selectedEventId, statusFilter])

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/events`)
      setEvents(response.data)
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      
      // If event is selected, get photos for that event
      if (selectedEventId !== 'all') {
        const response = await axios.get(`${apiUrl}/api/events/${selectedEventId}/photos`)
        let photosData = response.data
        
        // Apply status filter
        if (statusFilter !== 'all') {
          photosData = photosData.filter((p: Photo) => p.status === statusFilter)
        }
        
        setPhotos(photosData)
      } else {
        // Get all photos from all events
        const eventsResponse = await axios.get(`${apiUrl}/api/events`)
        const allEvents = eventsResponse.data
        
        const allPhotos: Photo[] = []
        for (const event of allEvents) {
          try {
            const response = await axios.get(`${apiUrl}/api/events/${event.id}/photos`)
            allPhotos.push(...response.data)
          } catch (err) {
            console.error(`Error fetching photos for event ${event.id}:`, err)
          }
        }
        
        // Apply status filter
        const filteredPhotos = statusFilter === 'all' 
          ? allPhotos 
          : allPhotos.filter(p => p.status === statusFilter)
        
        setPhotos(filteredPhotos)
      }
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

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'รอประมวลผล' },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">จัดการรูปภาพ</h1>
              <p className="text-gray-600 mt-1">รูปภาพทั้งหมดในระบบ</p>
            </div>
            <Link href="/admin/photos/upload" className="btn-primary">
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Event Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                กรองตามงาน
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">ทุกงาน</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                กรองตามสถานะ
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="processing">กำลังประมวลผล</option>
                <option value="pending">รอประมวลผล</option>
                <option value="failed">ล้มเหลว</option>
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                รูปแบบการแสดงผล
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🔲 Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ☰ List
                </button>
              </div>
            </div>
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

        {/* Photos */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">กำลังโหลด...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">ไม่พบรูปภาพ</p>
              <Link href="/admin/photos/upload" className="btn-primary mt-4 inline-block">
                อัพโหลดรูปแรก
              </Link>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="p-4">
              <div className="mb-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                >
                  {selectedPhotos.size === photos.length ? '☑️ ยกเลิกทั้งหมด' : '☐ เลือกทั้งหมด'}
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
          ) : (
            <div className="divide-y divide-gray-200">
              <div className="p-4 bg-gray-50 flex items-center gap-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                >
                  {selectedPhotos.size === photos.length ? '☑️ ยกเลิกทั้งหมด' : '☐ เลือกทั้งหมด'}
                </button>
              </div>
              {photos.map(photo => (
                <div 
                  key={photo.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedPhotos.has(photo.id)}
                      onChange={() => handleSelectPhoto(photo.id)}
                      className="w-5 h-5"
                    />
                    <img 
                      src={`${apiUrl}${photo.thumbnail_path || photo.original_path}`}
                      alt={`Photo ${photo.id}`}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">Photo #{photo.id}</p>
                      <p className="text-sm text-gray-600">
                        {photo.has_face ? `มี ${photo.face_count} ใบหน้า` : 'ไม่มีใบหน้า'}
                      </p>
                    </div>
                    <div>
                      {getStatusBadge(photo.status)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(photo.created_at).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
