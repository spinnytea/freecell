import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { OfflineServiceWorker } from '@/app/OfflineServiceWorker';

describe('OfflineServiceWorker', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	test('registers the offline service worker when the browser supports it', () => {
		const registerSpy = vi.fn().mockResolvedValue(undefined);
		const serviceWorkerMock = {
			register: registerSpy,
		};
		Object.defineProperty(globalThis.navigator, 'serviceWorker', {
			configurable: true,
			value: serviceWorkerMock,
		});

		render(<OfflineServiceWorker />);

		expect(registerSpy).toHaveBeenCalledWith('/freecell/sw.js');
	});
});
