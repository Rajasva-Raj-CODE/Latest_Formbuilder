'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FormField } from '@/lib/store'
import { Card, CardContent, Button } from '@/components/ui'
import { Trash2, GripVertical, Settings } from 'lucide-react'
import { FieldInput, FieldEditor } from './index'

interface SortableFieldProps {
  field: FormField
  onUpdate: (updates: Partial<FormField>) => void
  onDelete: () => void
}

export function SortableField({ field, onUpdate, onDelete }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const [isEditing, setIsEditing] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSave = (updates: Partial<FormField>) => {
    onUpdate(updates)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
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
            <FieldEditor
              field={field}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <FieldInput
                field={field}
                value=""
                onChange={() => {}}
                disabled={true}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 