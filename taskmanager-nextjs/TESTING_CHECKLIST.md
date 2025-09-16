# Google OAuth Testing Checklist

## Pre-Testing Setup ✅

- [ ] Google Cloud Console project created
- [ ] OAuth consent screen configured
- [ ] OAuth client ID created with correct origins
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` updated in `.env.local`
- [ ] Both servers running (API on 5118, Frontend on 3000)

## Test Scenario 1: Email/Password First, Then Google Linking

### Step 1: Create Account with Email/Password
- [ ] Go to `http://localhost:3000/signup`
- [ ] Fill form with:
  - Name: "Test User"
  - Email: "test@example.com" (use real email)
  - Password: "password123"
- [ ] Click "Get Started"
- [ ] Redirected to `/today` page
- [ ] Account created successfully

### Step 2: Check Profile (Password Only)
- [ ] Go to profile page
- [ ] Account Status section shows:
  - [ ] ✅ Password Login (green checkmark)
  - [ ] ⚪ Google Login (gray circle)
  - [ ] No "Accounts Linked" message

### Step 3: Logout and Test Google Login (Account Linking)
- [ ] Logout from profile page
- [ ] Go to `http://localhost:3000/login`
- [ ] Click "Sign in with Google" button
- [ ] Google popup appears
- [ ] Sign in with **same email** (test@example.com)
- [ ] Redirected to `/today` page
- [ ] Successfully logged in

### Step 4: Check Profile (Both Methods Linked)
- [ ] Go to profile page
- [ ] Account Status section shows:
  - [ ] ✅ Password Login (green checkmark)
  - [ ] ✅ Google Login (green checkmark)
  - [ ] 🔗 Blue box: "Accounts Linked - You can sign in with either method"

### Step 5: Test Both Login Methods
- [ ] Logout
- [ ] Login with email/password → Works
- [ ] Logout
- [ ] Login with Google → Works
- [ ] Both access the same account and data

## Test Scenario 2: Google First, Then Password

### Step 1: New User with Google First
- [ ] Use different email (e.g., "newuser@gmail.com")
- [ ] Go to `http://localhost:3000/login`
- [ ] Click "Sign in with Google"
- [ ] Sign in with new email
- [ ] Account created and redirected to `/today`

### Step 2: Check Profile (Google Only)
- [ ] Go to profile page
- [ ] Account Status shows:
  - [ ] ⚪ Password Login (gray circle)
  - [ ] ✅ Google Login (green checkmark)
  - [ ] No "Accounts Linked" message

### Step 3: Add Password to Google Account
- [ ] In profile page, click "Change Password"
- [ ] Since no current password, leave "Current Password" empty
- [ ] Enter new password
- [ ] Submit
- [ ] Password added successfully

### Step 4: Test Both Methods
- [ ] Logout
- [ ] Login with email/password → Should work
- [ ] Profile shows both methods enabled and linked

## Test Scenario 3: Password Change

### For Accounts with Password:
- [ ] Go to profile page
- [ ] Click "Change Password"
- [ ] Enter current password: "password123"
- [ ] Enter new password: "newpassword123"
- [ ] Confirm new password: "newpassword123"
- [ ] Submit
- [ ] Success message appears
- [ ] Logout and login with new password → Works

## Error Testing

### Test Invalid Google Client ID:
- [ ] Temporarily change `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to invalid value
- [ ] Restart frontend
- [ ] Google button should show error or not work
- [ ] Restore correct Client ID

### Test API Connection:
- [ ] Stop API server
- [ ] Try any login → Should show appropriate error
- [ ] Restart API server

## Browser Developer Tools Checks

### Console Tab (F12):
- [ ] No JavaScript errors on page load
- [ ] No errors when clicking Google button
- [ ] Successful API calls visible in console

### Network Tab:
- [ ] API calls to `/users/login` or `/users/google-auth` succeed
- [ ] Response status 200 for successful operations
- [ ] Error responses show appropriate error messages

## Expected Results Summary

✅ **Working Correctly When:**
1. Google OAuth popup appears and works
2. Account linking happens automatically with same email
3. Profile page shows correct authentication methods
4. Users can switch between login methods seamlessly
5. Password changes work for password-enabled accounts
6. All data persists regardless of login method used

🎉 **All tests passed = Fully functional Google OAuth with account linking!**