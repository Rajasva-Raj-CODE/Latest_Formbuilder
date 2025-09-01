import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/Navigation'
import ToastContainer from '@/components/ToastContainer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Form Builder',
  description: 'Build beautiful forms with drag and drop interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
        <ToastContainer />
      </body>
    </html>
  )
} 