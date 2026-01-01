export function spyOnGsap(_gsap: typeof gsap) {
	const toGsapSpy = jest.spyOn(_gsap, 'to');
	const setGsapSpy = jest.spyOn(_gsap, 'set');
	const fromGsapSpy = jest.spyOn(_gsap, 'from');
	const fromToSpy = jest.fn();
	const toSpy = jest.fn();
	const setSpy = jest.fn();
	const addLabelSpy = jest.fn();
	const addSpy = jest.fn();
	const timeScaleSpy = jest.fn();
	let timelineOnComplete: gsap.Callback | undefined;
	const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {
		throw new Error('must mock console.debug');
	});

	jest.spyOn(_gsap, 'timeline').mockImplementation((vars: gsap.TimelineVars | undefined) => {
		timelineOnComplete = vars?.onComplete;
		const timelineMock: unknown = {
			fromTo: fromToSpy,
			to: toSpy,
			set: setSpy,
			addLabel: addLabelSpy,
			add: addSpy,
			timeScale: timeScaleSpy,
			totalProgress: () => ({
				kill: () => {
					/* empty */
				},
			}),
		};
		return timelineMock as gsap.core.Timeline;
	});

	function mockReset(runOnComplete = true) {
		if (timelineOnComplete && runOnComplete) {
			timelineOnComplete();
		}

		toGsapSpy.mockReset();
		setGsapSpy.mockReset();
		fromGsapSpy.mockReset();
		fromToSpy.mockReset();
		toSpy.mockReset();
		setSpy.mockReset();
		addLabelSpy.mockReset();
		addSpy.mockReset();
		timeScaleSpy.mockReset();
	}

	function mockCallTimes(): Record<string, number> {
		return Object.entries({
			toGsapSpy,
			setGsapSpy,
			fromGsapSpy,
			fromToSpy,
			toSpy,
			setSpy,
			addLabelSpy,
			addSpy,
			timeScaleSpy,
			consoleDebugSpy,
		} as Record<string, jest.SpyInstance>).reduce<Record<string, number>>((acc, [key, spy]) => {
			const length = spy.mock.calls.length;
			if (length > 0) {
				acc[key] = length;
			}
			return acc;
		}, {});
	}

	// REVIEW (techdebt) can we add more helper functions and remove the spies?
	return {
		// gsap spies
		toGsapSpy,
		setGsapSpy,
		fromGsapSpy,
		fromToSpy,
		toSpy,
		setSpy,
		addLabelSpy,
		addSpy,
		timeScaleSpy,
		// others
		timelineOnComplete,
		consoleDebugSpy,
		// helper functions
		mockReset,
		mockCallTimes,
	};
}
