import { fireEvent, render, screen } from '@testing-library/react';
import { gsap } from 'gsap/all';
import { FreeCell } from '@/app/game/game';
import GameBoard from '@/app/GameBoard';
import StaticGameContextProvider from '@/app/hooks/contexts/Game/StaticGameContextProvider';
import { ManualTestingSettingsContextProvider } from '@/app/hooks/contexts/Settings/ManualTestingSettingsContextProvider';
import { ErrorBoundary } from '@/app/hooks/ErrorBoundary';

jest.mock('gsap/all', () => ({
	gsap: {
		to: () => ({}),
		set: () => ({}),
		timeline: () => ({}),
		utils: {
			random: () => undefined,
		},
	},
}));

function MockGamePage({ game }: { game: FreeCell }) {
	return (
		<ManualTestingSettingsContextProvider>
			<StaticGameContextProvider games={[game]}>
				<ErrorBoundary>
					<GameBoard className="none" />
				</ErrorBoundary>
			</StaticGameContextProvider>
		</ManualTestingSettingsContextProvider>
	);
}

describe('Free Cell UI', () => {
	// REVIEW (techdebt) this is a _lot_ of mocking, duplicated in useCardPositionAnimations.test
	let toGsapSpy: jest.SpyInstance;
	let setGsapSpy: jest.SpyInstance;
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
		toSpy.mockReset();
		fromToSpy.mockReset();
		setSpy.mockReset();
		addLabelSpy.mockReset();
		addSpy.mockReset();
		timeScaleSpy.mockReset();
	}

	// just pick a seed for an easy game
	//  - click to move single
	//  - click to move sequence
	//  - click to move to/from cell
	//  - click to send home
	//  - some auto-plays are fine
	test.todo('we can win a game by clicking through cards');

	/** https://www.solitairelaboratory.com/tutorial.html */
	test('renders a game', () => {
		const { container } = render(<MockGamePage game={new FreeCell().shuffle32(0)} />);

		// initial state
		expect(toGsapSpy).toHaveBeenCalledTimes(52);
		expect(setGsapSpy).toHaveBeenCalledTimes(52);
		expect(toSpy).toHaveBeenCalledTimes(0);
		expect(fromToSpy).toHaveBeenCalledTimes(0);
		expect(setSpy).toHaveBeenCalledTimes(52);
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions']]);
		expect(addSpy).toHaveBeenCalledTimes(0);
		expect(timeScaleSpy).toHaveBeenCalledTimes(0);
		expect(consoleDebugSpy.mock.calls).toEqual([]);

		mockReset();
		fireEvent.click(screen.getAllByAltText('card back')[0]);

		// animations
		expect(toGsapSpy).toHaveBeenCalledTimes(0);
		expect(setGsapSpy).toHaveBeenCalledTimes(0);
		expect(toSpy).toHaveBeenCalledTimes(52);
		expect(fromToSpy).toHaveBeenCalledTimes(52);
		expect(setSpy).toHaveBeenCalledTimes(0);
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions']]);
		expect(addSpy).toHaveBeenCalledTimes(0);
		expect(timeScaleSpy).toHaveBeenCalledTimes(0);
		expect(consoleDebugSpy.mock.calls).toEqual([]);

		expect(container).toMatchSnapshot();
	});

	/** https://www.solitairelaboratory.com/tutorial.html */
	test.todo('Game #5 (tutorial)'); // FIXME test.todo, reimpl moveByShorthand into clicks(screen)
});
