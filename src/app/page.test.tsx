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
		} else if ([0, -1, undefined].includes(location.data[1])) {
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

		// Move the nine of spades to a freecell
		moveByShorthand('1a');
		expect(screen.getByRole('status').textContent).toBe('move 1a 9S→cell');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();
		// and the two of hearts to another freecell
		moveByShorthand('1b');
		expect(screen.getByRole('status').textContent).toBe('move 1b 2H→cell');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();
		// Move the five of spades onto the six of hearts,
		moveByShorthand('13');
		expect(screen.getByRole('status').textContent).toBe('move 13 5S→6H');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();
		// and the ten of diamonds (followed by the nine of spades) onto the jack of spades.
		moveByShorthand('15');
		expect(screen.getByRole('status').textContent).toBe('move 15 TD→JS');
		moveByShorthand('a5');
		expect(screen.getByRole('status').textContent).toBe('move a5 9S→TD');
		expect(toGsapSpy).toHaveBeenCalledTimes(2); // select a, then rotate back
		expect(addLabelSpy.mock.calls).toEqual([
			['updateCardPositions'],
			['updateCardPositions'],
			['updateCardPositions'],
		]);
		mockReset();
		// Now move the three of spades and the five of clubs each to a freecell,
		// and the ace of hearts and two of hearts automatically move to a new homecell.
		moveByShorthand('1a');
		expect(screen.getByRole('status').textContent).toBe('move 1a 3S→cell');
		moveByShorthand('1c');
		expect(screen.getByRole('status').textContent).toBe(
			'move 1c 5C→cell (auto-foundation 1b AH,2H)'
		);
		expect(addLabelSpy.mock.calls).toEqual([
			['updateCardPositions'],
			['updateCardPositions'],
			['updateCardPositions'],
			['updateCardPositionsPrev'],
			['updateCardPositions'],
		]);
		mockReset();
		// Click on the five of hearts now to select it, then click on the empty sixth column.
		moveByShorthand('86');
		expect(screen.getByRole('status').textContent).toBe('move 86 7D-6C-5H→cascade');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();

		expect(container).toMatchSnapshot();

		// Next move the eight of diamonds onto the nine of spades,
		moveByShorthand('85');
		expect(screen.getByRole('status').textContent).toBe('move 85 8D→9S');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();
		// and the four of spades and three of diamonds onto the five of hearts, clearing column eight.
		moveByShorthand('86');
		expect(screen.getByRole('status').textContent).toBe('move 86 4S→5H');
		moveByShorthand('86');
		expect(screen.getByRole('status').textContent).toBe('move 86 3D→4S');
		expect(addLabelSpy.mock.calls).toEqual([
			['updateCardPositions'],
			['updateCardPositions'],
			['updateCardPositions'],
			['updateCardPositions'],
		]);
		mockReset();
		// Next move the queen of hearts into the empty first column
		moveByShorthand('21');
		expect(screen.getByRole('status').textContent).toBe('move 21 QH→cascade');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();
		// Move the seven of spades onto the eight of diamonds,
		moveByShorthand('25');
		expect(screen.getByRole('status').textContent).toBe('move 25 7S→8D');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();
		// the five of diamonds to a freecell (sending the ace of spades home),
		moveByShorthand('2b');
		expect(screen.getByRole('status').textContent).toBe('move 2b 5D→cell (auto-foundation 2 AS)');
		expect(addLabelSpy.mock.calls).toEqual([
			['updateCardPositions'],
			['updateCardPositionsPrev'],
			['updateCardPositions'],
		]);
		mockReset();
		// and the eight of spades onto the nine of hearts.
		moveByShorthand('27');
		expect(screen.getByRole('status').textContent).toBe('move 27 8S→9H');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();
		// Move the ten of spades into the empty second column,
		moveByShorthand('42');
		expect(screen.getByRole('status').textContent).toBe('move 42 TS→cascade');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();
		// the six of diamonds (followed by the five of clubs) onto the seven of spades,
		moveByShorthand('45');
		expect(screen.getByRole('status').textContent).toBe('move 45 6D→7S');
		moveByShorthand('c5');
		expect(screen.getByRole('status').textContent).toBe('move c5 5C→6D');
		expect(toGsapSpy).toHaveBeenCalledTimes(2); // select c, then rotate back
		expect(addLabelSpy.mock.calls).toEqual([
			['updateCardPositions'],
			['updateCardPositions'],
			['updateCardPositions'],
		]);
		mockReset();
		// the nine of diamonds onto the ten of spades,
		moveByShorthand('42');
		expect(screen.getByRole('status').textContent).toBe('move 42 9D→TS');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();
		// and the seven of hearts onto the eight of spades.
		moveByShorthand('47');
		expect(screen.getByRole('status').textContent).toBe('move 47 7H→8S');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();

		// it is perfectly safe to move the three of hearts to its homecell,
		// and you can do so yourself by selecting it, then clicking on the two of hearts.
		moveByShorthand('4h');
		expect(screen.getByRole('status').textContent).toBe('move 4h 3H→2H');
		expect(addLabelSpy.mock.calls).toEqual([['updateCardPositions'], ['updateCardPositions']]);
		mockReset();
		// Now reverse the backwards sequence in the fourth column by moving the king of hearts,
		// followed by the queen of spades, to the empty eighth column.
		moveByShorthand('48');
		expect(screen.getByRole('status').textContent).toBe('move 48 KH→cascade');
		moveByShorthand('48');
		expect(screen.getByRole('status').textContent).toBe('move 48 QS→KH');
		expect(addLabelSpy.mock.calls).toEqual([
			['updateCardPositions'],
			['updateCardPositions'],
			['updateCardPositions'],
			['updateCardPositions'],
		]);
		mockReset();

		// FIXME finish following game.test.js

		expect(container).toMatchSnapshot();
	});
});
