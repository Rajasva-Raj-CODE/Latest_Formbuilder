import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// CSV Export Utilities
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Convert data to CSV format
  const csvContent = convertToCSV(data)
  
  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const convertToCSV = (data: any[]): string => {
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

export const prepareFormsForCSV = (forms: any[]) => {
  return forms.map(form => ({
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
}

export const prepareSubmissionsForCSV = (submissions: any[]) => {
  return submissions.map(submission => {
    let submissionData = {}
    
    try {
      // Parse the JSON data from the submission
      const parsedData = JSON.parse(submission.data)
      submissionData = parsedData
    } catch (error) {
      // If parsing fails, use the raw data
      submissionData = { 'Raw Data': submission.data }
    }
    
    return {
      'Submission ID': submission.id,
      'Form Title': submission.form?.title || '',
      'Form ID': submission.formId,
      'User Name': submission.userName || '',
      'Submission Date': new Date(submission.createdAt).toLocaleDateString(),
      'Submission Time': new Date(submission.createdAt).toLocaleTimeString(),
      ...submissionData
    }
  })
} 

// Excel-friendly CSV export with BOM
export const exportToExcelCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Convert data to CSV format
  const csvContent = convertToCSV(data)
  
  // Add BOM for Excel compatibility (UTF-8 with BOM)
  const bom = '\uFEFF'
  const csvWithBom = bom + csvContent
  
  // Create and download the file
  const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
} 