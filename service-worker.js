// Service Worker for Grocery & Meal Planner App
const CACHE_NAME = 'grocery-meal-planner-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/groceries.html',
  '/meal-plan.html',
  '/recipes.html',
  '/app-icon.svg',
  '/app-icon.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
  // Skip Firebase API calls and let them go directly to network
  if (event.request.url.includes('firebaseio.com') || 
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('firestore') ||
      event.request.url.includes('identitytoolkit')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Make a copy of the response
        const responseCopy = response.clone();
        
        // Open the cache
        caches.open(CACHE_NAME)
          .then(cache => {
            // Add the response to the cache
            cache.put(event.request, responseCopy);
          });
          
        return response;
      })
      .catch(() => caches.match(event.request))
  );
}); 