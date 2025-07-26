import { units } from '@/app/components/cards/SVGCards13';
import { RankList, SuitList } from '@/game/card/card';

describe('SVGCards13', () => {
	test('getFilename', () => {
		const allNames: string[] = [];

		SuitList.forEach((suit) => {
			RankList.forEach((rank) => {
				allNames.push(`${rank} of ${suit} → ${units.getFilename(rank, suit)}`);
			});
		});
		SuitList.forEach((suit) => {
			const rank = 'joker';
			allNames.push(`${rank} of ${suit} → ${units.getFilename(rank, suit)}`);
		});
		// allNames.push(`card back → ${units.getFilename('ace', 'spades')}`);

		expect(allNames).toMatchSnapshot();
	});
});
