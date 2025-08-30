// Test script to debug form submission
const testFormSubmission = async () => {
  try {
    // First, let's get a list of forms to see what's available
    console.log('Fetching forms...')
    const formsResponse = await fetch('/api/forms')
    const forms = await formsResponse.json()
    console.log('Available forms:', forms)
    
    if (forms.length === 0) {
      console.log('No forms available')
      return
    }
    
    // Get the first published form
    const publishedForm = forms.find(form => form.isPublished)
    if (!publishedForm) {
      console.log('No published forms available')
      return
    }
    
    console.log('Testing submission for form:', publishedForm.id)
    
    // Test form submission
    const submissionData = {
      data: {
        testField: 'test value',
        emailField: 'test@example.com'
      },
      userName: 'Test User'
    }
    
    console.log('Submitting data:', submissionData)
    
    const submissionResponse = await fetch(`/api/forms/${publishedForm.id}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submissionData),
    })
    
    console.log('Submission response status:', submissionResponse.status)
    
    if (submissionResponse.ok) {
      const result = await submissionResponse.json()
      console.log('Submission successful:', result)
    } else {
      const error = await submissionResponse.json()
      console.error('Submission failed:', error)
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
testFormSubmission() 