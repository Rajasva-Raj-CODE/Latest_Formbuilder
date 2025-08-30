'use client'

import { useFormStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui'
import { FormHeader } from '@/components/forms'
import { SortableField } from '@/components/fields'

export function FormBuilder() {
  const {
    metadata,
    fields,
    updateMetadata,
    updateField,
    deleteField
  } = useFormStore()

  return (
    <div className="max-w-4xl mx-auto">
      {/* Form Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <FormHeader
            metadata={metadata}
            onUpdate={updateMetadata}
          />
        </CardContent>
      </Card>

      {/* Form Fields */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No fields added yet</p>
              <p className="text-sm">Drag fields from the left panel or click to add them</p>
            </div>
          </Card>
        ) : (
          fields.map((field) => (
            <SortableField
              key={field.id}
              field={field}
              onUpdate={(updates) => updateField(field.id, updates)}
              onDelete={() => deleteField(field.id)}
            />
          ))
        )}
      </div>
    </div>
  )
} 