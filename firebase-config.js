// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase and Firestore
let firebaseInitialized = false;
let firestoreDb = null;

// Initialize Firebase and Firestore if the SDK is available
function initializeFirebase() {
  if (typeof firebase !== 'undefined' && !firebaseInitialized) {
    const app = firebase.initializeApp(firebaseConfig);
    firestoreDb = firebase.firestore(app);
    firebaseInitialized = true;
    console.log('Firebase and Firestore initialized successfully');
    return true;
  } else if (firebaseInitialized) {
    return true;
  } else {
    console.warn('Firebase SDK not available');
    return false;
  }
}

// Export for use in other files
window.firebaseConfig = {
  init: initializeFirebase,
  getDb: () => firestoreDb
};

// Uncomment this line to activate Firebase integration
// window.addEventListener('DOMContentLoaded', initializeFirebase); 