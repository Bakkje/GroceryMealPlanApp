# Grocery & Meal Planner App

A mobile-friendly web application for managing your grocery shopping list and meal planning.

## Features

- **Device-Based Identification**: Automatic device ID generation with no account creation needed
- **Shared Lists**: Share your grocery list with family members using a 6-character share code
- **Cross-Device Sync**: Connect multiple devices using share codes
- **Grocery List Management**: Add, remove, and check off items from your shopping list
- **Meal Planning**: Plan your meals for the week and easily add ingredients to your grocery list
- **Recipe Collection**: Browse and save your favorite recipes for easy meal planning
- **Offline Support**: The app works even when you're offline with data synced when you reconnect
- **Mobile-Friendly**: Designed for use on mobile phones with easy navigation

## How to Use

### Getting Started

1. Open `index.html` in your web browser
2. The app automatically generates a unique device ID and share code
3. You'll see your share code that you can give to family members to access your grocery list

### Using on Multiple Devices

1. On your computer, find your share code in the Share & Sync section
2. Copy the share code
3. On your phone or another device, visit the app
4. Enter the share code in the "Join Someone's List" section
5. Click "Join" to connect to the same grocery list

### Sharing Your List

1. Find your share code displayed in the Share & Sync section
2. Click "Copy" to copy the code to your clipboard
3. Share this code with family members
4. If needed, you can generate a new share code by clicking "Generate New Code"

### Joining a Shared List

1. Enter the share code you received in the "Join Someone's List" form
2. Click "Join" to access the shared grocery list

### Managing Your Grocery List

1. Navigate to the Grocery List page using the bottom navigation
2. Add new items using the form at the bottom
3. Check off items as you shop
4. All changes sync automatically across connected devices

### Planning Meals

1. Go to the Meal Plan page
2. Add meals to specific days of the week
3. Select recipes from your collection or create custom meal entries
4. Add ingredients directly to your grocery list

## Troubleshooting

### Sharing Issues

- Share codes are 6 characters long and contain only letters and numbers
- Make sure you're entering the code exactly as it was shared with you
- If joining fails, ask the list owner to verify their share code

### Sync Issues

- If changes aren't syncing, check your internet connection
- The app will indicate when you're offline at the bottom of the screen
- Changes made offline will sync automatically when you reconnect

## Technical Information

This app is built with:
- HTML5, CSS3, and JavaScript
- IndexedDB for local data persistence
- Firebase Realtime Database for cloud synchronization (optional)
- Service worker for offline capabilities
- Web app manifest for installability

The app can run entirely in the browser without requiring external services, but connecting to Firebase enhances the cloud sync capability.

## Firebase Setup (Optional)

To enable cloud synchronization:

1. Create a Firebase account and project at [firebase.google.com](https://firebase.google.com)
2. Add a web app to your Firebase project
3. Enable the Realtime Database
4. Copy your Firebase configuration
5. Update the `firebase-config.js` file with your configuration details
6. Uncomment the initialization line at the bottom of `firebase-config.js`

Without Firebase configuration, the app will still work using local storage only. 