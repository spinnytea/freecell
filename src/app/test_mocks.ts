import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

vi.mock('gsap/all', () => ({
	gsap: {
		to: () => ({}),
		set: () => ({}),
		from: () => ({}),
		timeline: () => ({}),
		getProperty: () => ({}),
		registerPlugin: () => ({}),
		utils: {
			random: vi.fn().mockImplementation(() => {
				throw new Error('you MUST mock gsap.utils.random');
			}),
		},
	},
	Draggable: {
		create: () => [],
	},
}));

beforeEach(() => {
	vi.stubGlobal('console', {
		...console,
		debug: vi.fn().mockImplementation(() => {
			throw new Error('must mock console.debug');
		}),
	});
});

afterEach(() => {
	cleanup();
});
