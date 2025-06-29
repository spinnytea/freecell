import { FreeCell } from '@/app/game/game';

describe('game.$toggleCursor', () => {
	describe('examples', () => {
		test('one', () => {
			let game = new FreeCell()
				.shuffle32(7852)
				.dealAll()
				.moveCursor('left')
				.moveCursor('down')
				.moveCursor('left')
				.$touchAndMove(); // space bar
			expect(game.print()).toBe(
				'' + //
					'                         \n' +
					' JS 9S 2C TC 8D 5C 3H 2H \n' +
					' 9D 8C 9H 5H JD AH 7D JC \n' +
					' 7S 2S 6S 4H TH TD AS 7H \n' +
					' KC 3S 2D AC JH KD 5D 8H \n' +
					' 3D QH QD 7C QS TS 6C KS \n' +
					' KH QC 8S AD 9C 4C    4S \n' +
					' 6H 3C 6D>5S             \n' +
					'          4D             \n' +
					' move 74 4D→5S'
			);

			expect(game.$toggleCursor().previousAction.text).toBe('cursor set 7 6C');
			expect(game.$toggleCursor().$toggleCursor().previousAction.text).toBe('cursor set 4 5S');
			expect(game.$toggleCursor().$toggleCursor().$toggleCursor().previousAction.text).toBe(
				'cursor set 7 6C'
			);
			expect(
				game.$toggleCursor().$toggleCursor().$toggleCursor().$toggleCursor().previousAction.text
			).toBe('cursor set 4 5S');

			// okay, moving on
			// see how much easier this iw with toggleCursor
			game = game.$toggleCursor().$touchAndMove();
			expect(game.previousAction.text).toBe('move 7a 6C→cell');
			game = game.$toggleCursor().$touchAndMove();
			expect(game.previousAction.text).toBe('move 7b 5D→cell (auto-foundation 7 AS)');
			game = game.moveCursor('left').$touchAndMove();
			expect(game.previousAction.text).toBe('move a7 6C→7D');
			game = game.$toggleCursor().moveCursor('right').$touchAndMove();
			expect(game.previousAction.text).toBe('move b7 5D→6C');

			expect(game.printHistory(true)).toBe(
				'\n' + //
					':h shuffle32 7852\n' +
					' 74 7a 7b a7 b7 '
			);
		});

		test('two', () => {
			// same setup as one, but different moves
			let game = new FreeCell()
				.shuffle32(7852)
				.dealAll()
				.moveCursor('left')
				.moveCursor('down')
				.moveCursor('left')
				.$touchAndMove(); // space bar
			expect(game.print()).toBe(
				'' + //
					'                         \n' +
					' JS 9S 2C TC 8D 5C 3H 2H \n' +
					' 9D 8C 9H 5H JD AH 7D JC \n' +
					' 7S 2S 6S 4H TH TD AS 7H \n' +
					' KC 3S 2D AC JH KD 5D 8H \n' +
					' 3D QH QD 7C QS TS 6C KS \n' +
					' KH QC 8S AD 9C 4C    4S \n' +
					' 6H 3C 6D>5S             \n' +
					'          4D             \n' +
					' move 74 4D→5S'
			);

			game = game.$toggleCursor().$touchAndMove();
			expect(game.previousAction.text).toBe('move 7a 6C→cell');
			game = game.$toggleCursor().$touchAndMove();
			expect(game.previousAction.text).toBe('move 7b 5D→cell (auto-foundation 7 AS)');
			game = game.$toggleCursor().$touchAndMove();
			expect(game.previousAction.text).toBe('move 7c 7D→cell');
			game = game.$toggleCursor().$touchAndMove();
			expect(game.previousAction.text).toBe('move 78 3H→4S');
			expect(game.print()).toBe(
				'' + //
					' 6C 5D 7D    AS          \n' +
					' JS 9S 2C TC 8D 5C    2H \n' +
					' 9D 8C 9H 5H JD AH    JC \n' +
					' 7S 2S 6S 4H TH TD    7H \n' +
					' KC 3S 2D AC JH KD    8H \n' +
					' 3D QH QD 7C QS TS    KS \n' +
					' KH QC 8S AD 9C 4C   >4S \n' +
					' 6H 3C 6D 5S          3H \n' +
					'          4D             \n' +
					' move 78 3H→4S'
			);

			// now we need to do a bit to get 7D into the right place
			game = game
				.moveCursor('right')
				.moveCursor('right')
				.moveCursor('right')
				.moveCursor('up')
				.moveCursor('up')
				.moveCursor('up')
				.moveCursor('up')
				.moveCursor('up')
				.moveCursor('up')
				.$touchAndMove();
			expect(game.previousAction.text).toBe('move c7 7D→cascade');
			// but now it's easy again
			game = game.$toggleCursor().moveCursor('left').moveCursor('left').$touchAndMove();
			expect(game.previousAction.text).toBe('move a7 6C→7D');
			game = game.$toggleCursor().moveCursor('right').$touchAndMove();
			expect(game.previousAction.text).toBe('move b7 5D→6C');
			// okay, this last one is a little far
			// expect(game.print()).toBe('');
			game = game
				.moveCursor('right')
				.moveCursor('down')
				.moveCursor('down')
				.moveCursor('down')
				.moveCursor('down')
				.$touchAndMove();
			expect(game.previousAction.text).toBe('move 87 4S-3H→5D');

			expect(game.print({ includeHistory: true })).toBe(
				'' + //
					'             AS          \n' +
					' JS 9S 2C TC 8D 5C 7D 2H \n' +
					' 9D 8C 9H 5H JD AH 6C JC \n' +
					' 7S 2S 6S 4H TH TD 5D 7H \n' +
					' KC 3S 2D AC JH KD 4S 8H \n' +
					' 3D QH QD 7C QS TS 3H KS \n' +
					' KH QC 8S AD 9C 4C       \n' +
					' 6H 3C 6D 5S             \n' +
					'          4D             \n' +
					' move 87 4S-3H→5D\n' +
					':h shuffle32 7852\n' +
					' 74 7a 7b 7c 78 c7 a7 b7 \n' +
					' 87 '
			);
		});
	});

	test('deck / allowEmptyDeck', () => {
		// deal most cards keeps the cursor in the deck (after)
		const gameDealMost = new FreeCell().dealAll({ demo: true, keepDeck: true });
		expect(gameDealMost.deck.length).toBe(8);
		expect(gameDealMost.cursor.fixture).toEqual('deck');
		expect(gameDealMost.$toggleCursor().cursor.fixture).toEqual('deck');
		expect(gameDealMost.$toggleCursor().$toggleCursor().cursor.fixture).toEqual('deck');

		// dealing all cards moves the cursor to a cell
		const gameAllCards = new FreeCell().dealAll();
		expect(gameAllCards.deck.length).toBe(0);
		expect(gameAllCards.cursor.fixture).toEqual('cell');
		expect(gameAllCards.$toggleCursor().cursor.fixture).toEqual('cell');
		expect(gameAllCards.$toggleCursor().$toggleCursor().cursor.fixture).toEqual('cell');
		expect(gameAllCards.$toggleCursor({ allowEmptyDeck: true }).cursor.fixture).toEqual('deck');
		expect(
			gameAllCards.$toggleCursor({ allowEmptyDeck: true }).$toggleCursor({ allowEmptyDeck: true })
				.cursor.fixture
		).toEqual('cell');
	});
});
