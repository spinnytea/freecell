import { render, screen } from '@testing-library/react';
import { gsap } from 'gsap/all';
import { ErrorBoundary } from '@/app/hooks/ErrorBoundary';
import Page from '@/app/page';

jest.mock('gsap/all', () => ({
	gsap: {
		to: () => ({}),
		set: () => ({}),
		from: () => ({}),
		timeline: () => ({}),
		registerPlugin: () => ({}),
		utils: {
			random: () => undefined,
		},
	},
}));

describe('page', () => {
	// REVIEW (techdebt) this is a _lot_ of mocking, duplicated in useCardPositionAnimations.test
	let toGsapSpy: jest.SpyInstance;
	let setGsapSpy: jest.SpyInstance;
	let fromGsapSpy: jest.SpyInstance;
	let fromToSpy: jest.SpyInstance;
	let toSpy: jest.SpyInstance;
	let setSpy: jest.SpyInstance;
	let addLabelSpy: jest.SpyInstance;
	let addSpy: jest.SpyInstance;
	let timeScaleSpy: jest.SpyInstance;
	let timelineOnComplete: gsap.Callback | undefined;
	let consoleDebugSpy: jest.SpyInstance;
	beforeEach(() => {
		toGsapSpy = jest.spyOn(gsap, 'to');
		setGsapSpy = jest.spyOn(gsap, 'set');
		fromGsapSpy = jest.spyOn(gsap, 'from');
		fromToSpy = jest.fn();
		toSpy = jest.fn();
		setSpy = jest.fn();
		addLabelSpy = jest.fn();
		addSpy = jest.fn();
		timeScaleSpy = jest.fn();

		jest.spyOn(gsap, 'timeline').mockImplementation((vars) => {
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
		consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
	});

	function mockReset(runOnComplete = true) {
		if (timelineOnComplete && runOnComplete) {
			timelineOnComplete();
		}

		toGsapSpy.mockReset();
		setGsapSpy.mockReset();
		fromGsapSpy.mockReset();
		toSpy.mockReset();
		fromToSpy.mockReset();
		setSpy.mockReset();
		addLabelSpy.mockReset();
		addSpy.mockReset();
		timeScaleSpy.mockReset();
	}

	it('should render without crashing', () => {
		render(
			<ErrorBoundary>
				<Page />
			</ErrorBoundary>
		);
		// XXX (techdebt) there's a hidden card, so this count is not obvious
		expect(screen.queryAllByAltText('card back').length).toBe(53);
		expect(consoleDebugSpy).not.toHaveBeenCalled();
		void mockReset;
	});
});
