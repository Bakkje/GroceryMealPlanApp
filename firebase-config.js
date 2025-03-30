// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
let firebaseInitialized = false;
let firebaseDb = null;

// Initialize Firebase if the SDK is available
function initializeFirebase() {
  if (typeof firebase !== 'undefined' && !firebaseInitialized) {
    firebase.initializeApp(firebaseConfig);
    firebaseDb = firebase.database();
    firebaseInitialized = true;
    console.log('Firebase initialized successfully');
    return true;
  } else if (firebaseInitialized) {
    return true;
  } else {
    console.warn('Firebase SDK not available');
    return false;
  }
}

// Uncomment this line to activate Firebase integration
// window.addEventListener('DOMContentLoaded', initializeFirebase); 