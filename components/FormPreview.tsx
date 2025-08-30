'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { Loader2 } from 'lucide-react'
import { useFormStore } from '@/lib/store'
import { FormFieldWrapper } from './forms'
import { SuccessMessage, ErrorMessage } from './ui'

export function FormPreview() {
  const params = useParams()
  const {
    metadata,
    fields,
    formValues,
    errors,
    isSubmitted,
    isSubmitting,
    submitError,
    updateFormValue,
    setErrors,
    clearErrors,
    setIsSubmitting,
    setIsSubmitted,
    setSubmitError,
    resetFormValues
  } = useFormStore()

  const handleInputChange = (fieldId: string, value: any) => {
    updateFormValue(fieldId, value)
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      clearErrors(fieldId)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    fields.forEach(field => {
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
      resetFormValues()
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
        resetFormValues()
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

  if (isSubmitted) {
    return (
      <SuccessMessage
        title="Form Submitted Successfully!"
        message="Thank you for your submission. Your response has been recorded."
        buttonText="Submit Another Response"
        onButtonClick={() => {
          setIsSubmitted(false)
          resetFormValues()
        }}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{metadata.title}</CardTitle>
          {metadata.description && (
            <p className="text-gray-600">{metadata.description}</p>
          )}
        </CardHeader>
        <CardContent>
          {submitError && (
            <ErrorMessage message={submitError} />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((field) => (
              <FormFieldWrapper
                key={field.id}
                field={field}
                value={formValues[field.id]}
                onChange={(value) => handleInputChange(field.id, value)}
                error={errors[field.id]}
              />
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