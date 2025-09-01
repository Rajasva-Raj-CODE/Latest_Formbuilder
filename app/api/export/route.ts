import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/export - Export data to CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'forms' or 'submissions'
    const format = searchParams.get('format') // 'overview', 'detailed', 'all', 'form'
    const formId = searchParams.get('formId') // optional, for specific form submissions
    
    let data: any[] = []
    let filename = ''
    
    if (type === 'forms') {
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
      
      if (format === 'overview') {
        // Simple overview with basic information
        data = forms.map(form => ({
          'Form ID': form.id,
          'Title': form.title,
          'Description': form.description || '',
          'Creator': form.userName,
          'Status': form.isPublished ? 'Published' : 'Draft',
          'Active': form.isActive ? 'Yes' : 'No',
          'Created Date': new Date(form.createdAt).toLocaleDateString(),
          'Updated Date': new Date(form.updatedAt).toLocaleDateString(),
          'Published Date': form.publishedAt ? new Date(form.publishedAt).toLocaleDateString() : '',
          'Total Submissions': form._count?.submissions || 0,
          'Fields Count': form.fields?.length || 0
        }))
        filename = `forms-overview-${new Date().toISOString().split('T')[0]}`
      } else {
        // Detailed export with field information
        data = forms.map(form => {
          const baseData = {
            'Form ID': form.id,
            'Title': form.title,
            'Description': form.description || '',
            'Creator': form.userName,
            'Status': form.isPublished ? 'Published' : 'Draft',
            'Active': form.isActive ? 'Yes' : 'No',
            'Created Date': new Date(form.createdAt).toLocaleDateString(),
            'Updated Date': new Date(form.updatedAt).toLocaleDateString(),
            'Published Date': form.publishedAt ? new Date(form.publishedAt).toLocaleDateString() : '',
            'Total Submissions': form._count?.submissions || 0,
            'Fields Count': form.fields?.length || 0
          }
          
          // Add field details
          const fieldData: any = {}
          form.fields.forEach((field, index) => {
            fieldData[`Field ${index + 1} - Label`] = field.label
            fieldData[`Field ${index + 1} - Type`] = field.type
            fieldData[`Field ${index + 1} - Required`] = field.required ? 'Yes' : 'No'
            fieldData[`Field ${index + 1} - Order`] = field.order
            if (field.placeholder) {
              fieldData[`Field ${index + 1} - Placeholder`] = field.placeholder
            }
            if (field.options) {
              fieldData[`Field ${index + 1} - Options`] = field.options
            }
          })
          
          return { ...baseData, ...fieldData }
        })
        filename = `forms-detailed-${new Date().toISOString().split('T')[0]}`
      }
    } else if (type === 'submissions') {
      let submissions
      
      if (format === 'form' && formId) {
        // Get submissions for a specific form
        submissions = await prisma.formSubmission.findMany({
          where: { formId },
          include: {
            form: {
              select: { title: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        filename = `form-submissions-${formId}-${new Date().toISOString().split('T')[0]}`
      } else {
        // Get all submissions
        submissions = await prisma.formSubmission.findMany({
          include: {
            form: {
              select: { title: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        filename = `all-submissions-${new Date().toISOString().split('T')[0]}`
      }
      
      data = submissions.map(submission => {
        const baseData = {
          'Submission ID': submission.id,
          'Form Title': submission.form?.title || '',
          'Form ID': submission.formId,
          'User Name': submission.userName || 'Anonymous',
          'Submission Date': new Date(submission.createdAt).toLocaleDateString(),
          'Submission Time': new Date(submission.createdAt).toLocaleTimeString(),
          'Submission DateTime': new Date(submission.createdAt).toLocaleString()
        }
        
        let submissionData = {}
        try {
          // Parse the JSON data from the submission
          const parsedData = JSON.parse(submission.data)
          
          // Flatten nested objects and arrays for better CSV structure
          submissionData = flattenObject(parsedData)
        } catch (error) {
          // If parsing fails, use the raw data
          submissionData = { 'Raw Data': submission.data }
        }
        
        return { ...baseData, ...submissionData }
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid export type. Use "forms" or "submissions"' },
        { status: 400 }
      )
    }
    
    if (data.length === 0) {
      return NextResponse.json(
        { error: 'No data to export' },
        { status: 404 }
      )
    }
    
    // Convert to CSV
    const csvContent = convertToCSV(data)
    
    // Add BOM for Excel compatibility (UTF-8 with BOM)
    const bom = '\uFEFF'
    const csvWithBom = bom + csvContent
    
    // Return CSV file
    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    })
    
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

function flattenObject(obj: any, prefix = ''): any {
  const flattened: any = {}
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key]
      const newKey = prefix ? `${prefix} - ${key}` : key
      
      if (value === null || value === undefined) {
        flattened[newKey] = ''
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenObject(value, newKey))
      } else if (Array.isArray(value)) {
        // Handle arrays by joining with semicolons
        flattened[newKey] = value.map(item => 
          typeof item === 'object' ? JSON.stringify(item) : String(item)
        ).join('; ')
      } else {
        flattened[newKey] = value
      }
    }
  }
  
  return flattened
}

function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return ''

  // Get headers from the first object
  const headers = Object.keys(data[0])
  
  // Create CSV header row
  const csvRows = [headers.join(',')]
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      // Handle different data types and escape commas/quotes
      if (value === null || value === undefined) {
        return ''
      }
      
      let stringValue = String(value)
      
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        stringValue = `"${stringValue.replace(/"/g, '""')}"`
      }
      
      return stringValue
    })
    csvRows.push(values.join(','))
  }
  
  return csvRows.join('\n')
} 