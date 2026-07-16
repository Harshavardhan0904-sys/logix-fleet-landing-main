@echo off
REM Logix Fleet — Quick Deploy to GitHub & Netlify
REM This script automates the GitHub push process

echo.
echo ========================================
echo  LOGIX FLEET - NETLIFY DEPLOYMENT
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed. Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo 1. Enter your GitHub username:
set /p GITHUB_USER="> "

echo.
echo 2. Enter your repository name (e.g., logix-fleet-landing):
set /p REPO_NAME="> "

echo.
echo 3. Pushing to GitHub...
echo.

REM Set remote and push
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
git branch -M main
git push -u origin main

if %ERRORLEVEL% EQ 0 (
    echo.
    echo ========================================
    echo  SUCCESS! Your code is on GitHub
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Go to https://app.netlify.com
    echo 2. Click "Add new site" ^> "Import an existing project"
    echo 3. Select GitHub and authorize
    echo 4. Select %REPO_NAME%
    echo 5. Click Deploy
    echo.
    echo Your site will be live in ~30 seconds at:
    echo https://%REPO_NAME%.netlify.app
    echo.
) else (
    echo.
    echo ERROR: Push failed. Check your GitHub credentials.
    echo You may need a Personal Access Token: https://github.com/settings/tokens
    echo.
)

pause
