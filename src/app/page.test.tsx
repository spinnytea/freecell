import { render, screen } from '@testing-library/react';
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
	let mockCallTimes: () => Record<string, number>;
	beforeEach(() => {
		({ mockCallTimes } = spyOnGsap(gsap));
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
	});
});
