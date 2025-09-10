// src/sw.js

import { precacheAndRoute } from 'workbox-precaching';

// ✅ Load OneSignal push worker inside the same SW
importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');

// ✅ Precache assets injected by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

// ✅ (Optional) Your own logic later
self.addEventListener('fetch', () => {
  // custom caching logic if needed
});
