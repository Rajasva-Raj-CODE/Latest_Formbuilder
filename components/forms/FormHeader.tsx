'use client'

import { useState } from 'react'
import { FormMetadata } from '@/lib/store'
import { Button, Input } from '@/components/ui'
import { Settings, User } from 'lucide-react'

interface FormHeaderProps {
  metadata: FormMetadata
  onUpdate: (updates: Partial<FormMetadata>) => void
}

export function FormHeader({ metadata, onUpdate }: FormHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(metadata)

  const handleSave = () => {
    onUpdate(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(metadata)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <Input
          type="text"
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          className="text-2xl font-bold"
          placeholder="Form title"
        />
        
        <Input
          type="text"
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          placeholder="Form description"
        />
        
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <Input
            type="text"
            value={editData.userName}
            onChange={(e) => setEditData({ ...editData, userName: e.target.value })}
            placeholder="Your name"
            className="flex-1"
          />
        </div>
        
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

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">{metadata.title}</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      
      {metadata.description && (
        <p className="text-gray-600 mb-2">{metadata.description}</p>
      )}
      
      {metadata.userName && (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <User className="w-4 h-4" />
          <span>Created by: {metadata.userName}</span>
        </div>
      )}
    </div>
  )
} 