'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MenuItem {
  label: string
  href: string
  icon: string
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'งานอีเว้นท์', href: '/admin/events', icon: '📅' },
  { label: 'รูปภาพ', href: '/admin/photos', icon: '📸' },
  { label: 'คำสั่งซื้อ', href: '/admin/orders', icon: '💰' },
  { label: 'ตั้งค่า', href: '/admin/settings', icon: '⚙️' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="block">
          <h1 className="text-xl font-bold">📸 ThePixStock</h1>
          <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.href)
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-semibold">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <span>👁️</span>
          <span>ดูหน้าลูกค้า</span>
        </Link>
        <Link
          href="/admin/logout"
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <span>🚪</span>
          <span>ออกจากระบบ</span>
        </Link>
      </div>
    </aside>
  )
}
