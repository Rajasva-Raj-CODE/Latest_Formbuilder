import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface FormField {
  id: string
  type: string
  label: string
  required: boolean
  placeholder: string
  options?: string[]
}

export interface FormMetadata {
  title: string
  description: string
  userName: string
}

export interface FormState {
  // Form metadata
  metadata: FormMetadata
  // Form fields
  fields: FormField[]
  // Form values for preview/submission
  formValues: Record<string, any>
  // Validation errors
  errors: Record<string, string>
  // UI state
  isEditingTitle: boolean
  isSubmitting: boolean
  isSubmitted: boolean
  submitError: string | null
  
  // Actions
  updateMetadata: (updates: Partial<FormMetadata>) => void
  addField: (fieldType: string) => void
  updateField: (fieldId: string, updates: Partial<FormField>) => void
  deleteField: (fieldId: string) => void
  reorderFields: (newOrder: FormField[]) => void
  updateFormValue: (fieldId: string, value: any) => void
  setErrors: (errors: Record<string, string>) => void
  clearErrors: (fieldId?: string) => void
  setIsEditingTitle: (isEditing: boolean) => void
  setIsSubmitting: (isSubmitting: boolean) => void
  setIsSubmitted: (isSubmitted: boolean) => void
  setSubmitError: (error: string | null) => void
  resetForm: () => void
  resetFormValues: () => void
}

const generateFieldId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

const createDefaultField = (type: string): FormField => ({
  id: generateFieldId(),
  type,
  label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
  required: false,
  placeholder: `Enter ${type}`,
  options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2'] : undefined
})

export const useFormStore = create<FormState>()(
  devtools(
    (set, get) => ({
      // Initial state
      metadata: {
        title: 'Untitled Form',
        description: '',
        userName: ''
      },
      fields: [],
      formValues: {},
      errors: {},
      isEditingTitle: false,
      isSubmitting: false,
      isSubmitted: false,
      submitError: null,

      // Actions
      updateMetadata: (updates) => set((state) => ({
        metadata: { ...state.metadata, ...updates }
      })),

      addField: (fieldType) => set((state) => ({
        fields: [...state.fields, createDefaultField(fieldType)]
      })),

      updateField: (fieldId, updates) => set((state) => ({
        fields: state.fields.map(field =>
          field.id === fieldId ? { ...field, ...updates } : field
        )
      })),

      deleteField: (fieldId) => set((state) => ({
        fields: state.fields.filter(field => field.id !== fieldId),
        formValues: Object.fromEntries(
          Object.entries(state.formValues).filter(([key]) => key !== fieldId)
        ),
        errors: Object.fromEntries(
          Object.entries(state.errors).filter(([key]) => key !== fieldId)
        )
      })),

      reorderFields: (newOrder) => set({ fields: newOrder }),

      updateFormValue: (fieldId, value) => set((state) => ({
        formValues: { ...state.formValues, [fieldId]: value }
      })),

      setErrors: (errors) => set({ errors }),

      clearErrors: (fieldId) => set((state) => ({
        errors: fieldId 
          ? Object.fromEntries(
              Object.entries(state.errors).filter(([key]) => key !== fieldId)
            )
          : {}
      })),

      setIsEditingTitle: (isEditing) => set({ isEditingTitle: isEditing }),

      setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

      setIsSubmitted: (isSubmitted) => set({ isSubmitted }),

      setSubmitError: (error) => set({ submitError: error }),

      resetForm: () => set((state) => ({
        fields: [],
        formValues: {},
        errors: {},
        isEditingTitle: false,
        isSubmitting: false,
        isSubmitted: false,
        submitError: null
      })),

      resetFormValues: () => set({
        formValues: {},
        errors: {},
        isSubmitted: false,
        submitError: null
      })
    }),
    {
      name: 'form-store'
    }
  )
) 