'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function MonitoringPage() {
  const grafanaUrl = process.env.NEXT_PUBLIC_GRAFANA_URL || 'http://localhost:3001'

  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      window.open(grafanaUrl, '_blank')
    }, 3000)

    return () => clearTimeout(timer)
  }, [grafanaUrl])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-6">📊</div>
          <h1 className="text-3xl font-bold mb-4">System Monitoring</h1>
          <p className="text-gray-600 mb-6">
            กำลังเปิด Grafana Dashboard...
          </p>
          
          <div className="space-y-4">
            <a
              href={grafanaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block"
            >
              🔗 เปิด Grafana Dashboard
            </a>
            
            <div className="text-sm text-gray-500">
              หรือไปที่: <code className="bg-gray-100 px-2 py-1 rounded">{grafanaUrl}</code>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <a
                href={`${grafanaUrl}/d/system-overview`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                💻 System Overview
              </a>
              <a
                href={`${grafanaUrl}/d/api-metrics`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                âš¡ API Metrics
              </a>
              <a
                href={`${grafanaUrl}/d/database`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ðŸ—„ï¸ Database
              </a>
              <a
                href={`${grafanaUrl}/d/logs`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                📋 Logs
              </a>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/admin"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← กลับไปหน้า Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">เกี่ยวกับ Monitoring</p>
              <ul className="space-y-1">
                <li>• Grafana แสดงข้อมูลการทำงานของระบบแบบ Real-time</li>
                <li>• ตรวจสอบ CPU, RAM, Disk usage</li>
                <li>• ดู API response time และ error rate</li>
                <li>• ดู logs จาก Loki</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
