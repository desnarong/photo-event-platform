'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // TODO: ส่งข้อมูลไป backend
    // ตอนนี้แค่ simulate
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success('ส่งข้อความเรียบร้อยแล้ว! เราจะติดต่อกลับโดยเร็ว')
    
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    })
    setSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">ติดต่อเรา</h1>
          <p className="text-lg text-gray-600">
            มีคำถามหรือข้อเสนอแนะ? เราพร้อมช่วยเหลือคุณ
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">ส่งข้อความถึงเรา</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ-นามสกุล *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="กรุณากรอกชื่อ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อีเมล *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หัวข้อ *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">เลือกหัวข้อ</option>
                  <option value="general">สอบถามทั่วไป</option>
                  <option value="support">ขอความช่วยเหลือ</option>
                  <option value="photographer">สมัครเป็นช่างภาพ</option>
                  <option value="partnership">ความร่วมมือทางธุรกิจ</option>
                  <option value="technical">ปัญหาทางเทคนิค</option>
                  <option value="other">อื่น ๆ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ข้อความ *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="กรุณากรอกข้อความที่ต้องการสอบถาม..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'กำลังส่ง...' : 'ส่งข้อความ'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Email */}
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📧</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">อีเมล</h3>
                  <p className="text-gray-600">support@yourdomain.com</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ตอบกลับภายใน 24 ชั่วโมง
                  </p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">โทรศัพท์</h3>
                  <p className="text-gray-600">02-XXX-XXXX</p>
                  <p className="text-sm text-gray-500 mt-1">
                    จันทร์-ศุกร์ 9:00-18:00 น.
                  </p>
                </div>
              </div>
            </div>

            {/* Line */}
            <div className="card">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">LINE</h3>
                  <p className="text-gray-600">@photoevent</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ตอบกลับเร็วที่สุด
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="card">
              <h3 className="font-semibold text-lg mb-4">ติดตามเราได้ที่</h3>
              <div className="flex gap-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <span className="text-xl">f</span>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-pink-600 text-white rounded-lg flex items-center justify-center hover:bg-pink-700 transition-colors"
                >
                  <span className="text-xl">📷</span>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-sky-500 text-white rounded-lg flex items-center justify-center hover:bg-sky-600 transition-colors"
                >
                  <span className="text-xl">𝕏</span>
                </a>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="card bg-primary-50 border-primary-200">
              <h3 className="font-semibold text-lg mb-2">คำถามที่พบบ่อย</h3>
              <p className="text-gray-700 mb-3">
                ลองดูคำถามที่พบบ่อย อาจมีคำตอบที่คุณต้องการ
              </p>
              <a href="/faq" className="text-primary-600 font-semibold hover:text-primary-700">
                ดู FAQ →
              </a>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="card mt-8 bg-gray-100">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-3">เวลาทำการ</h3>
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div>
                <p className="font-semibold text-gray-700">จันทร์ - ศุกร์</p>
                <p className="text-gray-600">9:00 - 18:00 น.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">เสาร์ - อาทิตย์</p>
                <p className="text-gray-600">10:00 - 16:00 น.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
