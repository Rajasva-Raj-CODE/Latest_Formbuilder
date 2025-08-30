import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/forms/[id]/submissions - Get all submissions for a form
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submissions = await prisma.formSubmission.findMany({
      where: { formId: params.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

// POST /api/forms/[id]/submissions - Submit a form
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { data, userName } = body

    // Check if form exists and is published
    const form = await prisma.form.findUnique({
      where: { id: params.id }
    })

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }

    if (!form.isPublished) {
      return NextResponse.json(
        { error: 'Form is not published' },
        { status: 400 }
      )
    }

    // Create submission
    const submission = await prisma.formSubmission.create({
      data: {
        formId: params.id,
        userName,
        data: JSON.stringify(data)
      }
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('Error creating submission:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
} 