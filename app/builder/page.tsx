'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FormBuilder } from '@/components/FormBuilder'
import { FormPreview } from '@/components/FormPreview'
import { FieldPanel } from '@/components/FieldPanel'
import { Button } from '@/components/ui/button'
import { Save, Eye, Settings, Plus, CheckCircle } from 'lucide-react'
import { useFormStore } from '@/lib/store'

export default function BuilderPage() {
  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveMessageType, setSaveMessageType] = useState<'success' | 'error'>('success')
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const editFormId = searchParams.get('edit')

  const {
    metadata,
    fields,
    reorderFields,
    resetForm,
    resetFormValues
  } = useFormStore()

  useEffect(() => {
    if (editFormId) {
      loadForm(editFormId)
    } else {
      // Reset form when creating new
      resetForm()
    }
  }, [editFormId, resetForm])

  const loadForm = async (formId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/forms/${formId}`)
      if (response.ok) {
        const form = await response.json()
        // Transform the form data and update store
        const transformedForm = {
          metadata: {
            title: form.title,
            description: form.description || '',
            userName: form.userName
          },
          fields: form.fields.map((field: any) => ({
            id: field.id,
            type: field.type,
            label: field.label,
            required: field.required,
            placeholder: field.placeholder || '',
            options: field.options ? JSON.parse(field.options) : undefined
          }))
        }
        
        // Update store with loaded data
        useFormStore.setState({
          metadata: transformedForm.metadata,
          fields: transformedForm.fields
        })
      } else {
        console.error('Failed to load form')
        alert('Failed to load form')
      }
    } catch (error) {
      console.error('Error loading form:', error)
      alert('Error loading form')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(field => field.id === active.id)
      const newIndex = fields.findIndex(field => field.id === over.id)
      
      const newFields = [...fields]
      const [movedField] = newFields.splice(oldIndex, 1)
      newFields.splice(newIndex, 0, movedField)
      
      reorderFields(newFields)
    }
  }

  const saveForm = async () => {
    try {
      setSaving(true)
      setSaveMessage(null)
      
      // Validate form data before saving
      if (!metadata.title.trim()) {
        setSaveMessage('Form title is required')
        setSaveMessageType('error')
        return
      }
      
      if (!metadata.userName.trim()) {
        setSaveMessage('Your name is required')
        setSaveMessageType('error')
        return
      }
      
      if (fields.length === 0) {
        setSaveMessage('Please add at least one field to your form')
        setSaveMessageType('error')
        return
      }
      
      const url = editFormId ? `/api/forms/${editFormId}` : '/api/forms'
      const method = editFormId ? 'PUT' : 'POST'
      
      // Prepare data for API
      const dataToSend = editFormId ? {
        id: editFormId,
        title: metadata.title,
        description: metadata.description,
        userName: metadata.userName,
        fields: fields
      } : {
        title: metadata.title,
        description: metadata.description,
        userName: metadata.userName,
        fields: fields
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        const savedForm = await response.json()
        
        if (!editFormId) {
          // If this was a new form, update the URL
          router.replace(`/builder?edit=${savedForm.id}`, { scroll: false })
        }
        
        setSaveMessage('Form saved successfully!')
        setSaveMessageType('success')
        
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        const errorData = await response.json()
        setSaveMessage(errorData.error || 'Failed to save form')
        setSaveMessageType('error')
      }
    } catch (error) {
      console.error('Error saving form:', error)
      setSaveMessage('Network error. Please check your connection and try again.')
      setSaveMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  const publishForm = async () => {
    try {
      setPublishing(true)
      setSaveMessage(null)
      
      // First save the form if it hasn't been saved
      if (!editFormId) {
        setSaveMessage('Saving form first...')
        setSaveMessageType('success')
        
        await saveForm()
        
        // Check if save was successful
        if (!editFormId) {
          setSaveMessage('Failed to save form. Cannot publish.')
          setSaveMessageType('error')
          return
        }
        
        // Wait a bit for the state to update
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Now publish the form
      const response = await fetch(`/api/forms/${editFormId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished: true }),
      })

      if (response.ok) {
        setSaveMessage('Form published successfully! Redirecting to dashboard...')
        setSaveMessageType('success')
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        const errorData = await response.json()
        setSaveMessage(errorData.error || 'Failed to publish form')
        setSaveMessageType('error')
      }
    } catch (error) {
      console.error('Error publishing form:', error)
      setSaveMessage('Network error. Please check your connection and try again.')
      setSaveMessageType('error')
    } finally {
      setPublishing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {editFormId ? 'Edit Form' : 'Create New Form'}
            </h1>
            <div className="flex items-center space-x-2">
              <Button
                variant={activeTab === 'builder' ? 'default' : 'outline'}
                onClick={() => setActiveTab('builder')}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Builder
              </Button>
              <Button
                variant={activeTab === 'preview' ? 'default' : 'outline'}
                onClick={() => setActiveTab('preview')}
                size="sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {saveMessage && (
              <div className={`px-4 py-2 rounded-md text-sm font-medium ${
                saveMessageType === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {saveMessage}
              </div>
            )}
            
            <Button variant="outline" onClick={saveForm} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button 
              onClick={publishForm} 
              disabled={publishing || !editFormId}
            >
              <Settings className="w-4 h-4 mr-2" />
              {publishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Field Panel */}
        <div className="w-80 bg-white border-r border-gray-200 p-4">
          <FieldPanel />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {activeTab === 'builder' ? (
            <div className="flex-1 p-6">
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map(field => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <FormBuilder />
                </SortableContext>
              </DndContext>
            </div>
          ) : (
            <div className="flex-1 p-6">
              <FormPreview />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 