import { fireEvent, render, screen } from '@testing-library/react';
import { gsap } from 'gsap/all';
import { ErrorBoundary } from '@/app/hooks/ErrorBoundary';
import Page from '@/app/page';
import { spyOnGsap } from '@/app/testUtils';
import { utils } from '@/utils';

describe('page', () => {
	let addLabelSpy: jest.SpyInstance;
	let mockReset: (runOnComplete?: boolean) => void;
	let mockCallTimes: () => Record<string, number>;
	let randomIntegerSpy: jest.SpyInstance;
	beforeEach(() => {
		({ addLabelSpy, mockCallTimes, mockReset } = spyOnGsap(gsap));
		randomIntegerSpy = jest.spyOn(utils, 'randomInteger').mockImplementation(() => {
			throw new Error('you MUST mock utils.randomInteger');
		});
	});

	test('should render without crashing', () => {
		randomIntegerSpy.mockReturnValueOnce(5); // seed for shuffle
		render(
			<ErrorBoundary>
				<Page />
			</ErrorBoundary>
		);
		expect(screen.queryAllByAltText('card back').length).toBe(53); // there is hidden card back
		expect(mockCallTimes()).toEqual({
			gsapSetSpy: 52,
			setSpy: 52,
			addLabelSpy: 2,
		});
		expect(addLabelSpy.mock.calls).toEqual([['shuffle deck (5)'], ['updateCardPositions']]);

		mockReset(true);
		fireEvent.click(screen.getAllByAltText('card back')[0]);

		expect(mockCallTimes()).toEqual({
			fromToSpy: 52,
			toSpy: 51,
			addLabelSpy: 2,
		});
		expect(addLabelSpy.mock.calls).toEqual([
			['gameFunction check-can-flourish'],
			['updateCardPositions'],
		]);

		expect(screen.queryAllByAltText('card back').length).toBe(1); // there is hidden card back
		expect(screen.getByText('king of hearts')).toBeTruthy();
		expect(randomIntegerSpy.mock.calls).toEqual([[32000]]); // just one shuffle
	});
});
