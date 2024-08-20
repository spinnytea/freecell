import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CardImage, RankList, SuitList, units } from './card';

describe('card', () => {
	test('first', () => {
		render(<CardImage rank="5" suit="hearts" />);
		expect(screen.getByAltText('5 of hearts')).toMatchSnapshot();
	});

	describe('getFilename', () => {
		test('fancy', () => {
			const allNames: string[] = [];

			SuitList.forEach((suit) => {
				RankList.forEach((rank) => {
					allNames.push(`${rank} of ${suit} → ${units.getFilename(rank, suit, true)}`);
				});
			});

			expect(allNames).toMatchSnapshot();
		});

		test('simple', () => {
			const allNames: string[] = [];

			SuitList.forEach((suit) => {
				RankList.forEach((rank) => {
					allNames.push(`${rank} of ${suit} → ${units.getFilename(rank, suit, false)}`);
				});
			});

			expect(allNames).toMatchSnapshot();
		});
	});

	describe('manual checks', () => {
		test.todo('visual check on all Suit x Rank');

		test.todo('visual check on red/black jokers');
	});
});
