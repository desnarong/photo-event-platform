'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'

interface Stats {
  totalEvents: number
  totalPhotos: number
  photosProcessed: number
  photosPending: number
  totalSearches: number
  todaySearches: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    totalPhotos: 0,
    photosProcessed: 0,
    photosPending: 0,
    totalSearches: 0,
    todaySearches: 0
  })
  const [loading, setLoading] = useState(true)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // TODO: สร้าง API endpoint สำหรับ stats
      // ตอนนี้ใช้ mock data
      setStats({
        totalEvents: 15,
        totalPhotos: 2450,
        photosProcessed: 2380,
        photosPending: 70,
        totalSearches: 1234,
        todaySearches: 45
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">ภาพรวมของระบบ</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Events */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">งานอีเว้นท์ทั้งหมด</p>
                <p className="text-3xl font-bold text-primary-600">{stats.totalEvents}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/events" className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
                จัดการงาน →
              </Link>
            </div>
          </div>

          {/* Total Photos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">รูปภาพทั้งหมด</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalPhotos.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📸</span>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/photos" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                จัดการรูปภาพ →
              </Link>
            </div>
          </div>

          {/* Processed Photos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">ประมวลผลแล้ว</p>
                <p className="text-3xl font-bold text-green-600">{stats.photosProcessed.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {Math.round((stats.photosProcessed / stats.totalPhotos) * 100)}% ของทั้งหมด
              </p>
            </div>
          </div>

          {/* Pending Photos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">รอประมวลผล</p>
                <p className="text-3xl font-bold text-orange-600">{stats.photosPending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {stats.photosPending > 0 ? 'กำลังประมวลผล...' : 'ไม่มีคิวรอ'}
              </p>
            </div>
          </div>

          {/* Total Searches */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">การค้นหาทั้งหมด</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalSearches.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                วันนี้: {stats.todaySearches} ครั้ง
              </p>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">สถานะระบบ</p>
                <p className="text-3xl font-bold text-green-600">ปกติ</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💚</span>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/admin/monitoring" className="text-sm text-green-600 hover:text-green-700 font-semibold">
                ดูรายละเอียด →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/events/new" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-2">➕</div>
              <p className="font-semibold">สร้างงานใหม่</p>
            </div>
          </Link>

          <Link href="/admin/photos/upload" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-2">📤</div>
              <p className="font-semibold">อัพโหลดรูป</p>
            </div>
          </Link>

          <Link href="/admin/orders" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <p className="font-semibold">คำสั่งซื้อ</p>
            </div>
          </Link>

          <Link href="/admin/settings" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="text-4xl mb-2">⚙️</div>
              <p className="font-semibold">ตั้งค่า</p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">กิจกรรมล่าสุด</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span>✅</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">ประมวลผลรูปเสร็จสิ้น</p>
                  <p className="text-sm text-gray-600">งาน "วิ่งมาราธอน 2024" - 150 รูป</p>
                </div>
                <p className="text-sm text-gray-500">5 นาทีที่แล้ว</p>
              </div>

              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span>📸</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">อัพโหลดรูปใหม่</p>
                  <p className="text-sm text-gray-600">งาน "คอนเสิร์ต Rock Night" - 200 รูป</p>
                </div>
                <p className="text-sm text-gray-500">15 นาทีที่แล้ว</p>
              </div>

              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span>🔍</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">มีการค้นหารูป</p>
                  <p className="text-sm text-gray-600">งาน "งานแต่งงาน" - พบ 12 รูป</p>
                </div>
                <p className="text-sm text-gray-500">30 นาทีที่แล้ว</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span>📅</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">สร้างงานใหม่</p>
                  <p className="text-sm text-gray-600">"งานวิ่งการกุศล 2024"</p>
                </div>
                <p className="text-sm text-gray-500">1 ชั่วโมงที่แล้ว</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
