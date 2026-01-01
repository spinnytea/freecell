import { fireEvent, render, screen } from '@testing-library/react';
import { gsap } from 'gsap/all';
import { ControlSchemes } from '@/app/components/cards/constants';
import { domUtils } from '@/app/components/element/domUtils';
import GameBoard from '@/app/GameBoard';
import { StaticFixtureSizesContextProvider } from '@/app/hooks/contexts/FixtureSizes/StaticFixtureSizesContextProvider';
import StaticGameContextProvider from '@/app/hooks/contexts/Game/StaticGameContextProvider';
import { useGame } from '@/app/hooks/contexts/Game/useGame';
import { ManualTestingSettingsContextProvider } from '@/app/hooks/contexts/Settings/ManualTestingSettingsContextProvider';
import { ErrorBoundary } from '@/app/hooks/ErrorBoundary';
import { spyOnGsap } from '@/app/testUtils';
import {
	calcCardId,
	CardLocation,
	RankList,
	shorthandCard,
	shorthandPosition,
	SuitList,
} from '@/game/card/card';
import { FreeCell } from '@/game/game';
import { parseShorthandMove } from '@/game/move/move';

const gsapUtilsRandom = gsap.utils.random as jest.Mock;

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

function MockGamePage({ game, gameBoardId }: { game: FreeCell; gameBoardId?: string }) {
	return (
		<ErrorBoundary>
			<ManualTestingSettingsContextProvider controlSchemes={[ControlSchemes.ClickToSelect]}>
				<StaticGameContextProvider games={[game]}>
					<StaticFixtureSizesContextProvider>
						<GameBoard className="none" gameBoardId={gameBoardId} />
						<CribTheGame />
					</StaticFixtureSizesContextProvider>
				</StaticGameContextProvider>
			</ManualTestingSettingsContextProvider>
		</ErrorBoundary>
	);
}

describe('GameBoard', () => {
	let toGsapSpy: jest.SpyInstance;
	let fromGsapSpy: jest.SpyInstance;
	let addLabelSpy: jest.SpyInstance;
	let consoleDebugSpy: jest.SpyInstance;
	let mockReset: (runOnComplete?: boolean) => void;
	let mockCallTimes: () => Record<string, number>;
	beforeEach(() => {
		({ toGsapSpy, fromGsapSpy, addLabelSpy, consoleDebugSpy, mockReset, mockCallTimes } =
			spyOnGsap(gsap));
		consoleDebugSpy.mockReturnValue(undefined);
	});

	/** https://www.solitairelaboratory.com/tutorial.html */
	test('renders a game', () => {
		const { container } = render(<MockGamePage game={new FreeCell().shuffle32(1)} />);

		// initial state
		expect(addLabelSpy.mock.calls).toEqual([['shuffle deck (1)'], ['updateCardPositions']]);
		expect(mockCallTimes()).toEqual({
			toGsapSpy: 52,
			setGsapSpy: 52,
			setSpy: 52,
			addLabelSpy: 2,
		});

		mockReset();
		fireEvent.click(screen.getAllByAltText('card back')[0]);

		// animations
		expect(addLabelSpy.mock.calls).toEqual([
			['gameFunction check-can-flourish'],
			['updateCardPositions'],
		]);
		expect(mockCallTimes()).toEqual({
			fromToSpy: 52,
			toSpy: 52,
			addLabelSpy: 2,
		});

		expect(container).toMatchSnapshot();
	});

	test('enable debug mode', () => {
		const { container } = render(<MockGamePage game={new FreeCell().shuffle32(1).dealAll()} />);
		fireEvent.click(screen.getByRole('checkbox', { name: 'Show Debug Info' }));
		fireEvent.click(screen.getByAltText('6 of clubs'));
		expect(container).toMatchSnapshot();
	});

	// XXX (techdebt) instead of just checking toGsapSpy call count, actually check what it did
	//  - expect(toGsapSpy).toHaveBeenCalledTimes(2); // select a, then rotate back
	/** https://www.solitairelaboratory.com/tutorial.html */
	test('Game #5 (tutorial)', () => {
		const gameBoardId = 'GameBoard.test-#5';
		gsapUtilsRandom.mockReturnValueOnce('scale'); // for WinMessage
		const { container } = render(
			<MockGamePage game={new FreeCell().shuffle32(5)} gameBoardId={gameBoardId} />
		);

		expect(container).toMatchSnapshot();
		expect(screen.queryByText('You Win!')).toBeFalsy();

		// Deal the game
		fireEvent.click(screen.getAllByAltText('card back')[0]);
		expect(container).toMatchSnapshot();
		expect(addLabelSpy.mock.calls).toEqual([
			['shuffle deck (5)'],
			['updateCardPositions'],
			['gameFunction check-can-flourish'],
			['updateCardPositions'],
		]);
		mockReset();

		// In game 5, you may begin by moving the six of hearts onto the seven of clubs.
		// Note that the free ace of diamonds moves automatically to a homecell when you do this.
		moveByShorthand('53');
		expect(screen.getByRole('status').textContent).toBe('move 53 6H→7C (auto-foundation 2 AD)');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 5 6H'],
			['updateCardPositions'],
			['move 53 6H→7C (auto-foundation 2 AD)'],
			['updateCardPositionsPrev'],
			['updateCardPositions'],
		]);
		mockReset();
		// the six of clubs to a freecell,
		moveByShorthand('6a');
		expect(screen.getByRole('status').textContent).toBe('move 6a 6C→cell');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 6 6C'],
			['updateCardPositions'],
			['move 6a 6C→cell'],
			['updateCardPositions'],
		]);
		mockReset();
		// the queen of diamonds onto the king of spades,
		moveByShorthand('65');
		expect(screen.getByRole('status').textContent).toBe('move 65 QD→KS');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 6 QD'],
			['updateCardPositions'],
			['move 65 QD→KS'],
			['updateCardPositions'],
		]);
		mockReset();
		// the jack of hearts onto the queen of clubs,
		moveByShorthand('67');
		expect(screen.getByRole('status').textContent).toBe('move 67 JH→QC');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 6 JH'],
			['updateCardPositions'],
			['move 67 JH→QC'],
			['updateCardPositions'],
		]);
		mockReset();
		// the jack of spades onto the queen of diamonds
		// (the free ace of clubs moves automatically to another homecell)
		moveByShorthand('85');
		expect(screen.getByRole('status').textContent).toBe('move 85 JS→QD (auto-foundation 8 AC)');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 8 JS'],
			['updateCardPositions'],
			['move 85 JS→QD (auto-foundation 8 AC)'],
			['updateCardPositionsPrev'],
			['updateCardPositions'],
		]);
		mockReset();
		// Now move the six of clubs from its freecell onto the seven of diamonds,
		moveByShorthand('a8');
		expect(screen.getByRole('status').textContent).toBe('move a8 6C→7D');
		expect(toGsapSpy).toHaveBeenCalledTimes(2); // select a, then rotate back
		expect(addLabelSpy.mock.calls).toEqual([
			['select a 6C'],
			['move a8 6C→7D'],
			['updateCardPositions'],
		]);
		mockReset();
		// and the five of hearts onto the six of clubs.
		// The free two of clubs now moves automatically onto the club homecell.
		moveByShorthand('68');
		expect(screen.getByRole('status').textContent).toBe('move 68 5H→6C (auto-foundation 6 2C)');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 6 5H'],
			['updateCardPositions'],
			['move 68 5H→6C (auto-foundation 6 2C)'],
			['updateCardPositionsPrev'],
			['updateCardPositions'],
		]);
		mockReset();
		// Move the ten of clubs onto the jack of hearts,
		moveByShorthand('27');
		expect(screen.getByRole('status').textContent).toBe('move 27 TC→JH');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 2 TC'],
			['updateCardPositions'],
			['move 27 TC→JH'],
			['updateCardPositions'],
		]);
		mockReset();
		// and the nine of hearts onto the ten of clubs.
		moveByShorthand('67');
		expect(screen.getByRole('status').textContent).toBe('move 67 9H→TC');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 6 9H'],
			['updateCardPositions'],
			['move 67 9H→TC'],
			['updateCardPositions'],
		]);
		mockReset();

		expect(container).toMatchSnapshot();

		// Move the nine of spades to a freecell
		moveByShorthand('1a');
		expect(screen.getByRole('status').textContent).toBe('move 1a 9S→cell');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 1 9S'],
			['updateCardPositions'],
			['move 1a 9S→cell'],
			['updateCardPositions'],
		]);
		mockReset();
		// and the two of hearts to another freecell
		moveByShorthand('1b');
		expect(screen.getByRole('status').textContent).toBe('move 1b 2H→cell');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 1 2H'],
			['updateCardPositions'],
			['move 1b 2H→cell'],
			['updateCardPositions'],
		]);
		mockReset();
		// Move the five of spades onto the six of hearts,
		moveByShorthand('13');
		expect(screen.getByRole('status').textContent).toBe('move 13 5S→6H');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 1 5S'],
			['updateCardPositions'],
			['move 13 5S→6H'],
			['updateCardPositions'],
		]);
		mockReset();
		// and the ten of diamonds (followed by the nine of spades) onto the jack of spades.
		moveByShorthand('15');
		expect(screen.getByRole('status').textContent).toBe('move 15 TD→JS');
		moveByShorthand('a5');
		expect(screen.getByRole('status').textContent).toBe('move a5 9S→TD');
		expect(toGsapSpy).toHaveBeenCalledTimes(2); // select a, then rotate back
		expect(addLabelSpy.mock.calls).toEqual([
			['select 1 TD'],
			['updateCardPositions'],
			['move 15 TD→JS'],
			['updateCardPositions'],
			['select a 9S'],
			// TODO (techdebt) (flourish-anim) (gsap) selecting a cell uses rotation, and is not part of the timeline
			['move a5 9S→TD'],
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
			['select 1 3S'],
			['updateCardPositions'],
			['move 1a 3S→cell'],
			['updateCardPositions'],
			['select 1 5C'],
			['updateCardPositions'],
			['move 1c 5C→cell (auto-foundation 1b AH,2H)'],
			['updateCardPositionsPrev'],
			['updateCardPositions'],
		]);
		mockReset();
		// Click on the five of hearts now to select it, then click on the empty sixth column.
		moveByShorthand('86');
		expect(screen.getByRole('status').textContent).toBe('move 86 7D-6C-5H→cascade');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 8 7D-6C-5H'],
			['updateCardPositions'],
			['move 86 7D-6C-5H→cascade'],
			['updateCardPositions'],
		]);
		mockReset();

		expect(container).toMatchSnapshot();

		// Next move the eight of diamonds onto the nine of spades,
		moveByShorthand('85');
		expect(screen.getByRole('status').textContent).toBe('move 85 8D→9S');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 8 8D'],
			['updateCardPositions'],
			['move 85 8D→9S'],
			['updateCardPositions'],
		]);
		mockReset();
		// and the four of spades and three of diamonds onto the five of hearts, clearing column eight.
		moveByShorthand('86');
		expect(screen.getByRole('status').textContent).toBe('move 86 4S→5H');
		moveByShorthand('86');
		expect(screen.getByRole('status').textContent).toBe('move 86 3D→4S');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 8 4S'],
			['updateCardPositions'],
			['move 86 4S→5H'],
			['updateCardPositions'],
			['select 8 3D'],
			['updateCardPositions'],
			['move 86 3D→4S'],
			['updateCardPositions'],
		]);
		mockReset();
		// Next move the queen of hearts into the empty first column
		moveByShorthand('21');
		expect(screen.getByRole('status').textContent).toBe('move 21 QH→cascade');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 2 QH'],
			['updateCardPositions'],
			['move 21 QH→cascade'],
			['updateCardPositions'],
		]);
		mockReset();
		// Move the seven of spades onto the eight of diamonds,
		moveByShorthand('25');
		expect(screen.getByRole('status').textContent).toBe('move 25 7S→8D');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 2 7S'],
			['updateCardPositions'],
			['move 25 7S→8D'],
			['updateCardPositions'],
		]);
		mockReset();
		// the five of diamonds to a freecell (sending the ace of spades home),
		moveByShorthand('2b');
		expect(screen.getByRole('status').textContent).toBe('move 2b 5D→cell (auto-foundation 2 AS)');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 2 5D'],
			['updateCardPositions'],
			['move 2b 5D→cell (auto-foundation 2 AS)'],
			['updateCardPositionsPrev'],
			['updateCardPositions'],
		]);
		mockReset();
		// and the eight of spades onto the nine of hearts.
		moveByShorthand('27');
		expect(screen.getByRole('status').textContent).toBe('move 27 8S→9H');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 2 8S'],
			['updateCardPositions'],
			['move 27 8S→9H'],
			['updateCardPositions'],
		]);
		mockReset();
		// Move the ten of spades into the empty second column,
		moveByShorthand('42');
		expect(screen.getByRole('status').textContent).toBe('move 42 TS→cascade');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 4 TS'],
			['updateCardPositions'],
			['move 42 TS→cascade'],
			['updateCardPositions'],
		]);
		mockReset();
		// the six of diamonds (followed by the five of clubs) onto the seven of spades,
		moveByShorthand('45');
		expect(screen.getByRole('status').textContent).toBe('move 45 6D→7S');
		moveByShorthand('c5');
		expect(screen.getByRole('status').textContent).toBe('move c5 5C→6D');
		expect(toGsapSpy).toHaveBeenCalledTimes(2); // select c, then rotate back
		expect(addLabelSpy.mock.calls).toEqual([
			['select 4 6D'],
			['updateCardPositions'],
			['move 45 6D→7S'],
			['updateCardPositions'],
			['select c 5C'],
			// TODO (techdebt) (flourish-anim) (gsap) selecting a cell uses rotation, and is not part of the timeline
			['move c5 5C→6D'],
			['updateCardPositions'],
		]);
		mockReset();
		// the nine of diamonds onto the ten of spades,
		moveByShorthand('42');
		expect(screen.getByRole('status').textContent).toBe('move 42 9D→TS');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 4 9D'],
			['updateCardPositions'],
			['move 42 9D→TS'],
			['updateCardPositions'],
		]);
		mockReset();
		// and the seven of hearts onto the eight of spades.
		moveByShorthand('47');
		expect(screen.getByRole('status').textContent).toBe('move 47 7H→8S');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 4 7H'],
			['updateCardPositions'],
			['move 47 7H→8S'],
			['updateCardPositions'],
		]);
		mockReset();

		// it is perfectly safe to move the three of hearts to its homecell,
		// and you can do so yourself by selecting it, then clicking on the two of hearts.
		moveByShorthand('4h');
		expect(screen.getByRole('status').textContent).toBe('move 4h 3H→2H');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 4 3H'],
			['updateCardPositions'],
			['move 4h 3H→2H'],
			['updateCardPositions'],
		]);
		mockReset();
		// Now reverse the backwards sequence in the fourth column by moving the king of hearts,
		// followed by the queen of spades, to the empty eighth column.
		moveByShorthand('48');
		expect(screen.getByRole('status').textContent).toBe('move 48 KH→cascade');
		moveByShorthand('48');
		expect(screen.getByRole('status').textContent).toBe('move 48 QS→KH');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 4 KH'],
			['updateCardPositions'],
			['move 48 KH→cascade'],
			['updateCardPositions'],
			['select 4 QS'],
			['updateCardPositions'],
			['move 48 QS→KH'],
			['updateCardPositions'],
		]);
		mockReset();

		expect(container).toMatchSnapshot();

		// move five cards (up to the jack of hearts) from column seven onto the queen of spades in column eight.
		moveByShorthand('78');
		expect(screen.getByRole('status').textContent).toBe('move 78 JH-TC-9H-8S-7H→QS');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 7 JH-TC-9H-8S-7H'],
			['updateCardPositions'],
			['move 78 JH-TC-9H-8S-7H→QS'],
			['updateCardPositions'],
		]);
		mockReset();
		// move the queen of clubs to a freecell,
		moveByShorthand('7c');
		expect(screen.getByRole('status').textContent).toBe('move 7c QC→cell');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 7 QC'],
			['updateCardPositions'],
			['move 7c QC→cell'],
			['updateCardPositions'],
		]);
		mockReset();
		// the four of hearts to its homecell
		moveByShorthand('7h');
		expect(screen.getByRole('status').textContent).toBe('move 7h 4H→3H');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 7 4H'],
			['updateCardPositions'],
			['move 7h 4H→3H'],
			['updateCardPositions'],
		]);
		mockReset();
		// move the jack of clubs onto the queen of hearts,
		moveByShorthand('71');
		expect(screen.getByRole('status').textContent).toBe('move 71 JC→QH');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 7 JC'],
			['updateCardPositions'],
			['move 71 JC→QH'],
			['updateCardPositions'],
		]);
		mockReset();
		// and the six of spades onto the seven of hearts.
		moveByShorthand('78');
		expect(screen.getByRole('status').textContent).toBe('move 78 6S→7H');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 7 6S'],
			['updateCardPositions'],
			['move 78 6S→7H'],
			['updateCardPositions'],
		]);
		mockReset();
		// Move the three of clubs to its homecell
		// The two of spades goes automatically, since both red aces are already home.
		moveByShorthand('7h');
		expect(screen.getByRole('status').textContent).toBe('move 7h 3C→2C (auto-foundation 7 2S)');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 7 3C'],
			['updateCardPositions'],
			['move 7h 3C→2C (auto-foundation 7 2S)'],
			['updateCardPositionsPrev'],
			['updateCardPositions'],
		]);
		mockReset();
		// Move the three of spades home
		moveByShorthand('ah');
		expect(screen.getByRole('status').textContent).toBe('move ah 3S→2S');
		expect(toGsapSpy).toHaveBeenCalledTimes(2); // select a, then rotate back
		expect(addLabelSpy.mock.calls).toEqual([
			['select a 3S'],
			// TODO (techdebt) (flourish-anim) (gsap) selecting a cell uses rotation, and is not part of the timeline
			['move ah 3S→2S'],
			['updateCardPositions'],
		]);
		mockReset();
		// and the five of diamonds onto the six of spades.
		moveByShorthand('b8');
		expect(screen.getByRole('status').textContent).toBe('move b8 5D→6S');
		expect(toGsapSpy).toHaveBeenCalledTimes(2); // select b, then rotate back
		expect(addLabelSpy.mock.calls).toEqual([
			['select b 5D'],
			// TODO (techdebt) (flourish-anim) (gsap) selecting a cell uses rotation, and is not part of the timeline
			['move b8 5D→6S'],
			['updateCardPositions'],
		]);
		mockReset();

		expect(container).toMatchSnapshot();

		// Move the five of spades through seven of clubs from column three to column four,
		moveByShorthand('34');
		expect(screen.getByRole('status').textContent).toBe('move 34 7C-6H-5S→cascade');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 3 7C-6H-5S'],
			['updateCardPositions'],
			['move 34 7C-6H-5S→cascade'],
			['updateCardPositions'],
		]);
		mockReset();
		// the ten of hearts onto the jack of clubs,
		moveByShorthand('31');
		expect(screen.getByRole('status').textContent).toBe('move 31 TH→JC');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 3 TH'],
			['updateCardPositions'],
			['move 31 TH→JC'],
			['updateCardPositions'],
		]);
		mockReset();
		// the eight of clubs onto the nine of diamonds,
		moveByShorthand('32');
		expect(screen.getByRole('status').textContent).toBe('move 32 8C→9D');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 3 8C'],
			['updateCardPositions'],
			['move 32 8C→9D'],
			['updateCardPositions'],
		]);
		mockReset();
		// the queen of clubs from its freecell to the empty seventh column,
		moveByShorthand('c7');
		expect(screen.getByRole('status').textContent).toBe('move c7 QC→cascade');
		expect(toGsapSpy).toHaveBeenCalledTimes(2); // select c, then rotate back
		expect(addLabelSpy.mock.calls).toEqual([
			['select c QC'],
			// TODO (techdebt) (flourish-anim) (gsap) selecting a cell uses rotation, and is not part of the timeline
			['move c7 QC→cascade'],
			['updateCardPositions'],
		]);
		mockReset();
		// and the jack of diamonds onto it.
		moveByShorthand('37');
		expect(screen.getByRole('status').textContent).toBe('move 37 JD→QC');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 3 JD'],
			['updateCardPositions'],
			['move 37 JD→QC'],
			['updateCardPositions'],
		]);
		mockReset();
		// Move the king of clubs to a freecell,
		moveByShorthand('3a');
		expect(screen.getByRole('status').textContent).toBe('move 3a KC→cell');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 3 KC'],
			['updateCardPositions'],
			['move 3a KC→cell'],
			['updateCardPositions'],
		]);
		mockReset();
		// and the nine of clubs onto the ten of hearts
		// (sending the two and three of diamonds and the four of spades home).
		moveByShorthand('31');
		expect(screen.getByRole('status').textContent).toBe(
			'move 31 9C→TH (auto-foundation 366 2D,3D,4S)'
		);
		expect(addLabelSpy.mock.calls).toEqual([
			['select 3 9C'],
			['updateCardPositions'],
			['move 31 9C→TH (auto-foundation 366 2D,3D,4S)'],
			['updateCardPositionsPrev'],
			['updateCardPositions'],
		]);
		mockReset();
		// Move the king of clubs back into the empty third column,
		moveByShorthand('a3');
		expect(screen.getByRole('status').textContent).toBe('move a3 KC→cascade');
		expect(toGsapSpy).toHaveBeenCalledTimes(2); // select a, then rotate back
		expect(addLabelSpy.mock.calls).toEqual([
			['select a KC'],
			// TODO (techdebt) (flourish-anim) (gsap) selecting a cell uses rotation, and is not part of the timeline
			['move a3 KC→cascade'],
			['updateCardPositions'],
		]);
		mockReset();
		// and the entire first column onto it.
		moveByShorthand('13');
		expect(screen.getByRole('status').textContent).toBe('move 13 QH-JC-TH-9C→KC');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 1 QH-JC-TH-9C'],
			['updateCardPositions'],
			['move 13 QH-JC-TH-9C→KC'],
			['updateCardPositions'],
		]);
		mockReset();
		// Move the entire second column onto the seventh column,
		moveByShorthand('27');
		expect(screen.getByRole('status').textContent).toBe('move 27 TS-9D-8C→JD');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 2 TS-9D-8C'],
			['updateCardPositions'],
			['move 27 TS-9D-8C→JD'],
			['updateCardPositions'],
		]);
		mockReset();
		// then the sixth column onto the seventh column.
		moveByShorthand('67');
		expect(screen.getByRole('status').textContent).toBe('move 67 7D-6C-5H→8C');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 6 7D-6C-5H'],
			['updateCardPositions'],
			['move 67 7D-6C-5H→8C'],
			['updateCardPositions'],
		]);
		mockReset();
		// The long nine-card sequence at the bottom of the fifth column can be moved in ~~two pieces~~ one supermove:
		// first select the five of clubs, then any empty column.
		// NOTE Next: we skip '51' from the original solution
		//  - "Clicking the Move Column button in the dialogue box will move five cards to the empty column you selected."
		//  - "Now select the ten of diamonds, and another empty column, to move the other four cards of the sequence."
		//  - essentially, the game asks to move move this in two parts
		//  - but we are moving it one supermove
		moveByShorthand('52');
		expect(screen.getByRole('status').textContent).toBe(
			'move 52 KS-QD-JS-TD-9S-8D-7S-6D-5C→cascade'
		);
		expect(addLabelSpy.mock.calls).toEqual([
			['select 5 KS-QD-JS-TD-9S-8D-7S-6D-5C'],
			['updateCardPositions'],
			['move 52 KS-QD-JS-TD-9S-8D-7S-6D-5C→cascade'],
			['updateCardPositions'],
		]);
		mockReset();
		// To finish the game, move the eight of hearts onto the nine of clubs,
		moveByShorthand('53');
		expect(screen.getByRole('status').textContent).toBe('move 53 8H→9C');
		expect(addLabelSpy.mock.calls).toEqual([
			['select 5 8H'],
			['updateCardPositions'],
			['move 53 8H→9C'],
			['updateCardPositions'],
		]);
		mockReset();
		// and the king of diamonds into an empty column.
		// The 38 cards remaining are now in sequence,
		// and will all go automatically to the homecells,
		// winning the game.
		moveByShorthand('56');
		expect(screen.getByRole('status').textContent).toBe(
			'move 56 KD→cascade (auto-foundation 55748248278274382782733728827338278263 4D,4C,5H,5S,5D,5C,6H,6S,6D,6C,7H,7S,7D,7C,8H,8S,8D,8C,9H,9S,9D,9C,TH,TS,TD,TC,JH,JS,JD,JC,QH,QS,QD,QC,KH,KS,KD,KC)'
		);
		expect(addLabelSpy.mock.calls).toEqual([
			['select 5 KD'],
			['updateCardPositions'],
			[
				'move 56 KD→cascade (auto-foundation 55748248278274382782733728827338278263 4D,4C,5H,5S,5D,5C,6H,6S,6D,6C,7H,7S,7D,7C,8H,8S,8D,8C,9H,9S,9D,9C,TH,TS,TD,TC,JH,JS,JD,JC,QH,QS,QD,QC,KH,KS,KD,KC)',
			],
			['updateCardPositionsPrev'],
			['updateCardPositions'],
		]);
		expect(fromGsapSpy).toHaveBeenCalledTimes(1); // animate win message
		mockReset();

		expect(container).toMatchSnapshot();
		expect(screen.queryByText('You Win!')).toBeTruthy();

		SuitList.forEach((suit) => {
			const aceTLZ = domUtils.getDomAttributes(
				calcCardId(shorthandCard({ rank: 'ace', suit }), gameBoardId)
			);
			if (!aceTLZ) throw new Error(`Card not found: ace of ${suit}`);

			RankList.forEach((rank, idx) => {
				const cardId = calcCardId(shorthandCard({ rank, suit }), gameBoardId);
				const tlz = domUtils.getDomAttributes(cardId);
				if (!tlz) throw new Error(`Card not found: ${cardId}`);

				// cards are stacked on aces
				expect(tlz.top).toBe(aceTLZ.top);
				expect(tlz.left).toBe(aceTLZ.left);
				// cards are stacked in order by rank
				expect(tlz.zIndex).toBe(aceTLZ.zIndex + idx);
			});
		});

		// now click throught to a new game
		// (ManualTestingSettingsContextProvider will set the original game)
		fireEvent.click(screen.getByAltText('king of hearts'));
		expect(container).toMatchSnapshot();
		expect(screen.queryByText('You Win!')).toBeFalsy();
		expect(screen.getByRole('status').textContent).toBe('shuffle deck (5)');
		expect(addLabelSpy.mock.calls).toEqual([['shuffle deck (5)'], ['updateCardPositions']]);
		mockReset();

		expect(gsapUtilsRandom.mock.calls).toEqual([
			[['scale', 'scaleX', 'scaleY']], // for WinMessage
		]);
	});
});
