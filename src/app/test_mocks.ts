import { vi } from 'vitest';

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
