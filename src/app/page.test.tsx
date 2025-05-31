import { fireEvent, render, screen } from '@testing-library/react';
import { gsap } from 'gsap/all';
import { ControlSchemes } from '@/app/components/cards/constants';
import { CardLocation, shorthandPosition } from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';
import { parseShorthandMove } from '@/app/game/move/move';
import GameBoard from '@/app/GameBoard';
import { StaticFixtureSizesContextProvider } from '@/app/hooks/contexts/FixtureSizes/StaticFixtureSizesContextProvider';
import StaticGameContextProvider from '@/app/hooks/contexts/Game/StaticGameContextProvider';
import { useGame } from '@/app/hooks/contexts/Game/useGame';
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

/** HACK (techdebt) we need the game state to know which card we are moving */
let moveByShorthand: (shorthandMove: string) => void;
function CribTheGame() {
	const game = useGame();

	moveByShorthand = (shorthandMove: string) => {
		const [from, to] = parseShorthandMove(game, shorthandMove);
		_clickByLocation(from);
		_clickByLocation(to);
	};

	function _clickByLocation(location: CardLocation) {
		const card = game.cards.find(
			(card) =>
				card.location.fixture === location.fixture &&
				card.location.data[0] === location.data[0] &&
				card.location.data[1] === location.data[1]
		);

		if (card) {
			fireEvent.click(screen.getByAltText(`${card.rank} of ${card.suit}`));
		} else if (location.data[0] === 0) {
			// pilemarker
			fireEvent.click(screen.getByText(shorthandPosition(location)));
		} else {
			throw new Error(`Card not found for location: ${JSON.stringify(location)}`);
		}
	}

	return null;
}

function MockGamePage({ game }: { game: FreeCell }) {
	return (
		<ErrorBoundary>
			<ManualTestingSettingsContextProvider controlScheme={ControlSchemes.ClickToSelect}>
				<StaticGameContextProvider games={[game]}>
					<StaticFixtureSizesContextProvider>
						<GameBoard className="none" />
						<CribTheGame />
					</StaticFixtureSizesContextProvider>
				</StaticGameContextProvider>
			</ManualTestingSettingsContextProvider>
		</ErrorBoundary>
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
	test('Game #5 (tutorial)', () => {
		const { container } = render(<MockGamePage game={new FreeCell().shuffle32(5)} />);
		expect(container).toMatchSnapshot();
		fireEvent.click(screen.getAllByAltText('card back')[0]);

		// REVIEW (techdebt) this is very hard to understand from the snapshot
		//  - confirmed Aces and Kings are in the right place
		//  - lots of cross checking with game.test.js
		//  - and then we can confirm each step as we go (e.g. move 53 6H→7C is easy to track)
		expect(container).toMatchSnapshot();
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();

		// In game 5, you may begin by moving the six of hearts onto the seven of clubs.
		// Note that the free ace of diamonds moves automatically to a homecell when you do this.
		moveByShorthand('53');
		expect(screen.getByRole('status').textContent).toBe('move 53 6H→7C (auto-foundation 2 AD)');
		expect(addLabelSpy.mock.calls).toEqual([
			['updateCardPositions'],
			['updateCardPositionsPrev'],
			['updateCardPositions'],
		]);
		mockReset();
		// the six of clubs to a freecell,
		moveByShorthand('6a');
		expect(screen.getByRole('status').textContent).toBe('move 6a 6C→cell');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();
		// the queen of diamonds onto the king of spades,
		moveByShorthand('65');
		expect(screen.getByRole('status').textContent).toBe('move 65 QD→KS');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();
		// the jack of hearts onto the queen of clubs,
		moveByShorthand('67');
		expect(screen.getByRole('status').textContent).toBe('move 67 JH→QC');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();
		// the jack of spades onto the queen of diamonds
		// (the free ace of clubs moves automatically to another homecell)
		moveByShorthand('85');
		expect(screen.getByRole('status').textContent).toBe('move 85 JS→QD (auto-foundation 8 AC)');
		expect(addLabelSpy.mock.calls).toEqual([
			['updateCardPositions'],
			['updateCardPositionsPrev'],
			['updateCardPositions'],
		]);
		mockReset();
		// Now move the six of clubs from its freecell onto the seven of diamonds,
		moveByShorthand('a8');
		expect(screen.getByRole('status').textContent).toBe('move a8 6C→7D');
		expect(toGsapSpy).toHaveBeenCalledTimes(2); // select a, then rotate back
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions']]);
		mockReset();
		// and the five of hearts onto the six of clubs.
		// The free two of clubs now moves automatically onto the club homecell.
		moveByShorthand('68');
		expect(screen.getByRole('status').textContent).toBe('move 68 5H→6C (auto-foundation 6 2C)');
		expect(addLabelSpy.mock.calls).toEqual([
			['updateCardPositions'],
			['updateCardPositionsPrev'],
			['updateCardPositions'],
		]);
		mockReset();
		// Move the ten of clubs onto the jack of hearts,
		moveByShorthand('27');
		expect(screen.getByRole('status').textContent).toBe('move 27 TC→JH');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();
		// and the nine of hearts onto the ten of clubs.
		moveByShorthand('67');
		expect(screen.getByRole('status').textContent).toBe('move 67 9H→TC');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();

		expect(container).toMatchSnapshot();

		// FIXME finish following game.test.js

		expect(container).toMatchSnapshot();
	});
});
