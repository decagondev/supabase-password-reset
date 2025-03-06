# Supabase Password Reset

A Node.js package for resetting user passwords in Supabase and sending notification emails via Mailgun.

## Installation

```bash
npm install supabase-password-reset
```

The package requires the following dependencies:
```bash
npm install @supabase/supabase-js bcrypt mailgun.js form-data
```

## Features

- Reset passwords for Supabase users by email
- Generate secure random passwords
- Send notification emails with the new password via Mailgun
- Highly configurable with custom email templates
- Simple API

## Usage

### Basic Usage

```javascript
const SupabasePasswordReset = require('supabase-password-reset');

const passwordReset = new SupabasePasswordReset({
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-supabase-service-role-key',
  mailgunApiKey: 'your-mailgun-api-key',
  mailgunDomain: 'your-mailgun-domain.com'
});

// Reset a user's password
async function resetPassword() {
  const result = await passwordReset.resetPasswordByEmail('user@example.com');
  console.log(result);
  // { success: true, message: 'Password reset successful. An email has been sent with the new password.' }
}

resetPassword();
```

### Express API Endpoint

Create a secure API endpoint in your Express.js backend:

```javascript
// routes/password-reset.js
const express = require('express');
const router = express.Router();
const SupabasePasswordReset = require('supabase-password-reset');

// Initialize with your environment variables
const passwordReset = new SupabasePasswordReset({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY,
  mailgunApiKey: process.env.MAILGUN_API_KEY,
  mailgunDomain: process.env.MAILGUN_DOMAIN,
  options: {
    fromEmail: 'support@yourcompany.com',
    fromName: 'Your Company Support'
  }
});

// POST endpoint to handle password reset requests
router.post('/reset', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }
  
  try {
    // Optional: Add rate limiting here
    
    const result = await passwordReset.resetPasswordByEmail(email);
    
    // Return appropriate status based on result
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred while processing your request'
    });
  }
});

module.exports = router;

// In your main app.js or server.js file:
// app.use('/api', require('./routes/password-reset'));
```

### React Component Examples

#### React with Tailwind CSS

```jsx
// PasswordResetForm.jsx
import React, { useState } from 'react';

function PasswordResetForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: '', type: '' });

    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      setStatus({
        message: data.message,
        type: data.success ? 'success' : 'error',
      });
      
      // Clear form on success
      if (data.success) {
        setEmail('');
      }
    } catch (error) {
      setStatus({
        message: 'Failed to connect to the server. Please try again later.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reset Your Password</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            placeholder="Enter your email address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {status.message && (
          <div className={`p-3 rounded-md mb-4 ${
            status.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {status.message}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={isSubmitting || !email}
          className={`w-full py-2 px-4 rounded-md font-medium text-white ${
            isSubmitting || !email
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {isSubmitting ? 'Processing...' : 'Reset Password'}
        </button>
        
        <p className="mt-4 text-sm text-center text-gray-500">
          We'll send a temporary password to your email if an account exists.
        </p>
      </form>
    </div>
  );
}

export default PasswordResetForm;
```

#### React with Styled Components

```jsx
// PasswordResetForm.jsx
import React, { useState } from 'react';
import styled from 'styled-components';

// Styled Components
const FormContainer = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }
  
  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: ${props => props.disabled ? '#9ca3af' : '#4f46e5'};
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #4338ca;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.4);
  }
`;

const StatusMessage = styled.div`
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 0.375rem;
  
  ${props => props.type === 'success' && `
    background-color: #ecfdf5;
    color: #065f46;
    border: 1px solid #10b981;
  `}
  
  ${props => props.type === 'error' && `
    background-color: #fef2f2;
    color: #991b1b;
    border: 1px solid #ef4444;
  `}
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  margin-top: 1rem;
`;

function PasswordResetForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: '', type: '' });

    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      setStatus({
        message: data.message,
        type: data.success ? 'success' : 'error',
      });
      
      // Clear form on success
      if (data.success) {
        setEmail('');
      }
    } catch (error) {
      setStatus({
        message: 'Failed to connect to the server. Please try again later.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <Title>Reset Your Password</Title>
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="email">Email Address</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            placeholder="Enter your email address"
          />
        </FormGroup>
        
        {status.message && (
          <StatusMessage type={status.type}>
            {status.message}
          </StatusMessage>
        )}
        
        <Button 
          type="submit" 
          disabled={isSubmitting || !email}
        >
          {isSubmitting ? 'Processing...' : 'Reset Password'}
        </Button>
        
        <InfoText>
          We'll send a temporary password to your email if an account exists.
        </InfoText>
      </form>
    </FormContainer>
  );
}

export default PasswordResetForm;
```

### Advanced Configuration

```javascript
const passwordReset = new SupabasePasswordReset({
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-supabase-service-role-key',
  mailgunApiKey: 'your-mailgun-api-key',
  mailgunDomain: 'your-mailgun-domain.com',
  options: {
    saltRounds: 12, // bcrypt salt rounds
    passwordLength: 12, // length of generated password
    fromEmail: 'support@yourcompany.com',
    fromName: 'Your Company Support',
    subject: 'Your Password Has Been Reset - Action Required',
    emailTemplateFunction: (email, password) => {
      return `
      Hello ${email},
      
      Your password has been reset as requested.
      
      New Password: ${password}
      
      Please log in and change your password immediately.
      
      Best regards,
      Your Company Support Team
      `;
    }
  }
});
```

## Security Considerations

- This package requires a Supabase service role key with admin access. Make sure to keep this key secure.
- Never use this package directly in client-side code (browser/React) as it would expose your admin credentials.
- Always implement this functionality on a secure server-side API endpoint.
- Implement rate limiting on your API endpoints that use this package.
- Add appropriate authorization checks to ensure only authorized users can reset passwords.
- Consider using CAPTCHA or similar verification to prevent automated abuse.
- It's recommended to set up a secure password change flow after users log in with their temporary password.

## Dependencies

This package depends on:
- `@supabase/supabase-js`: For interacting with Supabase
- `bcrypt`: For securely hashing passwords
- `mailgun.js`: For sending emails via Mailgun
- `form-data`: Required by the Mailgun.js client

## API Reference

### `new SupabasePasswordReset(config)`

Creates a new instance of the password reset utility.

#### Parameters:

- `config` (Object):
  - `supabaseUrl` (String): Your Supabase project URL
  - `supabaseKey` (String): Your Supabase service role key
  - `mailgunApiKey` (String): Your Mailgun API key
  - `mailgunDomain` (String): Your Mailgun domain
  - `options` (Object, optional):
    - `saltRounds` (Number, default: 10): Number of bcrypt salt rounds
    - `passwordLength` (Number, default: 10): Length of generated password
    - `fromEmail` (String, default: "noreply@yourdomain.com"): From email address
    - `fromName` (String, default: "Password Reset"): From name
    - `subject` (String, default: "Your Password Has Been Reset"): Email subject
    - `emailTemplateFunction` (Function): Custom email template function

### `resetPasswordByEmail(email)`

Resets the password for a user with the specified email address.

#### Parameters:

- `email` (String): The email address of the user

#### Returns:

- Promise that resolves to an object:
  - `success` (Boolean): Whether the password reset was successful
  - `message` (String): A descriptive message about the result

## License

MIT