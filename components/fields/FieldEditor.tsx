'use client'

import { useState, useEffect } from 'react'
import { FormField } from '@/lib/store'
import { Button, Input } from '@/components/ui'

interface FieldEditorProps {
  field: FormField
  onSave: (updates: Partial<FormField>) => void
  onCancel: () => void
}

export function FieldEditor({ field, onSave, onCancel }: FieldEditorProps) {
  const [editData, setEditData] = useState<FormField>(field)

  useEffect(() => {
    setEditData(field)
  }, [field])

  const handleSave = () => {
    onSave(editData)
  }

  const handleCancel = () => {
    setEditData(field)
    onCancel()
  }

  const renderOptionsEditor = () => {
    if (!['select', 'radio', 'checkbox'].includes(field.type)) return null

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Options:</label>
        {editData.options?.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...(editData.options || [])]
                newOptions[index] = e.target.value
                setEditData({ ...editData, options: newOptions })
              }}
              placeholder={`Option ${index + 1}`}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newOptions = editData.options?.filter((_, i) => i !== index) || []
                setEditData({ ...editData, options: newOptions })
              }}
              className="text-red-600 hover:text-red-700 p-1"
            >
              ×
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newOptions = [...(editData.options || []), `Option ${(editData.options?.length || 0) + 1}`]
            setEditData({ ...editData, options: newOptions })
          }}
          className="w-full"
        >
          Add Option
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Input
        type="text"
        value={editData.label}
        onChange={(e) => setEditData({ ...editData, label: e.target.value })}
        placeholder="Field label"
      />
      
      <Input
        type="text"
        value={editData.placeholder}
        onChange={(e) => setEditData({ ...editData, placeholder: e.target.value })}
        placeholder="Placeholder text"
      />
      
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={editData.required}
          onChange={(e) => setEditData({ ...editData, required: e.target.checked })}
          className="rounded"
        />
        <span className="text-sm text-gray-600">Required field</span>
      </label>
      
      {renderOptionsEditor()}
      
      <div className="flex space-x-2">
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outline" size="sm" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
} 