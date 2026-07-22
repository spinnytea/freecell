const CACHE_NAME = 'freecell-offline-v__VERSION__'; // @see write-service-worker.mjs
const APP_SHELL_PREFETCH = [
	'/freecell/',
	'/freecell/manifest.webmanifest',
	'/freecell/favicon.svg',
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			await cache.addAll(APP_SHELL_PREFETCH);
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
				// if the request is not cached
				// and the request fails
				// return index.html
				return caches.match('/freecell/');
			}
		})()
	);
});
