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

	// canFlourish is about as fast as it can be
	//  - this takes 33 seconds (60s → 33s)
	//  - this takes 12 minutes as a unit test (¿24 minutes? → 730s)
	if (juice.canFlourish(game).length) {
		flourishCount++;
	}

	// canFlourish52 is about as fast as it can be
	//  - this takes 4.5 seconds (10s → 4.5s)
	//  - this takes 94 seconds as a unit test (3 minutes → 94s)
	const aces = juice.canFlourish52(game);
	// const aces = [];

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
const expectedFlourishCount = 28843;
const catalogSeeds = getSeedsByTag('canFlourish52');

const checks = [
	{
		title: `canFlourish - seed lengths (${expectedFlourishCount.toString(10)})`,
		pass: flourishCount === expectedFlourishCount,
	},
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
