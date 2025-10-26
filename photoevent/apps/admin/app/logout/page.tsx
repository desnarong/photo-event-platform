'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // TODO: Clear authentication token/session
    // localStorage.removeItem('auth_token')
    // sessionStorage.clear()

    // Redirect after 2 seconds
    const timer = setTimeout(() => {
      router.push('/')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-6">👋</div>
          <h1 className="text-3xl font-bold mb-4">ออกจากระบบแล้ว</h1>
          <p className="text-gray-600 mb-6">
            ขอบคุณที่ใช้งาน
          </p>
          
          <div className="space-y-3">
            <Link
              href="/admin"
              className="btn-primary inline-block w-full"
            >
              🔓 เข้าสู่ระบบอีกครั้ง
            </Link>
            
            <Link
              href="/"
              className="block text-sm text-gray-600 hover:text-gray-900"
            >
              ← กลับไปหน้าแรก
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-xl">⚠️</span>
            <div className="text-sm text-yellow-800">
              <p className="font-semibold">หมายเหตุ</p>
              <p className="mt-1">
                ระบบยังไม่มีการ authentication 
                หน้านี้เป็นเพียง placeholder สำหรับอนาคต
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
