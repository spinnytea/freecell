import { fireEvent, render, screen } from '@testing-library/react';
import { gsap } from 'gsap/all';
import { ErrorBoundary } from '@/app/hooks/ErrorBoundary';
import Page from '@/app/page';
import { spyOnGsap } from '@/app/testUtils';

jest.mock('gsap/all', () => ({
	gsap: {
		to: () => ({}),
		set: () => ({}),
		from: () => ({}),
		timeline: () => ({}),
		registerPlugin: () => ({}),
		utils: {
			random: () => undefined,
		},
	},
}));

describe('page', () => {
	let mockReset: (runOnComplete?: boolean) => void;
	let mockCallTimes: () => Record<string, number>;
	beforeEach(() => {
		({ mockCallTimes, mockReset } = spyOnGsap(gsap));
	});

	it('should render without crashing', () => {
		render(
			<ErrorBoundary>
				<Page />
			</ErrorBoundary>
		);
		expect(screen.queryAllByAltText('card back').length).toBe(53); // there is hidden card back
		expect(mockCallTimes()).toEqual({
			toGsapSpy: 52,
			setGsapSpy: 52,
			fromGsapSpy: 0,
			fromToSpy: 0,
			toSpy: 0,
			setSpy: 52,
			addLabelSpy: 1,
			addSpy: 0,
			timeScaleSpy: 0,
			consoleDebugSpy: 0,
		});

		mockReset(true);
		fireEvent.click(screen.getAllByAltText('card back')[0]);

		expect(mockCallTimes()).toEqual({
			toGsapSpy: 0,
			setGsapSpy: 0,
			fromGsapSpy: 0,
			fromToSpy: 52,
			toSpy: 52,
			setSpy: 0,
			addLabelSpy: 1,
			addSpy: 0,
			timeScaleSpy: 0,
			consoleDebugSpy: 0,
		});

		expect(screen.queryAllByAltText('card back').length).toBe(1); // there is hidden card back
		expect(screen.getByText('king of hearts')).toBeTruthy();
	});
});
