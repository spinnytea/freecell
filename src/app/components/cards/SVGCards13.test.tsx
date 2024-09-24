import { units } from '@/app/components/cards/SVGCards13';
import { RankList, SuitList } from '@/app/game/card';

describe('SVGCards13', () => {
	describe('getFilename', () => {
		test('fancy', () => {
			const allNames: string[] = [];

			SuitList.forEach((suit) => {
				RankList.forEach((rank) => {
					allNames.push(`${rank} of ${suit} → ${units.getFilename(rank, suit, true)}`);
				});
			});
			SuitList.forEach((suit) => {
				const rank = 'joker';
				allNames.push(`${rank} of ${suit} → ${units.getFilename(rank, suit, true)}`);
			});
			// allNames.push(`card back → ${units.getFilename('ace', 'spades', true)}`);

			expect(allNames).toMatchSnapshot();
		});

		test('simple', () => {
			const allNames: string[] = [];

			SuitList.forEach((suit) => {
				RankList.forEach((rank) => {
					allNames.push(`${rank} of ${suit} → ${units.getFilename(rank, suit, false)}`);
				});
			});
			SuitList.forEach((suit) => {
				const rank = 'joker';
				allNames.push(`${rank} of ${suit} → ${units.getFilename(rank, suit, false)}`);
			});
			// allNames.push(`card back → ${units.getFilename('ace', 'spades', false)}`);

			expect(allNames).toMatchSnapshot();
		});
	});
});
