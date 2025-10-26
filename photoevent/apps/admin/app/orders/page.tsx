'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Order {
  id: number
  user_id: number
  photo_id: number
  amount: number
  payment_status: string
  payment_method: string
  transaction_id: string
  created_at: string
  updated_at: string
}

interface User {
  id: number
  email: string
  name: string
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [searchEmail, setSearchEmail] = useState<string>('')

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      // TODO: Implement orders API endpoint
      // Mock data for now
      const mockOrders: Order[] = [
        {
          id: 1,
          user_id: 1,
          photo_id: 123,
          amount: 199,
          payment_status: 'completed',
          payment_method: 'credit_card',
          transaction_id: 'TXN001',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          user_id: 2,
          photo_id: 456,
          amount: 399,
          payment_status: 'pending',
          payment_method: 'bank_transfer',
          transaction_id: 'TXN002',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      let filtered = mockOrders
      if (statusFilter !== 'all') {
        filtered = mockOrders.filter(o => o.payment_status === statusFilter)
      }
      
      setOrders(filtered)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('ไม่สามารถโหลดคำสั่งซื้อได้')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      // TODO: Implement update status API
      toast.success('อัพเดตสถานะเรียบร้อยแล้ว')
      fetchOrders()
    } catch (error) {
      toast.error('ไม่สามารถอัพเดตสถานะได้')
    }
  }

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    toast.info('กำลังเตรียมไฟล์ CSV...')
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'รอชำระเงิน' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'กำลังดำเนินการ' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'สำเร็จ' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'ล้มเหลว' },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'คืนเงินแล้ว' }
    }[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status }

    return (
      <span className={`px-3 py-1 ${config.bg} ${config.text} text-xs rounded-full font-semibold`}>
        {config.label}
      </span>
    )
  }

  const stats = {
    total: orders.length,
    completed: orders.filter(o => o.payment_status === 'completed').length,
    pending: orders.filter(o => o.payment_status === 'pending').length,
    failed: orders.filter(o => o.payment_status === 'failed').length,
    totalRevenue: orders
      .filter(o => o.payment_status === 'completed')
      .reduce((sum, o) => sum + o.amount, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">จัดการคำสั่งซื้อ</h1>
              <p className="text-gray-600 mt-1">รายการคำสั่งซื้อทั้งหมดในระบบ</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="btn-primary"
            >
              📥 ส่งออก CSV
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">คำสั่งซื้อทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">สำเร็จ</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">รอชำระเงิน</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">ล้มเหลว</p>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">ยอดขายรวม</p>
            <p className="text-2xl font-bold text-primary-600">
              ฿{stats.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {/* Search by Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ค้นหาจากอีเมล
              </label>
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Status Filters */}
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
              สำเร็จ ({stats.completed})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              รอชำระเงิน ({stats.pending})
            </button>
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
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">กำลังโหลด...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">ไม่พบคำสั่งซื้อ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รหัสคำสั่งซื้อ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ลูกค้า
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รูปภาพ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ยอดเงิน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ช่องทาง
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      วันที่
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold text-gray-900">#{order.id}</p>
                        <p className="text-xs text-gray-500">{order.transaction_id}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">User #{order.user_id}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`#`}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Photo #{order.photo_id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-gray-900">
                          ฿{order.amount.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">
                          {order.payment_method === 'credit_card' && '💳 บัตรเครดิต'}
                          {order.payment_method === 'bank_transfer' && '🏦 โอนเงิน'}
                          {order.payment_method === 'promptpay' && '📱 พร้อมเพย์'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.payment_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          {order.payment_status === 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                              className="text-green-600 hover:text-green-900 text-xs font-semibold"
                              title="ยืนยันการชำระเงิน"
                            >
                              ✓ ยืนยัน
                            </button>
                          )}
                          <button
                            onClick={() => {
                              // TODO: Show order details
                              toast.info('ฟีเจอร์กำลังพัฒนา')
                            }}
                            className="text-primary-600 hover:text-primary-900"
                            title="ดูรายละเอียด"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => {
                              // TODO: Resend download link
                              toast.info('ส่งลิงก์ดาวน์โหลดแล้ว')
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="ส่งลิงก์ดาวน์โหลดใหม่"
                          >
                            📧
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">หมายเหตุ</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• ระบบจะส่งลิงก์ดาวน์โหลดอัตโนมัติเมื่อชำระเงินสำเร็จ</li>
                <li>• สำหรับการโอนเงิน ต้องยืนยันการชำระเงินด้วยตนเอง</li>
                <li>• ลิงก์ดาวน์โหลดมีอายุ 7 วัน หลังจากนั้นต้องขอใหม่</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
