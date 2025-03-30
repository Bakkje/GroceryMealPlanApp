/**
 * Cloud Sync Module for Grocery & Meal Planner App
 * Handles synchronization between devices using Firebase Realtime Database
 */

// Use external Firebase config if available, otherwise fallback to demo config
let firebaseConfig;
if (window.firebaseConfig) {
  firebaseConfig = window.firebaseConfig;
  console.log('Using external Firebase configuration');
} else {
  console.warn('Using demo Firebase configuration - REPLACE WITH YOUR OWN CONFIG IN PRODUCTION');
  // Demo config - replace with your actual Firebase project config
  firebaseConfig = {
    apiKey: "AIzaSyCloudSyncDemoKey123456", // Replace with your actual Firebase API key
    authDomain: "grocery-meal-planner.firebaseapp.com",
    databaseURL: "https://grocery-meal-planner-default-rtdb.firebaseio.com",
    projectId: "grocery-meal-planner",
    storageBucket: "grocery-meal-planner.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
  };
}

// Global variables
let db;
let currentUser = null;
let firebaseApp;
let firebaseDB;
let syncInProgress = false;

// Initialize sync system
function initCloudSync() {
  return new Promise((resolve, reject) => {
    console.log('Initializing cloud sync system...');
    
    // Initialize local storage first
    initIndexedDB()
      .then(() => {
        // Then initialize Firebase (if available)
        if (typeof firebase !== 'undefined') {
          try {
            // Initialize Firebase
            firebaseApp = firebase.initializeApp(firebaseConfig);
            firebaseDB = firebase.database();
            console.log('Firebase initialized successfully');
            
            // Check if user is already logged in
            firebase.auth().onAuthStateChanged(user => {
              if (user) {
                console.log('User is signed in:', user.email);
                currentUser = user;
                setupSyncListeners();
              } else {
                console.log('No user is signed in');
                currentUser = null;
              }
              resolve();
            });
          } catch (error) {
            console.error('Firebase initialization error:', error);
            resolve(); // Continue anyway with local storage
          }
        } else {
          console.log('Firebase not available, running in offline mode');
          resolve(); // Continue with local storage only
        }
      })
      .catch(error => {
        console.error('Error initializing IndexedDB:', error);
        reject(error);
      });
  });
}

// IndexedDB initialization for local persistence
function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GroceryMealPlannerDB', 1);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      // Create stores for different types of data
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'email' });
      }
      
      if (!db.objectStoreNames.contains('sharedLists')) {
        db.createObjectStore('sharedLists', { keyPath: 'shareCode' });
      }
      
      if (!db.objectStoreNames.contains('mealPlans')) {
        db.createObjectStore('mealPlans', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('recipes')) {
        db.createObjectStore('recipes', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = event => {
      db = event.target.result;
      console.log('IndexedDB initialized successfully');
      
      // Migrate data from localStorage if exists
      migrateFromLocalStorage()
        .then(() => resolve())
        .catch(error => reject(error));
    };
    
    request.onerror = event => {
      console.error('IndexedDB initialization error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Migrate data from localStorage to IndexedDB
function migrateFromLocalStorage() {
  return new Promise((resolve, reject) => {
    try {
      // Check for existing localStorage data
      const localUsers = JSON.parse(localStorage.getItem('appUsers') || '{}');
      const localSharedLists = JSON.parse(localStorage.getItem('sharedGroceryLists') || '{}');
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      const currentSharedCode = localStorage.getItem('currentSharedCode');
      
      // If we have localStorage data, move it to IndexedDB
      const hasData = Object.keys(localUsers).length > 0 || Object.keys(localSharedLists).length > 0;
      
      if (hasData) {
        console.log('Migrating data from localStorage to IndexedDB...');
        
        const transaction = db.transaction(['users', 'sharedLists'], 'readwrite');
        const userStore = transaction.objectStore('users');
        const sharedListStore = transaction.objectStore('sharedLists');
        
        // Migrate users
        Object.keys(localUsers).forEach(email => {
          const userData = localUsers[email];
          userData.email = email;
          userData.lastUpdated = new Date().toISOString();
          userStore.put(userData);
        });
        
        // Migrate shared lists
        Object.keys(localSharedLists).forEach(shareCode => {
          const listData = localSharedLists[shareCode];
          listData.shareCode = shareCode;
          listData.lastUpdated = new Date().toISOString();
          sharedListStore.put(listData);
        });
        
        transaction.oncomplete = () => {
          console.log('Migration completed successfully');
          
          // Save current user info
          if (currentUserEmail && currentSharedCode) {
            setCurrentUser(currentUserEmail, currentSharedCode);
          }
          
          resolve();
        };
        
        transaction.onerror = event => {
          console.error('Migration error:', event.target.error);
          reject(event.target.error);
        };
      } else {
        console.log('No localStorage data to migrate');
        resolve();
      }
    } catch (error) {
      console.error('Migration error:', error);
      reject(error);
    }
  });
}

// Authenticate user with Firebase
function authenticateUser(email, password) {
  return new Promise((resolve, reject) => {
    if (typeof firebase === 'undefined') {
      reject(new Error('Firebase is not available, cannot authenticate user'));
      return;
    }
    
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        // Signed in
        currentUser = userCredential.user;
        console.log('User authenticated:', currentUser.email);
        setupSyncListeners();
        resolve(currentUser);
      })
      .catch(error => {
        console.error('Authentication error:', error);
        
        // If user doesn't exist, create it
        if (error.code === 'auth/user-not-found') {
          firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
              // Signed up & in
              currentUser = userCredential.user;
              console.log('New user created and authenticated:', currentUser.email);
              setupSyncListeners();
              resolve(currentUser);
            })
            .catch(createError => {
              console.error('User creation error:', createError);
              reject(createError);
            });
        } else {
          reject(error);
        }
      });
  });
}

// Sign out user
function signOutUser() {
  return new Promise((resolve, reject) => {
    // Clear local current user
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentSharedCode');
    currentUser = null;
    
    // Sign out from Firebase if available
    if (typeof firebase !== 'undefined') {
      firebase.auth().signOut()
        .then(() => {
          console.log('User signed out from Firebase');
          resolve();
        })
        .catch(error => {
          console.error('Firebase sign out error:', error);
          reject(error);
        });
    } else {
      resolve();
    }
  });
}

// Set current user info
function setCurrentUser(email, shareCode) {
  localStorage.setItem('currentUserEmail', email);
  localStorage.setItem('currentSharedCode', shareCode);
  return { email, shareCode };
}

// Get current user info
function getCurrentUser() {
  return {
    email: localStorage.getItem('currentUserEmail'),
    shareCode: localStorage.getItem('currentSharedCode')
  };
}

// Setup listeners for real-time sync
function setupSyncListeners() {
  if (!currentUser || !firebaseDB) return;
  
  const userEmail = currentUser.email;
  const userId = userEmail.replace(/[.#$/[\]]/g, '_');
  
  // Listen for changes to shared lists
  const sharedListsRef = firebaseDB.ref(`users/${userId}/sharedLists`);
  
  sharedListsRef.on('child_changed', snapshot => {
    if (syncInProgress) return;
    
    const shareCode = snapshot.key;
    const cloudData = snapshot.val();
    
    console.log(`Cloud data changed for list ${shareCode}, updating local storage...`);
    
    // Update local data
    updateLocalSharedList(shareCode, cloudData);
  });
}

// Get users from IndexedDB
function getUsers() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    const request = store.getAll();
    
    request.onsuccess = event => {
      const users = {};
      event.target.result.forEach(user => {
        users[user.email] = user;
      });
      resolve(users);
    };
    
    request.onerror = event => {
      console.error('Error getting users:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Get shared lists from IndexedDB
function getSharedLists() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sharedLists'], 'readonly');
    const store = transaction.objectStore('sharedLists');
    const request = store.getAll();
    
    request.onsuccess = event => {
      const lists = {};
      event.target.result.forEach(list => {
        lists[list.shareCode] = list;
      });
      resolve(lists);
    };
    
    request.onerror = event => {
      console.error('Error getting shared lists:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Save user to IndexedDB and sync to cloud
function saveUser(email, userData) {
  return new Promise((resolve, reject) => {
    // Add email field to userData
    userData.email = email;
    userData.lastUpdated = new Date().toISOString();
    
    const transaction = db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    const request = store.put(userData);
    
    request.onsuccess = () => {
      console.log('User saved locally:', email);
      
      // Sync to cloud if user is authenticated
      if (currentUser && firebaseDB) {
        syncUserToCloud(email, userData)
          .then(() => resolve())
          .catch(error => {
            console.error('Error syncing user to cloud:', error);
            addToSyncQueue('users', email, userData);
            resolve(); // Still resolve as local save succeeded
          });
      } else {
        addToSyncQueue('users', email, userData);
        resolve();
      }
    };
    
    request.onerror = event => {
      console.error('Error saving user:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Save shared list to IndexedDB and sync to cloud
function saveSharedList(shareCode, listData) {
  return new Promise((resolve, reject) => {
    // Add shareCode field to listData
    listData.shareCode = shareCode;
    listData.lastUpdated = new Date().toISOString();
    
    const transaction = db.transaction(['sharedLists'], 'readwrite');
    const store = transaction.objectStore('sharedLists');
    const request = store.put(listData);
    
    request.onsuccess = () => {
      console.log('Shared list saved locally:', shareCode);
      
      // Sync to cloud if user is authenticated
      if (currentUser && firebaseDB) {
        syncSharedListToCloud(shareCode, listData)
          .then(() => resolve())
          .catch(error => {
            console.error('Error syncing shared list to cloud:', error);
            addToSyncQueue('sharedLists', shareCode, listData);
            resolve(); // Still resolve as local save succeeded
          });
      } else {
        addToSyncQueue('sharedLists', shareCode, listData);
        resolve();
      }
    };
    
    request.onerror = event => {
      console.error('Error saving shared list:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Sync user to cloud
function syncUserToCloud(email, userData) {
  return new Promise((resolve, reject) => {
    if (!currentUser || !firebaseDB) {
      reject(new Error('Not authenticated or Firebase not available'));
      return;
    }
    
    const userId = email.replace(/[.#$/[\]]/g, '_');
    const userRef = firebaseDB.ref(`users/${userId}/userData`);
    
    syncInProgress = true;
    
    userRef.set(userData)
      .then(() => {
        console.log('User synced to cloud:', email);
        syncInProgress = false;
        resolve();
      })
      .catch(error => {
        console.error('Error syncing user to cloud:', error);
        syncInProgress = false;
        reject(error);
      });
  });
}

// Sync shared list to cloud
function syncSharedListToCloud(shareCode, listData) {
  return new Promise((resolve, reject) => {
    if (!currentUser || !firebaseDB) {
      reject(new Error('Not authenticated or Firebase not available'));
      return;
    }
    
    const userId = currentUser.email.replace(/[.#$/[\]]/g, '_');
    const listRef = firebaseDB.ref(`users/${userId}/sharedLists/${shareCode}`);
    
    syncInProgress = true;
    
    listRef.set(listData)
      .then(() => {
        console.log('Shared list synced to cloud:', shareCode);
        
        // Also update shared references for other users
        if (listData.owner === currentUser.email) {
          // This is the owner, update the shared reference
          const sharedRef = firebaseDB.ref(`sharedLists/${shareCode}`);
          sharedRef.set({
            owner: listData.owner,
            updatedAt: listData.updatedAt,
            reference: `users/${userId}/sharedLists/${shareCode}`
          })
            .then(() => {
              console.log('Shared reference updated');
              syncInProgress = false;
              resolve();
            })
            .catch(error => {
              console.error('Error updating shared reference:', error);
              syncInProgress = false;
              reject(error);
            });
        } else {
          syncInProgress = false;
          resolve();
        }
      })
      .catch(error => {
        console.error('Error syncing shared list to cloud:', error);
        syncInProgress = false;
        reject(error);
      });
  });
}

// Update local shared list with data from cloud
function updateLocalSharedList(shareCode, cloudData) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sharedLists'], 'readwrite');
    const store = transaction.objectStore('sharedLists');
    
    // Get current data first
    const getRequest = store.get(shareCode);
    
    getRequest.onsuccess = event => {
      const currentData = event.target.result || { shareCode };
      
      // Compare last updated timestamps
      const cloudUpdated = new Date(cloudData.updatedAt || 0);
      const localUpdated = new Date(currentData.updatedAt || 0);
      
      if (cloudUpdated > localUpdated) {
        // Cloud data is newer, update local
        console.log(`Updating local data for list ${shareCode} with newer cloud data`);
        cloudData.shareCode = shareCode;
        
        const updateRequest = store.put(cloudData);
        
        updateRequest.onsuccess = () => {
          console.log(`Local data updated for list ${shareCode}`);
          resolve(cloudData);
        };
        
        updateRequest.onerror = event => {
          console.error('Error updating local data:', event.target.error);
          reject(event.target.error);
        };
      } else {
        console.log(`Local data for list ${shareCode} is already up to date`);
        resolve(currentData);
      }
    };
    
    getRequest.onerror = event => {
      console.error('Error getting shared list:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Add item to sync queue for later processing
function addToSyncQueue(storeName, itemKey, itemData) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    const syncItem = {
      storeName,
      itemKey,
      itemData,
      timestamp: new Date().toISOString(),
      attempts: 0
    };
    
    const request = store.add(syncItem);
    
    request.onsuccess = () => {
      console.log(`Added to sync queue: ${storeName}/${itemKey}`);
      resolve();
    };
    
    request.onerror = event => {
      console.error('Error adding to sync queue:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Process sync queue
function processSyncQueue() {
  return new Promise((resolve, reject) => {
    if (!currentUser || !firebaseDB) {
      console.log('Not authenticated or Firebase not available, skipping sync');
      resolve();
      return;
    }
    
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.getAll();
    
    request.onsuccess = async event => {
      const items = event.target.result;
      console.log(`Processing sync queue: ${items.length} items`);
      
      for (const item of items) {
        try {
          if (item.storeName === 'users') {
            await syncUserToCloud(item.itemKey, item.itemData);
          } else if (item.storeName === 'sharedLists') {
            await syncSharedListToCloud(item.itemKey, item.itemData);
          }
          
          // Remove from queue after successful sync
          await removeFromSyncQueue(item.id);
        } catch (error) {
          console.error(`Error processing sync item ${item.id}:`, error);
          
          // Increment attempt count
          item.attempts += 1;
          if (item.attempts < 5) {
            // Update item in queue
            await updateSyncQueueItem(item);
          } else {
            // Too many attempts, remove from queue
            await removeFromSyncQueue(item.id);
            console.error(`Giving up on sync item ${item.id} after too many attempts`);
          }
        }
      }
      
      resolve();
    };
    
    request.onerror = event => {
      console.error('Error getting sync queue:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Remove item from sync queue
function removeFromSyncQueue(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.delete(id);
    
    request.onsuccess = () => {
      console.log(`Removed item ${id} from sync queue`);
      resolve();
    };
    
    request.onerror = event => {
      console.error(`Error removing item ${id} from sync queue:`, event.target.error);
      reject(event.target.error);
    };
  });
}

// Update sync queue item
function updateSyncQueueItem(item) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    const request = store.put(item);
    
    request.onsuccess = () => {
      console.log(`Updated sync queue item ${item.id}, attempt ${item.attempts}`);
      resolve();
    };
    
    request.onerror = event => {
      console.error(`Error updating sync queue item ${item.id}:`, event.target.error);
      reject(event.target.error);
    };
  });
}

// Periodically process sync queue
function startSyncQueueProcessing() {
  // Process queue immediately
  processSyncQueue().catch(error => {
    console.error('Error processing sync queue:', error);
  });
  
  // Then process every 5 minutes
  setInterval(() => {
    processSyncQueue().catch(error => {
      console.error('Error processing sync queue:', error);
    });
  }, 5 * 60 * 1000);
}

// Check for network status changes
function setupNetworkStatusListeners() {
  window.addEventListener('online', () => {
    console.log('Network connection restored, processing sync queue...');
    processSyncQueue().catch(error => {
      console.error('Error processing sync queue:', error);
    });
  });
  
  window.addEventListener('offline', () => {
    console.log('Network connection lost, sync will resume when online');
  });
}

// Export functions
window.cloudSync = {
  init: initCloudSync,
  authenticate: authenticateUser,
  signOut: signOutUser,
  getUsers,
  getSharedLists,
  saveUser,
  saveSharedList,
  getCurrentUser,
  setCurrentUser
};

// Run initialization when script loads
document.addEventListener('DOMContentLoaded', () => {
  // Initialize cloud sync
  initCloudSync()
    .then(() => {
      console.log('Cloud sync system initialized');
      startSyncQueueProcessing();
      setupNetworkStatusListeners();
    })
    .catch(error => {
      console.error('Error initializing cloud sync:', error);
    });
}); 