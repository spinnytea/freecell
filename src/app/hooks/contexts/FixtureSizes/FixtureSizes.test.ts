import { calcCardCoords, calcFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/FixtureSizes';
import { calcStaticFixtureSizes } from '@/app/hooks/contexts/FixtureSizes/StaticFixtureSizesContextProvider';
import { CardLocation } from '@/game/card/card';

describe('FixtureSizes', () => {
	describe('calcFixtureSizes', () => {
		test('basic', () => {
			expect(calcFixtureSizes({})).toMatchSnapshot();
		});

		test('portait', () => {
			expect(calcFixtureSizes({ fixtureLayout: 'portrait' })).toMatchSnapshot();
		});

		test('landscape', () => {
			expect(calcFixtureSizes({ fixtureLayout: 'landscape' })).toMatchSnapshot();
		});

		test('adjust counts', () => {
			expect(calcFixtureSizes({ cellCount: 6, cascadeCount: 10 })).toMatchSnapshot();
		});

		// the tableau can get so wide that it goes off screen
		// the assumption has always been "the home row is wider than the tableau"
		// (the home row is cell + foundation + 1) (the gap can scale down to 1 but not less)
		test.todo('cascadeCount > homeCount');
	});

	test.todo('calcTopLeftZ');

	describe('calcCardCoords', () => {
		const fixtureSizes = calcStaticFixtureSizes(4, 4, 8);
		describe('cell', () => {
			test.each`
				d0    | left
				${0}  | ${10}
				${1}  | ${20}
				${2}  | ${30}
				${3}  | ${40}
				${4}  | ${undefined}
				${-1} | ${undefined}
			`('$d0', ({ d0, left }: { d0: number; left: number }) => {
				const location: CardLocation = { fixture: 'cell', data: [d0] };
				const type = 'available-low';
				expect(calcCardCoords(fixtureSizes, location, type)).toEqual({
					top: 5,
					left,
					width: 10,
					height: 20,
				});
			});
		});

		describe('foundation', () => {
			test.each`
				d0    | left
				${0}  | ${50}
				${1}  | ${60}
				${2}  | ${70}
				${3}  | ${80}
				${4}  | ${undefined}
				${-1} | ${undefined}
			`('$d0', ({ d0, left }: { d0: number; left: number }) => {
				const location: CardLocation = { fixture: 'foundation', data: [d0] };
				const type = 'available-low';
				expect(calcCardCoords(fixtureSizes, location, type)).toEqual({
					top: 5,
					left,
					width: 10,
					height: 20,
				});
			});
		});

		describe('deck', () => {
			test.each([0, 1, 2, 3, 4, -1])('%d', (d0: number) => {
				const location: CardLocation = { fixture: 'deck', data: [d0] };
				const type = 'available-low';
				expect(calcCardCoords(fixtureSizes, location, type)).toEqual({
					top: 90,
					left: 10,
					width: 10,
					height: 20,
				});
			});
		});

		describe('cascade', () => {
			describe('single', () => {
				test.each`
					data        | top   | left
					${[0, 0]}   | ${20} | ${10}
					${[1, 1]}   | ${21} | ${20}
					${[2, 2]}   | ${22} | ${30}
					${[3, 3]}   | ${23} | ${40}
					${[4, 4]}   | ${24} | ${50}
					${[5, 5]}   | ${25} | ${60}
					${[6, 6]}   | ${26} | ${70}
					${[7, 7]}   | ${27} | ${80}
					${[8, 8]}   | ${28} | ${undefined}
					${[-1, -1]} | ${19} | ${undefined}
				`('$d0', ({ data, top, left }: { data: number[]; top: number; left: number }) => {
					const location: CardLocation = { fixture: 'cascade', data };
					const type = 'available-low';
					expect(calcCardCoords(fixtureSizes, location, type)).toEqual({
						top,
						left,
						width: 10,
						height: 20,
					});
				});
			});

			describe('column', () => {
				test.each`
					d0    | left
					${0}  | ${10}
					${1}  | ${20}
					${2}  | ${30}
					${3}  | ${40}
					${4}  | ${50}
					${5}  | ${60}
					${6}  | ${70}
					${7}  | ${80}
					${8}  | ${undefined}
					${-1} | ${undefined}
				`('$d0', ({ d0, left }: { d0: number; left: number }) => {
					const location: CardLocation = { fixture: 'cascade', data: [d0] };
					const type = 'cascade';
					expect(calcCardCoords(fixtureSizes, location, type)).toEqual({
						top: 20,
						left,
						width: 10,
						height: 119,
					});
				});
			});
		});

		describe('type = cursor', () => {
			test.each`
				location                                | top   | left
				${{ fixture: 'cell', data: [1] }}       | ${5}  | ${20}
				${{ fixture: 'foundation', data: [1] }} | ${5}  | ${60}
				${{ fixture: 'deck', data: [10] }}      | ${90} | ${10}
				${{ fixture: 'cascade', data: [0, 0] }} | ${20} | ${10}
			`('$d0', ({ location, top, left }: { location: CardLocation; top: number; left: number }) => {
				const type = 'cursor';
				expect(calcCardCoords(fixtureSizes, location, type)).toEqual({
					top,
					left,
					width: 10,
					height: 1,
				});
			});
		});
	});

	// in many cases, the top/left should be the same
	test.todo('calcTopLeftZ ⨉ calcCardCoords');
});
