'use client'

import { Button } from './index'

interface SuccessMessageProps {
  title: string
  message: string
  buttonText: string
  onButtonClick: () => void
}

export function SuccessMessage({ title, message, buttonText, onButtonClick }: SuccessMessageProps) {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <Button onClick={onButtonClick}>
        {buttonText}
      </Button>
    </div>
  )
} 