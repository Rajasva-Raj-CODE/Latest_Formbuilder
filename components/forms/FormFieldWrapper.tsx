'use client'

import { FormField } from '@/lib/store'
import { FieldInput } from '../fields'
import { AlertCircle } from 'lucide-react'

interface FormFieldWrapperProps {
  field: FormField
  value: any
  onChange: (value: any) => void
  error?: string
}

export function FormFieldWrapper({ field, value, onChange, error }: FormFieldWrapperProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <FieldInput
        field={field}
        value={value}
        onChange={onChange}
        error={error}
      />
      
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
} 