'use client';

import { useEffect } from 'react';
import { ASSET_FOLDER } from '@/app/components/cards/constants';

const SERVICE_WORKER_PATH = `${ASSET_FOLDER}/sw-${process.env.VERSION ?? 'Unknown'}.js`;

export function OfflineServiceWorker() {
	useEffect(() => {
		if (!('serviceWorker' in navigator)) {
			return;
		}
		if (process.env.NODE_ENV === 'development') {
			return;
		}

		navigator.serviceWorker.register(SERVICE_WORKER_PATH).catch(() => {
			// Ignore service worker registration failures here so the game still renders.
		});
	}, []);

	return null;
}
