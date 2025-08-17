import { shorthandCard } from '@/game/card/card';
import { FreeCell } from '@/game/game';

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
			'' + //
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
			'' + //
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

	test('noop', () => {
		const game = new FreeCell().shuffle32(1).dealAll();
		expect(game.deck.length).toBe(0);
		expect(game.shuffle32(2)).toBe(game);
	});

	test('partial deck', () => {
		const game = FreeCell.parse(
			'' + //
				'>JC          9C 9D 9H 9S \n' +
				'                         \n' +
				' hand-jammed'
		);

		// XXX (techdebt) `shuffle deck (1)` is wrong/weird, we cannot "recover" the game with that seed
		//  - so don't use that seed, write something else
		expect(game.print()).toBe(
			'' + //
				'>JC          9C 9D 9H 9S \n' +
				'                         \n' +
				':d KS KH KD KC QS QH QD QC JS JH JD TS TH TD TC \n' +
				' hand-jammed'
		);
		expect(game.shuffle32(1).print()).toBe(
			'' + //
				'>JC          9C 9D 9H 9S \n' +
				'                         \n' +
				':d KC TD TS JD QC KS KD JS JH TH TC KH QD QS QH \n' +
				' shuffle deck (1)'
		);
		expect(game.shuffle32(1).shuffle32(1).print()).toBe(
			'' + //
				'>JC          9C 9D 9H 9S \n' +
				'                         \n' +
				':d JD QS KH TC JS KC TS JH TH QD QH TD KD QC KS \n' +
				' shuffle deck (1)'
		);
	});

	// BUG (techdebt) (history) this actionText seed is wrong
	//  - it's correct if `new FreeCell().shuffle32()`
	//  - it's wrong if `new FreeCell().shuffle32().shuffle32()`
	//  - (we need to print multiple shuffles, not just throw out the old one)
	//  - e.g. :h shuffle32 5
	//  - e.g. :h shuffle32 5,5
	//  - e.g. :h shuffle32 1
	//  - e.g. :h shuffle32 5,1
	test('shuffle32 twice', () => {
		// if we use the same seed, shouldn' the order of the cards be the same?
		let a = new FreeCell().shuffle32(5);
		let b = new FreeCell().shuffle32(5).shuffle32(5);
		expect(a.deck).not.toEqual(b.deck);
		expect(a.history).toEqual(['shuffle deck (5)']);
		expect(b.history).toEqual(['shuffle deck (5)', 'shuffle deck (5)']);
		expect(a.dealAll().__printHistory(true)).toBe('\n:h shuffle32 5');
		expect(b.dealAll().__printHistory(true)).toBe(
			'\n deal all cards\n shuffle deck (5)\n shuffle deck (5)'
		);
		expect(FreeCell.parse(a.print({ includeHistory: true })).history).toEqual(['shuffle deck (5)']);
		expect(FreeCell.parse(b.print({ includeHistory: true })).history).toEqual([
			'shuffle deck (5)',
			'shuffle deck (5)',
		]);

		a = new FreeCell().shuffle32(1);
		b = new FreeCell().shuffle32(5).shuffle32(1);
		expect(a.deck).not.toEqual(b.deck);
		expect(a.history).toEqual(['shuffle deck (1)']);
		expect(b.history).toEqual(['shuffle deck (5)', 'shuffle deck (1)']);
		expect(a.dealAll().__printHistory(true)).toBe('\n:h shuffle32 1');
		expect(b.dealAll().__printHistory(true)).toBe(
			'\n deal all cards\n shuffle deck (1)\n shuffle deck (5)'
		);
		expect(FreeCell.parse(a.print({ includeHistory: true })).history).toEqual(['shuffle deck (1)']);
		expect(FreeCell.parse(b.print({ includeHistory: true })).history).toEqual([
			'shuffle deck (5)',
			'shuffle deck (1)',
		]);
	});

	// BUG (techdebt) (history) this actionText seed, parse is wrong
	// TODO (techdebt) (history) update parse so this isn't invalid history
	test('deal demo', () => {
		let game = new FreeCell().shuffle32(5).dealAll({ demo: true, keepDeck: true });
		expect(game.print()).toBe(
			'' +
				'                         \n' +
				' AH 8S 2D QS 4C 9H 2S 3D \n' +
				' 5C AS 9C KH 4D 2C 3C 4S \n' +
				' 3S 5D KC 3H KD 5H 6S 8D \n' +
				' TD 7S JD 7H 8H JH JC 7D \n' +
				' 5S QH 8C 9D KS QD 4H AC \n' +
				' 2H TC TH 6D             \n' +
				':d 6H 6C QC JS 9S AD 7C>TS \n' +
				' deal most cards'
		);
		expect(game.history).toEqual(['shuffle deck (5)', 'deal most cards']);
		expect(game.__printDeck()).toEqual(' 6H 6C QC JS 9S AD 7C>TS ');
		expect(FreeCell.parse(game.print({ includeHistory: true })).history).toEqual([
			'init with invalid history',
			'deal most cards',
		]);
		game = game.shuffle32(6);
		expect(game.history).toEqual(['shuffle deck (5)', 'deal most cards', 'shuffle deck (6)']);
		expect(game.__printDeck()).toEqual(' AD 6H QC TS 6C JS 9S>7C ');
		expect(FreeCell.parse(game.print({ includeHistory: true })).history).toEqual([
			'init with invalid history',
			'shuffle deck (6)',
		]);
		game = game.dealAll();
		expect(game.history).toEqual([
			'shuffle deck (5)',
			'deal most cards',
			'shuffle deck (6)',
			'deal all cards',
		]);
		expect(FreeCell.parse(game.print({ includeHistory: true })).history).toEqual([
			'init with invalid history',
			'deal all cards',
		]);
		expect(game.print()).toBe(
			'' +
				'>                        \n' +
				' AH 8S 2D QS 4C 9H 2S 3D \n' +
				' 5C AS 9C KH 4D 2C 3C 4S \n' +
				' 3S 5D KC 3H KD 5H 6S 8D \n' +
				' TD 7S JD 7H 8H JH JC 7D \n' +
				' 5S QH 8C 9D KS QD 4H AC \n' +
				' 2H TC TH 6D 6C JS 9S 7C \n' +
				' AD 6H QC TS             \n' +
				' deal all cards'
		);
		expect(game.print({ includeHistory: true })).toBe(
			'' +
				'                         \n' +
				' AH 8S 2D QS 4C 9H 2S 3D \n' +
				' 5C AS 9C KH 4D 2C 3C 4S \n' +
				' 3S 5D KC 3H KD 5H 6S 8D \n' +
				' TD 7S JD 7H 8H JH JC 7D \n' +
				' 5S QH 8C 9D KS QD 4H AC \n' +
				' 2H TC TH 6D 6C JS 9S 7C \n' +
				' AD 6H QC TS             \n' +
				' deal all cards\n' +
				':h shuffle32 5'
		);
	});
});
