jest.mock('gsap/all', () => ({
	gsap: {
		to: () => ({}),
		set: () => ({}),
		from: () => ({}),
		timeline: () => ({}),
		getProperty: () => ({}),
		registerPlugin: () => ({}),
		utils: {
			random: () => undefined,
		},
	},
	Draggable: {
		create: () => [],
	},
}));
