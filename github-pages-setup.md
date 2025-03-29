# GitHub Pages Setup Guide for Grocery & Meal Planner App

This guide will help you deploy your Grocery & Meal Planner app to GitHub Pages, where it will be accessible online from any device.

## Prerequisites

1. **Install Git on your computer**
   - Download Git from [https://git-scm.com/downloads](https://git-scm.com/downloads)
   - Follow the installation instructions for Windows
   - After installation, restart your computer to ensure Git is properly recognized

2. **Create a GitHub account**
   - Sign up at [https://github.com/signup](https://github.com/signup) if you don't already have an account

## Step 1: Initialize Git in your project folder

Open PowerShell or Command Prompt and navigate to your project folder:

```
cd C:\Users\elena\Documents\GroceryMealPlanApp
git init
```

## Step 2: Create a .gitignore file (optional)

Create a file named `.gitignore` in your project folder with the following content:

```
# Node modules and dependencies
node_modules/

# IDE and editor folders
.vscode/
.idea/

# System files
.DS_Store
Thumbs.db
```

## Step 3: Add and commit your files

```
git add .
git commit -m "Initial commit of Grocery & Meal Planner app"
```

## Step 4: Create a GitHub repository

1. Go to [https://github.com/new](https://github.com/new)
2. Name your repository `grocery-meal-planner`
3. Leave the description optional but you can add: "A web app for planning meals and managing grocery lists"
4. Choose "Public" repository (required for GitHub Pages free tier)
5. Do not initialize with README, .gitignore, or license since we're importing an existing project
6. Click "Create repository"

## Step 5: Link your local repository to GitHub

After creating the repository, GitHub will show you commands to connect your local repository. Use these commands:

```
git remote add origin https://github.com/YOUR-USERNAME/grocery-meal-planner.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

## Step 6: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "GitHub Pages" section
4. Under "Source", select "main" branch
5. Click "Save"
6. Wait a few minutes for your site to be published
7. GitHub will display the URL (something like `https://YOUR-USERNAME.github.io/grocery-meal-planner/`)

## Step 7: Access your app

Your app will now be accessible at the URL provided by GitHub Pages. You can:

1. Visit this URL on your phone's browser
2. Add it to your home screen by:
   - Opening the site in Chrome
   - Tapping the three dots menu (⋮)
   - Selecting "Add to Home screen"
   - Following the prompts

## Step 8: Updating your app

Whenever you make changes to your app locally, update the GitHub Pages version with:

```
git add .
git commit -m "Description of your changes"
git push origin main
```

GitHub Pages will automatically update within a few minutes.

## Troubleshooting

- **404 Page Not Found**: Make sure your repository is public and GitHub Pages is enabled correctly
- **Content not updating**: It may take a few minutes for changes to appear after pushing
- **JavaScript not working**: Check your app for any absolute paths that should be relative

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [GitHub Desktop](https://desktop.github.com/) - A GUI alternative to command line Git 