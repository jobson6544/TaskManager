# 🎯 Quick Start Guide - Google OAuth Setup

## 📋 What You Need to Do

### 1. **Get Google Credentials** (5 minutes)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google Identity API → Create OAuth client ID
3. Add `http://localhost:3000` to authorized origins
4. Copy your Client ID (looks like: `123...apps.googleusercontent.com`)

### 2. **Update Configuration** (1 minute)
1. Open `.env.local` in your project
2. Replace `your-google-client-id-here.apps.googleusercontent.com` with your actual Client ID
3. Save the file

### 3. **Start Servers** (1 minute)
```bash
# Terminal 1: API
cd TaskManager.API
dotnet run

# Terminal 2: Frontend  
cd taskmanager-nextjs
npm run dev
```

### 4. **Test It** (2 minutes)
1. Go to `http://localhost:3000/signup`
2. Create account with email/password
3. Go to `http://localhost:3000/login`
4. Click "Sign in with Google" with same email
5. Check profile page - should show both methods linked! 🔗

## 📚 Detailed Guides

- **Step-by-step setup:** `DETAILED_SETUP_GUIDE.md`
- **Testing checklist:** `TESTING_CHECKLIST.md`
- **Google setup only:** `GOOGLE_OAUTH_SETUP.md`

## 🔧 Quick Verification

**Windows:** Run `verify-setup.bat`
**Linux/Mac:** Run `bash verify-setup.sh`

## ✨ What You Get

✅ **Email/password authentication**
✅ **Google OAuth login**  
✅ **Automatic account linking** (same email = same account)
✅ **Profile management** with password reset
✅ **Modern dark theme UI**
✅ **Full account status display**

## 🆘 Need Help?

**Common Issues:**
- Google button not appearing → Check Client ID in `.env.local`
- "Invalid origin" error → Add `http://localhost:3000` to Google Console
- 404 API errors → Make sure backend is running on port 5118

**Everything working?** 🎉 You now have a production-ready authentication system!