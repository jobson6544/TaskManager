# Complete Google OAuth Setup - Detailed Guide

## Step 1: Get Google OAuth Credentials (Detailed)

### 1.1 Access Google Cloud Console
1. Open your web browser and go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### 1.2 Create or Select a Project
1. **If you don't have a project:**
   - Click the project dropdown at the top of the page
   - Click "New Project"
   - Enter a project name (e.g., "TaskManager App")
   - Click "Create"
   - Wait for the project to be created and select it

2. **If you have an existing project:**
   - Click the project dropdown and select your project

### 1.3 Enable Required APIs
1. In the left sidebar, click "APIs & Services" > "Library"
2. Search for "Google Identity" or "Google+ API"
3. Click on "Google Identity Services API" or "Google+ API"
4. Click "Enable"
5. Wait for the API to be enabled

### 1.4 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. **If prompted to configure OAuth consent screen:**
   - Click "Configure Consent Screen"
   - Choose "External" (unless you have a Google Workspace)
   - Fill in required fields:
     - App name: "TaskManager"
     - User support email: Your email
     - Developer contact information: Your email
   - Click "Save and Continue" through all steps
   - Return to "Credentials" tab

4. **Create OAuth Client ID:**
   - Application type: "Web application"
   - Name: "TaskManager Web Client"
   - **Authorized JavaScript origins:**
     - Add: `http://localhost:3000`
     - Add: `https://yourdomain.com` (for production later)
   - **Authorized redirect URIs (optional for our setup):**
     - Add: `http://localhost:3000`
   - Click "Create"

### 1.5 Copy Your Client ID
1. A popup will show your credentials
2. **Copy the "Client ID"** - it looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
3. Keep this safe - you'll need it in the next step

## Step 2: Update Environment Variables

### 2.1 Open .env.local file
```bash
# Navigate to your project directory
cd "d:\Croohm\organic\taskmanager-nextjs"

# Open .env.local in VS Code or any text editor
code .env.local
```

### 2.2 Replace the placeholder
**Before:**
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5118/api

# Google OAuth Configuration
# Replace with your actual Google Client ID from Google Cloud Console
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

**After (with your actual Client ID):**
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5118/api

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### 2.3 Save the file
- Save the `.env.local` file
- **Important:** Restart your Next.js development server after changing environment variables

## Step 3: Start Both Servers

### 3.1 Start the Backend API
```bash
# Terminal 1: Start the .NET API
cd "d:\Croohm\organic\TaskManager.API"
dotnet run
```

**Expected output:**
```
Building...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5118
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### 3.2 Start the Frontend
```bash
# Terminal 2: Start the Next.js frontend
cd "d:\Croohm\organic\taskmanager-nextjs"
npm run dev
```

**Expected output:**
```
▲ Next.js 15.5.3 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
✓ Ready in 1584ms
```

## Step 4: Test the Integration (Detailed)

### 4.1 Test Email/Password Registration
1. **Open your browser:** Go to `http://localhost:3000`
2. **Navigate to signup:** Click "Sign up" or go to `http://localhost:3000/signup`
3. **Fill the form:**
   - Name: "Test User"
   - Email: "test@example.com" (use a real email you have access to)
   - Password: "password123"
4. **Submit:** Click "Get Started"
5. **Expected result:** You should be redirected to the today page (`/today`)

### 4.2 Test Login with Email/Password
1. **Logout:** Go to profile page and click logout
2. **Navigate to login:** Go to `http://localhost:3000/login`
3. **Login:**
   - Email: "test@example.com"
   - Password: "password123"
4. **Expected result:** Successfully logged in and redirected to today page

### 4.3 Check Profile Page - Password Only
1. **Navigate to profile:** Click on profile icon or go to `/profile`
2. **Check account status section:**
   - ✅ Password Login (green checkmark)
   - ⚪ Google Login (gray circle)
   - No "Accounts Linked" message should appear

### 4.4 Test Google OAuth Integration
1. **Logout again:** From the profile page
2. **Go to login page:** `http://localhost:3000/login`
3. **Try Google login:**
   - Click the "Sign in with Google" button
   - **If you see an error about origin:** Double-check you added `http://localhost:3000` to authorized origins
   - A Google popup should appear
   - Sign in with the **same email** you used for registration ("test@example.com")
   - **Expected result:** You should be logged in and see the today page

### 4.5 Check Profile Page - Both Methods
1. **Navigate to profile:** Go to `/profile`
2. **Check account status section:**
   - ✅ Password Login (green checkmark)
   - ✅ Google Login (green checkmark)
   - 🔗 Blue box saying "Accounts Linked - You can sign in with either method"

### 4.6 Test Account Linking
1. **Try logging out and back in with email/password:** Should work
2. **Try logging out and back in with Google:** Should work
3. **Both methods should access the same account with same data**

## Step 5: Test Different Scenarios

### 5.1 New User with Google First
1. **Use a different email** (e.g., "newuser@example.com")
2. **Click "Sign in with Google"** on login page
3. **Sign in with the new email**
4. **Expected result:** Creates a new account with Google authentication only

### 5.2 Password Change (if you have password login)
1. **Go to profile page**
2. **Click "Change Password"**
3. **Fill in current and new password**
4. **Submit**
5. **Expected result:** Password changed successfully

## Troubleshooting

### Common Issues:

#### 1. "Invalid Origin" Error
```
Error: Invalid origin
```
**Solution:** Make sure you added `http://localhost:3000` to "Authorized JavaScript origins" in Google Cloud Console

#### 2. Google Button Not Appearing
**Check:**
- Environment variable is correctly set
- Development server was restarted after changing `.env.local`
- Browser developer tools console for JavaScript errors

#### 3. 404 Errors on API Calls
**Check:**
- Backend is running on port 5118
- `NEXT_PUBLIC_API_URL` is set to `http://localhost:5118/api`
- No firewall blocking the connection

#### 4. Database Errors
**Run:**
```bash
cd "d:\Croohm\organic\TaskManager.API"
dotnet ef database update
```

### Debug Steps:

#### 1. Check Console Logs
- Open browser Developer Tools (F12)
- Check Console tab for any errors
- Check Network tab to see API calls

#### 2. Check Environment Variables
```bash
# In your Next.js project
echo $NEXT_PUBLIC_GOOGLE_CLIENT_ID  # Linux/Mac
echo %NEXT_PUBLIC_GOOGLE_CLIENT_ID%  # Windows CMD
```

#### 3. Verify API Connection
- Go to `http://localhost:5118/api/health` in browser
- Should return: `{"status":"Healthy","timestamp":"..."}`

## Success Indicators

✅ **You'll know it's working when:**
1. Google sign-in button appears on login/signup pages
2. Clicking it opens Google OAuth popup
3. After Google login, you're redirected to the app
4. Profile page shows both authentication methods
5. You can switch between login methods seamlessly
6. Account linking message appears when both methods are enabled

🎉 **Congratulations!** You now have a fully functional authentication system with Google OAuth and account linking!