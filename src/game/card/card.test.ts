import {
	brailleToCount,
	Card,
	cloneCards,
	countToBraille,
	initializeDeck,
	isAdjacent,
	parseShorthandCard,
	Rank,
	RankList,
	shorthandCard,
	shorthandPosition,
	shorthandSequence,
	sortCardsBySuitAndRank,
	sortCardsOG,
	SuitList,
} from '@/game/card/card';
import { FreeCell } from '@/game/game';

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

	describe('sort', () => {
		const INIT_DECK_SHORTHAND =
			'AC-AD-AH-AS-2C-2D-2H-2S-3C-3D-3H-3S-4C-4D-4H-4S-5C-5D-5H-5S-6C-6D-6H-6S-7C-7D-7H-7S-8C-8D-8H-8S-9C-9D-9H-9S-TC-TD-TH-TS-JC-JD-JH-JS-QC-QD-QH-QS-KC-KD-KH-KS';
		const deckShorthand = (cards: Card[]) =>
			shorthandSequence({
				location: { fixture: 'deck', data: [0] },
				cards,
				peekOnly: true,
			});

		test('initializeDeck', () => {
			const deck = initializeDeck();
			const game = new FreeCell();
			expect(deckShorthand(deck)).toBe(INIT_DECK_SHORTHAND);
			expect(deckShorthand(game.cards)).toBe(INIT_DECK_SHORTHAND);
			expect(deckShorthand(deck)).toBe(deckShorthand(game.cards));
		});

		test('sortCardsOG', () => {
			const game = new FreeCell();
			const deck = cloneCards(game.cards);
			deck.reverse();
			expect(deckShorthand(deck)).not.toBe(INIT_DECK_SHORTHAND);
			expect(deckShorthand(deck)).toBe(
				'KS-KH-KD-KC-QS-QH-QD-QC-JS-JH-JD-JC-TS-TH-TD-TC-9S-9H-9D-9C-8S-8H-8D-8C-7S-7H-7D-7C-6S-6H-6D-6C-5S-5H-5D-5C-4S-4H-4D-4C-3S-3H-3D-3C-2S-2H-2D-2C-AS-AH-AD-AC'
			);

			sortCardsOG(game, deck);

			expect(deckShorthand(deck)).toBe(INIT_DECK_SHORTHAND);
			expect(deckShorthand(deck)).toBe(deckShorthand(game.cards));
		});

		test('sortCardsBySuitAndRank', () => {
			const game = new FreeCell();
			const deck = cloneCards(game.cards);
			deck.reverse();
			expect(deckShorthand(deck)).not.toBe(INIT_DECK_SHORTHAND);
			expect(deckShorthand(deck)).toBe(
				'KS-KH-KD-KC-QS-QH-QD-QC-JS-JH-JD-JC-TS-TH-TD-TC-9S-9H-9D-9C-8S-8H-8D-8C-7S-7H-7D-7C-6S-6H-6D-6C-5S-5H-5D-5C-4S-4H-4D-4C-3S-3H-3D-3C-2S-2H-2D-2C-AS-AH-AD-AC'
			);

			sortCardsBySuitAndRank(deck);

			expect(deckShorthand(deck)).toBe(
				'KS-QS-JS-TS-9S-8S-7S-6S-5S-4S-3S-2S-AS-KH-QH-JH-TH-9H-8H-7H-6H-5H-4H-3H-2H-AH-KD-QD-JD-TD-9D-8D-7D-6D-5D-4D-3D-2D-AD-KC-QC-JC-TC-9C-8C-7C-6C-5C-4C-3C-2C-AC'
			);
			expect(deckShorthand(deck)).not.toBe(deckShorthand(game.cards));
			expect(deckShorthand(game.cards)).toBe(INIT_DECK_SHORTHAND);

			expect(deckShorthand(deck.reverse())).toBe(
				'AC-2C-3C-4C-5C-6C-7C-8C-9C-TC-JC-QC-KC-AD-2D-3D-4D-5D-6D-7D-8D-9D-TD-JD-QD-KD-AH-2H-3H-4H-5H-6H-7H-8H-9H-TH-JH-QH-KH-AS-2S-3S-4S-5S-6S-7S-8S-9S-TS-JS-QS-KS'
			);
			expect(deckShorthand(game.cards)).toBe(
				'AC-AD-AH-AS-2C-2D-2H-2S-3C-3D-3H-3S-4C-4D-4H-4S-5C-5D-5H-5S-6C-6D-6H-6S-7C-7D-7H-7S-8C-8D-8H-8S-9C-9D-9H-9S-TC-TD-TH-TS-JC-JD-JH-JS-QC-QD-QH-QS-KC-KD-KH-KS'
			);
		});
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
		describe('deck', () => {
			test.each`
				d0    | shorthand | shorthandD0
				${-2} | ${'k'}    | ${'k'}
				${-1} | ${'k'}    | ${'k'}
				${0}  | ${'k'}    | ${'k⡀'}
				${1}  | ${'k'}    | ${'k⡁'}
				${2}  | ${'k'}    | ${'k⡂'}
				${7}  | ${'k'}    | ${'k⡇'}
				${8}  | ${'k'}    | ${'k⡈'}
				${9}  | ${'k'}    | ${'k⡉'}
				${10} | ${'k'}    | ${'k⡊'}
				${11} | ${'k'}    | ${'k⡋'}
				${43} | ${'k'}    | ${'k⡫'}
				${44} | ${'k'}    | ${'k⡬'}
				${45} | ${'k'}    | ${'k⡭'}
				${46} | ${'k'}    | ${'k⡮'}
				${47} | ${'k'}    | ${'k⡯'}
				${48} | ${'k'}    | ${'k⡰'}
				${49} | ${'k'}    | ${'k⡱'}
				${50} | ${'k'}    | ${'k⡲'}
				${51} | ${'k'}    | ${'k⡳'}
				${55} | ${'k'}    | ${'k⡷'}
			`(
				'$d0',
				({
					d0,
					shorthand,
					shorthandD0,
				}: {
					d0: number;
					shorthand: string;
					shorthandD0: string;
				}) => {
					expect(shorthandPosition({ fixture: 'deck', data: [d0] })).toBe(shorthand);
					expect(shorthandPosition({ fixture: 'deck', data: [d0] }, true)).toBe(shorthandD0);
				}
			);
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
				expect(shorthandPosition({ fixture: 'cell', data: [d0] }, true)).toBe(shorthand);
			});
		});

		describe('foundation', () => {
			test.each`
				d0    | shorthand | shorthandD0
				${-2} | ${'h'}    | ${'h'}
				${-1} | ${'h'}    | ${'h'}
				${0}  | ${'h'}    | ${'h⡀'}
				${1}  | ${'h'}    | ${'h⡁'}
				${2}  | ${'h'}    | ${'h⡂'}
				${3}  | ${'h'}    | ${'h⡃'}
				${4}  | ${'h'}    | ${'h⡄'}
				${5}  | ${'h'}    | ${'h⡅'}
				${6}  | ${'h'}    | ${'h⡆'}
				${7}  | ${'h'}    | ${'h⡇'}
			`(
				'$d0',
				({
					d0,
					shorthand,
					shorthandD0,
				}: {
					d0: number;
					shorthand: string;
					shorthandD0: string;
				}) => {
					expect(shorthandPosition({ fixture: 'foundation', data: [d0] })).toBe(shorthand);
					expect(shorthandPosition({ fixture: 'foundation', data: [d0] }, true)).toBe(shorthandD0);
				}
			);
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

			describe.each`
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
				test.each`
					d1    | braille
					${-1} | ${''}
					${0}  | ${'⡀'}
					${1}  | ${'⡁'}
					${10} | ${'⡊'}
					${13} | ${'⡍'}
					${20} | ${'⡔'}
					${55} | ${'⡷'}
				`('$d1', ({ d1, braille }: { d1: number; braille: string }) => {
					expect(shorthandPosition({ fixture: 'cascade', data: [d0, d1] })).toBe(shorthand);
					expect(shorthandPosition({ fixture: 'cascade', data: [d0, d1] }, true)).toBe(
						shorthand + braille
					);
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
