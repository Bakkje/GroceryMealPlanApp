/**
 * Cloud Sync Module for Grocery & Meal Planner App
 * Handles synchronization between devices using Firebase Firestore
 */

// Global variables
let db;
let deviceId = null;
let shareCode = null;
let firestoreDb = null;
let syncInProgress = false;
let syncStartListeners = [];
let syncCompleteListeners = [];

// Initialize sync system
function initCloudSync() {
  return new Promise((resolve, reject) => {
    console.log('Initializing cloud sync system with Firestore...');
    
    // Initialize local storage first
    initIndexedDB()
      .then(() => {
        // Initialize device ID
        initDeviceId();
        
        // Then initialize Firebase & Firestore (if available)
        if (window.firebaseConfig && typeof firebase !== 'undefined') {
          try {
            // Initialize Firebase
            window.firebaseConfig.init();
            firestoreDb = window.firebaseConfig.getDb();
            console.log('Firestore initialized successfully');
            
            // Set up real-time listeners
            setupFirestoreListeners();
            resolve();
          } catch (error) {
            console.error('Firestore initialization error:', error);
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
    const request = indexedDB.open('GroceryMealPlannerDB', 2);
    
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

// Set up Firestore real-time listeners
function setupFirestoreListeners() {
  if (!firestoreDb || !shareCode) return;

  console.log(`Setting up Firestore listener for share code: ${shareCode}`);
  
  // Listen for changes to the shared list document
  const unsubscribe = firestoreDb.collection('sharedLists').doc(shareCode)
    .onSnapshot((doc) => {
      if (syncInProgress) return;
      
      if (doc.exists) {
        const cloudData = doc.data();
        console.log(`Cloud data changed for list ${shareCode}, updating local storage...`);
        
        // Notify listeners that sync has started
        notifySyncStart();
        
        // Update local data
        updateLocalSharedList(shareCode, cloudData)
          .then(() => {
            // Notify listeners that sync is complete
            notifySyncComplete();
          })
          .catch(error => {
            console.error('Error updating local data:', error);
          });
      }
    }, (error) => {
      console.error('Firestore listener error:', error);
    });
  
  // Store the unsubscribe function for later cleanup
  window.firestoreUnsubscribe = unsubscribe;
}

// Join a shared list
function joinSharedList(code) {
  return new Promise((resolve, reject) => {
    if (!code || code.length !== 6) {
      reject(new Error('Invalid share code'));
      return;
    }
    
    // Check if the shared list exists in Firestore
    if (firestoreDb) {
      firestoreDb.collection('sharedLists').doc(code).get()
        .then(doc => {
          if (doc.exists) {
            // List exists, save the share code
            shareCode = code;
            localStorage.setItem('shareCode', code);
            
            // Set up Firestore listeners for the new code
            setupFirestoreListeners();
            
            // Sync the list from Firestore
            return syncSharedListFromCloud(code);
          } else {
            // If list doesn't exist, create it
            return createNewSharedList(code)
              .then(() => {
                shareCode = code;
                localStorage.setItem('shareCode', code);
                setupFirestoreListeners();
              });
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
      // No Firestore, just save the share code locally
      shareCode = code;
      localStorage.setItem('shareCode', code);
      resolve();
    }
  });
}

// Create a new shared list in Firestore
function createNewSharedList(code) {
  if (!firestoreDb) {
    return Promise.reject(new Error('Firestore not available'));
  }
  
  const newList = {
    shareCode: code,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: deviceId,
    items: []
  };
  
  return firestoreDb.collection('sharedLists').doc(code).set(newList);
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
  // If there was a previous listener, clean it up
  if (window.firestoreUnsubscribe) {
    window.firestoreUnsubscribe();
  }
  
  shareCode = code;
  localStorage.setItem('shareCode', code);
  
  // Set up new listener with the new code
  if (firestoreDb) {
    setupFirestoreListeners();
  }
  
  return { deviceId, shareCode };
}

// Get shared lists from IndexedDB
function getSharedLists() {
  return new Promise((resolve, reject) => {
    if (firestoreDb && shareCode) {
      // Try to get the list from Firestore first
      firestoreDb.collection('sharedLists').doc(shareCode).get()
        .then(doc => {
          if (doc.exists) {
            const lists = {};
            lists[shareCode] = doc.data();
            resolve(lists);
          } else {
            // Fall back to IndexedDB if not in Firestore
            getListsFromIndexedDB().then(resolve).catch(reject);
          }
        })
        .catch(error => {
          console.error('Error getting lists from Firestore:', error);
          // Fall back to IndexedDB
          getListsFromIndexedDB().then(resolve).catch(reject);
        });
    } else {
      // No Firestore, use IndexedDB
      getListsFromIndexedDB().then(resolve).catch(reject);
    }
  });
}

// Get lists from IndexedDB (helper function)
function getListsFromIndexedDB() {
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
      console.error('Error getting shared lists from IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Update a shared list
function updateSharedList(shareCode, updates) {
  return new Promise((resolve, reject) => {
    notifySyncStart();
    
    // Get the current list data
    getSharedLists()
      .then(lists => {
        let listData = lists[shareCode] || { shareCode };
        
        // Apply updates to the list data
        listData = { ...listData, ...updates, updatedAt: new Date().toISOString() };
        
        // Save to local IndexedDB
        return saveToIndexedDB(shareCode, listData)
          .then(() => {
            // Then save to Firestore
            if (firestoreDb) {
              return firestoreDb.collection('sharedLists').doc(shareCode).set(listData)
                .then(() => {
                  console.log('List updated in Firestore');
                  notifySyncComplete();
                  return listData;
                })
                .catch(error => {
                  console.error('Error updating list in Firestore:', error);
                  addToSyncQueue('sharedLists', shareCode, listData);
                  notifySyncComplete();
                  return listData; // Still resolve with local data
                });
            } else {
              // No Firestore, just add to sync queue
              addToSyncQueue('sharedLists', shareCode, listData);
              notifySyncComplete();
              return listData;
            }
          });
      })
      .then(listData => {
        resolve(listData);
      })
      .catch(error => {
        console.error('Error updating shared list:', error);
        notifySyncComplete();
        reject(error);
      });
  });
}

// Save list to IndexedDB
function saveToIndexedDB(shareCode, listData) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['sharedLists'], 'readwrite');
    const store = transaction.objectStore('sharedLists');
    const request = store.put(listData);
    
    request.onsuccess = () => {
      console.log('List saved to IndexedDB:', shareCode);
      resolve(listData);
    };
    
    request.onerror = event => {
      console.error('Error saving to IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Sync shared list from cloud
function syncSharedListFromCloud(shareCode) {
  return new Promise((resolve, reject) => {
    if (!firestoreDb) {
      reject(new Error('Firestore not available'));
      return;
    }
    
    notifySyncStart();
    
    firestoreDb.collection('sharedLists').doc(shareCode).get()
      .then(doc => {
        if (doc.exists) {
          const cloudData = doc.data();
          return updateLocalSharedList(shareCode, cloudData);
        } else {
          reject(new Error('Shared list not found'));
        }
      })
      .then(listData => {
        notifySyncComplete();
        resolve(listData);
      })
      .catch(error => {
        console.error('Error syncing from cloud:', error);
        notifySyncComplete();
        reject(error);
      });
  });
}

// Update local shared list with data from cloud
function updateLocalSharedList(shareCode, cloudData) {
  return saveToIndexedDB(shareCode, { ...cloudData, shareCode });
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
    if (!firestoreDb) {
      console.log('Firestore not available, skipping sync');
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
            await firestoreDb.collection('sharedLists').doc(item.itemKey).set(item.itemData);
            console.log(`Synced item from queue: ${item.itemKey}`);
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

// Add a sync start listener
function onSyncStart(callback) {
  if (typeof callback === 'function') {
    syncStartListeners.push(callback);
  }
}

// Add a sync complete listener
function onSyncComplete(callback) {
  if (typeof callback === 'function') {
    syncCompleteListeners.push(callback);
  }
}

// Notify all sync start listeners
function notifySyncStart() {
  syncInProgress = true;
  syncStartListeners.forEach(callback => {
    try {
      callback();
    } catch (error) {
      console.error('Error in sync start listener:', error);
    }
  });
}

// Notify all sync complete listeners
function notifySyncComplete() {
  syncInProgress = false;
  syncCompleteListeners.forEach(callback => {
    try {
      callback();
    } catch (error) {
      console.error('Error in sync complete listener:', error);
    }
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
  updateSharedList,
  getCurrentDevice,
  setShareCode,
  joinSharedList,
  generateShareCode,
  onSyncStart,
  onSyncComplete
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