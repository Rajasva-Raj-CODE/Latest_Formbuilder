'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui'
import { AlertCircle } from 'lucide-react'
import { FormPreview } from '@/components/FormPreview'
import { useFormStore } from '@/lib/store'

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder: string
  options?: string
}

interface Form {
  id: string
  title: string
  userName: string
  description: string
  isPublished: boolean
  isActive: boolean
  fields: FormField[]
}

export default function FormPage() {
  const params = useParams()
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { updateMetadata, reorderFields } = useFormStore()

  useEffect(() => {
    if (params.id) {
      fetchForm(params.id as string)
    }
  }, [params.id])

  const fetchForm = async (formId: string) => {
    try {
      console.log('Fetching form with ID:', formId)
      const response = await fetch(`/api/forms/${formId}`)
      
      console.log('Form response status:', response.status)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Form not found')
        } else {
          setError('Failed to load form')
        }
        return
      }

      const data = await response.json()
      console.log('Form data received:', data)
      
      if (!data.isPublished) {
        setError('This form is not published yet')
        return
      }

      if (!data.isActive) {
        setError('This form is no longer active')
        return
      }

      setForm(data)
      
      // Update the Zustand store with the form data
      updateMetadata({
        title: data.title,
        description: data.description,
        userName: data.userName
      })
      
      // Transform and update fields
      const transformedFields = data.fields.map((field: any) => ({
        id: field.id,
        type: field.type,
        label: field.label,
        required: field.required,
        placeholder: field.placeholder || '',
        options: field.options ? JSON.parse(field.options) : undefined
      }))
      
      console.log('Transformed fields:', transformedFields)
      reorderFields(transformedFields)
    } catch (error) {
      console.error('Error fetching form:', error)
      setError('Failed to load form')
    } finally {
      setLoading(false)
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Form Unavailable</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!form) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Form Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-lg text-gray-600">{form.description}</p>
            )}
          </div>

          {/* Form Content */}
          <FormPreview />
        </div>
      </div>
    </div>
  )
} 