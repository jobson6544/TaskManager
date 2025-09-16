#!/bin/bash
# Quick Setup Verification Script for TaskManager Google OAuth

echo "🔍 TaskManager Google OAuth Setup Verification"
echo "=============================================="

# Check if .env.local exists and has Google Client ID
echo ""
echo "1. Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
    if grep -q "NEXT_PUBLIC_GOOGLE_CLIENT_ID=" .env.local; then
        CLIENT_ID=$(grep "NEXT_PUBLIC_GOOGLE_CLIENT_ID=" .env.local | cut -d'=' -f2)
        if [[ $CLIENT_ID == *"your-google-client-id-here"* ]]; then
            echo "❌ Google Client ID still contains placeholder"
            echo "   Please update NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local"
        elif [[ $CLIENT_ID == *".apps.googleusercontent.com" ]]; then
            echo "✅ Google Client ID appears to be configured"
        else
            echo "⚠️  Google Client ID format looks unusual: $CLIENT_ID"
        fi
    else
        echo "❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID not found in .env.local"
    fi
else
    echo "❌ .env.local file not found"
fi

# Check if API is running
echo ""
echo "2. Checking API server..."
if curl -s http://localhost:5118/api/health > /dev/null 2>&1; then
    echo "✅ API server is running on port 5118"
else
    echo "❌ API server not responding on port 5118"
    echo "   Run: cd TaskManager.API && dotnet run"
fi

# Check if frontend is running
echo ""
echo "3. Checking frontend server..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend server is running on port 3000"
else
    echo "❌ Frontend server not responding on port 3000"
    echo "   Run: npm run dev"
fi

# Check Google OAuth setup files
echo ""
echo "4. Checking Google OAuth integration..."
if [ -f "src/components/GoogleLoginButton.tsx" ]; then
    echo "✅ GoogleLoginButton component exists"
else
    echo "❌ GoogleLoginButton component missing"
fi

if grep -q "GoogleLoginButton" src/app/\(auth\)/login/page.tsx; then
    echo "✅ Google login integrated in login page"
else
    echo "❌ Google login not found in login page"
fi

if grep -q "GoogleLoginButton" src/app/\(auth\)/signup/page.tsx; then
    echo "✅ Google login integrated in signup page"
else
    echo "❌ Google login not found in signup page"
fi

echo ""
echo "5. Next steps:"
echo "   1. If API/Frontend not running, start them in separate terminals"
echo "   2. If Google Client ID not configured, follow DETAILED_SETUP_GUIDE.md"
echo "   3. Open http://localhost:3000/login to test Google OAuth"
echo ""
echo "📖 For detailed setup instructions, see: DETAILED_SETUP_GUIDE.md"