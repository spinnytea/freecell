import { FreeCell } from '@/app/game/game';
import { closestAvailableMovesPriority, linearAvailableMovesPriority } from '@/app/game/move/move';

describe('game/move.findAvailableMoves', () => {
	let game: FreeCell;

	beforeEach(() => {
		game = new FreeCell().shuffle32(11863);
	});

	test('init deal default', () => {
		game = game.dealAll();
		expect(game.print()).toBe(
			'' +
				'>                        \n' +
				' 8H 5D KS 3C 3S 3H JD AC \n' +
				' 9H 7D KC 5C 9D 5H 2C 2H \n' +
				' 6D TC 4H TS 3D 8S QH 4S \n' +
				' 6S 2S 5S 7H QD 8C JC 8D \n' +
				' AS 6H 9S 4C KD TD 6C 9C \n' +
				' 7C JH 7S TH QS AD KH 2D \n' +
				' QC AH JS 4D             \n' +
				' deal all cards'
		);
	});

	test('init deal demo', () => {
		game = game.dealAll({ demo: true });
		expect(game.print()).toBe(
			'' +
				'>QS AD KH 2D QC AH JS 4D \n' +
				' 8H 5D KS 3C 3S 3H JD AC \n' +
				' 9H 7D KC 5C 9D 5H 2C 2H \n' +
				' 6D TC 4H TS 3D 8S QH 4S \n' +
				' 6S 2S 5S 7H QD 8C JC 8D \n' +
				' AS 6H 9S 4C KD TD 6C 9C \n' +
				' 7C JH 7S TH             \n' +
				' deal all cards'
		);
	});

	describe('cell', () => {
		test('empty', () => {
			game = game
				.dealAll()
				.setCursor({ fixture: 'cascade', data: [4, 5] })
				.touch();
			expect(game.selection).toEqual({
				location: { fixture: 'cascade', data: [4, 5] },
				cards: [{ rank: 'queen', suit: 'spades', location: { fixture: 'cascade', data: [4, 5] } }],
				canMove: true,
			});
			expect(game.cells[0]).toBe(null);
			expect(game.availableMoves).toEqual([
				{ location: { fixture: 'cell', data: [0] }, moveDestinationType: 'cell', priority: -1 },
				{ location: { fixture: 'cell', data: [1] }, moveDestinationType: 'cell', priority: -1 },
				{ location: { fixture: 'cell', data: [2] }, moveDestinationType: 'cell', priority: -1 },
				{ location: { fixture: 'cell', data: [3] }, moveDestinationType: 'cell', priority: -1 },
				{
					location: { fixture: 'cascade', data: [6, 5] },
					moveDestinationType: 'cascade:sequence',
					priority: 10,
				},
			]);
		});

		test('full', () => {
			game = game
				.dealAll({ demo: true })
				.setCursor({ fixture: 'cascade', data: [4, 4] })
				.touch();
			expect(game.selection).toEqual({
				location: { fixture: 'cascade', data: [4, 4] },
				cards: [{ rank: 'king', suit: 'diamonds', location: { fixture: 'cascade', data: [4, 4] } }],
				canMove: true,
			});
			expect(game.availableMoves).toEqual([]);
		});
	});

	describe('foundation', () => {
		test('empty no', () => {
			game = game
				.dealAll()
				.setCursor({ fixture: 'cascade', data: [0, 6] })
				.touch();
			expect(game.selection).toEqual({
				location: { fixture: 'cascade', data: [0, 6] },
				cards: [{ rank: 'queen', suit: 'clubs', location: { fixture: 'cascade', data: [0, 6] } }],
				canMove: true,
			});
			expect(game.foundations[0]).toBe(null);
			expect(game.availableMoves).toEqual([
				{ location: { fixture: 'cell', data: [0] }, moveDestinationType: 'cell', priority: -1 },
				{ location: { fixture: 'cell', data: [1] }, moveDestinationType: 'cell', priority: -1 },
				{ location: { fixture: 'cell', data: [2] }, moveDestinationType: 'cell', priority: -1 },
				{ location: { fixture: 'cell', data: [3] }, moveDestinationType: 'cell', priority: -1 },
				{
					location: { fixture: 'cascade', data: [6, 5] },
					moveDestinationType: 'cascade:sequence',
					priority: 10,
				},
			]);
		});

		test('empty yes', () => {
			game = game
				.dealAll()
				.setCursor({ fixture: 'cascade', data: [1, 6] })
				.touch();
			expect(game.selection).toEqual({
				location: { fixture: 'cascade', data: [1, 6] },
				cards: [{ rank: 'ace', suit: 'hearts', location: { fixture: 'cascade', data: [1, 6] } }],
				canMove: true,
			});
			// XXX (techdebt) unsure if we should prefer foundation or cells
			expect(game.availableMoves).toEqual([
				{
					location: { fixture: 'cell', data: [0] },
					moveDestinationType: 'cell',
					priority: expect.any(Number) as number,
				},
				{
					location: { fixture: 'cell', data: [1] },
					moveDestinationType: 'cell',
					priority: expect.any(Number) as number,
				},
				{
					location: { fixture: 'cell', data: [2] },
					moveDestinationType: 'cell',
					priority: expect.any(Number) as number,
				},
				{
					location: { fixture: 'cell', data: [3] },
					moveDestinationType: 'cell',
					priority: expect.any(Number) as number,
				},
				{
					location: { fixture: 'foundation', data: [0] },
					moveDestinationType: 'foundation',
					priority: expect.any(Number) as number,
				},
				{
					location: { fixture: 'foundation', data: [1] },
					moveDestinationType: 'foundation',
					priority: expect.any(Number) as number,
				},
				{
					location: { fixture: 'foundation', data: [2] },
					moveDestinationType: 'foundation',
					priority: expect.any(Number) as number,
				},
				{
					location: { fixture: 'foundation', data: [3] },
					moveDestinationType: 'foundation',
					priority: expect.any(Number) as number,
				},
			]);
		});

		test('adjacent no', () => {
			game = game
				.dealAll({ demo: true })
				.setCursor({ fixture: 'cascade', data: [4, 4] })
				.touch();
			expect(game.selection).toEqual({
				location: { fixture: 'cascade', data: [4, 4] },
				cards: [{ rank: 'king', suit: 'diamonds', location: { fixture: 'cascade', data: [4, 4] } }],
				canMove: true,
			});
			expect(game.foundations[0]).toEqual({
				rank: 'queen',
				suit: 'clubs',
				location: { fixture: 'foundation', data: [0] },
			});
			expect(game.availableMoves).toEqual([]);
		});

		test('adjacent yes', () => {
			game = game
				.dealAll({ demo: true })
				.setCursor({ fixture: 'cell', data: [0] })
				.touch();
			expect(game.selection).toEqual({
				location: { fixture: 'cell', data: [0] },
				cards: [{ rank: 'queen', suit: 'spades', location: { fixture: 'cell', data: [0] } }],
				canMove: true,
			});
			expect(game.foundations[2]).toEqual({
				rank: 'jack',
				suit: 'spades',
				location: { fixture: 'foundation', data: [2] },
			});
			expect(game.availableMoves).toEqual([
				{
					location: { fixture: 'foundation', data: [2] },
					moveDestinationType: 'foundation',
					priority: -1,
				},
				{
					location: { fixture: 'cascade', data: [4, 4] },
					moveDestinationType: 'cascade:sequence',
					priority: 4,
				},
			]);
		});
	});

	describe('cascade', () => {
		// e.g. 0,0 is empty
		test.todo('empty');

		// e.g. 0,0 has card, 0,1 does not
		test.todo('one');

		test('single', () => {
			game = game
				.dealAll()
				.setCursor({ fixture: 'cascade', data: [0, 6] })
				.touch();
			expect(game.selection).toEqual({
				location: { fixture: 'cascade', data: [0, 6] },
				cards: [{ rank: 'queen', suit: 'clubs', location: { fixture: 'cascade', data: [0, 6] } }],
				canMove: true,
			});
			expect(game.tableau[6][5]).toEqual({
				rank: 'king',
				suit: 'hearts',
				location: { fixture: 'cascade', data: [6, 5] },
			});
			expect(game.availableMoves).toEqual([
				{ location: { fixture: 'cell', data: [0] }, moveDestinationType: 'cell', priority: -1 },
				{ location: { fixture: 'cell', data: [1] }, moveDestinationType: 'cell', priority: -1 },
				{ location: { fixture: 'cell', data: [2] }, moveDestinationType: 'cell', priority: -1 },
				{ location: { fixture: 'cell', data: [3] }, moveDestinationType: 'cell', priority: -1 },
				{
					location: { fixture: 'cascade', data: [6, 5] },
					moveDestinationType: 'cascade:sequence',
					priority: 10,
				},
			]);
		});

		test.todo('sequence');

		test('none', () => {
			game = game
				.dealAll({ demo: true })
				.setCursor({ fixture: 'cascade', data: [0, 5] })
				.touch();
			expect(game.selection).toEqual({
				location: { fixture: 'cascade', data: [0, 5] },
				cards: [{ rank: '7', suit: 'clubs', location: { fixture: 'cascade', data: [0, 5] } }],
				canMove: true,
			});
			expect(game.availableMoves).toEqual([]);
		});

		// FIXME test.todo
		//** closest: when to use it */
		describe('linear vs closest', () => {
			test.todo('closest A');

			test.todo('closest B');

			test.todo('linear A');

			test.todo('linear B');

			// start at 0, move to stacked, move to another stack (3S -> 4D,4H)
			test.todo('across stacks from empty');

			// 3S is on a 5 or something (3S -> 4D,4H)
			test.todo('across stacks from invalid');

			// start at 0, move to stacked, move to another stack (3S -> 4D ??)
			test.todo('empty to single stack');

			// 3S is on at some root (3S -> empty,empty)
			test.todo('across empty from empty');

			// 3S is on a 5 or something (3S -> empty,empty)
			test.todo('across empty from invalid');

			// moving a 3S, there is 4D,4H,JD,JH
			test.todo('joker stacks');
		});
	});

	describe('linearAvailableMovesPriority', () => {
		describe('1 count', () => {
			const positions = [0];
			test.each`
				sourceD0     | priorities
				${undefined} | ${[1]}
				${0}         | ${[0]}
			`(
				'sourceD0: $sourceD0',
				({ sourceD0, priorities }: { sourceD0: number | undefined; priorities: number[] }) => {
					expect(positions.map((d0) => linearAvailableMovesPriority(1, d0, sourceD0))).toEqual(
						priorities
					);
				}
			);
		});

		describe('4 count', () => {
			const positions = [0, 1, 2, 3];
			test.each`
				sourceD0     | priorities
				${undefined} | ${[4, 3, 2, 1]}
				${0}         | ${[0, 7, 6, 5]}
				${1}         | ${[4, 0, 6, 5]}
				${2}         | ${[4, 3, 0, 5]}
				${3}         | ${[4, 3, 2, 0]}
			`(
				'sourceD0: $sourceD0',
				({ sourceD0, priorities }: { sourceD0: number | undefined; priorities: number[] }) => {
					expect(positions.map((d0) => linearAvailableMovesPriority(4, d0, sourceD0))).toEqual(
						priorities
					);
				}
			);
		});

		describe('8 count', () => {
			const positions = [0, 1, 2, 3, 4, 5, 6, 7];
			test.each`
				sourceD0     | priorities
				${undefined} | ${[8, 7, 6, 5, 4, 3, 2, 1]}
				${0}         | ${[0, 15, 14, 13, 12, 11, 10, 9]}
				${1}         | ${[8, 0, 14, 13, 12, 11, 10, 9]}
				${2}         | ${[8, 7, 0, 13, 12, 11, 10, 9]}
				${3}         | ${[8, 7, 6, 0, 12, 11, 10, 9]}
				${4}         | ${[8, 7, 6, 5, 0, 11, 10, 9]}
				${5}         | ${[8, 7, 6, 5, 4, 0, 10, 9]}
				${6}         | ${[8, 7, 6, 5, 4, 3, 0, 9]}
				${7}         | ${[8, 7, 6, 5, 4, 3, 2, 0]}
			`(
				'sourceD0: $sourceD0',
				({ sourceD0, priorities }: { sourceD0: number | undefined; priorities: number[] }) => {
					expect(positions.map((d0) => linearAvailableMovesPriority(8, d0, sourceD0))).toEqual(
						priorities
					);
				}
			);
		});

		describe('10 count', () => {
			const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
			test.each`
				sourceD0     | priorities
				${undefined} | ${[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]}
				${0}         | ${[0, 19, 18, 17, 16, 15, 14, 13, 12, 11]}
				${1}         | ${[10, 0, 18, 17, 16, 15, 14, 13, 12, 11]}
				${5}         | ${[10, 9, 8, 7, 6, 0, 14, 13, 12, 11]}
				${8}         | ${[10, 9, 8, 7, 6, 5, 4, 3, 0, 11]}
				${9}         | ${[10, 9, 8, 7, 6, 5, 4, 3, 2, 0]}
			`(
				'sourceD0: $sourceD0',
				({ sourceD0, priorities }: { sourceD0: number | undefined; priorities: number[] }) => {
					expect(positions.map((d0) => linearAvailableMovesPriority(10, d0, sourceD0))).toEqual(
						priorities
					);
				}
			);
		});

		//** closest: what it does */
		describe('closestAvailableMovesPriority', () => {
			describe('1 count', () => {
				const positions = [0];
				test.each`
					sourceD0     | priorities
					${undefined} | ${[2]}
					${0}         | ${[0]}
				`(
					'sourceD0: $sourceD0',
					({ sourceD0, priorities }: { sourceD0: number | undefined; priorities: number[] }) => {
						expect(positions.map((d0) => closestAvailableMovesPriority(1, d0, sourceD0))).toEqual(
							priorities
						);
					}
				);
			});

			describe('4 count', () => {
				const positions = [0, 1, 2, 3];
				test.each`
					sourceD0     | priorities
					${undefined} | ${[8, 6, 4, 2]}
					${0}         | ${[0, 6, 4, 2]}
					${1}         | ${[5, 0, 6, 4]}
					${2}         | ${[3, 5, 0, 6]}
					${3}         | ${[1, 3, 5, 0]}
				`(
					'sourceD0: $sourceD0',
					({ sourceD0, priorities }: { sourceD0: number | undefined; priorities: number[] }) => {
						expect(positions.map((d0) => closestAvailableMovesPriority(4, d0, sourceD0))).toEqual(
							priorities
						);
					}
				);
			});

			describe('8 count', () => {
				const positions = [0, 1, 2, 3, 4, 5, 6, 7];
				test.each`
					sourceD0     | priorities
					${undefined} | ${[16, 14, 12, 10, 8, 6, 4, 2]}
					${0}         | ${[0, 14, 12, 10, 8, 6, 4, 2]}
					${1}         | ${[13, 0, 14, 12, 10, 8, 6, 4]}
					${2}         | ${[11, 13, 0, 14, 12, 10, 8, 6]}
					${3}         | ${[9, 11, 13, 0, 14, 12, 10, 8]}
					${4}         | ${[7, 9, 11, 13, 0, 14, 12, 10]}
					${5}         | ${[5, 7, 9, 11, 13, 0, 14, 12]}
					${6}         | ${[3, 5, 7, 9, 11, 13, 0, 14]}
					${7}         | ${[1, 3, 5, 7, 9, 11, 13, 0]}
				`(
					'sourceD0: $sourceD0',
					({ sourceD0, priorities }: { sourceD0: number | undefined; priorities: number[] }) => {
						expect(positions.map((d0) => closestAvailableMovesPriority(8, d0, sourceD0))).toEqual(
							priorities
						);
					}
				);
			});

			describe('10 count', () => {
				const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
				test.each`
					sourceD0     | priorities
					${undefined} | ${[20, 18, 16, 14, 12, 10, 8, 6, 4, 2]}
					${0}         | ${[0, 18, 16, 14, 12, 10, 8, 6, 4, 2]}
					${1}         | ${[17, 0, 18, 16, 14, 12, 10, 8, 6, 4]}
					${5}         | ${[9, 11, 13, 15, 17, 0, 18, 16, 14, 12]}
					${8}         | ${[3, 5, 7, 9, 11, 13, 15, 17, 0, 18]}
					${9}         | ${[1, 3, 5, 7, 9, 11, 13, 15, 17, 0]}
				`(
					'sourceD0: $sourceD0',
					({ sourceD0, priorities }: { sourceD0: number | undefined; priorities: number[] }) => {
						expect(positions.map((d0) => closestAvailableMovesPriority(10, d0, sourceD0))).toEqual(
							priorities
						);
					}
				);
			});
		});
	});
});
