'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Settings {
  photo_price: number
  photo_max_size_mb: number
  watermark_text: string
  watermark_enabled: boolean
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_from_email: string
  payment_stripe_key: string
  payment_omise_key: string
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'payment' | 'email'>('general')
  const [settings, setSettings] = useState<Settings>({
    photo_price: 199,
    photo_max_size_mb: 50,
    watermark_text: 'ThePixStock',
    watermark_enabled: true,
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_from_email: '',
    payment_stripe_key: '',
    payment_omise_key: ''
  })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      // TODO: Implement settings API endpoint
      // For now, load from mock data
      const mockSettings: Settings = {
        photo_price: 199,
        photo_max_size_mb: 50,
        watermark_text: 'ThePixStock',
        watermark_enabled: true,
        smtp_host: '',
        smtp_port: 587,
        smtp_user: '',
        smtp_from_email: '',
        payment_stripe_key: '',
        payment_omise_key: ''
      }
      setSettings(mockSettings)
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('ไม่สามารถโหลดการตั้งค่าได้')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      // TODO: Implement save settings API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว')
    } catch (error) {
      toast.error('ไม่สามารถบันทึกการตั้งค่าได้')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
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
              href="/admin" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← กลับ
            </Link>
            <div>
              <h1 className="text-3xl font-bold">ตั้งค่าระบบ</h1>
              <p className="text-gray-600 mt-1">กำหนดค่าต่างๆ ของระบบ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'general'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ⚙️ ทั่วไป
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'payment'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  💳 การชำระเงิน
                </button>
                <button
                  onClick={() => setActiveTab('email')}
                  className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'email'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📧 อีเมล
                </button>
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 space-y-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <>
                  <div>
                    <h2 className="text-xl font-bold mb-4">การตั้งค่าทั่วไป</h2>
                  </div>

                  {/* Photo Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ราคารูปภาพ (บาท)
                    </label>
                    <input
                      type="number"
                      name="photo_price"
                      value={settings.photo_price}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      ราคาต่อรูปสำหรับลูกค้า
                    </p>
                  </div>

                  {/* Max File Size */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ขนาดไฟล์สูงสุด (MB)
                    </label>
                    <input
                      type="number"
                      name="photo_max_size_mb"
                      value={settings.photo_max_size_mb}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      step="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      ขนาดไฟล์สูงสุดที่อนุญาตให้อัพโหลด
                    </p>
                  </div>

                  {/* Watermark */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        name="watermark_enabled"
                        checked={settings.watermark_enabled}
                        onChange={handleCheckboxChange}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <label className="text-sm font-semibold text-gray-700">
                        เปิดใช้งานลายน้ำ
                      </label>
                    </div>
                    {settings.watermark_enabled && (
                      <input
                        type="text"
                        name="watermark_text"
                        value={settings.watermark_text}
                        onChange={handleChange}
                        placeholder="ข้อความลายน้ำ"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      ข้อความที่จะแสดงบนรูป preview
                    </p>
                  </div>
                </>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <>
                  <div>
                    <h2 className="text-xl font-bold mb-4">การตั้งค่าการชำระเงิน</h2>
                  </div>

                  {/* Stripe */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span>💳</span> Stripe
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Publishable Key
                        </label>
                        <input
                          type="text"
                          name="payment_stripe_key"
                          value={settings.payment_stripe_key}
                          onChange={handleChange}
                          placeholder="pk_test_..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                        />
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          ⚠️ อย่าลืมตั้งค่า Secret Key ใน environment variables (.env)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Omise */}
                  <div className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span>🏦</span> Omise (Thailand)
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Public Key
                        </label>
                        <input
                          type="text"
                          name="payment_omise_key"
                          value={settings.payment_omise_key}
                          onChange={handleChange}
                          placeholder="pkey_test_..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                        />
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          ⚠️ อย่าลืมตั้งค่า Secret Key ใน environment variables (.env)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PromptPay */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <span>📱</span> PromptPay
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        💡 สำหรับ PromptPay ให้ใช้ระบบ QR Code โดยตรง ไม่ต้องตั้งค่าเพิ่มเติม
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Email Settings */}
              {activeTab === 'email' && (
                <>
                  <div>
                    <h2 className="text-xl font-bold mb-4">การตั้งค่าอีเมล (SMTP)</h2>
                  </div>

                  {/* SMTP Host */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      name="smtp_host"
                      value={settings.smtp_host}
                      onChange={handleChange}
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* SMTP Port */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      name="smtp_port"
                      value={settings.smtp_port}
                      onChange={handleChange}
                      placeholder="587"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* SMTP User */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      name="smtp_user"
                      value={settings.smtp_user}
                      onChange={handleChange}
                      placeholder="your-email@gmail.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* From Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      name="smtp_from_email"
                      value={settings.smtp_from_email}
                      onChange={handleChange}
                      placeholder="noreply@yourdomain.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Test Email Button */}
                  <div>
                    <button
                      onClick={() => toast.info('ส่งอีเมลทดสอบแล้ว')}
                      className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                    >
                      📧 ส่งอีเมลทดสอบ
                    </button>
                  </div>

                  {/* Info */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 font-semibold mb-2">
                      ⚠️ สำหรับ Gmail
                    </p>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>• ต้องเปิด "Less secure app access" หรือใช้ App Password</li>
                      <li>• แนะนำให้ใช้ App Password แทน รหัสผ่านจริง</li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={fetchSettings}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary min-w-[120px]"
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังบันทึก...</span>
                  </div>
                ) : (
                  '✓ บันทึก'
                )}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">หมายเหตุ</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• การตั้งค่าบางส่วนอาจต้องรีสตาร์ทระบบเพื่อให้มีผล</li>
                  <li>• Secret Keys ควรเก็บใน environment variables ไม่ใช่ในฐานข้อมูล</li>
                  <li>• ทดสอบการตั้งค่าก่อนใช้งานจริง</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
