import { ACTION_TEXT_EXAMPLES } from '@/game/catalog/actionText-examples';
import { FreeCell } from '@/game/game';

describe('actionText-examples', () => {
	// FIXME test.skip
	describe('defined games are valid', () => {
		const actionTextExamples = Object.keys(ACTION_TEXT_EXAMPLES).filter((actionText) => !!ACTION_TEXT_EXAMPLES[actionText]);
		test.skip.each(actionTextExamples)('%s', (actionText) => {
			const example = ACTION_TEXT_EXAMPLES[actionText];
			const game = FreeCell.parse(example);
			expect(game.print({ includeHistory: true })).toEqual(example);
			expect(game.history.join(', ')).not.toContain('invalid');
			// FIXME the actionText must be able to be produced
		});
	});
});
