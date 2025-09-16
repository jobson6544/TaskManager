@echo off
echo 🔍 TaskManager Google OAuth Setup Verification
echo ==============================================

REM Check if .env.local exists and has Google Client ID
echo.
echo 1. Checking environment configuration...
if exist ".env.local" (
    echo ✅ .env.local file exists
    findstr "NEXT_PUBLIC_GOOGLE_CLIENT_ID=" .env.local >nul
    if %errorlevel%==0 (
        for /f "tokens=2 delims==" %%a in ('findstr "NEXT_PUBLIC_GOOGLE_CLIENT_ID=" .env.local') do set CLIENT_ID=%%a
        echo Client ID: !CLIENT_ID!
        echo !CLIENT_ID! | findstr "your-google-client-id-here" >nul
        if !errorlevel!==0 (
            echo ❌ Google Client ID still contains placeholder
            echo    Please update NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local
        ) else (
            echo !CLIENT_ID! | findstr ".apps.googleusercontent.com" >nul
            if !errorlevel!==0 (
                echo ✅ Google Client ID appears to be configured
            ) else (
                echo ⚠️ Google Client ID format looks unusual
            )
        )
    ) else (
        echo ❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID not found in .env.local
    )
) else (
    echo ❌ .env.local file not found
)

REM Check if API is running
echo.
echo 2. Checking API server...
curl -s http://localhost:5118/api/health >nul 2>&1
if %errorlevel%==0 (
    echo ✅ API server is running on port 5118
) else (
    echo ❌ API server not responding on port 5118
    echo    Run: cd TaskManager.API ^&^& dotnet run
)

REM Check if frontend is running
echo.
echo 3. Checking frontend server...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Frontend server is running on port 3000
) else (
    echo ❌ Frontend server not responding on port 3000
    echo    Run: npm run dev
)

REM Check Google OAuth setup files
echo.
echo 4. Checking Google OAuth integration...
if exist "src\components\GoogleLoginButton.tsx" (
    echo ✅ GoogleLoginButton component exists
) else (
    echo ❌ GoogleLoginButton component missing
)

findstr "GoogleLoginButton" src\app\^(auth^)\login\page.tsx >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Google login integrated in login page
) else (
    echo ❌ Google login not found in login page
)

findstr "GoogleLoginButton" src\app\^(auth^)\signup\page.tsx >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Google login integrated in signup page
) else (
    echo ❌ Google login not found in signup page
)

echo.
echo 5. Next steps:
echo    1. If API/Frontend not running, start them in separate terminals
echo    2. If Google Client ID not configured, follow DETAILED_SETUP_GUIDE.md
echo    3. Open http://localhost:3000/login to test Google OAuth
echo.
echo 📖 For detailed setup instructions, see: DETAILED_SETUP_GUIDE.md

pause