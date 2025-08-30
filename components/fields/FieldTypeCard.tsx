'use client'

import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface FieldTypeCardProps {
  type: string
  label: string
  icon: LucideIcon
  description: string
  onClick: () => void
}

export function FieldTypeCard({ type, label, icon: Icon, description, onClick }: FieldTypeCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-gray-200 hover:border-blue-300"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{label}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 