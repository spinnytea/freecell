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

	// FIXME cleanup, this is ugly
	function mockCallTimes(): Record<string, number> {
		const data: Record<string, number> = {
			toGsapSpy: toGsapSpy.mock.calls.length,
			setGsapSpy: setGsapSpy.mock.calls.length,
			fromGsapSpy: fromGsapSpy.mock.calls.length,
			fromToSpy: fromToSpy.mock.calls.length,
			toSpy: toSpy.mock.calls.length,
			setSpy: setSpy.mock.calls.length,
			addLabelSpy: addLabelSpy.mock.calls.length,
			addSpy: addSpy.mock.calls.length,
			timeScaleSpy: timeScaleSpy.mock.calls.length,
			consoleDebugSpy: consoleDebugSpy.mock.calls.length,
		};
		const ret = {} as Record<string, number>;
		Object.keys(data).forEach((key) => {
			if (data[key]) {
				ret[key] = data[key];
			}
		});
		return ret;
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
