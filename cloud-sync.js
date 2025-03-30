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
let deviceId = null;
let shareCode = null;
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
        // Initialize device ID
        initDeviceId();
        
        // Then initialize Firebase (if available)
        if (typeof firebase !== 'undefined') {
          try {
            // Initialize Firebase
            firebaseApp = firebase.initializeApp(firebaseConfig);
            firebaseDB = firebase.database();
            console.log('Firebase initialized successfully');
            
            // Set up sync listeners
            setupSyncListeners();
            resolve();
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
      if (!db.objectStoreNames.contains('sharedLists')) {
        db.createObjectStore('sharedLists', { keyPath: 'shareCode' });
      }
      
      if (!db.objectStoreNames.contains('deviceInfo')) {
        db.createObjectStore('deviceInfo', { keyPath: 'id' });
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

// Generate a unique device ID if it doesn't exist
function initDeviceId() {
  deviceId = localStorage.getItem('deviceId');
  shareCode = localStorage.getItem('shareCode');
  
  if (!deviceId) {
    deviceId = generateUniqueId();
    localStorage.setItem('deviceId', deviceId);
  }
  
  if (!shareCode) {
    shareCode = generateShareCode();
    localStorage.setItem('shareCode', shareCode);
  }
  
  console.log(`Device ID: ${deviceId}, Share Code: ${shareCode}`);
}

// Generate a unique ID for the device
function generateUniqueId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Generate random share code
function generateShareCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Migrate data from localStorage to IndexedDB
function migrateFromLocalStorage() {
  return new Promise((resolve, reject) => {
    try {
      // Check for existing localStorage data
      const localSharedLists = JSON.parse(localStorage.getItem('sharedGroceryLists') || '{}');
      
      // If we have localStorage data, move it to IndexedDB
      const hasData = Object.keys(localSharedLists).length > 0;
      
      if (hasData) {
        console.log('Migrating data from localStorage to IndexedDB...');
        
        const transaction = db.transaction(['sharedLists'], 'readwrite');
        const sharedListStore = transaction.objectStore('sharedLists');
        
        // Migrate shared lists
        Object.keys(localSharedLists).forEach(shareCode => {
          const listData = localSharedLists[shareCode];
          listData.shareCode = shareCode;
          listData.lastUpdated = new Date().toISOString();
          sharedListStore.put(listData);
        });
        
        transaction.oncomplete = () => {
          console.log('Migration completed successfully');
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

// Join a shared list
function joinSharedList(code) {
  return new Promise((resolve, reject) => {
    if (!code || code.length !== 6) {
      reject(new Error('Invalid share code'));
      return;
    }
    
    // Check if the shared list exists in Firebase
    if (firebaseDB) {
      const sharedRef = firebaseDB.ref(`sharedLists/${code}`);
      
      sharedRef.once('value')
        .then(snapshot => {
          if (snapshot.exists()) {
            // List exists, save the share code
            shareCode = code;
            localStorage.setItem('shareCode', code);
            
            // Set up sync listeners for the new code
            setupSyncListeners();
            
            // Sync the list from Firebase
            return syncSharedListFromCloud(code);
          } else {
            reject(new Error('Shared list not found'));
          }
        })
        .then(() => {
          resolve();
        })
        .catch(error => {
          console.error('Error joining shared list:', error);
          reject(error);
        });
    } else {
      // No Firebase, just save the share code locally
      shareCode = code;
      localStorage.setItem('shareCode', code);
      resolve();
    }
  });
}

// Get the current device info
function getCurrentDevice() {
  return {
    deviceId,
    shareCode
  };
}

// Set share code
function setShareCode(code) {
  shareCode = code;
  localStorage.setItem('shareCode', code);
  return { deviceId, shareCode };
}

// Setup listeners for real-time sync
function setupSyncListeners() {
  if (!firebaseDB || !shareCode) return;
  
  // Listen for changes to shared lists
  const sharedListRef = firebaseDB.ref(`sharedLists/${shareCode}`);
  
  sharedListRef.on('child_changed', snapshot => {
    if (syncInProgress) return;
    
    const cloudData = snapshot.val();
    
    console.log(`Cloud data changed for list ${shareCode}, updating local storage...`);
    
    // Update local data
    updateLocalSharedList(shareCode, cloudData);
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
      
      // Sync to cloud if Firebase is available
      if (firebaseDB) {
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

// Sync shared list to cloud
function syncSharedListToCloud(shareCode, listData) {
  return new Promise((resolve, reject) => {
    if (!firebaseDB) {
      reject(new Error('Firebase not available'));
      return;
    }
    
    const listRef = firebaseDB.ref(`sharedLists/${shareCode}`);
    
    syncInProgress = true;
    
    listRef.set(listData)
      .then(() => {
        console.log('Shared list synced to cloud:', shareCode);
        syncInProgress = false;
        resolve();
      })
      .catch(error => {
        console.error('Error syncing shared list to cloud:', error);
        syncInProgress = false;
        reject(error);
      });
  });
}

// Sync shared list from cloud
function syncSharedListFromCloud(shareCode) {
  return new Promise((resolve, reject) => {
    if (!firebaseDB) {
      reject(new Error('Firebase not available'));
      return;
    }
    
    const listRef = firebaseDB.ref(`sharedLists/${shareCode}`);
    
    listRef.once('value')
      .then(snapshot => {
        if (snapshot.exists()) {
          const cloudData = snapshot.val();
          return updateLocalSharedList(shareCode, cloudData);
        } else {
          reject(new Error('Shared list not found'));
        }
      })
      .then(listData => {
        resolve(listData);
      })
      .catch(error => {
        console.error('Error syncing shared list from cloud:', error);
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
    if (!firebaseDB) {
      console.log('Firebase not available, skipping sync');
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
          if (item.storeName === 'sharedLists') {
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
  getSharedLists,
  saveSharedList,
  getCurrentDevice,
  setShareCode,
  joinSharedList,
  generateShareCode
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