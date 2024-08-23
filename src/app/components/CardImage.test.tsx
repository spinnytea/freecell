import { render, screen } from '@testing-library/react';
import { CardImage, units } from '@/app/components/CardImage';
import { RankList, SuitList } from '@/app/game/card';

describe('CardImage', () => {
	test('first', () => {
		render(<CardImage rank="5" suit="hearts" />);
		expect(screen.getByAltText('5 of hearts')).toMatchSnapshot();
	});

	describe('getFilename', () => {
		test('fancy', () => {
			const allNames: string[] = [];

			SuitList.forEach((suit) => {
				RankList.forEach((rank) => {
					allNames.push(`${rank} of ${suit} → ${units.getFilename(rank, suit, false, true)}`);
				});
			});
			SuitList.forEach((suit) => {
				const rank = 'joker';
				allNames.push(`${rank} of ${suit} → ${units.getFilename(rank, suit, false, true)}`);
			});
			allNames.push(`card back → ${units.getFilename('ace', 'spades', true, true)}`);

			expect(allNames).toMatchSnapshot();
		});

		test('simple', () => {
			const allNames: string[] = [];

			SuitList.forEach((suit) => {
				RankList.forEach((rank) => {
					allNames.push(`${rank} of ${suit} → ${units.getFilename(rank, suit, false, false)}`);
				});
			});
			SuitList.forEach((suit) => {
				const rank = 'joker';
				allNames.push(`${rank} of ${suit} → ${units.getFilename(rank, suit, false, false)}`);
			});
			allNames.push(`card back → ${units.getFilename('ace', 'spades', true, false)}`);

			expect(allNames).toMatchSnapshot();
		});
	});

	describe('manual checks', () => {
		test.todo('visual check on all Suit x Rank');

		test.todo('visual check on red/black jokers');
	});
});
