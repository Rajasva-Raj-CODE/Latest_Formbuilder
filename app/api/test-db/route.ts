import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/test-db - Test database connection
export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Database connection test result:', result)
    
    // Test if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('Available tables:', tables)
    
    // Test form creation
    const testForm = await prisma.form.create({
      data: {
        title: 'Test Form ' + Date.now(),
        description: 'Test description',
        userName: 'Test User',
        fields: {
          create: [
            {
              label: 'Test Field',
              type: 'text',
              required: true,
              placeholder: 'Test placeholder',
              order: 0
            }
          ]
        }
      },
      include: {
        fields: true
      }
    })
    
    console.log('Test form created successfully:', testForm)
    
    // Clean up test data
    await prisma.form.delete({
      where: { id: testForm.id }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Database connection working',
      tables: tables,
      testForm: testForm
    })
    
  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 