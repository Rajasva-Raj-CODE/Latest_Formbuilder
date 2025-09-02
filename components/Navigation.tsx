'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home, Plus, BarChart3, Database, TestTube } from 'lucide-react'
import Image from 'next/image'

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/builder', label: 'Create Form', icon: Plus },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/database-viewer', label: 'Database', icon: Database },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo and Brand Section - Left Side */}
        <div className="flex items-center space-x-3">
          <Link href="/">
          <div className="flex-shrink-0">
            <Image 
              src="/logosoft.svg" 
              alt="Company Logo" 
              width={56} 
              height={56} 
              className="w-24 h-24"
            />
          </div>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-primary leading-tight">FormBuilder</h1>
            <p className="text-xs text-muted-foreground leading-tight">Professional Forms</p>
          </div>
        </div>
        
        {/* Navigation Items - Right Side */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="sm">
            <span className="sr-only">Open menu</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden mt-3 pb-3">
        <div className="flex flex-col space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
} 