import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/forms/[id] - Get a specific form
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const form = await prisma.form.findUnique({
      where: { id: params.id },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(form)
  } catch (error) {
    console.error('Error fetching form:', error)
    return NextResponse.json(
      { error: 'Failed to fetch form' },
      { status: 500 }
    )
  }
}

// PUT /api/forms/[id] - Update a form
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, userName, fields } = body

    // First, delete existing fields
    await prisma.formField.deleteMany({
      where: { formId: params.id }
    })

    // Update the form and recreate fields
    const form = await prisma.form.update({
      where: { id: params.id },
      data: {
        title,
        description,
        userName,
        fields: {
          create: fields.map((field: any, index: number) => ({
            label: field.label,
            type: field.type,
            required: field.required,
            placeholder: field.placeholder,
            options: field.options ? JSON.stringify(field.options) : null,
            order: index
          }))
        }
      },
      include: {
        fields: true
      }
    })

    return NextResponse.json(form)
  } catch (error) {
    console.error('Error updating form:', error)
    return NextResponse.json(
      { error: 'Failed to update form' },
      { status: 500 }
    )
  }
}

// DELETE /api/forms/[id] - Delete a form
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete the form (fields and submissions will be deleted due to cascade)
    await prisma.form.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Form deleted successfully' })
  } catch (error) {
    console.error('Error deleting form:', error)
    return NextResponse.json(
      { error: 'Failed to delete form' },
      { status: 500 }
    )
  }
} 