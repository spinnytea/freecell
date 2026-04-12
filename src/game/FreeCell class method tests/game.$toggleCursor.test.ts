import { FreeCell } from '@/game/game';

describe('game.$toggleCursor', () => {
	describe('examples', () => {
		test('one', () => {
			let game = new FreeCell().shuffle32(7852).dealAll().moveCursor('left').moveCursor('down').moveCursor('left').$touchAndMove(); // space bar
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

			expect(game.previousAction.text).toBe('move 7⡅4⡆ 4D→5S');
			expect(game.$toggleCursor().previousAction.text).toBe('cursor set 7 6C');
			expect(game.$toggleCursor().$toggleCursor().previousAction.text).toBe('cursor set 4 5S');
			expect(game.$toggleCursor().$toggleCursor().$toggleCursor().previousAction.text).toBe('cursor set 7 6C');
			expect(game.$toggleCursor().$toggleCursor().$toggleCursor().$toggleCursor().previousAction.text).toBe('cursor set 4 5S');

			// okay, moving on
			// see how much easier this iw with toggleCursor
			game = game.$toggleCursor().$touchAndMove();
			expect(game.previousAction.text).toBe('move 7⡄a 6C→cell');
			game = game.$toggleCursor().$touchAndMove();
			expect(game.previousAction.text).toBe('move 7⡃b 5D→cell (auto-foundation 7 AS)');
			game = game.moveCursor('left').$touchAndMove();
			expect(game.previousAction.text).toBe('move a7⡁ 6C→7D');
			game = game.$toggleCursor().moveCursor('right').$touchAndMove();
			expect(game.previousAction.text).toBe('move b7⡂ 5D→6C');

			expect(game.__printHistory(true)).toBe(
				'\n' + //
					':h shuffle32 7852\n' +
					' 74 7a 7b a7 b7 '
			);
		});

		test('two', () => {
			// same setup as one, but different moves
			let game = new FreeCell().shuffle32(7852).dealAll().moveCursor('left').moveCursor('down').moveCursor('left').$touchAndMove(); // space bar
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
			expect(game.previousAction.text).toBe('move 7⡄a 6C→cell');
			game = game.$toggleCursor().$touchAndMove();
			expect(game.previousAction.text).toBe('move 7⡃b 5D→cell (auto-foundation 7 AS)');
			game = game.$toggleCursor().$touchAndMove();
			expect(game.previousAction.text).toBe('move 7⡁c 7D→cell');
			game = game.$toggleCursor().$touchAndMove();
			expect(game.previousAction.text).toBe('move 7⡀8⡅ 3H→4S');
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
			expect(game.previousAction.text).toBe('move a7⡀ 6C→7D');
			game = game.$toggleCursor().moveCursor('right').$touchAndMove();
			expect(game.previousAction.text).toBe('move b7⡁ 5D→6C');
			// okay, this last one is a little far
			game = game.moveCursor('right').moveCursor('down').moveCursor('down').moveCursor('down').moveCursor('down').$touchAndMove();
			expect(game.previousAction.text).toBe('move 8⡅7⡂ 4S-3H→5D');

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

	describe('deck', () => {
		test('with cards', () => {
			// deal 44 cards keeps the cursor in the deck (after)
			const gameDealMost = new FreeCell().dealAll({ demo: true, keepDeck: true });
			expect(gameDealMost.deck.length).toBe(8);

			expect(gameDealMost.cursor.fixture).toEqual('deck');
			expect(gameDealMost.$toggleCursor().cursor.fixture).toEqual('deck');
			expect(gameDealMost.$toggleCursor().$toggleCursor().cursor.fixture).toEqual('deck');
			expect(gameDealMost.$toggleCursor().$toggleCursor().$toggleCursor().cursor.fixture).toEqual('deck');

			expect(gameDealMost.previousAction.text).toBe('deal 44 cards');
			expect(gameDealMost.$toggleCursor().previousAction.text).toBe('cursor set k⡀ AC');
			expect(gameDealMost.$toggleCursor().$toggleCursor().previousAction.text).toBe('cursor set k⡀ AC');
			expect(gameDealMost.$toggleCursor().$toggleCursor().$toggleCursor().previousAction.text).toBe('cursor set k⡀ AC');
		});

		test('allowEmptyDeck', () => {
			// dealing all cards moves the cursor to a cell
			const gameAllCards = new FreeCell().dealAll();
			expect(gameAllCards.deck.length).toBe(0);

			expect(gameAllCards.cursor.fixture).toEqual('cell');
			expect(gameAllCards.$toggleCursor().cursor.fixture).toEqual('cell');
			expect(gameAllCards.$toggleCursor().$toggleCursor().cursor.fixture).toEqual('cell');
			expect(gameAllCards.$toggleCursor({ allowEmptyDeck: true }).cursor.fixture).toEqual('deck');
			expect(gameAllCards.$toggleCursor({ allowEmptyDeck: true }).$toggleCursor({ allowEmptyDeck: true }).cursor.fixture).toEqual('cell');

			expect(gameAllCards.previousAction.text).toBe('deal all cards');
			expect(gameAllCards.$toggleCursor().previousAction.text).toEqual('cursor set a');
			expect(gameAllCards.$toggleCursor().$toggleCursor().previousAction.text).toEqual('cursor set a');
			expect(gameAllCards.$toggleCursor({ allowEmptyDeck: true }).previousAction.text).toEqual('cursor set k⡀ deck');
			expect(gameAllCards.$toggleCursor({ allowEmptyDeck: true }).$toggleCursor({ allowEmptyDeck: true }).previousAction.text).toEqual('cursor set a');
		});
	});

	// FIXME GOAL test.todo, review game.touch
	describe('fixture', () => {
		test.todo('manually move to empty');

		test.todo('manually move to not empty');

		describe('gameFunction: recall-or-bury', () => {
			describe('foundation→deck', () => {
				test('empty', () => {
					const game = FreeCell.parse(
						'' + //
							'>QC QD QH QS TC|TD|TH TS \n' +
							' KC KD KH KS JC JD JH JS \n' +
							' hand-jammed'
					)
						.setCursor({ fixture: 'deck', data: [0] })
						.touch({ gameFunction: 'recall-or-bury' });
					expect(game.print()).toBe(
						'' + //
							' QC QD QH QS TC 9D TH TS \n' +
							' KC KD KH KS JC JD JH JS \n' +
							':d>TD \n' +
							' invalid move hk TD→deck'
					);
					expect(game.previousAction).toEqual({
						type: 'move',
						text: 'invalid move h⡁k TD→deck',
						gameFunction: 'recall-or-bury',
					});

					// FIXME toggle
				});

				describe('not empty', () => {
					test('top', () => {
						const game = FreeCell.parse(
							'' + //
								'>QC QD QH QS TC|TD|TH TS \n' +
								' KC       KS JC JD JH JS \n' +
								' hand-jammed'
						)
							.setCursor({ fixture: 'deck', data: [2] }, { gameFunction: 'recall-or-bury' })
							.touch({ gameFunction: 'recall-or-bury' });
						expect(game.print()).toBe(
							'' + //
								' QC QD QH QS TC 9D TH TS \n' +
								' KC       KS JC JD JH JS \n' +
								':d>TD KH KD \n' +
								' invalid move hk TD→deck'
						);
						expect(game.print({ includeHistory: true })).toBe(
							'' + //
								' QC QD QH QS TC 9D TH TS \n' +
								' KC       KS JC JD JH JS \n' +
								':d TD KH KD \n' +
								' invalid move h⡁k TD→deck\n' +
								' hand-jammed'
						);
						expect(game.previousAction).toEqual({
							type: 'move',
							text: 'invalid move h⡁k TD→deck',
							gameFunction: 'recall-or-bury',
						});

						// FIXME toggle
					});

					test.todo('first');

					test.todo('middle');

					test.todo('last');
				});
			});

			test.todo('deck→foundation');
		});

		describe('semi-unrelated', () => {
			// foundation is incidental
			test.todo('auto-foundation');

			// not a move
			test.todo('allowSelectFoundation');
		});
	});
});
