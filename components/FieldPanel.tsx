'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Type, 
  Mail, 
  Hash, 
  FileText, 
  List, 
  CheckSquare, 
  CircleDot,
  Calendar,
  Image,
  Link
} from 'lucide-react'

interface FieldPanelProps {
  onAddField: (fieldType: string) => void
}

const fieldTypes = [
  { type: 'text', label: 'Text Input', icon: Type, description: 'Single line text input' },
  { type: 'email', label: 'Email', icon: Mail, description: 'Email address input' },
  { type: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
  { type: 'textarea', label: 'Text Area', icon: FileText, description: 'Multi-line text input' },
  { type: 'select', label: 'Dropdown', icon: List, description: 'Select from options' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Multiple choice selection' },
  { type: 'radio', label: 'Radio Buttons', icon: CircleDot, description: 'Single choice selection' },
  { type: 'date', label: 'Date Picker', icon: Calendar, description: 'Date selection' },
  { type: 'file', label: 'File Upload', icon: Image, description: 'File upload input' },
  { type: 'url', label: 'URL', icon: Link, description: 'URL input' }
]

export function FieldPanel({ onAddField }: FieldPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFields = fieldTypes.filter(field =>
    field.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Form Fields</CardTitle>
        <p className="text-sm text-gray-600">Drag fields to your form or click to add</p>
      </CardHeader>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Field Types */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredFields.map((field) => {
          const Icon = field.icon
          return (
            <Card
              key={field.type}
              className="cursor-pointer hover:shadow-md transition-shadow border-gray-200 hover:border-blue-300"
              onClick={() => onAddField(field.type)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{field.label}</h3>
                    <p className="text-sm text-gray-600">{field.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Add Buttons */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Add</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddField('text')}
            className="text-xs"
          >
            Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddField('email')}
            className="text-xs"
          >
            Email
          </Button>
        </div>
      </div>
    </div>
  )
} 