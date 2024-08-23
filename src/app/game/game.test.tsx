import { shorthand } from '@/app/game/card';
import { FreeCell } from '@/app/game/game';

describe('game', () => {
	test('init', () => {
		const game = new FreeCell();
		expect(game).toMatchSnapshot();
		expect(game.deck[0]).toEqual({ rank: 'ace', suit: 'clubs' });
		expect(game.deck[1]).toEqual({ rank: 'ace', suit: 'diamonds' });
		expect(game.deck[2]).toEqual({ rank: 'ace', suit: 'hearts' });
		expect(game.deck[3]).toEqual({ rank: 'ace', suit: 'spades' });
		expect(game.deck[51]).toEqual({ rank: 'king', suit: 'spades' });
	});

	describe('shuffle32', () => {
		test('Game #1', () => {
			const game = new FreeCell();
			expect(game.deck.length).toBe(52);
			game.shuffle32(1);
			expect(game.deck.length).toBe(52);
			expect(shorthand(game.deck[51])).toBe('JD');
			expect(shorthand(game.deck[50])).toBe('2D');
			expect(shorthand(game.deck[49])).toBe('9H');
			expect(shorthand(game.deck[48])).toBe('JC');
			expect(shorthand(game.deck[3])).toBe('6S');
			expect(shorthand(game.deck[2])).toBe('9C');
			expect(shorthand(game.deck[1])).toBe('2H');
			expect(shorthand(game.deck[0])).toBe('6H');
			game.dealAll();
			expect(game.deck.length).toBe(0);
			expect(game.cascades).toMatchSnapshot();
			expect(game.cascades[0].length).toBe(7);
			expect(game.cascades[1].length).toBe(7);
			expect(game.cascades[2].length).toBe(7);
			expect(game.cascades[3].length).toBe(7);
			expect(game.cascades[4].length).toBe(6);
			expect(game.cascades[5].length).toBe(6);
			expect(game.cascades[6].length).toBe(6);
			expect(game.cascades[7].length).toBe(6);
			expect(shorthand(game.cascades[0][0])).toBe('JD');
			expect(shorthand(game.cascades[1][0])).toBe('2D');
			expect(shorthand(game.cascades[2][0])).toBe('9H');
			expect(shorthand(game.cascades[3][0])).toBe('JC');
			expect(shorthand(game.cascades[0][6])).toBe('6S');
			expect(shorthand(game.cascades[1][6])).toBe('9C');
			expect(shorthand(game.cascades[2][6])).toBe('2H');
			expect(shorthand(game.cascades[3][6])).toBe('6H');
			expect(game.print()).toBe(
				'                       \n' +
					`JD 2D 9H JC 5D 7H 7C 5H
KD KC 9S 5S AD QC KH 3H
2S KS 9D QD JS AS AH 3C
4C 5C TS QH 4H AC 4D 7S
3S TD 4S TH 8H 2C JH 7D
6D 8S 8D QS 6C 3D 8C TC
6S 9C 2H 6H            `
			);
		});

		test('Game #617', () => {
			const game = new FreeCell();
			game.shuffle32(617);
			game.dealAll();
			expect(game.print()).toBe(
				'                       \n' +
					`7D AD 5C 3S 5S 8C 2D AH
TD 7S QD AC 6D 8H AS KH
TH QC 3H 9D 6S 8D 3D TC
KD 5H 9S 3C 8S 7H 4D JS
4C QS 9C 9H 7C 6H 2C 2S
4S TS 2H 5D JC 6C JH QH
JD KS KC 4H            `
			);
		});
	});
});
