# AI Form Builder

A modern, drag-and-drop form builder built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎨 **Drag & Drop Form Builder** - Intuitive interface for creating forms
- 📱 **Responsive Design** - Works on all devices
- 🔧 **Multiple Field Types** - Text, email, number, textarea, select, checkbox, radio, date, file
- 💾 **Save & Publish** - Save drafts and publish forms when ready
- 📊 **Form Submissions** - Collect and view form responses
- 🔗 **Shareable Links** - Easy form sharing with copyable links
- 📈 **Dashboard** - Overview of all forms and submissions

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd aigenformbuilder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Update `.env.local` with your database connection:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
```

5. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### 1. Create a Form

1. Go to `/builder` page
2. Add form fields using the left sidebar
3. Configure field properties (label, required, placeholder, options)
4. Drag and drop to reorder fields
5. Click **Save** to save your form as a draft

### 2. Publish a Form

1. After saving, click **Publish** button
2. The form will be published and accessible to users
3. You'll be redirected to the dashboard

### 3. Share Your Form

1. Go to the dashboard
2. Find your published form
3. Click **Copy Link** to copy the form URL
4. Share the link with users

### 4. View Submissions

1. In the dashboard, see submission counts for each form
2. Use the **View** button to see the live form
3. Submissions are stored in the database

## Form Workflow

```
Create Form → Save Draft → Preview → Publish → Share Link → Collect Submissions
```

## Troubleshooting

### Form Submission Not Working

**Problem**: Users can't submit forms
**Solution**: 
1. Make sure the form is published (`isPublished: true`)
2. Check the browser console for errors
3. Verify the API endpoint `/api/forms/[id]/submissions` is working
4. Test with the `/test` page

### Copy Link Not Working

**Problem**: Can't copy form links to clipboard
**Solution**:
1. The system now has fallback methods for clipboard access
2. If clipboard fails, a prompt will show the link for manual copying
3. Make sure you're using HTTPS (clipboard API requires secure context)

### Form Status Not Visible

**Problem**: Can't see if form is saved/published
**Solution**:
1. Check the dashboard for form status indicators
2. Look for "Published" or "Draft" badges
3. Check the form's `publishedAt` timestamp
4. Use the builder's save/publish buttons with visual feedback

### After Save/Publish Redirect Issues

**Problem**: Confusion about what happens after saving/publishing
**Solution**:
1. **Save**: Keeps you in the builder, shows success message
2. **Publish**: Shows success message, then redirects to dashboard after 2 seconds
3. Check the status messages above the buttons for feedback

## API Endpoints

### Forms
- `GET /api/forms` - List all forms
- `POST /api/forms` - Create new form
- `GET /api/forms/[id]` - Get specific form
- `PUT /api/forms/[id]` - Update form
- `DELETE /api/forms/[id]` - Delete form

### Publishing
- `POST /api/forms/[id]/publish` - Publish/unpublish form

### Submissions
- `GET /api/forms/[id]/submissions` - Get form submissions
- `POST /api/forms/[id]/submissions` - Submit form data

## Database Schema

The system uses three main tables:
- `forms` - Form metadata and settings
- `form_fields` - Individual form fields and their properties
- `form_submissions` - User form responses

## Testing

Use the `/test` page to test form submission functionality:
1. Create and publish a form first
2. Replace `YOUR_FORM_ID` in the test page with the actual form ID
3. Submit the test form to verify everything works

## Common Issues & Solutions

### "Form is not published" Error
- Make sure to click **Publish** after saving
- Check the form's `isPublished` status in the database

### "Form not found" Error
- Verify the form ID in the URL
- Check if the form exists in the database

### Network Errors
- Check your internet connection
- Verify the API endpoints are accessible
- Check browser console for CORS issues

### Database Connection Issues
- Verify your `DATABASE_URL` in `.env.local`
- Make sure PostgreSQL is running
- Check if the database exists and is accessible

## Deployment

### Vercel Deployment

This application is configured for Vercel deployment with Prisma. The build process automatically generates the Prisma Client during deployment.

#### Environment Variables

Make sure to set these environment variables in your Vercel project:

- `DATABASE_URL` - Your PostgreSQL connection string
- `PRISMA_DATABASE_URL` - Your Prisma Accelerate URL (if using Prisma Accelerate)
- `JWT_SECRET` - A secure JWT secret key
- `NEXTAUTH_SECRET` - A secure NextAuth secret key

#### Build Configuration

The build process includes:
1. `prisma generate` - Generates Prisma Client
2. `next build` - Builds the Next.js application

#### Common Deployment Issues

**Prisma Client Not Generated**
- The build script now automatically runs `prisma generate`
- A `postinstall` script ensures Prisma Client is generated after dependencies are installed
- Check that your `DATABASE_URL` is correctly set in Vercel

**Build Failures**
- Ensure all environment variables are set in Vercel
- Check that your database is accessible from Vercel's servers
- Verify your Prisma schema is valid

**Database Connection Issues**
- Use Prisma Accelerate for better performance and reliability
- Ensure your database allows connections from Vercel's IP ranges
- Check SSL requirements for your database

### Local Development

For local development, use the provided build script:

```bash
./scripts/build.sh
```

This script ensures proper setup for local development.

## Development

### Project Structure
```
app/
├── api/           # API routes
├── builder/       # Form builder page
├── dashboard/     # Forms overview
├── form/          # Public form view
└── test/          # Testing page

components/         # Reusable components
├── FormBuilder.tsx
├── FormPreview.tsx
└── FieldPanel.tsx

prisma/            # Database schema and migrations
```

### Adding New Field Types

1. Update the `FormField` interface in components
2. Add the field type to the `renderField` function in `FormPreview.tsx`
3. Update the `addField` function in the builder
4. Add validation logic if needed

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify database connectivity
3. Check the API endpoints with tools like Postman
4. Review the troubleshooting section above

## License

This project is licensed under the MIT License. 