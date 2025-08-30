'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder: string
  options?: string | string[]
}

interface FormPreviewProps {
  formData: {
    id?: string
    title: string
    description: string
    fields: FormField[]
  }
}

export function FormPreview({ formData }: FormPreviewProps) {
  const params = useParams()
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    formData.fields.forEach(field => {
      if (field.required) {
        const value = formValues[field.id]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = 'This field is required'
        }
      }
      
      // Email validation
      if (field.type === 'email' && formValues[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formValues[field.id])) {
          newErrors[field.id] = 'Please enter a valid email address'
        }
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // If no form ID (preview mode), just show success
    if (!params.id) {
      setIsSubmitted(true)
      setFormValues({})
      setErrors({})
      return
    }

    try {
      setIsSubmitting(true)
      setSubmitError(null)

      const response = await fetch(`/api/forms/${params.id}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: formValues,
          userName: formValues.userName || 'Anonymous'
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setFormValues({})
        setErrors({})
      } else {
        const errorData = await response.json()
        setSubmitError(errorData.error || 'Failed to submit form. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const fieldId = field.id
    const value = formValues[fieldId]
    const error = errors[fieldId]

    const commonProps = {
      id: fieldId,
      value: value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleInputChange(fieldId, e.target.value),
      className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`,
      placeholder: field.placeholder
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
          />
        )
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={3}
            value={value || ''}
            onChange={(e) => handleInputChange(fieldId, e.target.value)}
          />
        )
      case 'select':
        return (
          <select
            {...commonProps}
            value={value || ''}
            onChange={(e) => handleInputChange(fieldId, e.target.value)}
          >
            <option value="">Select an option</option>
            {(() => {
              try {
                const options = typeof field.options === 'string' ? JSON.parse(field.options) : field.options;
                return options?.map((option: string, index: number) => (
                  <option key={index} value={option}>{option}</option>
                ));
              } catch (error) {
                console.error('Error parsing options:', error);
                return null;
              }
            })()}
          </select>
        )
      case 'checkbox':
        return (
          <div className="space-y-2">
            {(() => {
              try {
                const options = typeof field.options === 'string' ? JSON.parse(field.options) : field.options;
                return options?.map((option: string, index: number) => (
                  <label key={index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={Array.isArray(value) ? value.includes(option) : false}
                      onChange={(e) => {
                        const currentValues = Array.isArray(value) ? value : []
                        if (e.target.checked) {
                          handleInputChange(fieldId, [...currentValues, option])
                        } else {
                          handleInputChange(fieldId, currentValues.filter(v => v !== option))
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">{option}</span>
                  </label>
                ));
              } catch (error) {
                console.error('Error parsing options:', error);
                return null;
              }
            })()}
          </div>
        )
      case 'radio':
        return (
          <div className="space-y-2">
            {(() => {
              try {
                const options = typeof field.options === 'string' ? JSON.parse(field.options) : field.options;
                return options?.map((option: string, index: number) => (
                  <label key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={fieldId}
                      value={option}
                      checked={value === option}
                      onChange={(e) => handleInputChange(fieldId, e.target.value)}
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">{option}</span>
                  </label>
                ));
              } catch (error) {
                console.error('Error parsing options:', error);
                return null;
              }
            })()}
          </div>
        )
      case 'date':
        return (
          <input
            type="date"
            {...commonProps}
            value={value || ''}
            onChange={(e) => handleInputChange(fieldId, e.target.value)}
          />
        )
      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => handleInputChange(fieldId, e.target.files?.[0] || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )
      default:
        return <div className="text-gray-500">Unknown field type</div>
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Submitted Successfully!</h2>
        <p className="text-gray-600 mb-6">Thank you for your submission. Your response has been recorded.</p>
        <Button onClick={() => {
          setIsSubmitted(false)
          setFormValues({})
          setErrors({})
          setSubmitError(null)
        }}>
          Submit Another Response
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{formData.title}</CardTitle>
          {formData.description && (
            <p className="text-gray-600">{formData.description}</p>
          )}
        </CardHeader>
        <CardContent>
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{submitError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {formData.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {errors[field.id] && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors[field.id]}</span>
                  </div>
                )}
              </div>
            ))}
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Form'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 