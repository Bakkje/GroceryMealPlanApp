# Grocery & Meal Planner App

A mobile-friendly web application for managing grocery lists and meal planning, with cloud synchronization capabilities.

## Features

- **Device-Based Identification**: Automatic generation of a unique device ID and share code without requiring user registration or login.
- **Shared Lists**: Share your grocery lists and meal plans with family members and across your devices.
- **Cross-Device Sync**: Real-time synchronization powered by Firebase Firestore ensures your data is up-to-date across all your devices.
- **Grocery List Management**: Create, edit, and organize your grocery shopping list with categories.
- **Meal Planning**: Plan your meals for weeks in advance with a simple calendar interface.
- **Recipe Collection**: Save your favorite recipes and generate grocery lists from them.
- **Offline Support**: Full functionality even without an internet connection - changes sync when you're back online.
- **Mobile-Friendly**: Responsive design works great on smartphones and tablets.

## How to Use

### Getting Started

1. **First Visit**: When you open the app for the first time, a unique device ID and share code are automatically generated for you.
2. **Share Code**: Your share code allows you to sync data across devices or share with family members.

### Sharing Lists

1. Find your share code in the "Share & Sync" section on the home page.
2. Share this code with family members or use it on your other devices.
3. When someone enters your share code, their grocery lists and meal plans will sync with yours.

### Managing Grocery Lists

1. Add items to your grocery list using the input field.
2. Check off items as you shop.
3. Organize items by category using the category selector.
4. Access your grocery list on any device by using your share code.

### Meal Planning

1. Navigate to the "Meal Plan" section.
2. Add meals to specific days and times.
3. Add notes or ingredients to each meal.
4. Generate a grocery list from your meal plan with one click.

### Joining a Shared List

1. Go to the "Share & Sync" section on the home page.
2. Enter the share code provided by the list owner.
3. Your app will now sync with the shared grocery lists and meal plans.

## Troubleshooting

### Sync Issues

- **Not Syncing**: Make sure you have an internet connection and that the share code is entered correctly.
- **Missing Items**: If items are missing after sync, try refreshing the page or checking if you have the latest version of the shared list.
- **Conflicting Changes**: In case of conflicts, the most recent changes are prioritized.

### Export/Import Issues

- **Export Not Working**: Try clearing your browser cache and try again.
- **Import Errors**: Make sure the imported file is in the correct format (previously exported from this app).

## Technical Information

- Built with HTML5, CSS3, and JavaScript.
- Uses IndexedDB for local data persistence.
- Employs Firebase Firestore for optional cloud synchronization.
- Implements a service worker for offline functionality.
- Can be installed as a Progressive Web App (PWA) on compatible devices.

## Firebase Setup (Optional)

For enhanced cloud synchronization capabilities, you can integrate your own Firebase project:

1. Create a Firebase account at [firebase.google.com](https://firebase.google.com)
2. Create a new project
3. Add a web app to your project
4. Enable Firestore Database in test mode
5. Copy the Firebase configuration from your project settings
6. Update the `firebase-config.js` file with your configuration values
7. Uncomment the Firebase initialization line to activate

Note: The app will still function without Firebase, but cloud synchronization features will not be available.

## Privacy Note

This app prioritizes privacy:
- No user accounts or personal data collection
- All data is stored locally by default
- Cloud synchronization is optional and requires a Firebase account
- No tracking or analytics are implemented

## Support

For issues or suggestions, please file an issue on our GitHub repository.

---

© 2023 Grocery & Meal Planner App 