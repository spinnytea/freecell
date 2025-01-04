import { render } from '@testing-library/react';
import { gsap } from 'gsap/all';
import { ACTION_TEXT_EXAMPLES } from '@/app/components/cards/constants_test';
import { FreeCell } from '@/app/game/game';
import { useCardPositionAnimations } from '@/app/hooks/animations/useCardPositionAnimations';
import { FixtureSizesContextProvider } from '@/app/hooks/contexts/FixtureSizes/FixtureSizesContextProvider';
import StaticGameContextProvider from '@/app/hooks/contexts/Game/StaticGameContextProvider';

jest.mock('gsap/all', () => ({
	gsap: {
		timeline: () => ({}),
	},
}));

function MockGamePage({
	gameStateOne,
	gameStateTwo,
}: {
	gameStateOne: FreeCell | string;
	gameStateTwo: FreeCell | string;
}) {
	return (
		<StaticGameContextProvider games={[gameStateOne, gameStateTwo]}>
			<FixtureSizesContextProvider gameBoardRef={{ current: null }} fixtureLayout="portrait">
				<MockGameBoard />
			</FixtureSizesContextProvider>
		</StaticGameContextProvider>
	);
}

function MockGameBoard() {
	useCardPositionAnimations();
	return null;
}

describe('useCardPositionAnimations', () => {
	// we can use this for a lot of tests, so we don't need to keep remaking it
	const newGameState = new FreeCell();

	let fromToSpy: jest.SpyInstance;
	let toSpy: jest.SpyInstance;
	let setSpy: jest.SpyInstance;
	beforeEach(() => {
		fromToSpy = jest.fn();
		toSpy = jest.fn();
		setSpy = jest.fn();
		jest.spyOn(gsap, 'timeline').mockImplementation(() => {
			const timelineMock: unknown = {
				fromTo: fromToSpy,
				to: toSpy,
				set: setSpy,
				totalProgress: () => ({
					kill: () => {
						/* empty */
					},
				}),
			};
			return timelineMock as gsap.core.Timeline;
		});
	});

	function mockReset() {
		toSpy.mockReset();
		fromToSpy.mockReset();
		setSpy.mockReset();
	}

	function getCardIdsFromSpy(spy: jest.SpyInstance) {
		return spy.mock.calls.map(([cardId]: [string]) => cardId);
	}

	test.todo('change fixtureSizes');

	// REVIEW (animation) all of (each PreviousActionType) should be on manualtesting/page
	describe('game (each PreviousActionType)', () => {
		describe('init', () => {
			test('undefined -> init', () => {
				const gameStateOne = newGameState;
				const gameStateTwo = gameStateOne;
				expect(gameStateTwo.previousAction).toEqual({
					text: 'init',
					type: 'init',
				});

				const { rerender } = render(
					<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />
				);

				expect(toSpy).not.toHaveBeenCalled();
				expect(fromToSpy).not.toHaveBeenCalled();
				expect(setSpy.mock.calls.length).toBe(52);
				expect(setSpy.mock.calls).toMatchSnapshot();
				// expect(setSpy.mock.calls.map(([cardId]) => cardId as string)).toEqual(['#cAC', '#cAD', ..., '#cKH', '#cKS']);

				mockReset();
				rerender(<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />);

				expect(toSpy).not.toHaveBeenCalled();
				expect(fromToSpy).not.toHaveBeenCalled();
				expect(setSpy).not.toHaveBeenCalled();
			});

			test('win -> init', () => {
				const gameStateOne =
					'>            KC KD KH KS \n' + //
					'                         \n' + //
					':    Y O U   W I N !    :\n' + //
					'                         \n' + //
					' hand-jammed';
				const gameStateTwo = newGameState;
				expect(gameStateTwo.previousAction).toEqual({
					text: 'init',
					type: 'init',
				});

				const { rerender } = render(
					<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />
				);
				mockReset();
				rerender(<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />);

				// TODO (animation) (techdebt) isn't this backwards?
				//  - shouldn't kings be first?
				expect(toSpy.mock.calls.length).toBe(52);
				expect(toSpy.mock.calls[0]).toEqual([
					'#cAC',
					{ duration: 0.15, ease: 'none', zIndex: 0 },
					'<',
				]);
				expect(fromToSpy.mock.calls.length).toBe(52);
				expect(fromToSpy.mock.calls[0]).toEqual([
					'#cAC',
					{ top: 24.4, left: 428.07 },
					{ top: 453.6, left: 14.035, duration: 0.3, ease: 'power1.out' },
					'>0',
				]);
				expect(fromToSpy.mock.calls[1]).toEqual([
					'#cAD',
					{ top: 24.4, left: 519.298 },
					{ top: 453.6, left: 14.035, duration: 0.3, ease: 'power1.out' },
					'<0.006',
				]);
				expect(fromToSpy.mock.calls[51]).toEqual([
					'#cKS',
					{ top: 24.4, left: 701.754 },
					{ top: 453.6, left: 14.035, duration: 0.3, ease: 'power1.out' },
					'<0.006',
				]);
				expect(setSpy).not.toHaveBeenCalled();
			});

			// we (read: _i_) very often win a game then set it aside
			// after coming back later, maybe react has dropped the previous TLs
			//
			test.todo('win -> undefined init');
		});

		test('shuffle', () => {
			const gameStateOne = newGameState;
			const gameStateTwo = gameStateOne.shuffle32(5);
			expect(gameStateTwo.previousAction).toEqual({
				text: 'shuffle deck (5)',
				type: 'shuffle',
			});

			const { rerender } = render(
				<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />
			);
			mockReset();
			rerender(<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />);

			expect(toSpy).not.toHaveBeenCalled();
			expect(fromToSpy).not.toHaveBeenCalled();
			expect(setSpy).not.toHaveBeenCalled();
		});

		test('deal', () => {
			const gameStateOne = newGameState;
			const gameStateTwo = gameStateOne.dealAll();
			expect(gameStateTwo.previousAction).toEqual({
				text: 'deal all cards',
				type: 'deal',
			});

			const { rerender } = render(
				<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />
			);
			mockReset();
			rerender(<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />);

			expect(toSpy.mock.calls.length).toBe(52);
			expect(toSpy.mock.calls[0]).toEqual([
				'#cQC',
				{ duration: 0.15, ease: 'none', zIndex: 0 },
				'<',
			]);
			expect(fromToSpy.mock.calls.length).toBe(52);
			expect(fromToSpy.mock.calls[0]).toEqual([
				'#cQC',
				{ top: 453.6, left: 14.035 },
				{ top: 183, left: 701.754, duration: 0.3, ease: 'power1.out' },
				'>0',
			]);
			expect(fromToSpy.mock.calls[1]).toEqual([
				'#cQD',
				{ top: 453.6, left: 14.035 },
				{ top: 183, left: 603.509, duration: 0.3, ease: 'power1.out' },
				'<0.006',
			]);
			expect(fromToSpy.mock.calls[51]).toEqual([
				'#cAS',
				{ top: 453.6, left: 14.035 },
				{ top: 329.4, left: 14.035, duration: 0.3, ease: 'power1.out' },
				'<0.006',
			]);
			expect(setSpy).not.toHaveBeenCalled();
		});

		test('cursor', () => {
			const gameStateOne = newGameState.dealAll().moveCursor('down');
			const gameStateTwo = gameStateOne.moveCursor('right');
			expect(gameStateTwo.previousAction).toEqual({
				text: 'cursor right',
				type: 'cursor',
			});

			const { rerender } = render(
				<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />
			);
			mockReset();
			rerender(<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />);

			expect(toSpy).not.toHaveBeenCalled();
			expect(fromToSpy).not.toHaveBeenCalled();
			expect(setSpy).not.toHaveBeenCalled();
		});

		test.todo('select');

		test.todo('deselect');

		test.todo('move');

		describe('move-foundation', () => {
			test('one and one', () => {
				const gameStateOne = new FreeCell().shuffle32(5).dealAll();
				const gameStateTwo = gameStateOne.moveByShorthand('53');
				expect(gameStateTwo.previousAction).toEqual({
					text: 'move 53 6H→7C (auto-foundation 2 AD)',
					type: 'move-foundation',
					actionPrev: [
						{ rank: '6', suit: 'hearts', location: { fixture: 'cascade', data: [2, 7] } },
					],
				});

				const { rerender } = render(
					<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />
				);
				mockReset();
				rerender(<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />);

				expect(toSpy.mock.calls).toEqual([
					['#c6H', { zIndex: 7, duration: 0.15, ease: 'none' }, '<'],
					['#cAD', { zIndex: 99, duration: 0.15, ease: 'none' }, '<'],
				]);
				expect(fromToSpy.mock.calls).toEqual([
					[
						'#c6H',
						{ top: 305, left: 407.018 },
						{ top: 353.8, left: 210.526, duration: 0.3, ease: 'power1.out' },
						'>0',
					],
					[
						'#cAD',
						{ top: 329.4, left: 112.281 },
						{ top: 24.4, left: 428.07, duration: 0.3, ease: 'power1.out' },
						'>0',
					],
				]);
				const setCardIds = getCardIdsFromSpy(setSpy);
				expect(setCardIds.length).toBe(50);
				expect(setCardIds).not.toContain('#cAD'); // 51
				expect(setCardIds).not.toContain('#c6H'); // 52
			});

			test('multiple with overlap', () => {
				const gameStateOne = FreeCell.parse(
					'' + //
						'             QC TD KH TS \n' + //
						' KD KC       KS          \n' + //
						' QS>QD|                  \n' + //
						' JD|JS|                  \n' + //
						' select 2 QD-JS'
				);
				const gameStateTwo = gameStateOne.autoMove();
				expect(gameStateTwo.print()).toBe(
					'' +
						'             KC KD KH KS \n' + //
						'            >            \n' + //
						':    Y O U   W I N !    :\n' + //
						'                         \n' + //
						' move 25 QD-JS→KS (auto-foundation 1551215 JD,JS,QD,QS,KC,KD,KS)'
				);
				expect(gameStateTwo.previousAction).toEqual({
					text: 'move 25 QD-JS→KS (auto-foundation 1551215 JD,JS,QD,QS,KC,KD,KS)',
					type: 'move-foundation',
					actionPrev: [
						{ rank: 'queen', suit: 'diamonds', location: { fixture: 'cascade', data: [4, 1] } },
						{ rank: 'jack', suit: 'spades', location: { fixture: 'cascade', data: [4, 2] } },
					],
				});

				const { rerender } = render(
					<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />
				);
				mockReset();
				rerender(<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />);

				expect(toSpy.mock.calls.length).toBe(16);
				expect(toSpy.mock.calls).toEqual([
					['#cQD', { zIndex: 1, duration: 0.15, ease: 'none' }, '<'],
					['#cJS', { zIndex: 2, duration: 0.15, ease: 'none' }, '<'],
					// and then
					['#cJD', { top: 24.4, left: 519.298, duration: 0.3, ease: 'power1.out' }, '>0.043'],
					['#cJD', { zIndex: 109, duration: 0.15, ease: 'none' }, '<'],
					['#cJS', { top: 24.4, left: 701.754, duration: 0.3, ease: 'power1.out' }, '<0.043'],
					['#cJS', { zIndex: 109, duration: 0.15, ease: 'none' }, '<'],
					['#cQD', { top: 24.4, left: 519.298, duration: 0.3, ease: 'power1.out' }, '<0.043'],
					['#cQD', { zIndex: 110, duration: 0.15, ease: 'none' }, '<'],
					['#cQS', { top: 24.4, left: 701.754, duration: 0.3, ease: 'power1.out' }, '<0.043'],
					['#cQS', { zIndex: 110, duration: 0.15, ease: 'none' }, '<'],
					['#cKC', { top: 24.4, left: 428.07, duration: 0.3, ease: 'power1.out' }, '<0.043'],
					['#cKC', { zIndex: 111, duration: 0.15, ease: 'none' }, '<'],
					['#cKD', { top: 24.4, left: 519.298, duration: 0.3, ease: 'power1.out' }, '<0.043'],
					['#cKD', { zIndex: 111, duration: 0.15, ease: 'none' }, '<'],
					['#cKS', { top: 24.4, left: 701.754, duration: 0.3, ease: 'power1.out' }, '<0.043'],
					['#cKS', { zIndex: 111, duration: 0.15, ease: 'none' }, '<'],
				]);
				expect(fromToSpy.mock.calls).toEqual([
					[
						'#cQD',
						{ top: 201.3, left: 112.281 },
						{ top: 207.4, left: 407.018, duration: 0.3, ease: 'power1.out' },
						'>0',
					],
					[
						'#cJS',
						{ top: 244, left: 112.281 },
						{ top: 231.8, left: 407.018, duration: 0.3, ease: 'power1.out' },
						'<0.060',
					],
				]);
				const setCardIds = getCardIdsFromSpy(setSpy);
				expect(setCardIds.length).toBe(45);
				expect(setCardIds).not.toContain('#cJD'); // 46
				expect(setCardIds).not.toContain('#cJS');
				expect(setCardIds).not.toContain('#cQD');
				expect(setCardIds).not.toContain('#cQS');
				expect(setCardIds).not.toContain('#cKC'); // 50
				expect(setCardIds).not.toContain('#cKD');
				expect(setCardIds).not.toContain('#cKS'); // 52
			});
		});

		test.todo('move-flourish');

		test.todo('auto-foundation');

		test.todo('auto-flourish');

		describe('invalid (each MoveSourceType)', () => {
			test.todo('deck');

			test.todo('cell');

			test.todo('foundation');

			test.todo('cascade:single');

			test.todo('cascade:sequence');
		});
	});

	describe('actionText examples', () => {
		// let actionTextExamples: string[];
		// beforeAll(() => {
		// 	actionTextExamples = ACTION_TEXT_EXAMPLES.slice(0);
		// });
		// afterAll(() => {
		// 	expect(actionTextExamples).toEqual([]);
		// });

		// TODO (techdebt) (animation) actually write the tests for these?
		ACTION_TEXT_EXAMPLES.forEach((actionText) => {
			test.todo(actionText + '');
		});
	});

	// manual testing scenarios are for visual fine-tuning
	// these may be [basically] duplicates of other unit tests
	describe('manual testing scenarios', () => {
		test.todo('52CardFlourish');

		test.todo('readyToAutoFoundation');

		test.todo('win foundation -> deck');

		test.todo('animations 0');

		test.todo('animations 1');

		test.todo('animations 2');
	});

	describe('bugfix', () => {
		test('Invalid Undo 2S (animation)', () => {
			const gameStateOne = FreeCell.parse(
				'' +
					'    3H 8D 4D AC 2D AH 2S \n' +
					'    JC 9D 9C KD KC KS 5C \n' +
					'    JD 8S 4C QS    QH 2H \n' +
					'    6D 7D 3C       JS TD \n' +
					'    6H 6C 7S       TH 9S \n' +
					'    QC 5H QD          2C \n' +
					'    KH    TS          5S \n' +
					'    8H    JH          4H \n' +
					'    7C    TC          3S \n' +
					'          9H             \n' +
					'          8C             \n' +
					'          7H             \n' +
					'          6S             \n' +
					'          5D             \n' +
					'          4S             \n' +
					'          3D             \n' +
					' move 14 2S→3D (auto-foundation 14 AS,2S)\n' +
					':h shuffle32 2107\n' +
					' 64 62 6a 6b 3c 34 14 74 \n' +
					' 34 38 3d 34 18 15 73 71 \n' +
					' 73 57 53 57 54 13 a5 16 \n' +
					' 14 '
			).moveByShorthand('21');
			expect(gameStateOne.previousAction).toEqual({
				text: 'move 21 8H-7C→cascade',
				type: 'move',
			});
			const gameStateTwo = gameStateOne.undo();
			expect(gameStateTwo.previousAction).toEqual({
				text: 'move 14 2S→3D (auto-foundation 14 AS,2S)',
				type: 'move-foundation',
				actionPrev: [
					{ rank: '2', suit: 'spades', location: { fixture: 'cascade', data: [3, 15] } },
				],
			});

			// "2 of spades" does not move between states
			const gameStateOne_2S = gameStateOne.cards.find(
				({ rank, suit }) => rank === '2' && suit === 'spades'
			);
			const gameStateTwo_2S = gameStateTwo.cards.find(
				({ rank, suit }) => rank === '2' && suit === 'spades'
			);
			expect(gameStateOne_2S?.location).toEqual({ fixture: 'foundation', data: [3] });
			expect(gameStateTwo_2S?.location).toEqual({ fixture: 'foundation', data: [3] });
			expect(gameStateOne_2S?.location).toBe(gameStateOne_2S?.location);

			const { rerender } = render(
				<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />
			);
			mockReset();
			rerender(<MockGamePage gameStateOne={gameStateOne} gameStateTwo={gameStateTwo} />);

			expect(toSpy.mock.calls).toEqual([
				// ['#c2S', { zIndex: 15, duration: 0.15, ease: 'none' }, '<'],
				['#c7C', { zIndex: 7, duration: 0.15, ease: 'none' }, '<'],
				['#c8H', { zIndex: 6, duration: 0.15, ease: 'none' }, '<'],
			]);
			expect(fromToSpy.mock.calls).toEqual([
				// [
				// 	'#c2S',
				// 	{ top: 24.4, left: 701.754 },
				// 	{ top: 549, left: 308.772, duration: 0.3, ease: 'power1.out' },
				// 	'>0',
				// ],
				[
					'#c7C',
					{ top: 207.4, left: 14.035 },
					{ top: 353.8, left: 112.281, duration: 0.3, ease: 'power1.out' },
					'>0',
				],
				[
					'#c8H',
					{ top: 183, left: 14.035 },
					{ top: 329.4, left: 112.281, duration: 0.3, ease: 'power1.out' },
					'<0.060',
				],
			]);
			const setCardIds = getCardIdsFromSpy(setSpy);
			expect(setCardIds.length).toBe(50);
			expect(setCardIds).not.toContain('#c7C'); // 51
			expect(setCardIds).not.toContain('#c8H'); // 52
		});
	});
});
