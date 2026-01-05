import { gsap } from 'gsap/all';

export function spyOnGsap(_gsap: typeof gsap) {
	const gsapToSpy = jest.spyOn(_gsap, 'to');
	const gsapSetSpy = jest.spyOn(_gsap, 'set');
	const gsapFromSpy = jest.spyOn(_gsap, 'from');
	const fromToSpy = jest.fn();
	const toSpy = jest.fn();
	const setSpy = jest.fn();
	const addLabelSpy = jest.fn();
	const addSpy = jest.fn();
	const timeScaleSpy = jest.fn();
	const killTweensOfSpy = jest.fn();
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
			killTweensOf: killTweensOfSpy,
		};
		return timelineMock as gsap.core.Timeline;
	});

	function mockReset(runOnComplete = true) {
		if (timelineOnComplete && runOnComplete) {
			timelineOnComplete();
		}

		gsapToSpy.mockReset();
		gsapSetSpy.mockReset();
		gsapFromSpy.mockReset();
		fromToSpy.mockReset();
		toSpy.mockReset();
		setSpy.mockReset();
		addLabelSpy.mockReset();
		addSpy.mockReset();
		timeScaleSpy.mockReset();
		killTweensOfSpy.mockReset();
	}

	function mockCallTimes(): Record<string, number> {
		return Object.entries({
			gsapToSpy,
			gsapSetSpy,
			gsapFromSpy,
			fromToSpy,
			toSpy,
			setSpy,
			addLabelSpy,
			addSpy,
			timeScaleSpy,
			killTweensOfSpy,
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
		gsapToSpy,
		gsapSetSpy,
		gsapFromSpy,
		fromToSpy,
		toSpy,
		setSpy,
		addLabelSpy,
		addSpy,
		timeScaleSpy,
		killTweensOfSpy,
		// others
		timelineOnComplete,
		consoleDebugSpy,
		// helper functions
		mockReset,
		mockCallTimes,
	};
}

export function getCardIdsFromSpy(spy: jest.SpyInstance) {
	return spy.mock.calls.map(([cardIdSelector]: [string]) => cardIdSelector);
}

export function getPropertiesFromSpy(spy: jest.SpyInstance): Record<string, number> {
	const counts = spy.mock.calls.reduce<Record<string, number>>(
		(acc, [, properties]: [string, gsap.TweenVars]) => {
			Object.keys(properties).forEach((key) => {
				acc[key] = (acc[key] || 0) + 1;
			});
			return acc;
		},
		{}
	);
	// not a property being animated
	delete counts.duration;
	delete counts.ease;
	return counts;
}
