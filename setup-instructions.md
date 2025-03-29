# GitHub Pages Setup Instructions

Follow these step-by-step instructions to deploy your Grocery & Meal Planner app to GitHub Pages.

## Step 1: Run the setup script

1. Double-click the `github-setup.bat` file in your GroceryMealPlanApp folder
2. If you see a security warning, click "Run" or "Yes"
3. Enter your GitHub username and email when prompted
4. The script will initialize your Git repository and prepare your files

## Step 2: Create a GitHub repository

1. Go to [https://github.com/new](https://github.com/new)
2. Name your repository: `grocery-meal-planner`
3. Description (optional): "A web app for planning meals and managing grocery lists"
4. Choose "Public" repository
5. Do not check "Add a README file" or any other options
6. Click "Create repository"

![Create Repository Screenshot](https://docs.github.com/assets/cb-11427/images/help/repository/create-repository-name.png)

## Step 3: Connect and push your code

After creating the repository, GitHub will show you commands to connect your local repository. Copy and paste each command in your Command Prompt or PowerShell:

```
git remote add origin https://github.com/YOUR-USERNAME/grocery-meal-planner.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

If prompted, enter your GitHub credentials.

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab (near the top right)
3. Scroll down to "GitHub Pages" section (or click "Pages" in the left sidebar)
4. Under "Source", click the dropdown and select "main" branch
5. Click "Save"
6. Wait a few minutes for your site to be published
7. GitHub will display a message with your site's URL (it will look like `https://YOUR-USERNAME.github.io/grocery-meal-planner/`)

![GitHub Pages Settings](https://docs.github.com/assets/cb-70869/images/help/pages/select-gh-pages-or-branch-as-source.png)

## Step 5: Access your app on your phone

1. On your Android phone, open Chrome or another web browser
2. Enter the URL that GitHub provided (e.g., `https://YOUR-USERNAME.github.io/grocery-meal-planner/`)
3. To add it to your home screen:
   - Tap the three dots menu (⋮) in Chrome
   - Select "Add to Home screen"
   - Tap "Add" on the popup

## Step 6: Update your app in the future

When you make changes to your app locally, update the GitHub Pages version with these commands:

```
git add .
git commit -m "Description of your changes"
git push origin main
```

GitHub Pages will automatically update within a few minutes.

## Need Help?

- If you get an error about Git not being found, make sure Git is installed and restart your computer
- If you're prompted for GitHub credentials multiple times, consider setting up [GitHub CLI](https://cli.github.com/) or [GitHub Desktop](https://desktop.github.com/) for a simpler workflow
- If your app doesn't appear after enabling GitHub Pages, wait a few minutes and refresh the page 