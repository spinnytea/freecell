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
				expect(setSpy).not.toHaveBeenCalled();
			});
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
				expect(setSpy).not.toHaveBeenCalled();
			});

			test.todo('multiple with overlap');
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
	});

	// REVIEW (animation) which of these are covered by "each PreviousActionType"
	describe('manual testing scenarios', () => {
		test.todo('52CardFlourish');

		test.todo('readyToAutoFoundation');

		test.todo('win foundation -> deck');

		test.todo('animations 0');

		test.todo('animations 1');

		test.todo('animations 2');
	});
});
