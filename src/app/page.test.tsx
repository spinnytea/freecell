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
	let consoleDebugSpy: jest.SpyInstance;
	beforeEach(() => {
		({ consoleDebugSpy } = spyOnGsap(gsap));
	});

	it('should render without crashing', () => {
		render(
			<ErrorBoundary>
				<Page />
			</ErrorBoundary>
		);
		// XXX (techdebt) there's a hidden card, so this count is not obvious
		expect(screen.queryAllByAltText('card back').length).toBe(53);
		expect(consoleDebugSpy).not.toHaveBeenCalled();
	});
});
