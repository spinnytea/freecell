import { shorthandCard } from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';

describe('game.shuffle32', () => {
	test('Game #1', () => {
		let game = new FreeCell();
		expect(game.deck.length).toBe(52);
		game = game.shuffle32(1);
		expect(game.deck.length).toBe(52);
		expect(game.previousAction).toEqual({ text: 'shuffle deck (1)', type: 'shuffle' });
		expect(shorthandCard(game.deck[51])).toBe('JD');
		expect(shorthandCard(game.deck[50])).toBe('2D');
		expect(shorthandCard(game.deck[49])).toBe('9H');
		expect(shorthandCard(game.deck[48])).toBe('JC');
		expect(shorthandCard(game.deck[3])).toBe('6S');
		expect(shorthandCard(game.deck[2])).toBe('9C');
		expect(shorthandCard(game.deck[1])).toBe('2H');
		expect(shorthandCard(game.deck[0])).toBe('6H');
		expect(game.deck[51]).toEqual({
			rank: 'jack',
			suit: 'diamonds',
			location: { fixture: 'deck', data: [51] },
		});
		expect(game.deck[0]).toEqual({
			rank: '6',
			suit: 'hearts',
			location: { fixture: 'deck', data: [0] },
		});
		game = game.dealAll();
		expect(game.previousAction).toEqual({ text: 'deal all cards', type: 'deal' });
		expect(game.deck.length).toBe(0);
		expect(game).toMatchSnapshot();
		expect(game.tableau[0].length).toBe(7);
		expect(game.tableau[1].length).toBe(7);
		expect(game.tableau[2].length).toBe(7);
		expect(game.tableau[3].length).toBe(7);
		expect(game.tableau[4].length).toBe(6);
		expect(game.tableau[5].length).toBe(6);
		expect(game.tableau[6].length).toBe(6);
		expect(game.tableau[7].length).toBe(6);
		expect(shorthandCard(game.tableau[0][0])).toBe('JD');
		expect(shorthandCard(game.tableau[1][0])).toBe('2D');
		expect(shorthandCard(game.tableau[2][0])).toBe('9H');
		expect(shorthandCard(game.tableau[3][0])).toBe('JC');
		expect(shorthandCard(game.tableau[0][6])).toBe('6S');
		expect(shorthandCard(game.tableau[1][6])).toBe('9C');
		expect(shorthandCard(game.tableau[2][6])).toBe('2H');
		expect(shorthandCard(game.tableau[3][6])).toBe('6H');
		expect(game.tableau[0][0]).toEqual({
			rank: 'jack',
			suit: 'diamonds',
			location: { fixture: 'cascade', data: [0, 0] },
		});
		expect(game.tableau[3][6]).toEqual({
			rank: '6',
			suit: 'hearts',
			location: { fixture: 'cascade', data: [3, 6] },
		});
		expect(game.print()).toBe(
			'' +
				'>                        \n' +
				' JD 2D 9H JC 5D 7H 7C 5H \n' +
				' KD KC 9S 5S AD QC KH 3H \n' +
				' 2S KS 9D QD JS AS AH 3C \n' +
				' 4C 5C TS QH 4H AC 4D 7S \n' +
				' 3S TD 4S TH 8H 2C JH 7D \n' +
				' 6D 8S 8D QS 6C 3D 8C TC \n' +
				' 6S 9C 2H 6H             \n' +
				' deal all cards'
		);
	});

	test('Game #617', () => {
		let game = new FreeCell();
		game = game.shuffle32(617);
		expect(game.previousAction).toEqual({ text: 'shuffle deck (617)', type: 'shuffle' });
		game = game.dealAll();
		expect(game.previousAction).toEqual({ text: 'deal all cards', type: 'deal' });
		expect(game.print()).toBe(
			'' +
				'>                        \n' +
				' 7D AD 5C 3S 5S 8C 2D AH \n' +
				' TD 7S QD AC 6D 8H AS KH \n' +
				' TH QC 3H 9D 6S 8D 3D TC \n' +
				' KD 5H 9S 3C 8S 7H 4D JS \n' +
				' 4C QS 9C 9H 7C 6H 2C 2S \n' +
				' 4S TS 2H 5D JC 6C JH QH \n' +
				' JD KS KC 4H             \n' +
				' deal all cards'
		);
	});

	test('Game #11982', () => {
		const game = new FreeCell().shuffle32(11982);
		const matchSeed = /shuffle deck \((\d+)\)/.exec(game.previousAction.text);
		expect(matchSeed).not.toBe(null);
		expect(matchSeed?.[1]).toMatch(/^\d+$/);
		expect(matchSeed?.[1]).not.toBe('11982');
	});

	test('partial deck', () => {
		const game = FreeCell.parse(
			'' + //
				'>JC          9C 9D 9H 9S \n' + //
				'                         \n' + //
				' hand-jammed'
		);

		expect(game.print()).toBe(
			'' + //
				'>JC          9C 9D 9H 9S \n' + //
				'                         \n' + //
				':d KS KH KD KC QS QH QD QC JS JH JD TS TH TD TC \n' + //
				' hand-jammed'
		);
		expect(game.shuffle32(0).print()).toBe(
			'' + //
				'>JC          9C 9D 9H 9S \n' + //
				'                         \n' + //
				':d QD JH QH TD TC QC JD KH JS QS TS KD TH KC KS \n' + //
				' shuffle deck (0)'
		);
		expect(game.shuffle32(0).shuffle32(0).print()).toBe(
			'' + //
				'>JC          9C 9D 9H 9S \n' + //
				'                         \n' + //
				':d JD QS QC KC KS KH TS JH JS TC KD QH TH TD QD \n' + //
				' shuffle deck (0)'
		);
	});
});
