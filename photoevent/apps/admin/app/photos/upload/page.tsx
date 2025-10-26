'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Event {
  id: number
  name: string
  slug: string
  date: string
}

interface UploadFile {
  file: File
  id: string
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'failed'
  error?: string
}

export default function PhotoUploadPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [files, setFiles] = useState<UploadFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchEvents()
    
    // Check if event_id is in query params
    const eventId = searchParams.get('event_id')
    if (eventId) {
      setSelectedEventId(eventId)
    }
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/events`)
      setEvents(response.data)
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('ไม่สามารถโหลดรายการงานได้')
    }
  }

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return

    const newFiles: UploadFile[] = []
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} ไม่ใช่ไฟล์รูปภาพ`)
        continue
      }
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} มีขนาดใหญ่เกิน 50MB`)
        continue
      }

      newFiles.push({
        file,
        id: `${Date.now()}-${i}`,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'pending'
      })
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles])
      toast.success(`เพิ่ม ${newFiles.length} ไฟล์`)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const uploadFiles = async () => {
    if (!selectedEventId) {
      toast.error('กรุณาเลือกงานก่อน')
      return
    }

    if (files.length === 0) {
      toast.error('กรุณาเลือกไฟล์ที่จะอัพโหลด')
      return
    }

    const pendingFiles = files.filter(f => f.status === 'pending' || f.status === 'failed')
    if (pendingFiles.length === 0) {
      toast.error('ไม่มีไฟล์ที่ต้องอัพโหลด')
      return
    }

    setUploading(true)

    for (const uploadFile of pendingFiles) {
      try {
        // Update status to uploading
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
        ))

        const formData = new FormData()
        formData.append('file', uploadFile.file)

        await axios.post(
          `${apiUrl}/api/events/${selectedEventId}/photos`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const progress = progressEvent.total 
                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                : 0
              
              setFiles(prev => prev.map(f => 
                f.id === uploadFile.id ? { ...f, progress } : f
              ))
            }
          }
        )

        // Mark as completed
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { ...f, status: 'completed', progress: 100 } : f
        ))

      } catch (error: any) {
        console.error('Upload error:', error)
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'failed', error: error.response?.data?.detail || 'อัพโหลดไม่สำเร็จ' } 
            : f
        ))
      }
    }

    setUploading(false)

    const completed = files.filter(f => f.status === 'completed').length + pendingFiles.filter(f => files.find(ff => ff.id === f.id && ff.status === 'completed')).length
    const failed = files.filter(f => f.status === 'failed').length

    if (failed === 0) {
      toast.success(`อัพโหลดสำเร็จ ${completed} ไฟล์`)
    } else {
      toast.error(`อัพโหลดสำเร็จ ${completed} ไฟล์, ล้มเหลว ${failed} ไฟล์`)
    }
  }

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'))
  }

  const retryFailed = () => {
    setFiles(prev => prev.map(f => 
      f.status === 'failed' ? { ...f, status: 'pending', error: undefined } : f
    ))
  }

  const stats = {
    total: files.length,
    pending: files.filter(f => f.status === 'pending').length,
    uploading: files.filter(f => f.status === 'uploading').length,
    completed: files.filter(f => f.status === 'completed').length,
    failed: files.filter(f => f.status === 'failed').length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/photos" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← กลับ
            </Link>
            <div>
              <h1 className="text-3xl font-bold">อัพโหลดรูปภาพ</h1>
              <p className="text-gray-600 mt-1">อัพโหลดรูปภาพเข้าสู่งานอีเว้นท์</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Event Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              เลือกงาน <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              disabled={uploading}
            >
              <option value="">-- เลือกงาน --</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.name} ({new Date(event.date).toLocaleDateString('th-TH')})
                </option>
              ))}
            </select>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-lg shadow p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragging 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="text-6xl mb-4">📤</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                ลากไฟล์มาวางที่นี่
              </h3>
              <p className="text-gray-500 mb-4">
                หรือ คลิกเพื่อเลือกไฟล์
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
                disabled={uploading}
              >
                📁 เลือกไฟล์
              </button>
              <p className="text-sm text-gray-400 mt-4">
                รองรับไฟล์ JPG, PNG, WebP (สูงสุด 50MB/ไฟล์)
              </p>
            </div>
          </div>

          {/* Files List */}
          {files.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold">รายการไฟล์ ({stats.total})</h2>
                  <div className="flex gap-4 mt-1 text-sm">
                    <span className="text-gray-600">รอ: {stats.pending}</span>
                    <span className="text-blue-600">กำลังอัพโหลด: {stats.uploading}</span>
                    <span className="text-green-600">สำเร็จ: {stats.completed}</span>
                    {stats.failed > 0 && (
                      <span className="text-red-600">ล้มเหลว: {stats.failed}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {stats.failed > 0 && (
                    <button
                      onClick={retryFailed}
                      className="px-4 py-2 text-sm border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
                      disabled={uploading}
                    >
                      🔄 ลองใหม่
                    </button>
                  )}
                  {stats.completed > 0 && (
                    <button
                      onClick={clearCompleted}
                      className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={uploading}
                    >
                      ✓ ล้างที่สำเร็จ
                    </button>
                  )}
                  <button
                    onClick={uploadFiles}
                    className="btn-primary"
                    disabled={uploading || !selectedEventId || (stats.pending === 0 && stats.failed === 0)}
                  >
                    {uploading ? '⏳ กำลังอัพโหลด...' : '📤 อัพโหลดทั้งหมด'}
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {files.map(uploadFile => (
                  <div 
                    key={uploadFile.id}
                    className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Preview */}
                    <img 
                      src={uploadFile.preview} 
                      alt={uploadFile.file.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      
                      {/* Progress Bar */}
                      {uploadFile.status === 'uploading' && (
                        <div className="mt-2">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary-600 transition-all duration-300"
                              style={{ width: `${uploadFile.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{uploadFile.progress}%</p>
                        </div>
                      )}
                      
                      {/* Error */}
                      {uploadFile.status === 'failed' && uploadFile.error && (
                        <p className="text-sm text-red-600 mt-1">{uploadFile.error}</p>
                      )}
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {uploadFile.status === 'pending' && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          รอ
                        </span>
                      )}
                      {uploadFile.status === 'uploading' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          กำลังอัพโหลด
                        </span>
                      )}
                      {uploadFile.status === 'completed' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          ✓ สำเร็จ
                        </span>
                      )}
                      {uploadFile.status === 'failed' && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          ✗ ล้มเหลว
                        </span>
                      )}
                    </div>

                    {/* Remove Button */}
                    {(uploadFile.status === 'pending' || uploadFile.status === 'failed') && (
                      <button
                        onClick={() => removeFile(uploadFile.id)}
                        className="flex-shrink-0 text-red-600 hover:text-red-800 transition-colors"
                        disabled={uploading}
                      >
                        ✗
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">เคล็ดลับการอัพโหลด</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• รูปภาพจะถูกประมวลผลด้วย AI อัตโนมัติเพื่อตรวจจับใบหน้า</li>
                  <li>• การประมวลผลอาจใช้เวลา 2-5 นาทีต่อรูป ขึ้นอยู่กับขนาด</li>
                  <li>• แนะนำให้อัพโหลดครั้งละไม่เกิน 100 รูป</li>
                  <li>• ตรวจสอบสถานะการประมวลผลได้ที่หน้า "จัดการรูปภาพ"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
