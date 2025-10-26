'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { getAuthHeader } from '@/lib/auth';

interface User {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    role: 'customer',
    is_active: true,
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
        { headers: getAuthHeader() }
      );
      const userData = response.data;
      setUser(userData);
      setFormData({
        email: userData.email,
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        role: userData.role,
        is_active: userData.is_active,
        new_password: '',
        confirm_password: ''
      });
    } catch (error: any) {
      console.error('Load user error:', error);
      toast.error('โหลดข้อมูลผู้ใช้ไม่สำเร็จ');
      router.push('/users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate password if changing
    if (formData.new_password || formData.confirm_password) {
      if (formData.new_password !== formData.confirm_password) {
        toast.error('รหัสผ่านใหม่ไม่ตรงกัน');
        return;
      }
      if (formData.new_password.length < 6) {
        toast.error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        return;
      }
    }

    setSaving(true);

    try {
      const updateData: any = {
        email: formData.email,
        full_name: formData.full_name || null,
        phone: formData.phone || null,
        role: formData.role,
        is_active: formData.is_active
      };

      if (formData.new_password) {
        updateData.password = formData.new_password;
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
        updateData,
        { headers: getAuthHeader() }
      );

      toast.success('อัพเดตข้อมูลผู้ใช้สำเร็จ');
      router.push('/users');
    } catch (error: any) {
      console.error('Update user error:', error);
      const message = error.response?.data?.detail || 'อัพเดตข้อมูลไม่สำเร็จ';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    if (!confirm(`คุณต้องการลบผู้ใช้ ${user.email} หรือไม่?\n\n⚠️ การลบจะไม่สามารถย้อนกลับได้`)) {
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`,
        { headers: getAuthHeader() }
      );
      toast.success('ลบผู้ใช้สำเร็จ');
      router.push('/users');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'ลบผู้ใช้ไม่สำเร็จ';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/users"
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">แก้ไขผู้ใช้</h1>
        </div>
        <p className="text-gray-600">อัพเดตข้อมูลผู้ใช้ {user.email}</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user.full_name || 'ไม่มีชื่อ'}
              </h2>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'photographer' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role === 'admin' ? 'ผู้ดูแลระบบ' :
                   user.role === 'photographer' ? 'ช่างภาพ' : 'ลูกค้า'}
                </span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.is_active ? 'ใช้งาน' : 'ระงับ'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 px-4 py-2 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            ลบผู้ใช้
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Info */}
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลบัญชี</h3>
            
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อีเมล <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  บทบาท <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="customer">ลูกค้า</option>
                  <option value="photographer">ช่างภาพ</option>
                  <option value="admin">ผู้ดูแลระบบ</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    บัญชีเปิดใช้งาน
                  </span>
                </label>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  หากปิดการใช้งาน ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้
                </p>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ข้อมูลส่วนตัว</h3>
            
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ-นามสกุล
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="08X-XXX-XXXX"
                />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">เปลี่ยนรหัสผ่าน</h3>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ ถ้าต้องการเปลี่ยนรหัสผ่าน กรุณากรอกข้อมูลด้านล่าง หากไม่ต้องการเปลี่ยน ให้เว้นว่างไว้
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รหัสผ่านใหม่
                  </label>
                  <input
                    type="password"
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ยืนยันรหัสผ่านใหม่
                  </label>
                  <input
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">ข้อมูลบัญชี</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">สร้างเมื่อ:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div>
                <span className="text-gray-600">เข้าสู่ระบบล่าสุด:</span>
                <span className="ml-2 text-gray-900">
                  {user.last_login ? new Date(user.last_login).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'ยังไม่เคยเข้าสู่ระบบ'}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Link
              href="/users"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
