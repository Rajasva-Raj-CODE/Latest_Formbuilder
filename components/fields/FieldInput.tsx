'use client'

import { FormField } from '@/lib/store'

interface FieldInputProps {
  field: FormField
  value: any
  onChange: (value: any) => void
  error?: string
  disabled?: boolean
}

export function FieldInput({ field, value, onChange, error, disabled = false }: FieldInputProps) {
  const commonProps = {
    id: field.id,
    disabled,
    className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      error ? 'border-red-500' : 'border-gray-300'
    }`,
    placeholder: field.placeholder
  }

  const handleChange = (newValue: any) => {
    onChange(newValue)
  }

  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
    case 'url':
      return (
        <input
          type={field.type}
          {...commonProps}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
        />
      )

    case 'textarea':
      return (
        <textarea
          {...commonProps}
          rows={3}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
        />
      )

    case 'select':
      return (
        <select
          {...commonProps}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
        >
          <option value="">Select an option</option>
          {field.options?.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      )

    case 'checkbox':
      return (
        <div className="space-y-2">
          {field.options?.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={Array.isArray(value) ? value.includes(option) : false}
                onChange={(e) => {
                  const currentValues = Array.isArray(value) ? value : []
                  if (e.target.checked) {
                    handleChange([...currentValues, option])
                  } else {
                    handleChange(currentValues.filter(v => v !== option))
                  }
                }}
                disabled={disabled}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">{option}</span>
            </label>
          ))}
        </div>
      )

    case 'radio':
      return (
        <div className="space-y-2">
          {field.options?.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                name={field.id}
                value={option}
                checked={value === option}
                onChange={(e) => handleChange(e.target.value)}
                disabled={disabled}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">{option}</span>
            </label>
          ))}
        </div>
      )

    case 'date':
      return (
        <input
          type="date"
          {...commonProps}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
        />
      )

    case 'file':
      return (
        <input
          type="file"
          onChange={(e) => handleChange(e.target.files?.[0] || null)}
          className={commonProps.className}
          disabled={disabled}
        />
      )

    default:
      return <div className="text-gray-500">Unknown field type</div>
  }
} 