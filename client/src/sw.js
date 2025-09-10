// src/sw.js

// This is the injection point for the precache manifest.
// The vite-plugin-pwa will inject the list of files here.
// This must be present in your custom sw.js file.
import { precacheAndRoute } from 'workbox-precaching';
// const { precacheAndRoute } = self.workbox.precaching;

// Use importScripts to load the OneSignal SDK worker.
importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');

// Make sure your custom sw.js file includes this line.
precacheAndRoute(self.__WB_MANIFEST);

// Add any other custom service worker logic here (e.g., fetch event handlers).
self.addEventListener('fetch', (event) => {
  // Your custom caching logic goes here.
});