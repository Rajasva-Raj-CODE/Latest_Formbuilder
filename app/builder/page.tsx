'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { FormBuilder } from '@/components/FormBuilder'
import { FormPreview } from '@/components/FormPreview'
import { FieldPanel } from '@/components/FieldPanel'
import { Button } from '@/components/ui/button'
import { Save, Eye, Settings, Plus, User, CheckCircle } from 'lucide-react'

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder: string
  options?: string[]
}

interface FormData {
  id?: string
  title: string
  description: string
  userName: string
  fields: FormField[]
  isPublished?: boolean
  publishedAt?: string
}

export default function BuilderPage() {
  const [activeTab, setActiveTab] = useState<'builder' | 'preview'>('builder')
  const [formData, setFormData] = useState<FormData>({
    id: '',
    title: 'Untitled Form',
    description: '',
    userName: '',
    fields: []
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveMessageType, setSaveMessageType] = useState<'success' | 'error'>('success')
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const editFormId = searchParams.get('edit')

  useEffect(() => {
    if (editFormId) {
      loadForm(editFormId)
    }
  }, [editFormId])

  const loadForm = async (formId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/forms/${formId}`)
      if (response.ok) {
        const form = await response.json()
        // Transform the form data to match our local structure
        const transformedForm: FormData = {
          id: form.id,
          title: form.title,
          description: form.description || '',
          userName: form.userName,
          isPublished: form.isPublished,
          publishedAt: form.publishedAt,
          fields: form.fields.map((field: any) => ({
            id: field.id,
            type: field.type,
            label: field.label,
            required: field.required,
            placeholder: field.placeholder || '',
            options: field.options ? JSON.parse(field.options) : undefined
          }))
        }
        setFormData(transformedForm)
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
      const oldIndex = formData.fields.findIndex(field => field.id === active.id)
      const newIndex = formData.fields.findIndex(field => field.id === over.id)
      
      const newFields = [...formData.fields]
      const [movedField] = newFields.splice(oldIndex, 1)
      newFields.splice(newIndex, 0, movedField)
      
      setFormData(prev => ({
        ...prev,
        fields: newFields
      }))
    }
  }

  const addField = (fieldType: string) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: fieldType,
      label: `New ${fieldType}`,
      required: false,
      placeholder: '',
      options: fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox' ? ['Option 1'] : undefined
    }
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  const updateFormMetadata = (updates: Partial<Pick<FormData, 'title' | 'description' | 'userName'>>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }))
  }

  const deleteField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }))
  }

  const saveForm = async () => {
    try {
      setSaving(true)
      setSaveMessage(null)
      
      console.log('Saving form with data:', formData)
      console.log('Fields array:', formData.fields)
      console.log('Fields length:', formData.fields.length)
      console.log('First field example:', formData.fields[0])
      
      // Validate form data before saving
      if (!formData.title.trim()) {
        setSaveMessage('Form title is required')
        setSaveMessageType('error')
        return
      }
      
      if (!formData.userName.trim()) {
        setSaveMessage('Your name is required')
        setSaveMessageType('error')
        return
      }
      
      if (formData.fields.length === 0) {
        setSaveMessage('Please add at least one field to your form')
        setSaveMessageType('error')
        return
      }
      
      const url = formData.id ? `/api/forms/${formData.id}` : '/api/forms'
      const method = formData.id ? 'PUT' : 'POST'
      
      // Prepare data for API (remove id if it's empty for new forms)
      const dataToSend = formData.id ? formData : {
        title: formData.title,
        description: formData.description,
        userName: formData.userName,
        fields: formData.fields
      }
      
      console.log('Sending data to:', url, 'with method:', method)
      console.log('Data being sent:', dataToSend)
      console.log('Fields being sent:', dataToSend.fields)
      console.log('Fields type:', typeof dataToSend.fields)
      console.log('Fields is array:', Array.isArray(dataToSend.fields))
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const savedForm = await response.json()
        console.log('Form saved successfully:', savedForm)
        
        if (!formData.id) {
          // If this was a new form, update the form data with the real ID
          setFormData(prev => ({ ...prev, id: savedForm.id }))
          // Update URL without redirecting
          router.replace(`/builder?edit=${savedForm.id}`, { scroll: false })
        } else {
          // Update the form data with the latest from server
          setFormData(prev => ({ 
            ...prev, 
            title: savedForm.title,
            description: savedForm.description,
            userName: savedForm.userName,
            isPublished: savedForm.isPublished,
            publishedAt: savedForm.publishedAt
          }))
        }
        
        setSaveMessage('Form saved successfully!')
        setSaveMessageType('success')
        
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        const errorData = await response.json()
        console.error('Save failed:', errorData)
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
      
      console.log('Publishing form. Current formData:', formData)
      
      // First save the form if it hasn't been saved
      if (!formData.id) {
        setSaveMessage('Saving form first...')
        setSaveMessageType('success')
        
        console.log('Form has no ID, saving first...')
        
        // Save the form and wait for it to complete
        await saveForm()
        
        // Check if save was successful
        if (!formData.id) {
          console.log('Save failed, cannot publish')
          setSaveMessage('Failed to save form. Cannot publish.')
          setSaveMessageType('error')
          return
        }
        
        console.log('Form saved with ID:', formData.id)
        
        // Wait a bit for the state to update
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      console.log('Publishing form with ID:', formData.id)

      // Now publish the form
      const response = await fetch(`/api/forms/${formData.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished: true }),
      })

      console.log('Publish response status:', response.status)
      console.log('Publish response ok:', response.ok)

      if (response.ok) {
        const publishedForm = await response.json()
        console.log('Form published successfully:', publishedForm)
        
        setFormData(prev => ({ ...prev, isPublished: true, publishedAt: publishedForm.publishedAt }))
        
        setSaveMessage('Form published successfully! Redirecting to dashboard...')
        setSaveMessageType('success')
        
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        const errorData = await response.json()
        console.error('Publish failed:', errorData)
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
            
            <Button 
              variant="outline" 
              onClick={() => {
                // Test: Add a test field
                addField('text')
                setFormData(prev => ({
                  ...prev,
                  title: 'Test Form ' + Date.now(),
                  userName: 'Test User',
                  description: 'Test description'
                }))
              }}
              className="text-blue-600"
            >
              Test: Add Sample Data
            </Button>
            
            <Button variant="outline" onClick={saveForm} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button 
              onClick={publishForm} 
              disabled={publishing || !formData.id}
              className={formData.isPublished ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {formData.isPublished ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Published
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  {publishing ? 'Publishing...' : 'Publish'}
                </>
              )}
            </Button>
          </div>
          
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Field Panel */}
        <div className="w-80 bg-white border-r border-gray-200 p-4">
          <FieldPanel onAddField={addField} />
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
                  items={formData.fields.map(field => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <FormBuilder
                    formData={formData}
                    onUpdateField={updateField}
                    onUpdateFormMetadata={updateFormMetadata}
                    onDeleteField={deleteField}
                  />
                </SortableContext>
              </DndContext>
            </div>
          ) : (
            <div className="flex-1 p-6">
              <FormPreview formData={formData} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 