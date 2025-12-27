import { fireEvent, render, screen } from '@testing-library/react';
import { gsap } from 'gsap/all';
import { ErrorBoundary } from '@/app/hooks/ErrorBoundary';
import Page from '@/app/page';
import { spyOnGsap } from '@/app/testUtils';

describe('page', () => {
	let mockReset: (runOnComplete?: boolean) => void;
	let mockCallTimes: () => Record<string, number>;
	beforeEach(() => {
		({ mockCallTimes, mockReset } = spyOnGsap(gsap));
	});

	test('should render without crashing', () => {
		render(
			<ErrorBoundary>
				<Page />
			</ErrorBoundary>
		);
		expect(screen.queryAllByAltText('card back').length).toBe(53); // there is hidden card back
		expect(mockCallTimes()).toEqual({
			toGsapSpy: 52,
			setGsapSpy: 52,
			setSpy: 52,
			addLabelSpy: 2,
		});
		// TODO (techdebt) (test) lock down the shuffle seed
		// expect(addLabelSpy.mock.calls).toEqual([['shuffle deck (20616)'], ['updateCardPositions']]);

		mockReset(true);
		fireEvent.click(screen.getAllByAltText('card back')[0]);

		expect(mockCallTimes()).toEqual({
			fromToSpy: 52,
			toSpy: 52,
			addLabelSpy: 2,
		});
		// TODO (techdebt) (test) lock down the shuffle seed
		// expect(addLabelSpy.mock.calls).toEqual([['juice flash AD,AH'], ['updateCardPositions']]);

		expect(screen.queryAllByAltText('card back').length).toBe(1); // there is hidden card back
		expect(screen.getByText('king of hearts')).toBeTruthy();
	});
});
