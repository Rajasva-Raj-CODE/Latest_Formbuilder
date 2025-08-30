'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, GripVertical, Settings, User } from 'lucide-react'

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder: string
  options?: string[]
}

interface FormBuilderProps {
  formData: {
    title: string
    description: string
    userName: string
    fields: FormField[]
  }
  onUpdateField: (fieldId: string, updates: Partial<FormField>) => void
  onUpdateFormMetadata: (updates: Partial<{ title: string; description: string; userName: string }>) => void
  onDeleteField: (fieldId: string) => void
}

function SortableField({ field, onUpdate, onDelete }: {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(field)

  const handleSave = () => {
    onUpdate(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(field)
    setIsEditing(false)
  }

  const renderFieldInput = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'url':
        return (
          <input
            type={field.type}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
        )
      case 'textarea':
        return (
          <textarea
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled
          />
        )
      case 'select':
        return (
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" disabled>
            <option>Select an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        )
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input type="checkbox" disabled />
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
                <input type="radio" name={field.id} disabled />
                <span className="text-sm text-gray-600">{option}</span>
              </label>
            ))}
          </div>
        )
      case 'date':
        return (
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
        )
      case 'file':
        return (
          <input
            type="file"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
        )
      default:
        return <div className="text-gray-500">Unknown field type</div>
    }
  }

  const renderOptionsEditor = () => {
    if (!['select', 'radio', 'checkbox'].includes(field.type)) return null

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Options:</label>
        {editData.options?.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={option}
              onChange={(e) => {
                const newOptions = [...(editData.options || [])]
                newOptions[index] = e.target.value
                setEditData({ ...editData, options: newOptions })
              }}
              className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-sm"
              placeholder={`Option ${index + 1}`}
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
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        <CardContent className="p-4">
          {/* Field Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
              >
                <GripVertical className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {field.type.toUpperCase()}
              </span>
              {field.required && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                  Required
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Field Content */}
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editData.label}
                onChange={(e) => setEditData({ ...editData, label: e.target.value })}
                placeholder="Field label"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={editData.placeholder}
                onChange={(e) => setEditData({ ...editData, placeholder: e.target.value })}
                placeholder="Placeholder text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderFieldInput()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function FormBuilder({ formData, onUpdateField, onUpdateFormMetadata, onDeleteField }: FormBuilderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(formData.title)
  const [description, setDescription] = useState(formData.description)
  const [userName, setUserName] = useState(formData.userName)

  const handleTitleSave = () => {
    onUpdateFormMetadata({ title, description, userName })
    setIsEditingTitle(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Form Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {isEditingTitle ? (
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Form title"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Form description"
                rows={2}
              />
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleTitleSave}>
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setTitle(formData.title)
                    setDescription(formData.description)
                    setUserName(formData.userName)
                    setIsEditingTitle(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{formData.title}</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              {formData.description && (
                <p className="text-gray-600 mb-2">{formData.description}</p>
              )}
              {formData.userName && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  <span>Created by: {formData.userName}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Fields */}
      <div className="space-y-4">
        {formData.fields.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No fields added yet</p>
              <p className="text-sm">Drag fields from the left panel or click to add them</p>
            </div>
          </Card>
        ) : (
          formData.fields.map((field) => (
            <SortableField
              key={field.id}
              field={field}
              onUpdate={(updates) => onUpdateField(field.id, updates)}
              onDelete={() => onDeleteField(field.id)}
            />
          ))
        )}
      </div>
    </div>
  )
} 