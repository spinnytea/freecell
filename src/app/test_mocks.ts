jest.mock('gsap/all', () => ({
	gsap: {
		to: () => ({}),
		set: () => ({}),
		from: () => ({}),
		timeline: () => ({}),
		getProperty: () => ({}),
		registerPlugin: () => ({}),
		utils: {
			random: jest.fn().mockImplementation(() => {
				throw new Error('you MUST mock gsap.utils.random');
			}),
		},
	},
	Draggable: {
		create: () => [],
	},
}));
