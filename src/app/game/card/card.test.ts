import {
	brailleToCount,
	Card,
	countToBraille,
	isAdjacent,
	parseShorthandCard,
	Rank,
	RankList,
	shorthandCard,
	shorthandPosition,
	SuitList,
} from '@/app/game/card/card';

describe('game/card', () => {
	describe('isAdjacent', () => {
		test('byListOrder', () => {
			RankList.forEach((min, idx_min) => {
				RankList.forEach((max, idx_max) => {
					expect(isAdjacent({ min, max })).toBe(idx_min + 1 === idx_max);
				});
			});
		});

		test.each`
			min        | max        | adjacent
			${'ace'}   | ${'ace'}   | ${false}
			${'3'}     | ${'2'}     | ${false}
			${'ace'}   | ${'king'}  | ${false}
			${'king'}  | ${'ace'}   | ${false}
			${'ace'}   | ${'2'}     | ${true}
			${'2'}     | ${'3'}     | ${true}
			${'3'}     | ${'4'}     | ${true}
			${'9'}     | ${'10'}    | ${true}
			${'10'}    | ${'jack'}  | ${true}
			${'jack'}  | ${'queen'} | ${true}
			${'queen'} | ${'king'}  | ${true}
		`(
			'spot check $min → $max',
			({ min, max, adjacent }: { min: Rank; max: Rank; adjacent: boolean }) => {
				expect(isAdjacent({ min, max })).toBe(adjacent);
			}
		);
	});

	describe('shorthandCard / parseShorthandCard', () => {
		test('parity of lists', () => {
			SuitList.forEach((suit) => {
				RankList.forEach((rank) => {
					const card = { rank, suit } as Card; // card, sans location
					const shorthand = shorthandCard(card);
					expect(parseShorthandCard(shorthand)).toEqual({ rank, suit });
				});
			});
		});

		describe('parity for', () => {
			test.each`
				card                                   | shorthand
				${{ rank: 'king', suit: 'hearts' }}    | ${'KH'}
				${{ rank: 'joker', suit: 'clubs' }}    | ${'WC'}
				${{ rank: 'joker', suit: 'diamonds' }} | ${'WD'}
				${{ rank: 'joker', suit: 'hearts' }}   | ${'WH'}
				${{ rank: 'joker', suit: 'spades' }}   | ${'WS'}
			`('$shorthand', ({ card, shorthand }: { card: Card; shorthand: string }) => {
				// card, sans location
				expect(shorthandCard(card)).toBe(shorthand);
				expect(parseShorthandCard(shorthand)).toEqual(card);
			});
		});

		test('shorthandCard empty', () => {
			expect(shorthandCard(null)).toBe('  ');
			expect(shorthandCard(undefined)).toBe('  ');
		});

		test('parseShorthandCard empty', () => {
			expect(parseShorthandCard(' ', ' ')).toBe(null);
		});

		test('parseShorthandCard throw', () => {
			expect(() => parseShorthandCard(' ', undefined)).toThrow('invalid rank shorthand: " "');
			expect(() => parseShorthandCard(undefined, undefined)).toThrow(
				'invalid rank shorthand: "undefined"'
			);
			expect(() => parseShorthandCard('8', ' ')).toThrow('invalid suit shorthand: " "');
			expect(() => parseShorthandCard('8', undefined)).toThrow(
				'invalid suit shorthand: "undefined"'
			);
		});
	});

	describe('shorthandPosition', () => {
		test('deck', () => {
			const error = 'invalid position: {"fixture":"deck","data":[0]}';
			expect(() => shorthandPosition({ fixture: 'deck', data: [0] })).toThrow(error);
		});

		describe('cell', () => {
			test.each`
				d0    | error
				${-2} | ${'invalid position: {"fixture":"cell","data":[-2]}'}
				${-1} | ${'invalid position: {"fixture":"cell","data":[-1]}'}
				${6}  | ${'invalid position: {"fixture":"cell","data":[6]}'}
				${7}  | ${'invalid position: {"fixture":"cell","data":[7]}'}
			`('$d0', ({ d0, error }: { d0: number; error: string }) => {
				expect(() => shorthandPosition({ fixture: 'cell', data: [d0] })).toThrow(error);
			});

			test.each`
				d0   | shorthand
				${0} | ${'a'}
				${1} | ${'b'}
				${2} | ${'c'}
				${3} | ${'d'}
				${4} | ${'e'}
				${5} | ${'f'}
			`('$d0', ({ d0, shorthand }: { d0: number; shorthand: string }) => {
				expect(shorthandPosition({ fixture: 'cell', data: [d0] })).toBe(shorthand);
			});
		});

		describe('foundation', () => {
			test.each([-2, -1, 0, 1, 2, 3, 4, 5, 6, 7])('%d', (d0) => {
				expect(shorthandPosition({ fixture: 'foundation', data: [d0] })).toBe('h');
			});
		});

		describe('cascade', () => {
			test.each`
				d0    | error
				${-2} | ${'invalid position: {"fixture":"cascade","data":[-2,1]}'}
				${-1} | ${'invalid position: {"fixture":"cascade","data":[-1,1]}'}
				${10} | ${'invalid position: {"fixture":"cascade","data":[10,1]}'}
				${11} | ${'invalid position: {"fixture":"cascade","data":[11,1]}'}
			`('$d0', ({ d0, error }: { d0: number; error: string }) => {
				expect(() => shorthandPosition({ fixture: 'cascade', data: [d0, 1] })).toThrow(error);
			});

			test.each`
				d0   | shorthand
				${0} | ${'1'}
				${1} | ${'2'}
				${2} | ${'3'}
				${3} | ${'4'}
				${4} | ${'5'}
				${5} | ${'6'}
				${6} | ${'7'}
				${7} | ${'8'}
				${8} | ${'9'}
				${9} | ${'0'}
			`('$d0', ({ d0, shorthand }: { d0: number; shorthand: string }) => {
				[-1, 0, 1, 10, 13, 20, 55].forEach((d1) => {
					expect(shorthandPosition({ fixture: 'cascade', data: [d0, d1] })).toBe(shorthand);
				});
			});
		});
	});

	describe('braille counter', () => {
		test('valid range', () => {
			expect(countToBraille()).toBe('⡀');
			expect(countToBraille(0)).toBe('⡀');
			expect(countToBraille(1)).toBe('⡁');
			expect(countToBraille(2)).toBe('⡂');
			expect(countToBraille(3)).toBe('⡃');
			expect(countToBraille(15)).toBe('⡏');
			expect(countToBraille(191)).toBe('⣿');
			expect(brailleToCount()).toBe(0);
			expect(brailleToCount('⡀')).toBe(0);
			expect(brailleToCount('⡁')).toBe(1);
			expect(brailleToCount('⡂')).toBe(2);
			expect(brailleToCount('⡃')).toBe(3);
			expect(brailleToCount('⡏')).toBe(15);
			expect(brailleToCount('⣿')).toBe(191);
		});

		test('outside desired range', () => {
			// XXX (techdebt) this isn't desireable, it's just that it should never be used this way
			expect(countToBraille(-1)).toBe('⠿');
			expect(countToBraille(-2)).toBe('⠾');
			expect(countToBraille(-63)).toBe('⠁');
			expect(countToBraille(-64)).toBe('⠀');
			expect(brailleToCount('⠿')).toBe(-1);
			expect(brailleToCount('⠾')).toBe(-2);
			expect(brailleToCount('⠁')).toBe(-63);
			expect(brailleToCount('⠀')).toBe(-64);
		});

		test('outside valid range', () => {
			// XXX (techdebt) this isn't desireable, it's just that it will never be used this way
			expect(countToBraille(-65)).toBe('⟿');
			expect(countToBraille(192)).toBe('⤀');
			expect(brailleToCount('⟿')).toBe(-65);
			expect(brailleToCount('⤀')).toBe(192);
		});
	});
});
