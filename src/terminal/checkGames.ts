import { getSeedsByTag } from '@/game/catalog/difficulty-catalog';
import { FreeCell } from '@/game/game';
import { juice } from '@/game/move/juice';

/*
	loop through all games and see if there are any that can 52 flourish

	`nodemon --watch src/terminal --ext ts --exec npm run checkGames`
*/

const start = Date.now();
let flourishCount = 0;
const flourish52Seeds: number[] = [];
for (let seed = 1; seed <= 32000; seed++) {
	const game = new FreeCell().shuffle32(seed).dealAll();

	// TODO (3-priority) (techdebt) (flourish-anim) (optimize) make canFlourish run faster
	//  - this takes 1 minute when executed directly (here)
	//  - how long will it takes as a unit test
	if (juice.canFlourish(game).length) {
		flourishCount++;
	}

	// TODO (3-priority) (techdebt) (flourish-anim) (optimize) make canFlourish52 run faster
	//  - this takes 3 minutes when written as a unit test
	//  - this takes 10 seconds when executed directly (here)
	//  - ∴ when benchmarking, do this as a unit test
	const aces = juice.canFlourish52(game);

	if (aces.length) {
		flourish52Seeds.push(seed);
	}
	if (seed % 1000 === 0) {
		console.log(
			[
				`Game #${seed.toString(10)}`,
				`canFlourish so far: ${flourishCount.toString(10)}`,
				`canFlourish52 so far: ${flourish52Seeds.length.toString(10)}`,
				// TODO (techdebt) update node and typescript `const shortFormat = new Intl.DurationFormat("en");`
				`took: ${((Date.now() - start) / 1000).toFixed(1)}s`,
			].join('; ')
		);
	}
}

// basic data checks
const pass = '✅';
const fail = '❌';
const catalogSeeds = getSeedsByTag('canFlourish52');

const checks = [
	{ title: `canFlourish - seed lengths (${(28843).toString(10)})`, pass: flourishCount === 28843 },
	{
		title: `canFlourish52 - seed lengths (${catalogSeeds.length.toString(10)})`,
		pass: flourish52Seeds.length === catalogSeeds.length,
	},
	{
		title: 'canFlourish52 - values match',
		pass:
			flourish52Seeds.every((seed, idx) => catalogSeeds.at(idx) === seed) &&
			catalogSeeds.every((seed, idx) => flourish52Seeds.at(idx) === seed),
	},
];
console.log();
checks.forEach((check) => {
	console.log((check.pass ? pass : fail) + ' ' + check.title);
});
if (!checks.every((check) => check.pass)) {
	// no diffs, just print
	console.log({
		flourishCount,
		flourish52Seeds,
		catalogSeeds,
	});
}
