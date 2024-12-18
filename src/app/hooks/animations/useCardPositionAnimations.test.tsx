import { render } from '@testing-library/react';
import { gsap } from 'gsap/all';
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

// FIXME test.todo
//  - render a game state (populate previousTLs, timeline.set everything)
//  - change game state
//  - verify all the timeline calls
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

	// FIXME all of (each PreviousActionType) should be on manualtesting/page
	describe('game (each PreviousActionType)', () => {
		describe('init', () => {
			test('undefined -> init', () => {
				const gameStateOne = newGameState;
				const gameStateTwo = gameStateOne;
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

		test.todo('move-foundation');

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
