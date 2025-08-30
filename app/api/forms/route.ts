import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/forms - Get all forms
export async function GET(request: NextRequest) {
  try {
    const forms = await prisma.form.findMany({
      include: {
        fields: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(forms)
  } catch (error) {
    console.error('Error fetching forms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    )
  }
}

// POST /api/forms - Create a new form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received form data:', body)
    
    const { title, description, userName, fields } = body
    
    console.log('Extracted data:', { title, description, userName, fields })
    console.log('Fields array length:', fields?.length)
    console.log('Fields data:', fields)

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      console.error('No fields provided or fields is not an array')
      return NextResponse.json(
        { error: 'Fields array is required and must contain at least one field' },
        { status: 400 }
      )
    }

    // Create the form
    const form = await prisma.form.create({
      data: {
        title,
        description,
        userName,
        fields: {
          create: fields.map((field: any, index: number) => {
            console.log(`Processing field ${index}:`, field)
            return {
              label: field.label,
              type: field.type,
              required: field.required,
              placeholder: field.placeholder,
              options: field.options ? JSON.stringify(field.options) : null,
              order: index
            }
          })
        }
      },
      include: {
        fields: true
      }
    })

    console.log('Form created successfully:', form)
    return NextResponse.json(form, { status: 201 })
  } catch (error) {
    console.error('Error creating form:', error)
    return NextResponse.json(
      { error: 'Failed to create form', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 