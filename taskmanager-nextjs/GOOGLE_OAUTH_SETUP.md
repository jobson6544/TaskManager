# Google OAuth Setup Guide

## Steps to Configure Google OAuth

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API or Google Identity API

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application" as the application type
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain (when deploying)
5. Add authorized redirect URIs (if needed):
   - `http://localhost:3000` (for development)
6. Copy the "Client ID" that starts with something like `123456789-abc...apps.googleusercontent.com`

### 3. Update Environment Variables

Replace the placeholder in `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
```

### 4. Test the Integration

1. Restart your Next.js development server: `npm run dev`
2. Go to the login or signup page
3. Click the "Sign in with Google" button
4. You should see the Google OAuth popup

### 5. Backend Account Linking

The backend is already configured to handle:
- **New Google users**: Creates a new account with Google info
- **Existing email users**: Links the Google account to the existing email/password account
- **Profile management**: Shows unified account status

### Important Notes

- The Google Client ID is safe to expose in frontend code
- Make sure your backend is running on `http://localhost:5118`
- The account linking logic automatically connects accounts with the same email address
- Users can have both password and Google authentication methods on the same account

### Troubleshooting

- **"Invalid Origin" error**: Make sure you added `http://localhost:3000` to authorized origins
- **Console errors**: Check that the Google Client ID is correctly set in `.env.local`
- **Backend errors**: Ensure the TaskManager API is running and the User model supports Google authentication