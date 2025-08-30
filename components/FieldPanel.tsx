'use client'

import { useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui'
import { FieldTypeCard } from './fields'
import { useFormStore } from '@/lib/store'
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

export function FieldPanel() {
  const [searchTerm, setSearchTerm] = useState('')
  const { addField } = useFormStore()

  const filteredFields = fieldTypes.filter(field =>
    field.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddField = (fieldType: string) => {
    addField(fieldType)
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Form Fields</CardTitle>
        <p className="text-sm text-gray-600">Drag fields to your form or click to add</p>
      </CardHeader>

      {/* Search */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Field Types */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {filteredFields.map((field) => (
          <FieldTypeCard
            key={field.type}
            type={field.type}
            label={field.label}
            icon={field.icon}
            description={field.description}
            onClick={() => handleAddField(field.type)}
          />
        ))}
      </div>

      {/* Quick Add Buttons */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Add</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddField('text')}
            className="text-xs"
          >
            Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddField('email')}
            className="text-xs"
          >
            Email
          </Button>
        </div>
      </div>
    </div>
  )
} 