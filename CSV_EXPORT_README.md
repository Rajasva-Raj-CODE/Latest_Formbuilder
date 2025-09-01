# CSV Export Functionality

This project now includes comprehensive CSV export functionality for both forms and submissions data.

## Features

### 1. Dashboard Export Options
- **Export Forms**: Download all forms data as CSV
- **Export All Submissions**: Download all form submissions as CSV
- **Individual Form Export**: Export submissions for a specific form

### 2. Excel Compatibility
- UTF-8 with BOM (Byte Order Mark) for proper Excel opening
- Proper CSV formatting with escaped quotes and commas
- Structured data with clear column headers

## How to Use

### Export Forms
1. Go to the Dashboard page
2. Click the "Export Data" dropdown button
3. Select "Export Forms"
4. The CSV file will download automatically
5. Open in Excel or any spreadsheet application

### Export All Submissions
1. Go to the Dashboard page
2. Click the "Export Data" dropdown button
3. Select "Export All Submissions"
4. The CSV file will download automatically
5. Open in Excel or any spreadsheet application

### Export Individual Form Submissions
1. Go to the Dashboard page
2. Find the form you want to export
3. Click the "Export" button next to that form
4. The CSV file will download automatically
5. Open in Excel or any spreadsheet application

## CSV Structure

### Forms Export Columns
- Form ID
- Title
- Description
- Creator
- Status (Published/Draft)
- Active (Yes/No)
- Created Date
- Updated Date
- Published Date
- Total Submissions
- Fields Count

### Submissions Export Columns
- Submission ID
- Form Title
- Form ID
- User Name
- Submission Date
- Submission Time
- [Dynamic fields based on form structure]

## Technical Details

### API Endpoints
- `GET /api/export?type=forms` - Export all forms
- `GET /api/export?type=submissions` - Export all submissions
- `GET /api/export?type=submissions&formId={id}` - Export submissions for specific form

### File Naming
Files are automatically named with the current date:
- `forms-export-YYYY-MM-DD.csv`
- `all-submissions-YYYY-MM-DD.csv`
- `form-submissions-{formId}-YYYY-MM-DD.csv`

### Excel Compatibility
- UTF-8 encoding with BOM ensures proper character display
- Proper CSV escaping for special characters
- Structured headers for easy data analysis

## Browser Compatibility
- Modern browsers with download support
- Automatic file download
- No additional software required

## Troubleshooting

### CSV Not Opening in Excel
1. Ensure the file has a `.csv` extension
2. Try opening Excel first, then use File > Open
3. Check that the file encoding is UTF-8

### Special Characters Not Displaying
- The BOM ensures proper UTF-8 encoding
- If issues persist, try opening in a text editor first

### Large File Downloads
- For large datasets, the export may take a moment
- Ensure you have sufficient disk space
- Check browser download settings 