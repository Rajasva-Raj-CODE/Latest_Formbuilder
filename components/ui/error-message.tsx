'use client'

import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle className="w-5 h-5" />
        <span className="font-medium">{message}</span>
      </div>
    </div>
  )
} 