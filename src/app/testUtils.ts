import { gsap } from 'gsap/all';
import { shorthandPosition } from '@/game/card/card';
import { AvailableMove } from '@/game/move/move';

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
		consoleDebugSpy.mockReset();
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
	return accumulateGsapTweenVars(
		spy.mock.calls.map(([, properties]: [string, gsap.TweenVars]) => properties)
	);
}
export function getPropertiesFromFromToSpy(spy: jest.SpyInstance): {
	from: Record<string, number>;
	to: Record<string, number>;
} {
	const from = accumulateGsapTweenVars(
		spy.mock.calls.map(([, properties]: [string, gsap.TweenVars]) => properties)
	);
	const to = accumulateGsapTweenVars(
		spy.mock.calls.map(([, , properties]: [string, gsap.TweenVars, gsap.TweenVars]) => properties)
	);
	return { from, to };
}

function accumulateGsapTweenVars(list: gsap.TweenVars[]): Record<string, number> {
	const counts = list.reduce<Record<string, number>>((acc, properties) => {
		Object.keys(properties).forEach((key) => {
			acc[key] = (acc[key] || 0) + 1;
		});
		return acc;
	}, {});
	// not a property being animated
	delete counts.duration;
	delete counts.ease;
	return counts;
}

export function availableMovesMinimized(availableMoves: AvailableMove[] | null, all = false) {
	if (!availableMoves) return null;
	if (!availableMoves.length) return [];
	return availableMoves
		.filter(({ priority }) => all || priority > 0)
		.map(({ location, moveDestinationType, priority }) => [
			shorthandPosition(
				location,
				moveDestinationType === 'foundation' || moveDestinationType === 'cascade:sequence'
			),
			...(all ? [moveDestinationType] : []),
			priority,
		]);
}
