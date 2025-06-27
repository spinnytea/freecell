import { CardLocation, Position } from '@/app/game/card/card';
import { FreeCell } from '@/app/game/game';
import { parseShorthandMove } from '@/app/game/move/move';

describe('move.parseShorthandMove', () => {
	test('valid move', () => {
		const game = new FreeCell().shuffle32(1).dealAll();
		expect(parseShorthandMove(game, '1a')).toEqual([
			{ fixture: 'cascade', data: [0, 6] },
			{ fixture: 'cell', data: [0] },
		]);
	});

	test('invalid move', () => {
		const game = new FreeCell().shuffle32(1).dealAll();
		expect(parseShorthandMove(game, '12')).toEqual([
			{ fixture: 'cascade', data: [0, 6] },
			{ fixture: 'cascade', data: [1, 6] },
		]);
	});

	describe('various from position', () => {
		const game = FreeCell.parse(
			'' + //
				'    TH 4H    2S 2H AC    \n' +
				' 9H 5H TC 9D    2D 8S 5S \n' +
				' QH KS 8H AD    3D 5C 6H \n' +
				' KH 6D 3S QS       4S 4C \n' +
				' 8C JC 7S 2C       JD KD \n' +
				'    7H 3H 6C       7D 9S \n' +
				'    4D    5D       6S QC \n' +
				'    3C    KC          JH \n' +
				'          QD          TS \n' +
				'          JS             \n' +
				'          TD             \n' +
				'          9C             \n' +
				'          8D             \n' +
				'          7C             \n' +
				' move a8 TS→JH\n' +
				':h shuffle32 11737\n' +
				' 2a 14 13 64 68 5b 54 34 \n' +
				' 32 57 5c a8 '
		);

		// REVIEW (techdebt) (controls) ef90 should return null
		test.each`
			position | from_location
			${'a'}   | ${{ fixture: 'cell', data: [0] }}
			${'b'}   | ${{ fixture: 'cell', data: [1] }}
			${'c'}   | ${{ fixture: 'cell', data: [2] }}
			${'d'}   | ${{ fixture: 'cell', data: [3] }}
			${'e'}   | ${{ fixture: 'cell', data: [4] }}
			${'f'}   | ${{ fixture: 'cell', data: [5] }}
			${'h'}   | ${{ fixture: 'foundation', data: [0] }}
			${'1'}   | ${{ fixture: 'cascade', data: [0, 3] }}
			${'2'}   | ${{ fixture: 'cascade', data: [1, 5] }}
			${'3'}   | ${{ fixture: 'cascade', data: [2, 4] }}
			${'4'}   | ${{ fixture: 'cascade', data: [3, 10] }}
			${'5'}   | ${{ fixture: 'cascade', data: [4, 0] }}
			${'6'}   | ${{ fixture: 'cascade', data: [5, 1] }}
			${'7'}   | ${{ fixture: 'cascade', data: [6, 4] }}
			${'8'}   | ${{ fixture: 'cascade', data: [7, 5] }}
			${'9'}   | ${{ fixture: 'cascade', data: [7, 5] }}
			${'0'}   | ${{ fixture: 'cascade', data: [7, 5] }}
		`(
			'$position 5',
			({ position, from_location }: { position: Position; from_location: CardLocation }) => {
				expect(parseShorthandMove(game, `${position}5`)).toEqual([
					from_location,
					{ fixture: 'cascade', data: [4, 0] },
				]);
			}
		);
	});
});
