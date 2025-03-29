@echo off
echo Setting up GitHub repository for Grocery & Meal Planner app...
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Git is not found. Please make sure Git is installed and in your PATH.
    echo Visit https://git-scm.com/downloads to download and install Git.
    pause
    exit /b 1
)

echo Git is installed. Proceeding with setup...
echo.

echo Please enter your GitHub username:
set /p GITHUB_USERNAME=

echo.
echo Please enter your GitHub email:
set /p GITHUB_EMAIL=

echo.
echo Configuring Git with your information...
git config --global user.name "%GITHUB_USERNAME%"
git config --global user.email "%GITHUB_EMAIL%"

echo.
echo Initializing Git repository...
git init

echo.
echo Adding files to repository...
git add .

echo.
echo Creating initial commit...
git commit -m "Initial commit of Grocery & Meal Planner app"

echo.
echo Repository setup completed!
echo.
echo Next steps:
echo 1. Create a repository on GitHub named 'grocery-meal-planner'
echo 2. Run the commands below to push your code to GitHub:
echo    git remote add origin https://github.com/%GITHUB_USERNAME%/grocery-meal-planner.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Enable GitHub Pages in your repository settings:
echo    - Go to https://github.com/%GITHUB_USERNAME%/grocery-meal-planner/settings/pages
echo    - Under "Source", select "main" branch
echo    - Click "Save"
echo.
echo Your app will be available at: https://%GITHUB_USERNAME%.github.io/grocery-meal-planner/
echo.

pause 