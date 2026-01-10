import { FreeCell } from '@/game/game';
import {
	closestAvailableMovesPriority,
	linearAvailableMovesPriority,
	rightJustifyAvailableMovesPriority,
} from '@/game/move/move';

describe('game/move.findAvailableMoves', () => {
	let game: FreeCell;

	beforeEach(() => {
		game = new FreeCell().shuffle32(11863);
	});

	test('init deal default', () => {
		game = game.dealAll();
		expect(game.print()).toBe(
			'' + //
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
			'' + //
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
				peekOnly: false,
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
				peekOnly: false,
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
				peekOnly: false,
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
					priority: 4,
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
				peekOnly: false,
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
				peekOnly: false,
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
				peekOnly: false,
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
				peekOnly: false,
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
					priority: 4,
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
				peekOnly: false,
			});
			expect(game.availableMoves).toEqual([]);
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
	});

	describe('rightJustifyAvailableMovesPriority', () => {
		describe('1 count', () => {
			const positions = [0];
			test.each`
				sourceD0     | priorities
				${undefined} | ${[1]}
				${0}         | ${[0]}
			`(
				'sourceD0: $sourceD0',
				({ sourceD0, priorities }: { sourceD0: number | undefined; priorities: number[] }) => {
					expect(
						positions.map((d0) => rightJustifyAvailableMovesPriority(1, d0, sourceD0))
					).toEqual(priorities);
				}
			);
		});

		describe('4 count', () => {
			const positions = [0, 1, 2, 3];
			test.each`
				sourceD0     | priorities
				${undefined} | ${[1, 2, 3, 4]}
				${0}         | ${[0, 2, 3, 4]}
				${1}         | ${[1, 0, 3, 4]}
				${2}         | ${[1, 2, 0, 4]}
				${3}         | ${[1, 2, 3, 0]}
			`(
				'sourceD0: $sourceD0',
				({ sourceD0, priorities }: { sourceD0: number | undefined; priorities: number[] }) => {
					expect(
						positions.map((d0) => rightJustifyAvailableMovesPriority(4, d0, sourceD0))
					).toEqual(priorities);
				}
			);
		});

		describe('8 count', () => {
			const positions = [0, 1, 2, 3, 4, 5, 6, 7];
			test.each`
				sourceD0     | priorities
				${undefined} | ${[1, 2, 3, 4, 5, 6, 7, 8]}
				${0}         | ${[0, 2, 3, 4, 5, 6, 7, 8]}
				${1}         | ${[1, 0, 3, 4, 5, 6, 7, 8]}
				${2}         | ${[1, 2, 0, 4, 5, 6, 7, 8]}
				${3}         | ${[1, 2, 3, 0, 5, 6, 7, 8]}
				${4}         | ${[1, 2, 3, 4, 0, 6, 7, 8]}
				${5}         | ${[1, 2, 3, 4, 5, 0, 7, 8]}
				${6}         | ${[1, 2, 3, 4, 5, 6, 0, 8]}
				${7}         | ${[1, 2, 3, 4, 5, 6, 7, 0]}
			`(
				'sourceD0: $sourceD0',
				({ sourceD0, priorities }: { sourceD0: number | undefined; priorities: number[] }) => {
					expect(
						positions.map((d0) => rightJustifyAvailableMovesPriority(8, d0, sourceD0))
					).toEqual(priorities);
				}
			);
		});

		describe('10 count', () => {
			const positions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
			test.each`
				sourceD0     | priorities
				${undefined} | ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
				${0}         | ${[0, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
				${1}         | ${[1, 0, 3, 4, 5, 6, 7, 8, 9, 10]}
				${5}         | ${[1, 2, 3, 4, 5, 0, 7, 8, 9, 10]}
				${8}         | ${[1, 2, 3, 4, 5, 6, 7, 8, 0, 10]}
				${9}         | ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0]}
			`(
				'sourceD0: $sourceD0',
				({ sourceD0, priorities }: { sourceD0: number | undefined; priorities: number[] }) => {
					expect(
						positions.map((d0) => rightJustifyAvailableMovesPriority(10, d0, sourceD0))
					).toEqual(priorities);
				}
			);
		});
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
