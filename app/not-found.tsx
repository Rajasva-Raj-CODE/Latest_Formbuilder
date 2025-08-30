import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
          <p className="text-gray-600">The page you're looking for doesn't exist.</p>
        </div>
        
        <div className="space-y-4">
          <Link href="/">
            <Button className="w-full">
              Go Home
            </Button>
          </Link>
          
          <Link href="/builder">
            <Button variant="outline" className="w-full">
              Create Form
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 