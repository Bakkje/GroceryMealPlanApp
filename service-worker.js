// Service Worker for Grocery & Meal Planner App
const CACHE_NAME = 'grocery-meal-planner-v1';

// Assets to cache
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/groceries.html',
  '/meal-plan.html',
  '/recipes.html',
  '/src/styles/main.css',
  '/app-icon.svg',
  '/app-icon.png',
  '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  // Precache static assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('Service Worker: Assets cached');
        return self.skipWaiting(); // Ensure service worker activates immediately
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Clearing old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim(); // Take control of all clients
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests like Google Analytics
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('Service Worker: Served from cache', event.request.url);
          return cachedResponse;
        }
        
        // Network request, then cache response
        return fetch(event.request)
          .then(response => {
            // Don't cache if not a valid response or not a GET request
            if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
              return response;
            }
            
            // Clone the response - one to return, one to cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                console.log('Service Worker: Caching new resource', event.request.url);
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.log('Service Worker: Fetch failed; returning offline page instead.', error);
            // If fetch fails, we could serve a custom offline page here
            // return caches.match('/offline.html');
          });
      })
  );
});

// Handle sync events for background syncing
self.addEventListener('sync', function(event) {
  console.log('Service Worker: Sync event triggered', event.tag);
  
  if (event.tag === 'sync-grocery-lists') {
    event.waitUntil(syncGroceryLists());
  }
});

// Function to sync grocery lists when online
async function syncGroceryLists() {
  // This would be implemented to sync local changes with a server
  // when connectivity is restored
  console.log('Service Worker: Attempting to sync grocery lists');
  
  // Get data from IndexedDB or localStorage that needs to be synced
  // const pendingChanges = await getPendingChanges();
  
  // Send data to server
  // await sendToServer(pendingChanges);
  
  console.log('Service Worker: Sync completed');
}

// Listen for push notifications
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push notification received', event);
  
  const title = 'Grocery & Meal Planner';
  const options = {
    body: event.data.text(),
    icon: '/app-icon.png',
    badge: '/app-icon.png'
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// Listen for notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Notification click received', event);
  
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('Service Worker registered'); 