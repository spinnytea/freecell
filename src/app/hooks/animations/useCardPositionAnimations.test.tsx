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

function MockGamePage({ gamePrint }: { gamePrint: string }) {
	return (
			<StaticGameContextProvider gamePrint={gamePrint}>
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
					kill: () => { /* empty */ },
				}),
			};
			return timelineMock as gsap.core.Timeline;
		});
	});

	test.todo('change fixtureSizes');

	// FIXME all of (each PreviousActionType) should be on manualtesting/page
	describe('game (each PreviousActionType)', () => {
		describe('init', () => {
			test('undefined -> init', () => {
				const gamePrint = new FreeCell().print();
				const { rerender } = render(<MockGamePage gamePrint={gamePrint} />);

				expect(toSpy).not.toHaveBeenCalled();
				expect(fromToSpy).not.toHaveBeenCalled();
				expect(setSpy.mock.calls.length).toBe(52);
				expect(setSpy.mock.calls).toMatchSnapshot();
				// expect(setSpy.mock.calls.map(([cardId]) => cardId as string)).toEqual(['#cAC', '#cAD', ..., '#cKH', '#cKS']);

				setSpy.mockReset();

				rerender(<MockGamePage gamePrint={gamePrint} />);

				expect(toSpy).not.toHaveBeenCalled();
				expect(fromToSpy).not.toHaveBeenCalled();
				expect(setSpy).not.toHaveBeenCalled();
			});

			test.todo('win -> init');
		});

		test.todo('shuffle');

		test.todo('deal');

		test.todo('cursor');

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
