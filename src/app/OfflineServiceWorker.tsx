'use client';

import { useEffect } from 'react';

const SERVICE_WORKER_PATH = `${process.env.BASE_PATH ?? ''}/sw.js`;

export function OfflineServiceWorker() {
	useEffect(() => {
		if (!('serviceWorker' in navigator)) {
			return;
		}

		navigator.serviceWorker.register(SERVICE_WORKER_PATH).catch(() => {
			// Ignore service worker registration failures here so the game still renders.
		});
	}, []);

	return null;
}
