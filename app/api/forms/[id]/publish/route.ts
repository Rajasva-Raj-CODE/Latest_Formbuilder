import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/forms/[id]/publish - Publish a form
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { isPublished } = body

    const form = await prisma.form.update({
      where: { id: params.id },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : null
      },
      include: {
        fields: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(form)
  } catch (error) {
    console.error('Error publishing form:', error)
    return NextResponse.json(
      { error: 'Failed to publish form' },
      { status: 500 }
    )
  }
} 