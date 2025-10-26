import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Event Photo Platform - ค้นหารูปภาพของคุณ',
  description: 'ระบบค้นหาและซื้อรูปภาพจากงานอีเว้นท์ต่าง ๆ ด้วยเทคโนโลยี AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Toaster position="top-right" />
        <footer className="bg-gray-900 text-white py-8 mt-20">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 Event Photo Platform. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
