import { Dispatch, SetStateAction, useContext } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { gsap } from 'gsap/all';
import { MULTI_ANIMATION_TIMESCALE, SNAPPY_ACTION_TIMESCALE } from '@/app/animation_constants';
import { ControlSchemes } from '@/app/components/cards/constants';
import { domUtils } from '@/app/components/element/domUtils';
import GameBoard from '@/app/GameBoard';
import { StaticFixtureSizesContextProvider } from '@/app/hooks/contexts/FixtureSizes/StaticFixtureSizesContextProvider';
import StaticGameContextProvider from '@/app/hooks/contexts/Game/StaticGameContextProvider';
import { useGame } from '@/app/hooks/contexts/Game/useGame';
import { ManualTestingSettingsContextProvider } from '@/app/hooks/contexts/Settings/ManualTestingSettingsContextProvider';
import { Settings } from '@/app/hooks/contexts/Settings/Settings';
import { SettingsContext } from '@/app/hooks/contexts/Settings/SettingsContext';
import { ErrorBoundary } from '@/app/hooks/ErrorBoundary';
import { getCardIdsFromSpy, getPropertiesFromFromToSpy, getPropertiesFromSpy, spyOnGsap } from '@/app/testUtils';
import { calcCardId, CardLocation, CardShorthand, parseShorthandCard, PileSH, RankList, shorthandCard, shorthandPosition, SuitList } from '@/game/card/card';
import { getMoves } from '@/game/catalog/solutions-catalog';
import { FreeCell } from '@/game/game';
import { spotRegexMoveInHistory } from '@/game/move/history';
import { parseShorthandMove } from '@/game/move/move';

const gsapUtilsRandom = gsap.utils.random as jest.Mock;

/** HACK (techdebt) we need the game state to make moves by position shorthand */
let moveByShorthand: (shorthandMove: string) => void;
/** HACK (techdebt) @deprecated @use {@link screen} */
let cribGame: () => FreeCell;
/** HACK (techdebt) crib hook to update settings */
let setSettings: Dispatch<SetStateAction<Settings>>;
function CribTheGame() {
	const game = useGame();
	[, setSettings] = useContext(SettingsContext);
	cribGame = () => game;

	moveByShorthand = (shorthandMove: string) => {
		const [from, to] = parseShorthandMove(game, shorthandMove);
		_clickByLocation(from);
		_clickByLocation(to);
	};

	function _clickByLocation(location: CardLocation) {
		const card = game.cards.find(
			(card) => card.location.fixture === location.fixture && card.location.data[0] === location.data[0] && card.location.data[1] === location.data[1]
		);

		if (card) {
			clickCard(card);
		} else if ([0, -1, undefined].includes(location.data[1])) {
			// pilemarker
			const position = shorthandPosition(location)[0] as PileSH;
			if (position !== 'h') {
				clickPile(position);
			} else {
				const d0 = location.data[0];
				fireEvent.click(screen.getAllByText(position)[d0 - 1]);
			}
		} else {
			throw new Error(`Card not found for location: ${JSON.stringify(location)}`);
		}
	}

	return null;
}

function clickCard(shorthand: CardShorthand | string | null) {
	if (typeof shorthand === 'string') shorthand = parseShorthandCard(shorthand);
	if (shorthand) {
		fireEvent.click(screen.getByAltText(`${shorthand.rank} of ${shorthand.suit}`));
	}
}
function clickPile(pileSh: PileSH) {
	fireEvent.click(screen.getByText(pileSh));
}

function MockGamePage({
	game,
	gameBoardId,
	controlScheme = ControlSchemes.ClickToSelect,
}: {
	game: FreeCell;
	gameBoardId?: string;
	controlScheme?: ControlSchemes;
}) {
	return (
		<ErrorBoundary>
			<ManualTestingSettingsContextProvider controlSchemes={[controlScheme]}>
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
	let gsapSetSpy: jest.SpyInstance;
	let gsapFromSpy: jest.SpyInstance;
	let fromToSpy: jest.SpyInstance;
	let toSpy: jest.SpyInstance;
	let setSpy: jest.SpyInstance;
	let addLabelSpy: jest.SpyInstance;
	let timeScaleSpy: jest.SpyInstance;
	let consoleDebugSpy: jest.SpyInstance;
	let mockReset: (runOnComplete?: boolean) => void;
	let mockCallTimes: () => Record<string, number>;
	beforeEach(() => {
		({ gsapSetSpy, gsapFromSpy, fromToSpy, toSpy, setSpy, addLabelSpy, timeScaleSpy, consoleDebugSpy, mockReset, mockCallTimes } = spyOnGsap(gsap));
		consoleDebugSpy.mockReturnValue(undefined);
	});

	/** https://www.solitairelaboratory.com/tutorial.html */
	test('renders a game', () => {
		const { container } = render(<MockGamePage game={new FreeCell().shuffle32(1)} />);

		// initial state
		expect(addLabelSpy.mock.calls).toEqual([['shuffle deck (1)'], ['updateCardPositions']]);
		expect(mockCallTimes()).toEqual({
			gsapSetSpy: 52,
			setSpy: 52,
			addLabelSpy: 2,
		});
		expect(getPropertiesFromSpy(gsapSetSpy)).toEqual({
			top: 52,
			left: 52,
			zIndex: 52,
			rotation: 52,
		});
		expect(getPropertiesFromSpy(setSpy)).toEqual({
			top: 52,
			left: 52,
			zIndex: 52,
			rotation: 52,
		});

		mockReset();
		fireEvent.click(screen.getAllByAltText('card back')[0]);

		// animations
		expect(addLabelSpy.mock.calls).toEqual([['gameFunction check-can-flourish'], ['updateCardPositions']]);
		expect(mockCallTimes()).toEqual({
			fromToSpy: 52,
			toSpy: 52,
			addLabelSpy: 2,
		});
		expect(getPropertiesFromFromToSpy(fromToSpy)).toEqual({
			from: {
				top: 52,
				left: 52,
			},
			to: {
				top: 52,
				left: 52,
			},
		});
		expect(getPropertiesFromSpy(toSpy)).toEqual({
			zIndex: 51,
			rotation: 1,
		});

		expect(container).toMatchSnapshot();
	});

	test('enable debug mode', () => {
		const { container } = render(<MockGamePage game={new FreeCell().shuffle32(1).dealAll()} />);
		fireEvent.click(screen.getByRole('checkbox', { name: 'Show Debug Info' }));
		fireEvent.click(screen.getByAltText('6 of clubs'));
		expect(container).toMatchSnapshot();
	});

	/** @see game.test.ts */
	describe('completed games', () => {
		/** https://www.solitairelaboratory.com/tutorial.html */
		test('Game #5 (tutorial)', () => {
			const gameBoardId = 'GameBoard.test-#5';
			gsapUtilsRandom.mockReturnValueOnce('scale'); // for WinMessage
			const { container } = render(<MockGamePage game={new FreeCell().shuffle32(5)} gameBoardId={gameBoardId} />);

			expect(container).toMatchSnapshot();
			expect(screen.queryByText('You Win!')).toBeFalsy();
			expect(screen.getByRole('status').textContent).toBe('shuffle deck (5)');
			expect(mockCallTimes()).toEqual({
				gsapSetSpy: 52,
				setSpy: 52,
				addLabelSpy: 2,
			});
			// TODO (animation) (test) also test the animations, not just the labels
			expect(addLabelSpy.mock.calls).toEqual([
				// just the shuffle
				['shuffle deck (5)'],
				['updateCardPositions'],
			]);
			mockReset();

			// Deal the game
			fireEvent.click(screen.getAllByAltText('card back')[0]);
			expect(container).toMatchSnapshot();
			expect(screen.getByRole('status').textContent).toBe('juice flash AH,AS');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 52,
				toSpy: 53,
				addLabelSpy: 2,
			});
			// TODO (2-priority) (animation) should we split deal and check-can-flourish?
			//  - deal and check-can-flourish are squashed in one update
			//  - it would be nice to chain the card tilt so it's not so hidden
			expect(addLabelSpy.mock.calls).toEqual([['gameFunction check-can-flourish'], ['updateCardPositions']]);
			mockReset();

			// In game 5, you may begin by moving the six of hearts onto the seven of clubs.
			// Note that the free ace of diamonds moves automatically to a homecell when you do this.
			moveByShorthand('53');
			expect(screen.getByRole('status').textContent).toBe('move 5⡅3⡆ 6H→7C (auto-foundation 2 AD)');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 5,
				toSpy: 4,
				setSpy: 99,
				addLabelSpy: 5,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([
				['select 5⡅ 6H'],
				['updateCardPositions'],
				['move 5⡅3⡆ 6H→7C (auto-foundation 2 AD)'],
				['updateCardPositionsPrev'],
				['updateCardPositions'],
			]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cAH-GameBoard.test-#5', { top: 20, left: 10 }, { top: 20, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cAS-GameBoard.test-#5', { top: 21, left: 20 }, { top: 21, left: 20, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c6H-GameBoard.test-#5', { top: 25, left: 50 }, { top: 25.5, left: 50, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c6H-GameBoard.test-#5', { top: 25.5, left: 50 }, { top: 27, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cAD-GameBoard.test-#5', { top: 26, left: 20 }, { top: 5, left: 50, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#cAH-GameBoard.test-#5', { rotation: 0, duration: 0.1, ease: 'power1.inOut' }, '<'],
				['#cAS-GameBoard.test-#5', { rotation: 0, duration: 0.1, ease: 'power1.inOut' }, '<'],
				['#c6H-GameBoard.test-#5', { zIndex: 7, duration: 0.15, ease: 'none' }, '<'],
				['#cAD-GameBoard.test-#5', { zIndex: 101, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move-foundation']]);
			mockReset();
			// the six of clubs to a freecell,
			moveByShorthand('6a');
			expect(screen.getByRole('status').textContent).toBe('move 6⡅a 6C→cell');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 6⡅ 6C'], ['updateCardPositions'], ['move 6⡅a 6C→cell'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c6C-GameBoard.test-#5', { top: 25, left: 60 }, { top: 25.5, left: 60, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c6C-GameBoard.test-#5', { top: 25.5, left: 60 }, { top: 5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#c6C-GameBoard.test-#5', { zIndex: 99, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();
			// the queen of diamonds onto the king of spades,
			moveByShorthand('65');
			expect(screen.getByRole('status').textContent).toBe('move 6⡄5⡄ QD→KS');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 6⡄ QD'], ['updateCardPositions'], ['move 6⡄5⡄ QD→KS'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cQD-GameBoard.test-#5', { top: 24, left: 60 }, { top: 24.5, left: 60, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cQD-GameBoard.test-#5', { top: 24.5, left: 60 }, { top: 25, left: 50, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#cQD-GameBoard.test-#5', { zIndex: 5, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();
			// the jack of hearts onto the queen of clubs,
			moveByShorthand('67');
			expect(screen.getByRole('status').textContent).toBe('move 6⡃7⡅ JH→QC');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 6⡃ JH'], ['updateCardPositions'], ['move 6⡃7⡅ JH→QC'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cJH-GameBoard.test-#5', { top: 23, left: 60 }, { top: 23.5, left: 60, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cJH-GameBoard.test-#5', { top: 23.5, left: 60 }, { top: 26, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#cJH-GameBoard.test-#5', { zIndex: 6, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();
			// the jack of spades onto the queen of diamonds
			// (the free ace of clubs moves automatically to another homecell)
			moveByShorthand('85');
			expect(screen.getByRole('status').textContent).toBe('move 8⡅5⡅ JS→QD (auto-foundation 8 AC)');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 3,
				toSpy: 2,
				setSpy: 101,
				addLabelSpy: 5,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([
				['select 8⡅ JS'],
				['updateCardPositions'],
				['move 8⡅5⡅ JS→QD (auto-foundation 8 AC)'],
				['updateCardPositionsPrev'],
				['updateCardPositions'],
			]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cJS-GameBoard.test-#5', { top: 25, left: 80 }, { top: 25.5, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cJS-GameBoard.test-#5', { top: 25.5, left: 80 }, { top: 26, left: 50, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cAC-GameBoard.test-#5', { top: 24, left: 80 }, { top: 5, left: 60, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#cJS-GameBoard.test-#5', { zIndex: 6, duration: 0.15, ease: 'none' }, '<'],
				['#cAC-GameBoard.test-#5', { zIndex: 101, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move-foundation']]);
			mockReset();

			// Now move the six of clubs from its freecell onto the seven of diamonds,
			moveByShorthand('a8');
			expect(screen.getByRole('status').textContent).toBe('move a8⡃ 6C→7D');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 3,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select a 6C'], ['updateCardPositions'], ['move a8⡃ 6C→7D'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c6C-GameBoard.test-#5', { top: 5, left: 10 }, { top: 5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c6C-GameBoard.test-#5', { top: 5, left: 10 }, { top: 24, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			// REVIEW (animation) (fixture-sizes) we should schedule the "rotate to 0" before the card moves (deselect cell)
			expect(toSpy.mock.calls).toEqual([
				['#c6C-GameBoard.test-#5', { rotation: 10, duration: 0.1, ease: 'power1.inOut' }, '<'],
				['#c6C-GameBoard.test-#5', { zIndex: 4, duration: 0.15, ease: 'none' }, '<'],
				['#c6C-GameBoard.test-#5', { rotation: 0, duration: 0.1, ease: 'power1.inOut' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// and the five of hearts onto the six of clubs.
			// The free two of clubs now moves automatically onto the club homecell.
			moveByShorthand('68');
			expect(screen.getByRole('status').textContent).toBe('move 6⡂8⡄ 5H→6C (auto-foundation 6 2C)');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 3,
				toSpy: 2,
				setSpy: 101,
				addLabelSpy: 5,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([
				['select 6⡂ 5H'],
				['updateCardPositions'],
				['move 6⡂8⡄ 5H→6C (auto-foundation 6 2C)'],
				['updateCardPositionsPrev'],
				['updateCardPositions'],
			]);
			// REVIEW (animation) (test) shouldn't 2C (move-foundation) move with a delay; it should start partway through the 5H moving
			expect(fromToSpy.mock.calls).toEqual([
				['#c5H-GameBoard.test-#5', { top: 22, left: 60 }, { top: 22.5, left: 60, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c5H-GameBoard.test-#5', { top: 22.5, left: 60 }, { top: 25, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c2C-GameBoard.test-#5', { top: 21, left: 60 }, { top: 5, left: 60, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#c5H-GameBoard.test-#5', { zIndex: 5, duration: 0.15, ease: 'none' }, '<'],
				['#c2C-GameBoard.test-#5', { zIndex: 102, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move-foundation']]);
			mockReset();

			// Move the ten of clubs onto the jack of hearts,
			moveByShorthand('27');
			expect(screen.getByRole('status').textContent).toBe('move 2⡅7⡆ TC→JH');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 2⡅ TC'], ['updateCardPositions'], ['move 2⡅7⡆ TC→JH'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cTC-GameBoard.test-#5', { top: 25, left: 20 }, { top: 25.5, left: 20, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cTC-GameBoard.test-#5', { top: 25.5, left: 20 }, { top: 27, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#cTC-GameBoard.test-#5', { zIndex: 7, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// and the nine of hearts onto the ten of clubs.
			moveByShorthand('67');
			expect(screen.getByRole('status').textContent).toBe('move 6⡀7⡇ 9H→TC');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 6⡀ 9H'], ['updateCardPositions'], ['move 6⡀7⡇ 9H→TC'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c9H-GameBoard.test-#5', { top: 20, left: 60 }, { top: 20.5, left: 60, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c9H-GameBoard.test-#5', { top: 20.5, left: 60 }, { top: 28, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#c9H-GameBoard.test-#5', { zIndex: 8, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			expect(container).toMatchSnapshot();

			// Move the nine of spades to a freecell
			moveByShorthand('1a');
			expect(screen.getByRole('status').textContent).toBe('move 1⡆a 9S→cell');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 1⡆ 9S'], ['updateCardPositions'], ['move 1⡆a 9S→cell'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c9S-GameBoard.test-#5', { top: 26, left: 10 }, { top: 26.5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c9S-GameBoard.test-#5', { top: 26.5, left: 10 }, { top: 5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#c9S-GameBoard.test-#5', { zIndex: 99, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// and the two of hearts to another freecell
			moveByShorthand('1b');
			expect(screen.getByRole('status').textContent).toBe('move 1⡅b 2H→cell');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 1⡅ 2H'], ['updateCardPositions'], ['move 1⡅b 2H→cell'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c2H-GameBoard.test-#5', { top: 25, left: 10 }, { top: 25.5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c2H-GameBoard.test-#5', { top: 25.5, left: 10 }, { top: 5, left: 20, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#c2H-GameBoard.test-#5', { zIndex: 99, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// Move the five of spades onto the six of hearts,
			moveByShorthand('13');
			expect(screen.getByRole('status').textContent).toBe('move 1⡄3⡇ 5S→6H');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 1⡄ 5S'], ['updateCardPositions'], ['move 1⡄3⡇ 5S→6H'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c5S-GameBoard.test-#5', { top: 24, left: 10 }, { top: 24.5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c5S-GameBoard.test-#5', { top: 24.5, left: 10 }, { top: 28, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#c5S-GameBoard.test-#5', { zIndex: 8, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// and the ten of diamonds (followed by the nine of spades) onto the jack of spades.
			moveByShorthand('15');
			expect(screen.getByRole('status').textContent).toBe('move 1⡃5⡆ TD→JS');
			moveByShorthand('a5');
			expect(screen.getByRole('status').textContent).toBe('move a5⡇ 9S→TD');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 4,
				toSpy: 4,
				setSpy: 204,
				addLabelSpy: 8,
				timeScaleSpy: 5,
				consoleDebugSpy: 3,
			});
			expect(addLabelSpy.mock.calls).toEqual([
				['select 1⡃ TD'],
				['updateCardPositions'],
				['move 1⡃5⡆ TD→JS'],
				['updateCardPositions'],
				['select a 9S'],
				['updateCardPositions'],
				['move a5⡇ 9S→TD'],
				['updateCardPositions'],
			]);
			// REVIEW (animation) (test) why does 9S fromTo the same spot (select cell rotates)? stabilizing force? just in case?
			expect(fromToSpy.mock.calls).toEqual([
				['#cTD-GameBoard.test-#5', { top: 23, left: 10 }, { top: 23.5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cTD-GameBoard.test-#5', { top: 23.5, left: 10 }, { top: 27, left: 50, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c9S-GameBoard.test-#5', { top: 5, left: 10 }, { top: 5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c9S-GameBoard.test-#5', { top: 5, left: 10 }, { top: 28, left: 50, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			// REVIEW (animation) (fixture-sizes) we should schedule the "rotate to 0" before the card moves (deselect cell)
			expect(toSpy.mock.calls).toEqual([
				['#cTD-GameBoard.test-#5', { zIndex: 7, duration: 0.15, ease: 'none' }, '<'],
				['#c9S-GameBoard.test-#5', { rotation: 10, duration: 0.1, ease: 'power1.inOut' }, '<'],
				['#c9S-GameBoard.test-#5', { zIndex: 8, duration: 0.15, ease: 'none' }, '<'],
				['#c9S-GameBoard.test-#5', { rotation: 0, duration: 0.1, ease: 'power1.inOut' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([
				['speedup updateCardPositions', 'move'],
				['speedup updateCardPositions', 'select'],
				['speedup updateCardPositions', 'move'],
			]);
			mockReset();

			// Now move the three of spades and the five of clubs each to a freecell,
			// and the ace of hearts and two of hearts automatically move to a new homecell.
			moveByShorthand('1a');
			expect(screen.getByRole('status').textContent).toBe('move 1⡂a 3S→cell');
			moveByShorthand('1c');
			expect(screen.getByRole('status').textContent).toBe('move 1⡁c 5C→cell (auto-foundation 1b AH,2H)');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 6,
				toSpy: 4,
				setSpy: 202,
				addLabelSpy: 9,
				timeScaleSpy: 5,
				consoleDebugSpy: 3,
			});
			expect(addLabelSpy.mock.calls).toEqual([
				['select 1⡂ 3S'],
				['updateCardPositions'],
				['move 1⡂a 3S→cell'],
				['updateCardPositions'],
				['select 1⡁ 5C'],
				['updateCardPositions'],
				['move 1⡁c 5C→cell (auto-foundation 1b AH,2H)'],
				['updateCardPositionsPrev'],
				['updateCardPositions'],
			]);
			// REVIEW (animation) (test) when exactly does AH and 2H move? I don't understand from just this
			//  - I get that select/move, select/move-foundation are distince actions
			//  - but move & auto-foundation is chained
			//  - maybe we need a label for the chained animation (updateCardPositionsPrev)
			//  - maybe we need to _use_ the label in the timing information? (that's an idea, but I don't know if it will make things harder to time right)
			expect(fromToSpy.mock.calls).toEqual([
				['#c3S-GameBoard.test-#5', { top: 22, left: 10 }, { top: 22.5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c3S-GameBoard.test-#5', { top: 22.5, left: 10 }, { top: 5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c5C-GameBoard.test-#5', { top: 21, left: 10 }, { top: 21.5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c5C-GameBoard.test-#5', { top: 21.5, left: 10 }, { top: 5, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cAH-GameBoard.test-#5', { top: 20, left: 10 }, { top: 5, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c2H-GameBoard.test-#5', { top: 5, left: 20 }, { top: 5, left: 70, duration: 0.3, ease: 'power1.out' }, '<0.060'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#c3S-GameBoard.test-#5', { zIndex: 99, duration: 0.15, ease: 'none' }, '<'],
				['#c5C-GameBoard.test-#5', { zIndex: 99, duration: 0.15, ease: 'none' }, '<'],
				['#cAH-GameBoard.test-#5', { zIndex: 101, duration: 0.15, ease: 'none' }, '<'],
				['#c2H-GameBoard.test-#5', { zIndex: 102, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([
				['speedup updateCardPositions', 'move'],
				['speedup updateCardPositions', 'select'],
				['speedup updateCardPositions', 'move-foundation'],
			]);
			mockReset();

			// Click on the five of hearts now to select it, then click on the empty sixth column.
			moveByShorthand('86');
			expect(screen.getByRole('status').textContent).toBe('move 8⡃6 7D-6C-5H→cascade');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 6,
				toSpy: 3,
				setSpy: 98,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 8⡃ 7D-6C-5H'], ['updateCardPositions'], ['move 8⡃6 7D-6C-5H→cascade'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c7D-GameBoard.test-#5', { top: 23, left: 80 }, { top: 22.75, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c6C-GameBoard.test-#5', { top: 24, left: 80 }, { top: 24.5, left: 80, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c5H-GameBoard.test-#5', { top: 25, left: 80 }, { top: 25.5, left: 80, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c7D-GameBoard.test-#5', { top: 22.75, left: 80 }, { top: 20, left: 60, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c6C-GameBoard.test-#5', { top: 24.5, left: 80 }, { top: 21, left: 60, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c5H-GameBoard.test-#5', { top: 25.5, left: 80 }, { top: 22, left: 60, duration: 0.3, ease: 'power1.out' }, '<0.060'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#c7D-GameBoard.test-#5', { zIndex: 0, duration: 0.15, ease: 'none' }, '<'],
				['#c6C-GameBoard.test-#5', { zIndex: 1, duration: 0.15, ease: 'none' }, '<'],
				['#c5H-GameBoard.test-#5', { zIndex: 2, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			expect(container).toMatchSnapshot();

			// Next move the eight of diamonds onto the nine of spades,
			moveByShorthand('85');
			expect(screen.getByRole('status').textContent).toBe('move 8⡂5⡈ 8D→9S');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 8⡂ 8D'], ['updateCardPositions'], ['move 8⡂5⡈ 8D→9S'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c8D-GameBoard.test-#5', { top: 22, left: 80 }, { top: 22.5, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c8D-GameBoard.test-#5', { top: 22.5, left: 80 }, { top: 29, left: 50, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#c8D-GameBoard.test-#5', { zIndex: 9, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// and the four of spades and three of diamonds onto the five of hearts, clearing column eight.
			moveByShorthand('86');
			expect(screen.getByRole('status').textContent).toBe('move 8⡁6⡂ 4S→5H');
			moveByShorthand('86');
			expect(screen.getByRole('status').textContent).toBe('move 8⡀6⡃ 3D→4S');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 4,
				toSpy: 2,
				setSpy: 204,
				addLabelSpy: 8,
				timeScaleSpy: 5,
				consoleDebugSpy: 3,
			});
			expect(addLabelSpy.mock.calls).toEqual([
				['select 8⡁ 4S'],
				['updateCardPositions'],
				['move 8⡁6⡂ 4S→5H'],
				['updateCardPositions'],
				['select 8⡀ 3D'],
				['updateCardPositions'],
				['move 8⡀6⡃ 3D→4S'],
				['updateCardPositions'],
			]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c4S-GameBoard.test-#5', { top: 21, left: 80 }, { top: 21.5, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c4S-GameBoard.test-#5', { top: 21.5, left: 80 }, { top: 23, left: 60, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c3D-GameBoard.test-#5', { top: 20, left: 80 }, { top: 20.5, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c3D-GameBoard.test-#5', { top: 20.5, left: 80 }, { top: 24, left: 60, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#c4S-GameBoard.test-#5', { zIndex: 3, duration: 0.15, ease: 'none' }, '<'],
				['#c3D-GameBoard.test-#5', { zIndex: 4, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([
				['speedup updateCardPositions', 'move'],
				['speedup updateCardPositions', 'select'],
				['speedup updateCardPositions', 'move'],
			]);
			mockReset();

			// Next move the queen of hearts into the empty first column
			moveByShorthand('21');
			expect(screen.getByRole('status').textContent).toBe('move 2⡄1 QH→cascade');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 2⡄ QH'], ['updateCardPositions'], ['move 2⡄1 QH→cascade'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cQH-GameBoard.test-#5', { top: 24, left: 20 }, { top: 24.5, left: 20, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cQH-GameBoard.test-#5', { top: 24.5, left: 20 }, { top: 20, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#cQH-GameBoard.test-#5', { zIndex: 0, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// Move the seven of spades onto the eight of diamonds,
			moveByShorthand('25');
			expect(screen.getByRole('status').textContent).toBe('move 2⡃5⡉ 7S→8D');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 2⡃ 7S'], ['updateCardPositions'], ['move 2⡃5⡉ 7S→8D'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c7S-GameBoard.test-#5', { top: 23, left: 20 }, { top: 23.5, left: 20, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c7S-GameBoard.test-#5', { top: 23.5, left: 20 }, { top: 30, left: 50, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#c7S-GameBoard.test-#5', { zIndex: 10, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// the five of diamonds to a freecell (sending the ace of spades home),
			moveByShorthand('2b');
			expect(screen.getByRole('status').textContent).toBe('move 2⡂b 5D→cell (auto-foundation 2 AS)');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 3,
				toSpy: 2,
				setSpy: 101,
				addLabelSpy: 5,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([
				['select 2⡂ 5D'],
				['updateCardPositions'],
				['move 2⡂b 5D→cell (auto-foundation 2 AS)'],
				['updateCardPositionsPrev'],
				['updateCardPositions'],
			]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c5D-GameBoard.test-#5', { top: 22, left: 20 }, { top: 22.5, left: 20, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c5D-GameBoard.test-#5', { top: 22.5, left: 20 }, { top: 5, left: 20, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cAS-GameBoard.test-#5', { top: 21, left: 20 }, { top: 5, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#c5D-GameBoard.test-#5', { zIndex: 99, duration: 0.15, ease: 'none' }, '<'],
				['#cAS-GameBoard.test-#5', { zIndex: 101, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move-foundation']]);
			mockReset();

			// and the eight of spades onto the nine of hearts.
			moveByShorthand('27');
			expect(screen.getByRole('status').textContent).toBe('move 2⡀7⡈ 8S→9H');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 2⡀ 8S'], ['updateCardPositions'], ['move 2⡀7⡈ 8S→9H'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c8S-GameBoard.test-#5', { top: 20, left: 20 }, { top: 20.5, left: 20, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c8S-GameBoard.test-#5', { top: 20.5, left: 20 }, { top: 29, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#c8S-GameBoard.test-#5', { zIndex: 9, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// Move the ten of spades into the empty second column,
			moveByShorthand('42');
			expect(screen.getByRole('status').textContent).toBe('move 4⡆2 TS→cascade');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 4⡆ TS'], ['updateCardPositions'], ['move 4⡆2 TS→cascade'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cTS-GameBoard.test-#5', { top: 26, left: 40 }, { top: 26.5, left: 40, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cTS-GameBoard.test-#5', { top: 26.5, left: 40 }, { top: 20, left: 20, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#cTS-GameBoard.test-#5', { zIndex: 0, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// the six of diamonds (followed by the five of clubs) onto the seven of spades,
			moveByShorthand('45');
			expect(screen.getByRole('status').textContent).toBe('move 4⡅5⡊ 6D→7S');
			moveByShorthand('c5');
			expect(screen.getByRole('status').textContent).toBe('move c5⡋ 5C→6D');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 4,
				toSpy: 4,
				setSpy: 204,
				addLabelSpy: 8,
				timeScaleSpy: 5,
				consoleDebugSpy: 3,
			});
			expect(addLabelSpy.mock.calls).toEqual([
				['select 4⡅ 6D'],
				['updateCardPositions'],
				['move 4⡅5⡊ 6D→7S'],
				['updateCardPositions'],
				['select c 5C'],
				['updateCardPositions'],
				['move c5⡋ 5C→6D'],
				['updateCardPositions'],
			]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c6D-GameBoard.test-#5', { top: 25, left: 40 }, { top: 25.5, left: 40, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c6D-GameBoard.test-#5', { top: 25.5, left: 40 }, { top: 31, left: 50, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c5C-GameBoard.test-#5', { top: 5, left: 30 }, { top: 5, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'], // stabilizing force, just in case
				['#c5C-GameBoard.test-#5', { top: 5, left: 30 }, { top: 32, left: 50, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#c6D-GameBoard.test-#5', { zIndex: 11, duration: 0.15, ease: 'none' }, '<'],
				['#c5C-GameBoard.test-#5', { rotation: 10, duration: 0.1, ease: 'power1.inOut' }, '<'],
				['#c5C-GameBoard.test-#5', { zIndex: 12, duration: 0.15, ease: 'none' }, '<'],
				['#c5C-GameBoard.test-#5', { rotation: 0, duration: 0.1, ease: 'power1.inOut' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([
				['speedup updateCardPositions', 'move'],
				['speedup updateCardPositions', 'select'],
				['speedup updateCardPositions', 'move'],
			]);
			mockReset();

			// the nine of diamonds onto the ten of spades,
			moveByShorthand('42');
			expect(screen.getByRole('status').textContent).toBe('move 4⡄2⡀ 9D→TS');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 4⡄ 9D'], ['updateCardPositions'], ['move 4⡄2⡀ 9D→TS'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c9D-GameBoard.test-#5', { top: 24, left: 40 }, { top: 24.5, left: 40, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c9D-GameBoard.test-#5', { top: 24.5, left: 40 }, { top: 21, left: 20, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#c9D-GameBoard.test-#5', { zIndex: 1, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// and the seven of hearts onto the eight of spades.
			moveByShorthand('47');
			expect(screen.getByRole('status').textContent).toBe('move 4⡃7⡉ 7H→8S');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 4⡃ 7H'], ['updateCardPositions'], ['move 4⡃7⡉ 7H→8S'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c7H-GameBoard.test-#5', { top: 23, left: 40 }, { top: 23.5, left: 40, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c7H-GameBoard.test-#5', { top: 23.5, left: 40 }, { top: 30, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#c7H-GameBoard.test-#5', { zIndex: 10, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// it is perfectly safe to move the three of hearts to its homecell,
			// and you can do so yourself by selecting it, then clicking on the two of hearts.
			moveByShorthand('4h');
			expect(screen.getByRole('status').textContent).toBe('move 4⡂h⡂ 3H→2H');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 4⡂ 3H'], ['updateCardPositions'], ['move 4⡂h⡂ 3H→2H'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c3H-GameBoard.test-#5', { top: 22, left: 40 }, { top: 22.5, left: 40, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c3H-GameBoard.test-#5', { top: 22.5, left: 40 }, { top: 5, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#c3H-GameBoard.test-#5', { zIndex: 103, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// Now reverse the backwards sequence in the fourth column by moving the king of hearts,
			// followed by the queen of spades, to the empty eighth column.
			moveByShorthand('48');
			expect(screen.getByRole('status').textContent).toBe('move 4⡁8 KH→cascade');
			moveByShorthand('48');
			expect(screen.getByRole('status').textContent).toBe('move 4⡀8⡀ QS→KH');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 4,
				toSpy: 2,
				setSpy: 204,
				addLabelSpy: 8,
				timeScaleSpy: 5,
				consoleDebugSpy: 3,
			});
			expect(addLabelSpy.mock.calls).toEqual([
				['select 4⡁ KH'],
				['updateCardPositions'],
				['move 4⡁8 KH→cascade'],
				['updateCardPositions'],
				['select 4⡀ QS'],
				['updateCardPositions'],
				['move 4⡀8⡀ QS→KH'],
				['updateCardPositions'],
			]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cKH-GameBoard.test-#5', { top: 21, left: 40 }, { top: 21.5, left: 40, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cKH-GameBoard.test-#5', { top: 21.5, left: 40 }, { top: 20, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cQS-GameBoard.test-#5', { top: 20, left: 40 }, { top: 20.5, left: 40, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cQS-GameBoard.test-#5', { top: 20.5, left: 40 }, { top: 21, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#cKH-GameBoard.test-#5', { zIndex: 0, duration: 0.15, ease: 'none' }, '<'],
				['#cQS-GameBoard.test-#5', { zIndex: 1, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([
				['speedup updateCardPositions', 'move'],
				['speedup updateCardPositions', 'select'],
				['speedup updateCardPositions', 'move'],
			]);
			mockReset();

			expect(container).toMatchSnapshot();

			// move five cards (up to the jack of hearts) from column seven onto the queen of spades in column eight.
			moveByShorthand('78');
			expect(screen.getByRole('status').textContent).toBe('move 7⡆8⡁ JH-TC-9H-8S-7H→QS');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 10,
				toSpy: 5,
				setSpy: 94,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 7⡆ JH-TC-9H-8S-7H'], ['updateCardPositions'], ['move 7⡆8⡁ JH-TC-9H-8S-7H→QS'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cJH-GameBoard.test-#5', { top: 26, left: 70 }, { top: 25.75, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cTC-GameBoard.test-#5', { top: 27, left: 70 }, { top: 27.5, left: 70, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c9H-GameBoard.test-#5', { top: 28, left: 70 }, { top: 28.5, left: 70, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c8S-GameBoard.test-#5', { top: 29, left: 70 }, { top: 29.5, left: 70, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c7H-GameBoard.test-#5', { top: 30, left: 70 }, { top: 30.5, left: 70, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#cJH-GameBoard.test-#5', { top: 25.75, left: 70 }, { top: 22, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cTC-GameBoard.test-#5', { top: 27.5, left: 70 }, { top: 23, left: 80, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c9H-GameBoard.test-#5', { top: 28.5, left: 70 }, { top: 24, left: 80, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c8S-GameBoard.test-#5', { top: 29.5, left: 70 }, { top: 25, left: 80, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c7H-GameBoard.test-#5', { top: 30.5, left: 70 }, { top: 26, left: 80, duration: 0.3, ease: 'power1.out' }, '<0.060'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#cJH-GameBoard.test-#5', { zIndex: 2, duration: 0.15, ease: 'none' }, '<'],
				['#cTC-GameBoard.test-#5', { zIndex: 3, duration: 0.15, ease: 'none' }, '<'],
				['#c9H-GameBoard.test-#5', { zIndex: 4, duration: 0.15, ease: 'none' }, '<'],
				['#c8S-GameBoard.test-#5', { zIndex: 5, duration: 0.15, ease: 'none' }, '<'],
				['#c7H-GameBoard.test-#5', { zIndex: 6, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// move the queen of clubs to a freecell,
			moveByShorthand('7c');
			expect(screen.getByRole('status').textContent).toBe('move 7⡅c QC→cell');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 7⡅ QC'], ['updateCardPositions'], ['move 7⡅c QC→cell'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cQC-GameBoard.test-#5', { top: 25, left: 70 }, { top: 25.5, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cQC-GameBoard.test-#5', { top: 25.5, left: 70 }, { top: 5, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#cQC-GameBoard.test-#5', { zIndex: 99, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// the four of hearts to its homecell
			moveByShorthand('7h');
			expect(screen.getByRole('status').textContent).toBe('move 7⡄h⡂ 4H→3H');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 7⡄ 4H'], ['updateCardPositions'], ['move 7⡄h⡂ 4H→3H'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c4H-GameBoard.test-#5', { top: 24, left: 70 }, { top: 24.5, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c4H-GameBoard.test-#5', { top: 24.5, left: 70 }, { top: 5, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#c4H-GameBoard.test-#5', { zIndex: 104, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// move the jack of clubs onto the queen of hearts,
			moveByShorthand('71');
			expect(screen.getByRole('status').textContent).toBe('move 7⡃1⡀ JC→QH');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 7⡃ JC'], ['updateCardPositions'], ['move 7⡃1⡀ JC→QH'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cJC-GameBoard.test-#5', { top: 23, left: 70 }, { top: 23.5, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cJC-GameBoard.test-#5', { top: 23.5, left: 70 }, { top: 21, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#cJC-GameBoard.test-#5', { zIndex: 1, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// and the six of spades onto the seven of hearts.
			moveByShorthand('78');
			expect(screen.getByRole('status').textContent).toBe('move 7⡂8⡆ 6S→7H');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 7⡂ 6S'], ['updateCardPositions'], ['move 7⡂8⡆ 6S→7H'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c6S-GameBoard.test-#5', { top: 22, left: 70 }, { top: 22.5, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c6S-GameBoard.test-#5', { top: 22.5, left: 70 }, { top: 27, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#c6S-GameBoard.test-#5', { zIndex: 7, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// Move the three of clubs to its homecell
			// The two of spades goes automatically, since both red aces are already home.
			moveByShorthand('7h');
			expect(screen.getByRole('status').textContent).toBe('move 7⡁h⡁ 3C→2C (auto-foundation 7 2S)');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 3,
				toSpy: 2,
				setSpy: 101,
				addLabelSpy: 5,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([
				['select 7⡁ 3C'],
				['updateCardPositions'],
				['move 7⡁h⡁ 3C→2C (auto-foundation 7 2S)'],
				['updateCardPositionsPrev'],
				['updateCardPositions'],
			]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c3C-GameBoard.test-#5', { top: 21, left: 70 }, { top: 21.5, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c3C-GameBoard.test-#5', { top: 21.5, left: 70 }, { top: 5, left: 60, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c2S-GameBoard.test-#5', { top: 20, left: 70 }, { top: 5, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#c3C-GameBoard.test-#5', { zIndex: 103, duration: 0.15, ease: 'none' }, '<'],
				['#c2S-GameBoard.test-#5', { zIndex: 102, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move-foundation']]);
			mockReset();

			// Move the three of spades home
			moveByShorthand('ah');
			expect(screen.getByRole('status').textContent).toBe('move ah⡃ 3S→2S');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 3,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select a 3S'], ['updateCardPositions'], ['move ah⡃ 3S→2S'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c3S-GameBoard.test-#5', { top: 5, left: 10 }, { top: 5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c3S-GameBoard.test-#5', { top: 5, left: 10 }, { top: 5, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#c3S-GameBoard.test-#5', { rotation: 10, duration: 0.1, ease: 'power1.inOut' }, '<'],
				['#c3S-GameBoard.test-#5', { zIndex: 103, duration: 0.15, ease: 'none' }, '<'],
				['#c3S-GameBoard.test-#5', { rotation: 0, duration: 0.1, ease: 'power1.inOut' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// and the five of diamonds onto the six of spades.
			moveByShorthand('b8');
			expect(screen.getByRole('status').textContent).toBe('move b8⡇ 5D→6S');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 3,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select b 5D'], ['updateCardPositions'], ['move b8⡇ 5D→6S'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c5D-GameBoard.test-#5', { top: 5, left: 20 }, { top: 5, left: 20, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c5D-GameBoard.test-#5', { top: 5, left: 20 }, { top: 28, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#c5D-GameBoard.test-#5', { rotation: 10, duration: 0.1, ease: 'power1.inOut' }, '<'],
				['#c5D-GameBoard.test-#5', { zIndex: 8, duration: 0.15, ease: 'none' }, '<'],
				['#c5D-GameBoard.test-#5', { rotation: 0, duration: 0.1, ease: 'power1.inOut' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			expect(container).toMatchSnapshot();

			// Move the five of spades through seven of clubs from column three to column four,
			moveByShorthand('34');
			expect(screen.getByRole('status').textContent).toBe('move 3⡆4 7C-6H-5S→cascade');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 6,
				toSpy: 3,
				setSpy: 98,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 3⡆ 7C-6H-5S'], ['updateCardPositions'], ['move 3⡆4 7C-6H-5S→cascade'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c7C-GameBoard.test-#5', { top: 26, left: 30 }, { top: 25.75, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c6H-GameBoard.test-#5', { top: 27, left: 30 }, { top: 27.5, left: 30, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c5S-GameBoard.test-#5', { top: 28, left: 30 }, { top: 28.5, left: 30, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c7C-GameBoard.test-#5', { top: 25.75, left: 30 }, { top: 20, left: 40, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c6H-GameBoard.test-#5', { top: 27.5, left: 30 }, { top: 21, left: 40, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c5S-GameBoard.test-#5', { top: 28.5, left: 30 }, { top: 22, left: 40, duration: 0.3, ease: 'power1.out' }, '<0.060'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#c7C-GameBoard.test-#5', { zIndex: 0, duration: 0.15, ease: 'none' }, '<'],
				['#c6H-GameBoard.test-#5', { zIndex: 1, duration: 0.15, ease: 'none' }, '<'],
				['#c5S-GameBoard.test-#5', { zIndex: 2, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// the ten of hearts onto the jack of clubs,
			moveByShorthand('31');
			expect(screen.getByRole('status').textContent).toBe('move 3⡅1⡁ TH→JC');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 3⡅ TH'], ['updateCardPositions'], ['move 3⡅1⡁ TH→JC'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cTH-GameBoard.test-#5', { top: 25, left: 30 }, { top: 25.5, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cTH-GameBoard.test-#5', { top: 25.5, left: 30 }, { top: 22, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#cTH-GameBoard.test-#5', { zIndex: 2, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// the eight of clubs onto the nine of diamonds,
			moveByShorthand('32');
			expect(screen.getByRole('status').textContent).toBe('move 3⡄2⡁ 8C→9D');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 3⡄ 8C'], ['updateCardPositions'], ['move 3⡄2⡁ 8C→9D'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c8C-GameBoard.test-#5', { top: 24, left: 30 }, { top: 24.5, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c8C-GameBoard.test-#5', { top: 24.5, left: 30 }, { top: 22, left: 20, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#c8C-GameBoard.test-#5', { zIndex: 2, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// the queen of clubs from its freecell to the empty seventh column,
			moveByShorthand('c7');
			expect(screen.getByRole('status').textContent).toBe('move c7 QC→cascade');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 3,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select c QC'], ['updateCardPositions'], ['move c7 QC→cascade'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cQC-GameBoard.test-#5', { top: 5, left: 30 }, { top: 5, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cQC-GameBoard.test-#5', { top: 5, left: 30 }, { top: 20, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#cQC-GameBoard.test-#5', { rotation: 10, duration: 0.1, ease: 'power1.inOut' }, '<'],
				['#cQC-GameBoard.test-#5', { zIndex: 0, duration: 0.15, ease: 'none' }, '<'],
				['#cQC-GameBoard.test-#5', { rotation: 0, duration: 0.1, ease: 'power1.inOut' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// and the jack of diamonds onto it.
			moveByShorthand('37');
			expect(screen.getByRole('status').textContent).toBe('move 3⡃7⡀ JD→QC');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 3⡃ JD'], ['updateCardPositions'], ['move 3⡃7⡀ JD→QC'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cJD-GameBoard.test-#5', { top: 23, left: 30 }, { top: 23.5, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cJD-GameBoard.test-#5', { top: 23.5, left: 30 }, { top: 21, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#cJD-GameBoard.test-#5', { zIndex: 1, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// Move the king of clubs to a freecell,
			moveByShorthand('3a');
			expect(screen.getByRole('status').textContent).toBe('move 3⡂a KC→cell');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 3⡂ KC'], ['updateCardPositions'], ['move 3⡂a KC→cell'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cKC-GameBoard.test-#5', { top: 22, left: 30 }, { top: 22.5, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cKC-GameBoard.test-#5', { top: 22.5, left: 30 }, { top: 5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#cKC-GameBoard.test-#5', { zIndex: 99, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// and the nine of clubs onto the ten of hearts
			// (sending the two and three of diamonds and the four of spades home).
			moveByShorthand('31');
			expect(screen.getByRole('status').textContent).toBe('move 3⡁1⡂ 9C→TH (auto-foundation 366 2D,3D,4S)');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 5,
				toSpy: 4,
				setSpy: 99,
				addLabelSpy: 5,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([
				['select 3⡁ 9C'],
				['updateCardPositions'],
				['move 3⡁1⡂ 9C→TH (auto-foundation 366 2D,3D,4S)'],
				['updateCardPositionsPrev'],
				['updateCardPositions'],
			]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c9C-GameBoard.test-#5', { top: 21, left: 30 }, { top: 21.5, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c9C-GameBoard.test-#5', { top: 21.5, left: 30 }, { top: 23, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c2D-GameBoard.test-#5', { top: 20, left: 30 }, { top: 5, left: 50, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c3D-GameBoard.test-#5', { top: 24, left: 60 }, { top: 5, left: 50, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c4S-GameBoard.test-#5', { top: 23, left: 60 }, { top: 5, left: 80, duration: 0.3, ease: 'power1.out' }, '<0.060'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#c9C-GameBoard.test-#5', { zIndex: 3, duration: 0.15, ease: 'none' }, '<'],
				['#c2D-GameBoard.test-#5', { zIndex: 102, duration: 0.15, ease: 'none' }, '<'],
				['#c3D-GameBoard.test-#5', { zIndex: 103, duration: 0.15, ease: 'none' }, '<'],
				['#c4S-GameBoard.test-#5', { zIndex: 104, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move-foundation']]);
			mockReset();

			// Move the king of clubs back into the empty third column,
			moveByShorthand('a3');
			expect(screen.getByRole('status').textContent).toBe('move a3 KC→cascade');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 3,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select a KC'], ['updateCardPositions'], ['move a3 KC→cascade'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cKC-GameBoard.test-#5', { top: 5, left: 10 }, { top: 5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cKC-GameBoard.test-#5', { top: 5, left: 10 }, { top: 20, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#cKC-GameBoard.test-#5', { rotation: 10, duration: 0.1, ease: 'power1.inOut' }, '<'],
				['#cKC-GameBoard.test-#5', { zIndex: 0, duration: 0.15, ease: 'none' }, '<'],
				['#cKC-GameBoard.test-#5', { rotation: 0, duration: 0.1, ease: 'power1.inOut' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// and the entire first column onto it.
			moveByShorthand('13');
			expect(screen.getByRole('status').textContent).toBe('move 1⡀3⡀ QH-JC-TH-9C→KC');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 7,
				toSpy: 4,
				setSpy: 97,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 1⡀ QH-JC-TH-9C'], ['updateCardPositions'], ['move 1⡀3⡀ QH-JC-TH-9C→KC'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				// no stabilizing force for QH, since it doesn't move
				['#cJC-GameBoard.test-#5', { top: 21, left: 10 }, { top: 21.5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cTH-GameBoard.test-#5', { top: 22, left: 10 }, { top: 22.5, left: 10, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c9C-GameBoard.test-#5', { top: 23, left: 10 }, { top: 23.5, left: 10, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#cQH-GameBoard.test-#5', { top: 20, left: 10 }, { top: 21, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cJC-GameBoard.test-#5', { top: 21.5, left: 10 }, { top: 22, left: 30, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#cTH-GameBoard.test-#5', { top: 22.5, left: 10 }, { top: 23, left: 30, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c9C-GameBoard.test-#5', { top: 23.5, left: 10 }, { top: 24, left: 30, duration: 0.3, ease: 'power1.out' }, '<0.060'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#cQH-GameBoard.test-#5', { zIndex: 1, duration: 0.15, ease: 'none' }, '<'],
				['#cJC-GameBoard.test-#5', { zIndex: 2, duration: 0.15, ease: 'none' }, '<'],
				['#cTH-GameBoard.test-#5', { zIndex: 3, duration: 0.15, ease: 'none' }, '<'],
				['#c9C-GameBoard.test-#5', { zIndex: 4, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// Move the entire second column onto the seventh column,
			moveByShorthand('27');
			expect(screen.getByRole('status').textContent).toBe('move 2⡀7⡁ TS-9D-8C→JD');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 5,
				toSpy: 3,
				setSpy: 99,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 2⡀ TS-9D-8C'], ['updateCardPositions'], ['move 2⡀7⡁ TS-9D-8C→JD'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				// no stabilizing force for TS, since it doesn't move
				['#c9D-GameBoard.test-#5', { top: 21, left: 20 }, { top: 21.5, left: 20, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c8C-GameBoard.test-#5', { top: 22, left: 20 }, { top: 22.5, left: 20, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#cTS-GameBoard.test-#5', { top: 20, left: 20 }, { top: 22, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c9D-GameBoard.test-#5', { top: 21.5, left: 20 }, { top: 23, left: 70, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c8C-GameBoard.test-#5', { top: 22.5, left: 20 }, { top: 24, left: 70, duration: 0.3, ease: 'power1.out' }, '<0.060'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#cTS-GameBoard.test-#5', { zIndex: 2, duration: 0.15, ease: 'none' }, '<'],
				['#c9D-GameBoard.test-#5', { zIndex: 3, duration: 0.15, ease: 'none' }, '<'],
				['#c8C-GameBoard.test-#5', { zIndex: 4, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// then the sixth column onto the seventh column.
			moveByShorthand('67');
			expect(screen.getByRole('status').textContent).toBe('move 6⡀7⡄ 7D-6C-5H→8C');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 5,
				toSpy: 3,
				setSpy: 99,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 6⡀ 7D-6C-5H'], ['updateCardPositions'], ['move 6⡀7⡄ 7D-6C-5H→8C'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				// no stabilizing force for 7D, since it doesn't move
				['#c6C-GameBoard.test-#5', { top: 21, left: 60 }, { top: 21.5, left: 60, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c5H-GameBoard.test-#5', { top: 22, left: 60 }, { top: 22.5, left: 60, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c7D-GameBoard.test-#5', { top: 20, left: 60 }, { top: 25, left: 70, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c6C-GameBoard.test-#5', { top: 21.5, left: 60 }, { top: 26, left: 70, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				['#c5H-GameBoard.test-#5', { top: 22.5, left: 60 }, { top: 27, left: 70, duration: 0.3, ease: 'power1.out' }, '<0.060'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#c7D-GameBoard.test-#5', { zIndex: 5, duration: 0.15, ease: 'none' }, '<'],
				['#c6C-GameBoard.test-#5', { zIndex: 6, duration: 0.15, ease: 'none' }, '<'],
				['#c5H-GameBoard.test-#5', { zIndex: 7, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// The long nine-card sequence at the bottom of the fifth column can be moved in ~~two pieces~~ one supermove:
			// first select the five of clubs, then any empty column.
			// NOTE Next: we skip '51' from the original solution
			//  - "Clicking the Move Column button in the dialogue box will move five cards to the empty column you selected."
			//  - "Now select the ten of diamonds, and another empty column, to move the other four cards of the sequence."
			//  - essentially, the game asks to move move this in two parts
			//  - but we are moving it one supermove
			moveByShorthand('52');
			expect(screen.getByRole('status').textContent).toBe('move 5⡄2 KS-QD-JS-TD-9S-8D-7S-6D-5C→cascade');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 18,
				toSpy: 9,
				setSpy: 86,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([
				['select 5⡄ KS-QD-JS-TD-9S-8D-7S-6D-5C'],
				['updateCardPositions'],
				['move 5⡄2 KS-QD-JS-TD-9S-8D-7S-6D-5C→cascade'],
				['updateCardPositions'],
			]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cKS-GameBoard.test-#5', { top: 24, left: 50 }, { top: 23.75, left: 50, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cQD-GameBoard.test-#5', { top: 25, left: 50 }, { top: 25.5, left: 50, duration: 0.3, ease: 'power1.out' }, '<0.033'],
				['#cJS-GameBoard.test-#5', { top: 26, left: 50 }, { top: 26.5, left: 50, duration: 0.3, ease: 'power1.out' }, '<0.033'],
				['#cTD-GameBoard.test-#5', { top: 27, left: 50 }, { top: 27.5, left: 50, duration: 0.3, ease: 'power1.out' }, '<0.033'],
				['#c9S-GameBoard.test-#5', { top: 28, left: 50 }, { top: 28.5, left: 50, duration: 0.3, ease: 'power1.out' }, '<0.033'],
				['#c8D-GameBoard.test-#5', { top: 29, left: 50 }, { top: 29.5, left: 50, duration: 0.3, ease: 'power1.out' }, '<0.033'],
				['#c7S-GameBoard.test-#5', { top: 30, left: 50 }, { top: 30.5, left: 50, duration: 0.3, ease: 'power1.out' }, '<0.033'],
				['#c6D-GameBoard.test-#5', { top: 31, left: 50 }, { top: 31.5, left: 50, duration: 0.3, ease: 'power1.out' }, '<0.033'],
				['#c5C-GameBoard.test-#5', { top: 32, left: 50 }, { top: 32.5, left: 50, duration: 0.3, ease: 'power1.out' }, '<0.033'],
				['#cKS-GameBoard.test-#5', { top: 23.75, left: 50 }, { top: 20, left: 20, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cQD-GameBoard.test-#5', { top: 25.5, left: 50 }, { top: 21, left: 20, duration: 0.3, ease: 'power1.out' }, '<0.033'],
				['#cJS-GameBoard.test-#5', { top: 26.5, left: 50 }, { top: 22, left: 20, duration: 0.3, ease: 'power1.out' }, '<0.033'],
				['#cTD-GameBoard.test-#5', { top: 27.5, left: 50 }, { top: 23, left: 20, duration: 0.3, ease: 'power1.out' }, '<0.033'],
				['#c9S-GameBoard.test-#5', { top: 28.5, left: 50 }, { top: 24, left: 20, duration: 0.3, ease: 'power1.out' }, '<0.033'],
				['#c8D-GameBoard.test-#5', { top: 29.5, left: 50 }, { top: 25, left: 20, duration: 0.3, ease: 'power1.out' }, '<0.033'],
				['#c7S-GameBoard.test-#5', { top: 30.5, left: 50 }, { top: 26, left: 20, duration: 0.3, ease: 'power1.out' }, '<0.033'],
				['#c6D-GameBoard.test-#5', { top: 31.5, left: 50 }, { top: 27, left: 20, duration: 0.3, ease: 'power1.out' }, '<0.033'],
				['#c5C-GameBoard.test-#5', { top: 32.5, left: 50 }, { top: 28, left: 20, duration: 0.3, ease: 'power1.out' }, '<0.033'],
			]);
			expect(toSpy.mock.calls).toEqual([
				['#cKS-GameBoard.test-#5', { zIndex: 0, duration: 0.15, ease: 'none' }, '<'],
				['#cQD-GameBoard.test-#5', { zIndex: 1, duration: 0.15, ease: 'none' }, '<'],
				['#cJS-GameBoard.test-#5', { zIndex: 2, duration: 0.15, ease: 'none' }, '<'],
				['#cTD-GameBoard.test-#5', { zIndex: 3, duration: 0.15, ease: 'none' }, '<'],
				['#c9S-GameBoard.test-#5', { zIndex: 4, duration: 0.15, ease: 'none' }, '<'],
				['#c8D-GameBoard.test-#5', { zIndex: 5, duration: 0.15, ease: 'none' }, '<'],
				['#c7S-GameBoard.test-#5', { zIndex: 6, duration: 0.15, ease: 'none' }, '<'],
				['#c6D-GameBoard.test-#5', { zIndex: 7, duration: 0.15, ease: 'none' }, '<'],
				['#c5C-GameBoard.test-#5', { zIndex: 8, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// To finish the game, move the eight of hearts onto the nine of clubs,
			moveByShorthand('53');
			expect(screen.getByRole('status').textContent).toBe('move 5⡃3⡄ 8H→9C');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 2,
				toSpy: 1,
				setSpy: 102,
				addLabelSpy: 4,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([['select 5⡃ 8H'], ['updateCardPositions'], ['move 5⡃3⡄ 8H→9C'], ['updateCardPositions']]);
			expect(fromToSpy.mock.calls).toEqual([
				['#c8H-GameBoard.test-#5', { top: 23, left: 50 }, { top: 23.5, left: 50, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#c8H-GameBoard.test-#5', { top: 23.5, left: 50 }, { top: 25, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(toSpy.mock.calls).toEqual([['#c8H-GameBoard.test-#5', { zIndex: 5, duration: 0.15, ease: 'none' }, '<']]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
			mockReset();

			// and the king of diamonds into an empty column.
			// The 38 cards remaining are now in sequence,
			// and will all go automatically to the homecells,
			// winning the game.
			moveByShorthand('56');
			expect(screen.getByRole('status').textContent).toBe(
				'move 5⡂6 KD→cascade (auto-foundation 55748248278274382782733728827338278263 4D,4C,5H,5S,5D,5C,6H,6S,6D,6C,7H,7S,7D,7C,8H,8S,8D,8C,9H,9S,9D,9C,TH,TS,TD,TC,JH,JS,JD,JC,QH,QS,QD,QC,KH,KS,KD,KC)'
			);
			expect(mockCallTimes()).toEqual({
				gsapFromSpy: 1, // animate win message
				fromToSpy: 2,
				toSpy: 77,
				setSpy: 65,
				addLabelSpy: 5,
				timeScaleSpy: 2,
				consoleDebugSpy: 1,
			});
			expect(addLabelSpy.mock.calls).toEqual([
				['select 5⡂ KD'],
				['updateCardPositions'],
				[
					'move 5⡂6 KD→cascade (auto-foundation 55748248278274382782733728827338278263 4D,4C,5H,5S,5D,5C,6H,6S,6D,6C,7H,7S,7D,7C,8H,8S,8D,8C,9H,9S,9D,9C,TH,TS,TD,TC,JH,JS,JD,JC,QH,QS,QD,QC,KH,KS,KD,KC)',
				],
				['updateCardPositionsPrev'],
				['updateCardPositions'],
			]);
			expect(gsapFromSpy.mock.calls).toEqual([[expect.any(HTMLElement), { scale: 0, duration: 0.75, ease: 'power1.out' }]]);
			expect(fromToSpy.mock.calls).toEqual([
				['#cKD-GameBoard.test-#5', { top: 22, left: 50 }, { top: 22.5, left: 50, duration: 0.3, ease: 'power1.out' }, '>0'],
				['#cKD-GameBoard.test-#5', { top: 22.5, left: 50 }, { top: 20, left: 60, duration: 0.3, ease: 'power1.out' }, '>0'],
			]);
			expect(getPropertiesFromSpy(toSpy)).toEqual({
				top: 38,
				left: 38,
				zIndex: 39,
			});
			expect(getCardIdsFromSpy(toSpy)).toMatchSnapshot();
			expect(getPropertiesFromSpy(setSpy)).toEqual({
				top: 65,
				left: 65,
				zIndex: 65,
				rotation: 65,
				transform: 65,
			});
			expect(getCardIdsFromSpy(setSpy)).toMatchSnapshot();
			expect(timeScaleSpy.mock.calls).toEqual([[SNAPPY_ACTION_TIMESCALE], [MULTI_ANIMATION_TIMESCALE]]);
			expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move-foundation']]);
			mockReset();

			expect(container).toMatchSnapshot();
			expect(screen.queryByText('You Win!')).toBeTruthy();

			SuitList.forEach((suit) => {
				const aceTLZR = domUtils.getDomAttributes(calcCardId(shorthandCard({ rank: 'ace', suit }), gameBoardId));
				if (!aceTLZR) throw new Error(`Card not found: ace of ${suit}`);
				RankList.forEach((rank, idx) => {
					if (rank === 'joker') return;

					const cardId = calcCardId(shorthandCard({ rank, suit }), gameBoardId);
					const tlzr = domUtils.getDomAttributes(cardId);
					if (!tlzr) throw new Error(`Card not found: ${cardId}`);

					// cards are stacked on aces
					expect(tlzr.top).toBe(aceTLZR.top);
					expect(tlzr.left).toBe(aceTLZR.left);
					// cards are stacked in order by rank
					expect(tlzr.zIndex).toBe(aceTLZR.zIndex + idx);
					// they are all in foundations, so they shouldn't be rotated
					expect(tlzr.rotation).toBe(0);
				});
			});

			// now click throught to a new game
			// (ManualTestingSettingsContextProvider will set the original game)
			fireEvent.click(screen.getByAltText('king of hearts'));
			expect(container).toMatchSnapshot();
			expect(screen.queryByText('You Win!')).toBeFalsy();
			expect(screen.getByRole('status').textContent).toBe('shuffle deck (5)');
			expect(mockCallTimes()).toEqual({
				fromToSpy: 52,
				toSpy: 52,
				addLabelSpy: 2,
			});
			expect(addLabelSpy.mock.calls).toEqual([['shuffle deck (5)'], ['updateCardPositions']]);
			mockReset();

			expect(gsapUtilsRandom.mock.calls).toEqual([
				[['scale', 'scaleX', 'scaleY']], // for WinMessage
			]);
		});

		test.each`
			name             | seed     | winFoundations   | winActionText
			${'Game #1'}     | ${1}     | ${'KC KS KH KD'} | ${'move 1⡁3 KD→cascade (auto-foundation 16263 JD,QD,KC,KS,KD)'}
			${'Game #3'}     | ${3}     | ${'KH KC KS KD'} | ${'move 4⡁2⡁ JS→QH (auto-foundation 45656788a355782833552123 7H,8C,8S,9D,8H,9C,9S,TD,9H,TC,TS,JD,TH,JC,JS,QD,JH,QC,QS,KD,QH,KC,KS,KH)'}
			${'Game #617'}   | ${617}   | ${'KC KS KD KH'} | ${'move 1⡁b TD→cell (auto-foundation 1866628353ba8483734784387 7D,8S,8D,8H,8C,9S,9D,9H,9C,TS,TD,TH,TC,JS,JD,JH,JC,QS,QD,QH,QC,KS,KD,KH,KC)'}
			${'Game #7851'}  | ${7851}  | ${'KC KH KS KD'} | ${'move 5⡄6⡂ 3S→4D (flourish 51118225688246284d8251382c836b375873861738738a2838 AH,2H,AS,AD,2S,2D,3C,3H,3S,3D,4C,4H,4S,4D,5C,5H,5S,5D,6C,6H,6S,6D,7C,7H,7S,7D,8C,8H,8S,8D,9C,9H,9S,9D,TC,TH,TS,TD,JC,JH,JS,JD,QC,QH,QS,QD,KC,KH,KS,KD)'}
			${'Game #23190'} | ${23190} | ${'KS KD KC KH'} | ${'move 3⡃b 8S→cell (flourish52 33357d226765475665745627157ab15775185187781581571578 AS,AD,AC,2S,2D,2C,3D,AH,2H,3S,3C,3H,4S,4D,4C,4H,5S,5D,5C,5H,6S,6D,6C,6H,7S,7D,7C,7H,8S,8D,8C,8H,9S,9D,9C,9H,TS,TD,TC,TH,JS,JD,JC,JH,QS,QD,QC,QH,KS,KD,KC,KH)'}
		`('$name', ({ name, seed, winFoundations, winActionText }: { name: string; seed: number; winFoundations: string; winActionText: string }) => {
			gsapUtilsRandom.mockReturnValueOnce('scale'); // for WinMessage

			render(<MockGamePage game={new FreeCell().shuffle32(seed)} gameBoardId={name} />);

			// Deal the game
			fireEvent.click(screen.getAllByAltText('card back')[0]);

			// Play through the game whole game
			const moves = getMoves(seed);
			moves.forEach((move, idx) => {
				moveByShorthand(move);
				try {
					expect(cribGame().previousAction.text).toMatch(spotRegexMoveInHistory(move));
				} catch (cause) {
					console.error(cribGame().print({ includeHistory: true }));
					throw new Error(`${name}, Move #${(idx + 1).toString(10)}, ${move} failed`, { cause });
				}
			});

			expect(cribGame().printFoundation()).toBe(winFoundations);
			expect(cribGame().previousAction.text).toBe(winActionText);

			expect(gsapUtilsRandom.mock.calls).toEqual([
				[['scale', 'scaleX', 'scaleY']], // for WinMessage
			]);
		});
	});

	describe('game.undo + history', () => {
		test.todo('undo move-foundation');

		describe('collapse history', () => {
			/** @see game.undo.test.ts */
			test('a wild example', () => {
				render(
					<MockGamePage
						game={FreeCell.parse(
							'' + //
								'>QD          9C 9D TH JS \n' +
								' QH KH KS          JH QS \n' +
								' JC                TD TC \n' +
								'                   JD QC \n' +
								'                   KD KC \n' +
								' hand-jammed'
						)}
						gameBoardId="collapse-wild"
					/>
				);
				mockReset();

				// move card a
				// move card b
				clickCard('KS');
				expect(mockCallTimes()).toEqual({
					fromToSpy: 1,
					setSpy: 51,
					addLabelSpy: 2,
					timeScaleSpy: 1,
				});
				expect(addLabelSpy.mock.calls).toEqual([['select 3⡀ KS'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([['#cKS-collapse-wild', { top: 20, left: 30 }, { top: 20.5, left: 30, duration: 0.3, ease: 'power1.out' }, '>0']]);
				mockReset();
				clickPile('4');
				expect(cribGame().history).toEqual(['hand-jammed', 'move 3⡀4 KS→cascade']);
				expect(mockCallTimes()).toEqual({
					fromToSpy: 1,
					setSpy: 51,
					addLabelSpy: 2,
				});
				expect(addLabelSpy.mock.calls).toEqual([['move 3⡀4 KS→cascade'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([['#cKS-collapse-wild', { top: 20.5, left: 30 }, { top: 20, left: 40, duration: 0.3, ease: 'power1.out' }, '>0']]);
				mockReset();

				clickCard('QD');
				expect(mockCallTimes()).toEqual({
					fromToSpy: 1,
					toSpy: 1,
					setSpy: 51,
					addLabelSpy: 2,
					timeScaleSpy: 1,
				});
				expect(addLabelSpy.mock.calls).toEqual([['select a QD'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([['#cQD-collapse-wild', { top: 5, left: 10 }, { top: 5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0']]);
				expect(toSpy.mock.calls).toEqual([['#cQD-collapse-wild', { rotation: 10, duration: 0.1, ease: 'power1.inOut' }, '<']]);
				mockReset();
				clickCard('KS');
				expect(cribGame().history).toEqual(['hand-jammed', 'move 3⡀4 KS→cascade', 'move a4⡀ QD→KS']);
				expect(mockCallTimes()).toEqual({
					fromToSpy: 1,
					toSpy: 2,
					setSpy: 51,
					addLabelSpy: 2,
				});
				expect(addLabelSpy.mock.calls).toEqual([['move a4⡀ QD→KS'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([['#cQD-collapse-wild', { top: 5, left: 10 }, { top: 21, left: 40, duration: 0.3, ease: 'power1.out' }, '>0']]);
				expect(toSpy.mock.calls).toEqual([
					['#cQD-collapse-wild', { zIndex: 1, duration: 0.15, ease: 'none' }, '<'],
					['#cQD-collapse-wild', { rotation: 0, duration: 0.1, ease: 'power1.inOut' }, '<'],
				]);
				mockReset();
				expect(cribGame().print()).toBe(
					'' + //
						'             9C 9D TH JS \n' +
						' QH KH   >KS       JH QS \n' +
						' JC       QD       TD TC \n' +
						'                   JD QC \n' +
						'                   KD KC \n' +
						' move a4 QD→KS'
				);

				// move card c around a bit
				clickCard('QH');
				clickCard('KC');
				expect(cribGame().history).toEqual(['hand-jammed', 'move 3⡀4 KS→cascade', 'move a4⡀ QD→KS', 'move 1⡀8⡃ QH-JC→KC']);
				expect(mockCallTimes()).toEqual({
					fromToSpy: 3,
					toSpy: 2,
					setSpy: 101,
					addLabelSpy: 4,
					timeScaleSpy: 2,
					consoleDebugSpy: 1,
				});
				expect(addLabelSpy.mock.calls).toEqual([['select 1⡀ QH-JC'], ['updateCardPositions'], ['move 1⡀8⡃ QH-JC→KC'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([
					['#cJC-collapse-wild', { top: 21, left: 10 }, { top: 21.5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
					['#cQH-collapse-wild', { top: 20, left: 10 }, { top: 24, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
					['#cJC-collapse-wild', { top: 21.5, left: 10 }, { top: 25, left: 80, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				]);
				expect(toSpy.mock.calls).toEqual([
					['#cQH-collapse-wild', { zIndex: 4, duration: 0.15, ease: 'none' }, '<'],
					['#cJC-collapse-wild', { zIndex: 5, duration: 0.15, ease: 'none' }, '<'],
				]);
				expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
				mockReset();

				clickCard('QH');
				clickPile('3');
				expect(cribGame().history).toEqual(['hand-jammed', 'move 3⡀4 KS→cascade', 'move a4⡀ QD→KS', 'move 1⡀3 QH-JC→cascade']);
				expect(mockCallTimes()).toEqual({
					fromToSpy: 4,
					toSpy: 2,
					setSpy: 100,
					addLabelSpy: 4,
					timeScaleSpy: 2,
					consoleDebugSpy: 1,
				});
				// FIXME why is "select 8" the precursor to "move 13"?
				expect(addLabelSpy.mock.calls).toEqual([['select 8⡄ QH-JC'], ['updateCardPositions'], ['move 1⡀3 QH-JC→cascade'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([
					['#cQH-collapse-wild', { top: 24, left: 80 }, { top: 23.75, left: 80, duration: 0.3, ease: 'power1.out' }, '>0'],
					['#cJC-collapse-wild', { top: 25, left: 80 }, { top: 25.5, left: 80, duration: 0.3, ease: 'power1.out' }, '<0.060'],
					['#cQH-collapse-wild', { top: 23.75, left: 80 }, { top: 20, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
					['#cJC-collapse-wild', { top: 25.5, left: 80 }, { top: 21, left: 30, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				]);
				expect(toSpy.mock.calls).toEqual([
					['#cQH-collapse-wild', { zIndex: 0, duration: 0.15, ease: 'none' }, '<'],
					['#cJC-collapse-wild', { zIndex: 1, duration: 0.15, ease: 'none' }, '<'],
				]);
				expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
				mockReset();

				clickCard('QH');
				clickPile('5');
				expect(cribGame().history).toEqual(['hand-jammed', 'move 3⡀4 KS→cascade', 'move a4⡀ QD→KS', 'move 1⡀5 QH-JC→cascade']);
				expect(mockCallTimes()).toEqual({
					fromToSpy: 3,
					setSpy: 101,
					addLabelSpy: 4,
					timeScaleSpy: 2,
					consoleDebugSpy: 1,
				});
				// FIXME why is "select 3" the precursor to "move 15"?
				expect(addLabelSpy.mock.calls).toEqual([['select 3⡀ QH-JC'], ['updateCardPositions'], ['move 1⡀5 QH-JC→cascade'], ['updateCardPositions']]);
				expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
				expect(fromToSpy.mock.calls).toEqual([
					['#cJC-collapse-wild', { top: 21, left: 30 }, { top: 21.5, left: 30, duration: 0.3, ease: 'power1.out' }, '>0'],
					['#cQH-collapse-wild', { top: 20, left: 30 }, { top: 20, left: 50, duration: 0.3, ease: 'power1.out' }, '>0'],
					['#cJC-collapse-wild', { top: 21.5, left: 30 }, { top: 21, left: 50, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				]);
				mockReset();
				expect(cribGame().print()).toBe(
					'' + //
						'             9C 9D TH JS \n' +
						'    KH    KS>QH    JH QS \n' +
						'          QD JC    TD TC \n' +
						'                   JD QC \n' +
						'                   KD KC \n' +
						' move 15 QH-JC→cascade'
				);

				// move card d a bit, and then back
				act(() => {
					setSettings((s) => ({
						...s,
						enabledControlSchemes: new Set([ControlSchemes.ClickToMove]),
					}));
				});
				expect(mockCallTimes()).toEqual({});
				mockReset();

				clickCard('KH');
				expect(cribGame().history).toEqual(['hand-jammed', 'move 3⡀4 KS→cascade', 'move a4⡀ QD→KS', 'move 1⡀5 QH-JC→cascade', 'move 2⡀3 KH→cascade']);
				expect(mockCallTimes()).toEqual({
					fromToSpy: 1,
					setSpy: 51,
					addLabelSpy: 2,
				});
				expect(addLabelSpy.mock.calls).toEqual([['move 2⡀3 KH→cascade'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([['#cKH-collapse-wild', { top: 20, left: 20 }, { top: 20, left: 30, duration: 0.3, ease: 'power1.out' }, '>0']]);
				mockReset();
				clickCard('KH');
				expect(cribGame().history).toEqual(['hand-jammed', 'move 3⡀4 KS→cascade', 'move a4⡀ QD→KS', 'move 1⡀5 QH-JC→cascade', 'move 2⡀6 KH→cascade']);
				expect(mockCallTimes()).toEqual({
					fromToSpy: 1,
					setSpy: 51,
					addLabelSpy: 2,
				});
				expect(addLabelSpy.mock.calls).toEqual([['move 2⡀6 KH→cascade'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([['#cKH-collapse-wild', { top: 20, left: 30 }, { top: 20, left: 60, duration: 0.3, ease: 'power1.out' }, '>0']]);
				mockReset();
				clickCard('KH');
				expect(cribGame().history).toEqual(['hand-jammed', 'move 3⡀4 KS→cascade', 'move a4⡀ QD→KS', 'move 1⡀5 QH-JC→cascade', 'move 2⡀1 KH→cascade']);
				expect(mockCallTimes()).toEqual({
					fromToSpy: 1,
					setSpy: 51,
					addLabelSpy: 2,
				});
				expect(addLabelSpy.mock.calls).toEqual([['move 2⡀1 KH→cascade'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([['#cKH-collapse-wild', { top: 20, left: 60 }, { top: 20, left: 10, duration: 0.3, ease: 'power1.out' }, '>0']]);
				mockReset();
				clickCard('KH'); // this is when we remove the move from the history
				expect(cribGame().history).toEqual(['hand-jammed', 'move 3⡀4 KS→cascade', 'move a4⡀ QD→KS', 'move 1⡀5 QH-JC→cascade']);
				expect(mockCallTimes()).toEqual({
					fromToSpy: 1,
					setSpy: 51,
					addLabelSpy: 2,
				});
				expect(addLabelSpy.mock.calls).toEqual([['move 1⡀5 QH-JC→cascade'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([['#cKH-collapse-wild', { top: 20, left: 10 }, { top: 20, left: 20, duration: 0.3, ease: 'power1.out' }, '>0']]);
				mockReset();

				expect(cribGame().print()).toBe(
					'' + //
						'             9C 9D TH JS \n' +
						'   >KH    KS QH    JH QS \n' +
						'          QD JC    TD TC \n' +
						'                   JD QC \n' +
						'                   KD KC \n' +
						' move 15 QH-JC→cascade'
				);

				// move card c back
				// move card b back
				act(() => {
					setSettings((s) => ({
						...s,
						enabledControlSchemes: new Set([ControlSchemes.ClickToSelect]),
					}));
				});
				expect(mockCallTimes()).toEqual({});
				mockReset();

				clickCard('QH');
				clickPile('6');
				expect(cribGame().history).toEqual(['hand-jammed', 'move 3⡀4 KS→cascade', 'move a4⡀ QD→KS', 'move 1⡀6 QH-JC→cascade']);
				expect(mockCallTimes()).toEqual({
					fromToSpy: 3,
					setSpy: 101,
					addLabelSpy: 4,
					timeScaleSpy: 2,
					consoleDebugSpy: 1,
				});
				expect(addLabelSpy.mock.calls).toEqual([['select 5⡀ QH-JC'], ['updateCardPositions'], ['move 1⡀6 QH-JC→cascade'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([
					['#cJC-collapse-wild', { top: 21, left: 50 }, { top: 21.5, left: 50, duration: 0.3, ease: 'power1.out' }, '>0'],
					['#cQH-collapse-wild', { top: 20, left: 50 }, { top: 20, left: 60, duration: 0.3, ease: 'power1.out' }, '>0'],
					['#cJC-collapse-wild', { top: 21.5, left: 50 }, { top: 21, left: 60, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				]);
				expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
				mockReset();

				clickCard('QH');
				clickPile('1');
				expect(cribGame().history).toEqual(['hand-jammed', 'move 3⡀4 KS→cascade', 'move a4⡀ QD→KS']);
				expect(mockCallTimes()).toEqual({
					fromToSpy: 3,
					setSpy: 101,
					addLabelSpy: 4,
					timeScaleSpy: 2,
					consoleDebugSpy: 1,
				});
				expect(addLabelSpy.mock.calls).toEqual([['select 6⡀ QH-JC'], ['updateCardPositions'], ['move a4⡀ QD→KS'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([
					['#cJC-collapse-wild', { top: 21, left: 60 }, { top: 21.5, left: 60, duration: 0.3, ease: 'power1.out' }, '>0'],
					['#cQH-collapse-wild', { top: 20, left: 60 }, { top: 20, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
					['#cJC-collapse-wild', { top: 21.5, left: 60 }, { top: 21, left: 10, duration: 0.3, ease: 'power1.out' }, '<0.060'],
				]);
				expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
				mockReset();

				clickCard('QD');
				clickPile('a');
				expect(cribGame().history).toEqual(['hand-jammed', 'move 3⡀4 KS→cascade']);
				expect(mockCallTimes()).toEqual({
					fromToSpy: 2,
					setSpy: 102,
					toSpy: 1,
					addLabelSpy: 4,
					timeScaleSpy: 2,
					consoleDebugSpy: 1,
				});
				expect(addLabelSpy.mock.calls).toEqual([['select 4⡁ QD'], ['updateCardPositions'], ['move 3⡀4 KS→cascade'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([
					['#cQD-collapse-wild', { top: 21, left: 40 }, { top: 21.5, left: 40, duration: 0.3, ease: 'power1.out' }, '>0'],
					['#cQD-collapse-wild', { top: 21.5, left: 40 }, { top: 5, left: 10, duration: 0.3, ease: 'power1.out' }, '>0'],
				]);
				expect(toSpy.mock.calls).toEqual([['#cQD-collapse-wild', { zIndex: 99, duration: 0.15, ease: 'none' }, '<']]);
				expect(consoleDebugSpy.mock.calls).toEqual([['speedup updateCardPositions', 'move']]);
				mockReset();

				// move card d a bit, and then back
				act(() => {
					setSettings((s) => ({
						...s,
						enabledControlSchemes: new Set([ControlSchemes.ClickToMove]),
					}));
				});
				expect(mockCallTimes()).toEqual({});
				mockReset();

				clickCard('KS');
				expect(cribGame().history).toEqual(['hand-jammed', 'move 3⡀5 KS→cascade']);
				expect(mockCallTimes()).toEqual({
					fromToSpy: 1,
					setSpy: 51,
					addLabelSpy: 2,
				});
				expect(addLabelSpy.mock.calls).toEqual([['move 3⡀5 KS→cascade'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([['#cKS-collapse-wild', { top: 20, left: 40 }, { top: 20, left: 50, duration: 0.3, ease: 'power1.out' }, '>0']]);
				mockReset();

				clickCard('KS');
				expect(cribGame().history).toEqual(['hand-jammed', 'move 3⡀6 KS→cascade']);
				expect(mockCallTimes()).toEqual({
					fromToSpy: 1,
					setSpy: 51,
					addLabelSpy: 2,
				});
				expect(addLabelSpy.mock.calls).toEqual([['move 3⡀6 KS→cascade'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([['#cKS-collapse-wild', { top: 20, left: 50 }, { top: 20, left: 60, duration: 0.3, ease: 'power1.out' }, '>0']]);
				mockReset();

				// move card a back
				// (no moves anymore, just shuffle and deal)
				clickCard('KS');
				expect(cribGame().history).toEqual(['hand-jammed']);
				expect(mockCallTimes()).toEqual({
					fromToSpy: 1,
					setSpy: 51,
					addLabelSpy: 2,
				});
				expect(addLabelSpy.mock.calls).toEqual([['hand-jammed'], ['updateCardPositions']]);
				expect(fromToSpy.mock.calls).toEqual([['#cKS-collapse-wild', { top: 20, left: 60 }, { top: 20, left: 30, duration: 0.3, ease: 'power1.out' }, '>0']]);
				mockReset();

				expect(cribGame().print()).toBe(
					'' + //
						' QD          9C 9D TH JS \n' +
						' QH KH>KS          JH QS \n' +
						' JC                TD TC \n' +
						'                   JD QC \n' +
						'                   KD KC \n' +
						' hand-jammed'
				);
			});
		});
	});
});
