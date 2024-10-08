export const seedSolutions48 = new Map<number, string>([
	[
		1,
		'' +
			'3a 32 7b 3c 37 37 b7 8b 87 48 ' +
			'82 a8 4a 34 57 54 85 8d 87 c7 ' +
			'd7 b8 38 23 28 32 6b 6c 78 a3 ' +
			'73 7a 7c 74 c7 67 63 56 8h b8 ' +
			'5b 51 b5 24 25 6h 6h 24 26 a4 ' +
			'37 2a 8h 4h 1h 17 1h 1b 8h 4h ' +
			'4b 4c 4d a2 42 46 3h 7h 13',
	],

	[
		3,
		'' +
			'28 5a 5b 56 27 72 b7 37 38 5b ' +
			'65 35 35 35 15 3c 83 8h 3h 7h ' +
			'bh 3b 83 c3 8c 84 c8 28 18 46 ' +
			'4c 4h ch 2c 23 74 67 62 c2 1c ' +
			'13 48 42',
	],

	[
		617,
		'' +
			'83 53 6a 6b 6c 56 c5 a5 b6 2a ' +
			'4b 45 21 41 72 4c 4d 47 ch 51 ' +
			'54 5c 56 b6 76 d5 14 15 12 7b ' +
			'7d 76 17 14 d4 1h 27 21 25 71 ' +
			'7d 27 d7 2d d2 c2 bh 8b 87 8c ' +
			'c8 78 58 37 35 3c a4 34 b4 c2 ' +
			'13 1a 1b',
	],

	[
		23190,
		'' +
			'6d 76 75 d5 7d 75 72 7a 37 57 ' +
			'27 31 37 17 d3 5d 57 5c 57 5b ' +
			'52 a2 c5 b5 1c 12 15 17 16 15 ' +
			'd1 c1 85 85 45 4d 4c 41 46 45 ' +
			'd4 c5 25 86 81 8a 48 64 6b 61 ' +
			'6c 62 6d a6 c6 86 b8 48 24 21 ' +
			'3a 3b',
	],
]);

export function getMoves(seed: number, cellCount = 4, cascadeCount = 8): string[] {
	if (cellCount === 4 && cascadeCount === 8) {
		const moves = seedSolutions48.get(seed)?.split(' ');
		if (!moves)
			throw new Error(
				`No solution for Game #${seed.toString(10)} (${cellCount.toString(10)} × ${cascadeCount.toString(10)}).`
			);
		return moves;
	}
	throw new Error(
		`No solution for games of size ${cellCount.toString(10)} × ${cascadeCount.toString(10)}.`
	);
}
