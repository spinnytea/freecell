import { getSeedsByTag } from '@/game/catalog/difficulty-catalog';
import { FreeCell } from '@/game/game';
import { juice } from '@/game/move/juice';
import { sortedDiff } from '@/utils';
import { writeFileSync } from 'node:fs';

/*
	loop through all games and see if there are any that can 52 flourish

	`nodemon --watch src/terminal --ext ts --exec npm run checkGames`
*/

const start = Date.now();
const flourishSeeds: number[] = [];
const flourish52Seeds: number[] = [];
const catalogSeeds_impossible = getSeedsByTag('impossible');
for (let seed = 1; seed <= 32000; seed++) {
	if (catalogSeeds_impossible.includes(seed)) continue;
	const game = new FreeCell().shuffle32(seed).dealAll();

	// canFlourish is about as fast as it can be
	//  - this takes 12 seconds (down from 60s)
	//  - this takes 185 seconds as a unit test (¿down from probably 24 minutes?)
	if (juice.canFlourish(game).length) {
		flourishSeeds.push(seed);
	}

	// canFlourish52 is about as fast as it can be
	//  - this takes 3.8 seconds (down from 10s)
	//  - this takes 79 seconds as a unit test (down from 3 minutes)
	if (juice.canFlourish52(game).length) {
		flourish52Seeds.push(seed);
	}
	if (seed % 1000 === 0) {
		console.log(
			[
				`Game #${seed.toString(10)}`,
				`${flourishSeeds.length.toString(10)} flourish`,
				`${flourish52Seeds.length.toString(10)} flourish52`,
				// TODO (techdebt) update node and typescript `const shortFormat = new Intl.DurationFormat("en");`
				`took: ${((Date.now() - start) / 1000).toFixed(1)}s`,
			].join('; ')
		);
	}
}

// basic data checks
const pass = '✅';
const fail = '❌';
const catalogSeeds_canFlourish = getSeedsByTag('canFlourish');
const catalogSeeds_canFlourish52 = getSeedsByTag('canFlourish52');

const flourishDiff = sortedDiff(flourishSeeds, catalogSeeds_canFlourish);
const flourish52Diff = sortedDiff(flourish52Seeds, catalogSeeds_canFlourish52);

const checks = [
	{
		title: `canFlourish - seed lengths (${catalogSeeds_canFlourish.length.toString(10)})`,
		pass: flourishSeeds.length === catalogSeeds_canFlourish.length,
	},
	{
		title: `canFlourish - values match`,
		pass: flourishDiff.in_a.length === 0 && flourishDiff.in_b.length === 0,
	},
	{
		title: `canFlourish52 - seed lengths (${catalogSeeds_canFlourish52.length.toString(10)})`,
		pass: flourish52Seeds.length === catalogSeeds_canFlourish52.length,
	},
	{
		title: 'canFlourish52 - values match',
		pass: flourish52Diff.in_a.length === 0 && flourish52Diff.in_b.length === 0,
	},
];
console.log();
checks.forEach((check) => {
	console.log((check.pass ? pass : fail) + ' ' + check.title);
});

const out = {
	skip: catalogSeeds_impossible,
	flourish: {
		impl: {
			count: flourishSeeds.length,
			seeds: flourishDiff.in_a,
		},
		catalog: {
			count: catalogSeeds_canFlourish.length,
			seeds: flourishDiff.in_b,
		},
	},
	flourish52: {
		impl: {
			count: flourish52Seeds.length,
			seeds: flourish52Diff.in_a,
		},
		catalog: {
			count: catalogSeeds_canFlourish52.length,
			seeds: flourish52Diff.in_b,
		},
	},
};
writeFileSync('checkGames.out', JSON.stringify(out, null, 2));
