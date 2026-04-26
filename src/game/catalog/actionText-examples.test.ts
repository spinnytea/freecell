import { ACTION_TEXT_EXAMPLES } from '@/game/catalog/actionText-examples';
import { FreeCell } from '@/game/game';

describe('actionText-examples', () => {
	describe('defined games are valid', () => {
		const actionTextExamples = Object.keys(ACTION_TEXT_EXAMPLES).filter((actionText) => !!ACTION_TEXT_EXAMPLES[actionText]);
		// TODO (4-priority) (techdebt) (test) defined games are valid
		// eslint-disable-next-line jest/no-disabled-tests
		test.skip.each(actionTextExamples)('%s', (actionText) => {
			const example = ACTION_TEXT_EXAMPLES[actionText];
			const game = FreeCell.parse(example);
			expect(game.print({ includeHistory: true })).toEqual(example);
			expect(game.history.join(', ')).not.toContain('invalid');
			// TODO (4-priority) (techdebt) (test) the actionText must be able to be produced
		});
	});
});
