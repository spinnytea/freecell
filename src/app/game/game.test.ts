import { shorthandCard } from '@/app/game/card';
import { FreeCell } from '@/app/game/game';

describe('game', () => {
	test('init', () => {
		const game = new FreeCell();
		expect(game).toMatchSnapshot();
		expect(game.deck[0]).toEqual({
			rank: 'ace',
			suit: 'clubs',
			location: { fixture: 'deck', data: [0] },
		});
		expect(game.deck[1]).toEqual({
			rank: 'ace',
			suit: 'diamonds',
			location: { fixture: 'deck', data: [1] },
		});
		expect(game.deck[2]).toEqual({
			rank: 'ace',
			suit: 'hearts',
			location: { fixture: 'deck', data: [2] },
		});
		expect(game.deck[3]).toEqual({
			rank: 'ace',
			suit: 'spades',
			location: { fixture: 'deck', data: [3] },
		});
		expect(game.deck[51]).toEqual({
			rank: 'king',
			suit: 'spades',
			location: { fixture: 'deck', data: [51] },
		});
		expect(game.print()).toBe(
			'' +
				'>                        \n' +
				'                         \n' +
				'd: KS KH KD KC QS QH QD QC JS JH JD JC TS TH TD TC 9S 9H 9D 9C 8S 8H 8D 8C 7S 7H 7D 7C 6S 6H 6D 6C 5S 5H 5D 5C 4S 4H 4D 4C 3S 3H 3D 3C 2S 2H 2D 2C AS AH AD AC \n' +
				' init'
		);
	});

	describe('shuffle32', () => {
		test('Game #1', () => {
			let game = new FreeCell();
			expect(game.deck.length).toBe(52);
			game = game.shuffle32(1);
			expect(game.deck.length).toBe(52);
			expect(game.previousAction).toBe('shuffle deck (1)');
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
			expect(game.previousAction).toBe('deal all cards');
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
			expect(game.previousAction).toBe('shuffle deck (617)');
			game = game.dealAll();
			expect(game.previousAction).toBe('deal all cards');
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
	});

	describe('various sizes', () => {
		test('4 cells, 8 cascades', () => {
			let game = new FreeCell({ cellCount: 4, cascadeCount: 8 });
			game = game.dealAll({ demo: true });
			expect(game.print()).toBe(
				'' +
					'>2S 2H 2D 2C AS AH AD AC \n' +
					' KS KH KD KC QS QH QD QC \n' +
					' JS JH JD JC TS TH TD TC \n' +
					' 9S 9H 9D 9C 8S 8H 8D 8C \n' +
					' 7S 7H 7D 7C 6S 6H 6D 6C \n' +
					' 5S 5H 5D 5C 4S 4H 4D 4C \n' +
					' 3S 3H 3D 3C             \n' +
					' deal all cards'
			);
			expect(game.cells.length).toBe(4);
			expect(game.foundations.length).toBe(4);
			expect(game.tableau.length).toBe(8);
		});

		test('4 cells, 4 cascades', () => {
			let game = new FreeCell({ cellCount: 4, cascadeCount: 4 });
			game = game.dealAll({ demo: true });
			expect(game.print()).toBe(
				'' +
					'>2S 2H 2D 2C AS AH AD AC \n' +
					' KS KH KD KC \n' +
					' QS QH QD QC \n' +
					' JS JH JD JC \n' +
					' TS TH TD TC \n' +
					' 9S 9H 9D 9C \n' +
					' 8S 8H 8D 8C \n' +
					' 7S 7H 7D 7C \n' +
					' 6S 6H 6D 6C \n' +
					' 5S 5H 5D 5C \n' +
					' 4S 4H 4D 4C \n' +
					' 3S 3H 3D 3C \n' +
					' deal all cards'
			);
			expect(game.cells.length).toBe(4);
			expect(game.foundations.length).toBe(4);
			expect(game.tableau.length).toBe(4);
		});

		test('1 cells, 10 cascades', () => {
			let game = new FreeCell({ cellCount: 1, cascadeCount: 10 });
			game = game.dealAll({ demo: true });
			expect(game.print()).toBe(
				'' +
					'>2C AS AH AD AC \n' +
					' KS KH KD KC QS QH QD QC JS JH \n' +
					' JD JC TS TH TD TC 9S 9H 9D 9C \n' +
					' 8S 8H 8D 8C 7S 7H 7D 7C 6S 6H \n' +
					' 6D 6C 5S 5H 5D 5C 4S 4H 4D 4C \n' +
					' 3S 3H 3D 3C 2S 2H 2D          \n' +
					' deal all cards'
			);
			expect(game.cells.length).toBe(1);
			expect(game.foundations.length).toBe(4);
			expect(game.tableau.length).toBe(10);
		});

		test('0 cells', () => {
			expect(() => new FreeCell({ cellCount: 0 })).toThrow(
				'Must have between 1 and 6 cells; requested "0".'
			);
		});

		test('7 cells', () => {
			expect(() => new FreeCell({ cellCount: 7 })).toThrow(
				'Must have between 1 and 6 cells; requested "7".'
			);
		});

		test('3 cascades', () => {
			expect(() => new FreeCell({ cascadeCount: 3 })).toThrow(
				'Must have at least as many cascades as foundations (4); requested "3".'
			);
		});

		test.todo('11 cascades'); // @see shorthandPosition
	});

	describe('inspecting foundation always uses highest card', () => {
		test.todo('empty');

		test.todo('one');

		test.todo('few');

		test.todo('all');
	});

	describe('parse', () => {
		test('first (stock)', () => {
			const game = new FreeCell().dealAll({ demo: true }).setCursor({ fixture: 'cell', data: [1] });
			expect(game.print()).toBe(
				'' +
					' 2S>2H 2D 2C AS AH AD AC \n' +
					' KS KH KD KC QS QH QD QC \n' +
					' JS JH JD JC TS TH TD TC \n' +
					' 9S 9H 9D 9C 8S 8H 8D 8C \n' +
					' 7S 7H 7D 7C 6S 6H 6D 6C \n' +
					' 5S 5H 5D 5C 4S 4H 4D 4C \n' +
					' 3S 3H 3D 3C             \n' +
					' cursor set'
			);
			expect(FreeCell.parse(game.print()).print()).toBe(
				'' +
					' 2S>2H 2D 2C AS AH AD AC \n' +
					' KS KH KD KC QS QH QD QC \n' +
					' JS JH JD JC TS TH TD TC \n' +
					' 9S 9H 9D 9C 8S 8H 8D 8C \n' +
					' 7S 7H 7D 7C 6S 6H 6D 6C \n' +
					' 5S 5H 5D 5C 4S 4H 4D 4C \n' +
					' 3S 3H 3D 3C             \n' +
					' cursor set'
			);
		});

		test('second (hand-crafted)', () => {
			const print =
				'>            KD AC       \n' +
				' 2C 3C 4C 5C 6C 7C 8C    \n' +
				' KH                      \n' +
				' QS                      \n' +
				' JH                      \n' +
				' 5S                      \n' +
				' 4H                      \n' +
				' 2S                      \n';
			expect(FreeCell.parse(print + ' hand-jammed').print()).toBe(
				print +
					'd: KS KC QH QC JS JC TS TH TC 9S 9H 9C 8S 8H 7S 7H 6S 6H 5H 4S 3S 3H 2H AS AH \n' +
					' hand-jammed'
			);
		});

		describe('win state', () => {
			test('first', () => {
				const game = FreeCell.parse(
					'' + //
						'>            KC KD KH KS \n' + //
						'                         \n' + //
						' hand-jammed'
				);
				expect(game).toMatchSnapshot();
				expect(game.print()).toBe(
					'' + //
						'>            KC KD KH KS \n' + //
						'                         \n' + //
						':    Y O U   W I N !    :\n' + //
						'                         \n' + //
						' hand-jammed'
				);
			});

			test.each`
				cascadeCount | emptyLine
				${4}         | ${'             '}
				${5}         | ${'                '}
				${6}         | ${'                   '}
				${7}         | ${'                      '}
				${8}         | ${'                         '}
				${9}         | ${'                            '}
				${10}        | ${'                               '}
			`(
				'$cascadeCount cascades',
				({ cascadeCount, emptyLine }: { cascadeCount: number; emptyLine: string }) => {
					expect(emptyLine.length).toBe(cascadeCount * 3 + 1);
					const game = FreeCell.parse(`>            KC KD KH KS \n${emptyLine}\n hand-jammed`);
					expect(game.tableau.length).toBe(cascadeCount);
					expect(game.print().replaceAll(' ', '·')).toMatchSnapshot();
					expect(FreeCell.parse(game.print()).print()).toBe(game.print());
				}
			);
		});

		test.todo('test the state');
	});

	describe('complete games', () => {
		test('Game #1', () => {
			let game = new FreeCell().shuffle32(1).dealAll();
			const moves = (
				'3a 32 7b 3c 37 37 b7 8b 87 48 ' +
				'82 a8 4a 34 57 54 85 8d 87 c7 ' +
				'd7 b8 38 23 28 32 6b 6c 78 a3 ' +
				'73 7a 7c 74 c7 67 63 56 8h b8 ' +
				'5b 51 b5 24 25 6h 6h 24 26 a4 ' +
				'37 2a 8h 4h 1h 17 1h 1b 8h 4h ' +
				'4b 4c 4d a2 42 46 3h 7h 13'
			).split(' ');
			moves.forEach((move) => {
				game = game.moveByShorthand(move);
				expect(game.previousAction).toMatch(new RegExp(`^move ${move}`));
			});
			expect(game.print()).toBe(
				'' +
					'             KC KS KH KD \n' +
					'      >                  \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 13 KD→cascade (auto-foundation JD,QD,KC,KS,KD)'
			);
		});

		test('Game #3', () => {
			let game = new FreeCell().shuffle32(3).dealAll();
			const moves = (
				'28 5a 5b 56 27 72 b7 37 38 5b ' +
				'65 35 35 35 15 3c 83 8h 3h 7h ' +
				'bh 3b 83 c3 8c 84 c8 28 18 46 ' +
				'4c 4h ch 2c 23 74 67 62 c2 1c ' +
				'13 48 42'
			).split(' ');
			moves.forEach((move) => {
				game = game.moveByShorthand(move);
				expect(game.previousAction).toMatch(new RegExp(`^move ${move}`));
			});
			expect(game.print()).toBe(
				'' +
					'             KH KC KS KD \n' +
					'   >                     \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 42 JS→QH (auto-foundation 7H,8C,8S,9D,8H,9C,9S,TD,9H,TC,TS,JD,TH,JC,JS,QD,JH,QC,QS,KD,QH,KC,KS,KH)'
			);
		});

		/** https://www.solitairelaboratory.com/tutorial.html */
		test('Game #5 (tutorial)', () => {
			let game = new FreeCell().shuffle32(5).dealAll();

			expect(game.print()).toBe(
				'' +
					'>                        \n' +
					' AH 8S 2D QS 4C 9H 2S 3D \n' +
					' 5C AS 9C KH 4D 2C 3C 4S \n' +
					' 3S 5D KC 3H KD 5H 6S 8D \n' +
					' TD 7S JD 7H 8H JH JC 7D \n' +
					' 5S QH 8C 9D KS QD 4H AC \n' +
					' 2H TC TH 6D 6H 6C QC JS \n' +
					' 9S AD 7C TS             \n' +
					' deal all cards'
			);

			// In game 5, you may begin by moving the six of hearts onto the seven of clubs.
			// Note that the free ace of diamonds moves automatically to a homecell when you do this.
			game = game.moveByShorthand('53');
			expect(game.previousAction).toBe('move 53 6H→7C (auto-foundation AD)');
			expect(game.printFoundation()).toBe('AD         ');
			// the six of clubs to a freecell,
			game = game.moveByShorthand('6a');
			expect(game.previousAction).toBe('move 6a 6C→cell');
			// the queen of diamonds onto the king of spades,
			game = game.moveByShorthand('65');
			expect(game.previousAction).toBe('move 65 QD→KS');
			// the jack of hearts onto the queen of clubs,
			game = game.moveByShorthand('67');
			expect(game.previousAction).toBe('move 67 JH→QC');
			// the jack of spades onto the queen of diamonds
			// (the free ace of clubs moves automatically to another homecell)
			game = game.moveByShorthand('85');
			expect(game.previousAction).toBe('move 85 JS→QD (auto-foundation AC)');
			expect(game.printFoundation()).toBe('AD AC      ');
			// Now move the six of clubs from its freecell onto the seven of diamonds,
			game = game.moveByShorthand('a8');
			expect(game.previousAction).toBe('move a8 6C→7D');
			// and the five of hearts onto the six of clubs.
			// The free two of clubs now moves automatically onto the club homecell.
			game = game.moveByShorthand('68');
			expect(game.previousAction).toBe('move 68 5H→6C (auto-foundation 2C)');
			expect(game.printFoundation()).toBe('AD 2C      ');
			// Move the ten of clubs onto the jack of hearts,
			game = game.moveByShorthand('27');
			expect(game.previousAction).toBe('move 27 TC→JH');
			// and the nine of hearts onto the ten of clubs.
			game = game.moveByShorthand('67');
			expect(game.previousAction).toBe('move 67 9H→TC');

			expect(game.print()).toBe(
				'' +
					'             AD 2C       \n' +
					' AH 8S 2D QS 4C    2S 3D \n' +
					' 5C AS 9C KH 4D    3C 4S \n' +
					' 3S 5D KC 3H KD    6S 8D \n' +
					' TD 7S JD 7H 8H    JC 7D \n' +
					' 5S QH 8C 9D KS    4H 6C \n' +
					' 2H    TH 6D QD    QC 5H \n' +
					' 9S    7C TS JS    JH    \n' +
					'       6H         >TC    \n' +
					'                   9H    \n' +
					' move 67 9H→TC'
			);

			// Move the nine of spades to a freecell
			game = game.moveByShorthand('1a');
			expect(game.previousAction).toBe('move 1a 9S→cell');
			// and the two of hearts to another freecell
			game = game.moveByShorthand('1b');
			expect(game.previousAction).toBe('move 1b 2H→cell');
			// Move the five of spades onto the six of hearts,
			game = game.moveByShorthand('13');
			expect(game.previousAction).toBe('move 13 5S→6H');
			// and the ten of diamonds (followed by the nine of spades) onto the jack of spades.
			game = game.moveByShorthand('15');
			expect(game.previousAction).toBe('move 15 TD→JS');
			game = game.moveByShorthand('a5');
			expect(game.previousAction).toBe('move a5 9S→TD');
			// Now move the three of spades and the five of clubs each to a freecell,
			// and the ace of hearts and two of hearts automatically move to a new homecell.
			game = game.moveByShorthand('1a');
			expect(game.previousAction).toBe('move 1a 3S→cell');
			game = game.moveByShorthand('1c');
			expect(game.previousAction).toBe('move 1c 5C→cell (auto-foundation AH,2H)');
			expect(game.printFoundation()).toBe('AD 2C 2H   ');

			// Click on the five of hearts now to select it, then click on the empty sixth column.
			// (try once, as-stated)
			// (don't save it, so we can use the shorthand)
			expect(
				game
					.setCursor({ fixture: 'cascade', data: [7, 3] })
					.touch()
					.setCursor({ fixture: 'cascade', data: [5, 0] })
					.touch()
					.print()
			).toBe(
				'' +
					' 3S    5C    AD 2C 2H    \n' +
					'    8S 2D QS 4C>7D 2S 3D \n' +
					'    AS 9C KH 4D 6C 3C 4S \n' +
					'    5D KC 3H KD 5H 6S 8D \n' +
					'    7S JD 7H 8H    JC    \n' +
					'    QH 8C 9D KS    4H    \n' +
					'       TH 6D QD    QC    \n' +
					'       7C TS JS    JH    \n' +
					'       6H    TD    TC    \n' +
					'       5S    9S    9H    \n' +
					' move 86 7D-6C-5H→cascade'
			);

			// (same thing, just using the shorthand)
			game = game.moveByShorthand('86');

			expect(game.print()).toBe(
				'' +
					' 3S    5C    AD 2C 2H    \n' +
					'    8S 2D QS 4C>7D 2S 3D \n' +
					'    AS 9C KH 4D 6C 3C 4S \n' +
					'    5D KC 3H KD 5H 6S 8D \n' +
					'    7S JD 7H 8H    JC    \n' +
					'    QH 8C 9D KS    4H    \n' +
					'       TH 6D QD    QC    \n' +
					'       7C TS JS    JH    \n' +
					'       6H    TD    TC    \n' +
					'       5S    9S    9H    \n' +
					' move 86 7D-6C-5H→cascade'
			);

			// Next move the eight of diamonds onto the nine of spades,
			game = game.moveByShorthand('85');
			expect(game.previousAction).toBe('move 85 8D→9S');
			// and the four of spades and three of diamonds onto the five of hearts, clearing column eight.
			game = game.moveByShorthand('86');
			expect(game.previousAction).toBe('move 86 4S→5H');
			game = game.moveByShorthand('86');
			expect(game.previousAction).toBe('move 86 3D→4S');
			// Next move the queen of hearts into the empty first column
			game = game.moveByShorthand('21');
			expect(game.previousAction).toBe('move 21 QH→cascade');
			// Move the seven of spades onto the eight of diamonds,
			game = game.moveByShorthand('25');
			expect(game.previousAction).toBe('move 25 7S→8D');
			// the five of diamonds to a freecell (sending the ace of spades home),
			game = game.moveByShorthand('2b');
			expect(game.previousAction).toBe('move 2b 5D→cell (auto-foundation AS)');
			expect(game.printFoundation()).toBe('AD 2C 2H AS');
			// and the eight of spades onto the nine of hearts.
			game = game.moveByShorthand('27');
			expect(game.previousAction).toBe('move 27 8S→9H');
			// Move the ten of spades into the empty second column,
			game = game.moveByShorthand('42');
			expect(game.previousAction).toBe('move 42 TS→cascade');
			// the six of diamonds (followed by the five of clubs) onto the seven of spades,
			game = game.moveByShorthand('45');
			expect(game.previousAction).toBe('move 45 6D→7S');
			game = game.moveByShorthand('c5');
			expect(game.previousAction).toBe('move c5 5C→6D');
			// the nine of diamonds onto the ten of spades,
			game = game.moveByShorthand('42');
			expect(game.previousAction).toBe('move 42 9D→TS');
			// and the seven of hearts onto the eight of spades.
			game = game.moveByShorthand('47');
			expect(game.previousAction).toBe('move 47 7H→8S');

			// it is perfectly safe to move the three of hearts to its homecell,
			// and you can do so yourself by selecting it, then clicking on the two of hearts.
			game = game.moveByShorthand('4h');
			expect(game.previousAction).toBe('move 4h 3H→2H');
			expect(game.printFoundation()).toBe('AD 2C 3H AS');
			// Now reverse the backwards sequence in the fourth column by moving the king of hearts,
			// followed by the queen of spades, to the empty eighth column.
			game = game.moveByShorthand('48');
			expect(game.previousAction).toBe('move 48 KH→cascade');
			game = game.moveByShorthand('48');
			expect(game.previousAction).toBe('move 48 QS→KH');

			expect(game.print()).toBe(
				'' +
					' 3S 5D       AD 2C 3H AS \n' +
					' QH TS 2D    4C 7D 2S>KH \n' +
					'    9D 9C    4D 6C 3C QS \n' +
					'       KC    KD 5H 6S    \n' +
					'       JD    8H 4S JC    \n' +
					'       8C    KS 3D 4H    \n' +
					'       TH    QD    QC    \n' +
					'       7C    JS    JH    \n' +
					'       6H    TD    TC    \n' +
					'       5S    9S    9H    \n' +
					'             8D    8S    \n' +
					'             7S    7H    \n' +
					'             6D          \n' +
					'             5C          \n' +
					' move 48 QS→KH'
			);

			// move five cards (up to the jack of hearts) from column seven onto the queen of spades in column eight.
			game = game.moveByShorthand('78');
			expect(game.previousAction).toBe('move 78 JH-TC-9H-8S-7H→QS');
			// move the queen of clubs to a freecell,
			game = game.moveByShorthand('7c');
			expect(game.previousAction).toBe('move 7c QC→cell');
			// the four of hearts to its homecell
			game = game.moveByShorthand('7h');
			expect(game.previousAction).toBe('move 7h 4H→3H');
			expect(game.printFoundation()).toBe('AD 2C 4H AS');
			// move the jack of clubs onto the queen of hearts,
			game = game.moveByShorthand('71');
			expect(game.previousAction).toBe('move 71 JC→QH');
			// and the six of spades onto the seven of hearts.
			game = game.moveByShorthand('78');
			expect(game.previousAction).toBe('move 78 6S→7H');
			// Move the three of clubs to its homecell
			// The two of spades goes automatically, since both red aces are already home.
			game = game.moveByShorthand('7h');
			expect(game.previousAction).toBe('move 7h 3C→2C (auto-foundation 2S)');
			expect(game.printFoundation()).toBe('AD 3C 4H 2S');
			// Move the three of spades home
			game = game.moveByShorthand('ah');
			expect(game.previousAction).toBe('move ah 3S→2S');
			expect(game.printFoundation()).toBe('AD 3C 4H 3S');
			// and the five of diamonds onto the six of spades.
			game = game.moveByShorthand('b8');
			expect(game.previousAction).toBe('move b8 5D→6S');

			expect(game.print()).toBe(
				'' +
					'       QC    AD 3C 4H 3S \n' +
					' QH TS 2D    4C 7D    KH \n' +
					' JC 9D 9C    4D 6C    QS \n' +
					'       KC    KD 5H    JH \n' +
					'       JD    8H 4S    TC \n' +
					'       8C    KS 3D    9H \n' +
					'       TH    QD       8S \n' +
					'       7C    JS       7H \n' +
					'       6H    TD      >6S \n' +
					'       5S    9S       5D \n' +
					'             8D          \n' +
					'             7S          \n' +
					'             6D          \n' +
					'             5C          \n' +
					' move b8 5D→6S'
			);

			// Move the five of spades through seven of clubs from column three to column four,
			game = game.moveByShorthand('34');
			expect(game.previousAction).toBe('move 34 7C-6H-5S→cascade');
			// the ten of hearts onto the jack of clubs,
			game = game.moveByShorthand('31');
			expect(game.previousAction).toBe('move 31 TH→JC');
			// the eight of clubs onto the nine of diamonds,
			game = game.moveByShorthand('32');
			expect(game.previousAction).toBe('move 32 8C→9D');
			// the queen of clubs from its freecell to the empty seventh column,
			game = game.moveByShorthand('c7');
			expect(game.previousAction).toBe('move c7 QC→cascade');
			// and the jack of diamonds onto it.
			game = game.moveByShorthand('37');
			expect(game.previousAction).toBe('move 37 JD→QC');
			// Move the king of clubs to a freecell,
			game = game.moveByShorthand('3a');
			expect(game.previousAction).toBe('move 3a KC→cell');
			// and the nine of clubs onto the ten of hearts
			// (sending the two and three of diamonds and the four of spades home).
			game = game.moveByShorthand('31');
			expect(game.previousAction).toBe('move 31 9C→TH (auto-foundation 2D,3D,4S)');
			expect(game.printFoundation()).toBe('3D 3C 4H 4S');
			// Move the king of clubs back into the empty third column,
			game = game.moveByShorthand('a3');
			expect(game.previousAction).toBe('move a3 KC→cascade');
			// and the entire first column onto it.
			game = game.moveByShorthand('13');
			expect(game.previousAction).toBe('move 13 QH-JC-TH-9C→KC');
			// Move the entire second column onto the seventh column,
			game = game.moveByShorthand('27');
			expect(game.previousAction).toBe('move 27 TS-9D-8C→JD');
			// then the sixth column onto the seventh column.
			game = game.moveByShorthand('67');
			expect(game.previousAction).toBe('move 67 7D-6C-5H→8C');
			// The long nine-card sequence at the bottom of the fifth column can be moved in two pieces:
			// first select the five of clubs, then any empty column.
			game = game.moveByShorthand('51');
			expect(game.previousAction).toBe('move 51 KS-QD-JS-TD-9S-8D-7S-6D-5C→cascade');
			// XXX (techdebt) skipped '52' ?
			// To finish the game, move the eight of hearts onto the nine of clubs,
			game = game.moveByShorthand('53');
			expect(game.previousAction).toBe('move 53 8H→9C');
			// and the king of diamonds into an empty column.
			// The 38 cards remaining are now in sequence,
			// and will all go automatically to the homecells,
			// winning the game.
			game = game.moveByShorthand('56');
			expect(game.previousAction).toBe(
				'move 56 KD→cascade (auto-foundation 4D,4C,5H,5S,5D,5C,6H,6S,6D,6C,7H,7S,7D,7C,8H,8S,8D,8C,9H,9S,9D,9C,TH,TS,TD,TC,JH,JS,JD,JC,QH,QS,QD,QC,KH,KS,KD,KC)'
			);
			expect(game.printFoundation()).toBe('KD KC KH KS');

			expect(game.print()).toBe(
				'' +
					'             KD KC KH KS \n' +
					'               >         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 56 KD→cascade (auto-foundation 4D,4C,5H,5S,5D,5C,6H,6S,6D,6C,7H,7S,7D,7C,8H,8S,8D,8C,9H,9S,9D,9C,TH,TS,TD,TC,JH,JS,JD,JC,QH,QS,QD,QC,KH,KS,KD,KC)'
			);
		});

		test('Game #617', () => {
			let game = new FreeCell().shuffle32(617).dealAll();
			const moves = (
				'83 53 6a 6b 6c 56 c5 a5 b6 2a ' +
				'4b 45 21 41 72 4c 4d 47 ch 51 ' +
				'54 5c 56 b6 76 d5 14 15 12 7b ' +
				'7d 76 17 14 d4 1h 27 21 25 71 ' +
				'7d 27 d7 2d d2 c2 bh 8b 87 8c ' +
				'c8 78 58 37 35 3c a4 34 b4 c2 ' +
				'13 1a 1b'
			).split(' ');
			moves.forEach((move) => {
				game = game.moveByShorthand(move);
				expect(game.previousAction).toMatch(new RegExp(`^move ${move}`));
			});
			expect(game.print()).toBe(
				'' +
					'   >         KC KS KD KH \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 1b TD→cell (auto-foundation 7D,8S,8D,8H,8C,9S,9D,9H,9C,TS,TD,TH,TC,JS,JD,JH,JC,QS,QD,QH,QC,KS,KD,KH,KC)'
			);
		});

		test('Game #23190', () => {
			let game = new FreeCell().shuffle32(23190).dealAll();
			const moves = (
				'6d 76 75 d5 7d 75 72 7a 37 57 ' +
				'27 31 37 17 d3 5d 57 5c 57 5b ' +
				'52 a2 c5 b5 1c 12 15 17 16 15 ' +
				'd1 c1 85 85 45 4d 4c 41 46 45 ' +
				'd4 c5 25 86 81 8a 48 64 6b 61 ' +
				'6c 62 6d a6 c6 86 b8 48 24 21 ' +
				'3a 3b'
			).split(' ');
			moves.forEach((move) => {
				game = game.moveByShorthand(move);
				expect(game.previousAction).toMatch(new RegExp(`^move ${move}`));
			});
			expect(game.print()).toBe(
				'' +
					'   >         KS KD KC KH \n' +
					'                         \n' +
					':    Y O U   W I N !    :\n' +
					'                         \n' +
					' move 3b 8S→cell (auto-foundation AS,AD,AC,2S,2D,2C,3D,AH,2H,3S,3C,3H,4S,4D,4C,4H,5S,5D,5C,5H,6S,6D,6C,6H,7S,7D,7C,7H,8S,8D,8C,8H,9S,9D,9C,9H,TS,TD,TC,TH,JS,JD,JC,JH,QS,QD,QC,QH,KS,KD,KC,KH)'
			);
		});
	});
});
