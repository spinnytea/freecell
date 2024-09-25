import { render, screen } from '@testing-library/react';
import { CardImage } from '@/app/components/cards/CardImage';

describe('CardImage', () => {
	test('first', () => {
		render(<CardImage rank="5" suit="hearts" />);
		expect(screen.getByAltText('5 of hearts')).toMatchSnapshot();
	});
});
