// Keep this in sync with the release version so a new deploy gets a fresh cache.
const CACHE_NAME = 'freecell-offline-v2.0.12';
const APP_SHELL = ['/freecell/', '/freecell/manifest.webmanifest', '/freecell/manifest-icon.svg'];

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			await cache.addAll(APP_SHELL);
			await self.skipWaiting();
		})()
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const cacheNames = await caches.keys();
			await Promise.all(
				cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
			);
			await self.clients.claim();
		})()
	);
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') {
		return;
	}

	event.respondWith(
		(async () => {
			const request = event.request;
			const cachedResponse = await caches.match(request, { ignoreSearch: true });
			if (cachedResponse) {
				return cachedResponse;
			}

			try {
				const networkResponse = await fetch(request);
				const cache = await caches.open(CACHE_NAME);
				cache.put(request, networkResponse.clone());
				return networkResponse;
			} catch {
				return caches.match('/freecell/');
			}
		})()
	);
});
