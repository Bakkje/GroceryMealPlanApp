# Grocery & Meal Planner App

A mobile-friendly web application for managing your grocery shopping list and meal planning.

## Features

- **User Authentication**: Create accounts using email and password
- **Shared Lists**: Share your grocery list with family members using a 6-character share code
- **Cross-Device Sync**: Export your account from one device and import it on another
- **Grocery List Management**: Add, remove, and check off items from your shopping list
- **Meal Planning**: Plan your meals for the week and easily add ingredients to your grocery list
- **Recipe Collection**: Browse and save your favorite recipes for easy meal planning
- **Offline Support**: The app works even when you're offline with data synced when you reconnect
- **Mobile-Friendly**: Designed for use on mobile phones with easy navigation

## How to Use

### Getting Started

1. Open `index.html` in your web browser
2. Create an account using your email and a password (minimum 6 characters)
3. You'll receive a share code that you can give to family members to access your grocery list

### Using on Multiple Devices

1. On your computer, go to the Account section after logging in
2. Click "Export Account Data"
3. Copy the generated code
4. On your phone or another device, visit the app and go to the login screen
5. Scroll down to the "Import Account from Another Device" section
6. Paste the code you copied and click "Import Account"
7. You'll be automatically logged in with all your data available on the new device

### Sharing Your List

1. After logging in, go to the Account section
2. Find your share code displayed in the green box
3. Click "Copy" to copy the code to your clipboard
4. Share this code with family members

### Joining a Shared List

1. Create an account or log in
2. Enter the share code you received in the "Join Shared List" form
3. Click "Join List" to access the shared grocery list

### Managing Your Grocery List

1. Navigate to the Grocery List page using the bottom navigation
2. Add new items using the form at the top
3. Check off items as you shop
4. Categorized items help you navigate the store efficiently

### Planning Meals

1. Go to the Meal Plan page
2. Add meals to specific days of the week
3. Select recipes from your collection or create custom meal entries
4. Add ingredients directly to your grocery list

## Troubleshooting

### Login Issues

- Make sure you're using the correct email and password
- If you forgot your password, use the "Clear All Data" button to reset (this will delete all accounts and data)
- If you get "No accounts found" on a new device, use the Export/Import feature to transfer your account
- Check the browser console for detailed error messages

### Sharing Issues

- Share codes are 6 characters long and contain only letters and numbers
- Make sure you're entering the code exactly as it was shared with you
- If joining fails, ask the list owner to verify their share code

### Export/Import Issues

- Make sure you copy the entire export code
- The import code contains your account credentials and list data
- If import fails, try creating a new export code on the original device

## Technical Information

This app is built with:
- HTML5, CSS3, and JavaScript
- LocalStorage for data persistence
- Service worker for offline capabilities
- Web app manifest for installability

The app runs entirely in the browser without requiring a server. 